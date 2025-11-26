// Calculator indices loading and management module
import { findLatestIndicesFile } from './indices';

// Global state for indices - use object for reactivity
export const indicesState = {
  rakennuskustannusindeksi: {} as Record<number, Record<number, number>>,
  markkinahintaindeksi: {} as Record<number, Record<number, number>>,
  vanhatMarkkinahintaindeksi: {} as Record<number, Record<number, number>>,
  rajaneliohinta: null as any,
  indicesLoaded: false,
  indicesData: null as any, // Store raw JSON data for charts
};

/**
 * Validate indices data structure
 */
function validateIndicesData(data: any): string[] {
  const errors: string[] = [];

  // Check required fields
  if (!data) {
    errors.push('Data is null or undefined');
    return errors;
  }

  if (!data.rakennuskustannusindeksi || typeof data.rakennuskustannusindeksi !== 'object') {
    errors.push('rakennuskustannusindeksi is missing or invalid');
  }

  if (!data.markkinahintaindeksi || typeof data.markkinahintaindeksi !== 'object') {
    errors.push('markkinahintaindeksi is missing or invalid');
  }

  // Optional fields (just log warnings)
  if (data.vanhat_markkinahintaindeksi && typeof data.vanhat_markkinahintaindeksi !== 'object') {
    console.warn('vanhat_markkinahintaindeksi has invalid format');
  }

  if (data.rajaneliohinta && typeof data.rajaneliohinta !== 'object') {
    console.warn('rajaneliohinta has invalid format');
  }

  return errors;
}

/**
 * Safely parse index data with error handling
 */
function parseIndexData(
  indexData: any,
  indexName: string
): Record<number, Record<number, number>> {
  const parsed: Record<number, Record<number, number>> = {};

  if (!indexData || typeof indexData !== 'object') {
    console.warn(`${indexName} is missing or invalid`);
    return parsed;
  }

  try {
    for (const [yearStr, months] of Object.entries(indexData)) {
      const year = parseInt(yearStr);
      if (isNaN(year)) {
        console.warn(`Invalid year in ${indexName}: ${yearStr}`);
        continue;
      }

      parsed[year] = {};
      if (!months || typeof months !== 'object') {
        console.warn(`Invalid months data for year ${year} in ${indexName}`);
        continue;
      }

      for (const [monthStr, value] of Object.entries(months)) {
        const month = parseInt(monthStr);
        if (isNaN(month) || month < 1 || month > 12) {
          console.warn(`Invalid month in ${indexName} for year ${year}: ${monthStr}`);
          continue;
        }

        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
        if (isNaN(numValue)) {
          console.warn(`Invalid value in ${indexName} for ${year}-${month}: ${value}`);
          continue;
        }

        parsed[year][month] = numValue;
      }
    }
  } catch (error) {
    console.error(`Error parsing ${indexName}:`, error);
  }

  return parsed;
}

/**
 * Load indices from JSON file
 */
export async function loadIndices(): Promise<boolean> {
  try {
    // Find the latest indices file automatically
    // In Next.js, public/ files are served from root, so use /data/
    const indicesFile = await findLatestIndicesFile('/data/');
    const response = await fetch(indicesFile);
    if (!response.ok) {
      throw new Error(`Failed to load indices file: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate data structure
    const validationErrors = validateIndicesData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid indices data structure: ${validationErrors.join(', ')}`);
    }

    // Store raw data for charts
    indicesState.indicesData = data;

    // Parse indices data safely
    indicesState.rakennuskustannusindeksi = parseIndexData(
      data.rakennuskustannusindeksi,
      'rakennuskustannusindeksi'
    );
    indicesState.markkinahintaindeksi = parseIndexData(
      data.markkinahintaindeksi,
      'markkinahintaindeksi'
    );

    // Parse optional indices
    if (data.vanhat_markkinahintaindeksi) {
      indicesState.vanhatMarkkinahintaindeksi = parseIndexData(
        data.vanhat_markkinahintaindeksi,
        'vanhat_markkinahintaindeksi'
      );
    } else {
      indicesState.vanhatMarkkinahintaindeksi = {};
    }

    // Parse rajaneliöhinta safely
    if (data.rajaneliohinta) {
      try {
        // Validate rajaneliöhinta structure
        if (
          typeof data.rajaneliohinta === 'object' &&
          typeof data.rajaneliohinta.price_per_sqm === 'number' &&
          data.rajaneliohinta.valid_from &&
          data.rajaneliohinta.valid_until
        ) {
          indicesState.rajaneliohinta = data.rajaneliohinta;
        } else {
          console.warn('rajaneliohinta has invalid structure, skipping');
          indicesState.rajaneliohinta = null;
        }
      } catch (error) {
        console.error('Error parsing rajaneliohinta:', error);
        indicesState.rajaneliohinta = null;
      }
    } else {
      indicesState.rajaneliohinta = null;
    }

    // Check if we have minimum required data
    const hasRakennuskustannus = Object.keys(indicesState.rakennuskustannusindeksi).length > 0;
    const hasMarkkinahinta = Object.keys(indicesState.markkinahintaindeksi).length > 0;

    if (!hasRakennuskustannus || !hasMarkkinahinta) {
      throw new Error('Required indices data is empty or invalid');
    }

    indicesState.indicesLoaded = true;
    return true;
  } catch (error: any) {
    console.error('Error loading indices:', error);
    indicesState.indicesLoaded = false;
    // Show user-friendly error message without blocking page load
    const errorMsg = error.message || 'Tuntematon virhe';
    // Use setTimeout to avoid blocking page load in Safari
    setTimeout(() => {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText =
        'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #e74c3c; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000; max-width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.3);';
      errorDiv.innerHTML = `<strong>Virhe:</strong> Indeksien lataus epäonnistui.<br><br>${errorMsg}<br><br><button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: white; color: #e74c3c; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Päivitä sivu</button>`;
      document.body.appendChild(errorDiv);
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 10000);
    }, 100);
    return false;
  }
}

