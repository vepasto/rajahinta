// Indices loading module

/**
 * Find the latest indices JSON file by trying dates backwards from today.
 * @param {string} basePath - Base path to data directory (e.g., 'data' or '../data')
 * @param {number} maxDaysBack - Maximum number of days to look back (default: 30)
 * @returns {Promise<string>} Path to the latest indices file
 */
export async function findLatestIndicesFile(basePath = 'data', maxDaysBack = 30) {
    // Start from today and go backwards
    const today = new Date();
    for (let daysBack = 0; daysBack < maxDaysBack; daysBack++) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysBack);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const filename = `${basePath}/indices-${year}-${month}-${day}.json`;
        
        try {
            const response = await fetch(filename);
            if (response.ok) {
                return filename;
            }
        } catch (e) {
            continue;
        }
    }
    
    throw new Error('Could not find any indices file');
}

/**
 * Load indices data from the latest JSON file.
 * @param {string} basePath - Base path to data directory (e.g., 'data' or '../data')
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function loadIndicesData(basePath = 'data') {
    const indicesFile = await findLatestIndicesFile(basePath);
    const response = await fetch(indicesFile);
    
    if (!response.ok) {
        throw new Error(`Failed to load indices file: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
}

