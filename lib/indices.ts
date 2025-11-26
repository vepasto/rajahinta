// Indices loading utilities
export async function findLatestIndicesFile(relativePath = 'data/'): Promise<string> {
  const maxDaysBack = 30; // Try up to 30 days back
  const today = new Date();

  for (let daysBack = 0; daysBack < maxDaysBack; daysBack++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysBack);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const filename = `${relativePath}indices-${year}-${month}-${day}.json`;

    try {
      const response = await fetch(filename);
      if (response.ok) {
        return filename;
      }
    } catch (e) {
      // Ignore fetch errors and try previous day
      continue;
    }
  }
  throw new Error('Could not find any indices file within the last 30 days.');
}

export async function loadIndicesData(relativePath = 'data/'): Promise<any> {
  const indicesFile = await findLatestIndicesFile(relativePath);
  const response = await fetch(indicesFile);
  if (!response.ok) {
    throw new Error(`Failed to load indices file: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

