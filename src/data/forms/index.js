import luffy from './luffy.json';
import naruto from './naruto.json';
export const characterForms = [...luffy, ...naruto];
export const getFormsForCharacter = characterId => characterForms.filter(form => form.characterId === characterId);
export const getFormById = id => characterForms.find(form => form.id === id) ?? null;
