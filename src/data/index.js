import { indexAnimeFiles } from './registry.js';
import { animeConfig } from './anime.js';
import { getFormById } from './forms/index.js';
const rosters = import.meta.glob('./characters/*.json', { eager: true, import: 'default' });
export const charactersByAnime = indexAnimeFiles(animeConfig, rosters, './characters/');
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
