import naruto from './characters/naruto.json';
import onepiece from './characters/onepiece.json';
import bleach from './characters/bleach.json';
import { getFormById } from './forms/index.js';

export const charactersByAnime = { naruto, onepiece, bleach };
export const characters = Object.values(charactersByAnime).flat();
export const getCharacterById = (id) => characters.find(character => character.id === id) ?? null;
export default characters;

export { characterForms, getFormsForCharacter, getFormById } from './forms/index.js';

// Identity stays constant across forms, so drafting can deduplicate by character.id.
export function getRatedCharacter(characterId, formId = null) {
  const character = getCharacterById(characterId);
  if (!character) return null;
  if (!formId) return { ...character, formId: null };
  const form = getFormById(formId);
  if (!form || form.characterId !== characterId) return null;
  return {
    ...character, formId: form.id, formName: form.name, era: form.era,
    stats: form.stats, powerScore: form.powerScore, rarity: form.rarity,
    abilityTags: form.abilityTags, signatureMoves: form.signatureMoves,
    limitations: form.limitations, confidence: form.confidence,
  };
}
