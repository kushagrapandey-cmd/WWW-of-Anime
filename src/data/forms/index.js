const files = import.meta.glob('./*.json', { eager: true, import: 'default' });
export const characterForms = Object.entries(files).sort(([a], [b]) => a.localeCompare(b)).flatMap(([, forms]) => forms);
export const getFormsForCharacter = characterId => characterForms.filter(form => form.characterId === characterId);
export const getFormById = id => characterForms.find(form => form.id === id) ?? null;
