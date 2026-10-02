// Vite discovers files; catalog order keeps existing seeded question pools stable.
export function indexAnimeFiles(catalog, files, prefix) {
  return Object.fromEntries(catalog.map(({ id }) => {
    const records = files[`${prefix}${id}.json`];
    if (!Array.isArray(records) || !records.length) throw new Error(`Missing or empty data for ${id}.`);
    return [id, records];
  }));
}
