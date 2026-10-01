import naruto from './characters/naruto.json';
import onepiece from './characters/onepiece.json';
import bleach from './characters/bleach.json';

export const charactersByAnime = { naruto, onepiece, bleach };
export const characters = Object.values(charactersByAnime).flat();
export const getCharacterById = (id) => characters.find(character => character.id === id) ?? null;
export default characters;
