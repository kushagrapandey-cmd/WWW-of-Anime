import { shuffle } from '../game/random.js';
import { MINI } from './config.js';
import { normalizeName } from './names.js';
export const profileKey = card => MINI.statKeys.map(key => card.stats[key]).join(':');
const normalized = items => [...new Set(items.map(normalizeName))].sort();
export function lockCard(card) {
  return structuredClone(Object.fromEntries(['id', 'name', 'anime', 'stats', 'powerScore', 'rarity', 'role', 'image', 'abilityTags', 'signatureMoves', 'clues'].map(key => [key, card[key]]).concat([['formId', null], ['formName', 'Peak rated form']])));
}
export function eligibleCards(roster, settings) {
  return roster.filter(card => settings.anime === 'all' || card.anime === settings.anime).filter(card => {
    if (settings.mode === 'power') return true;
    if (roster.some(other => other.id !== card.id && normalizeName(other.name) === normalizeName(card.name))) return false;
    if (settings.mode === 'clue') return card.clues.length >= 3 && !roster.some(other => other.id !== card.id && normalized(other.clues).join(':') === normalized(card.clues).join(':'));
    if (settings.hard) return !roster.some(other => other.id !== card.id && profileKey(other) === profileKey(card));
    const moves = card.signatureMoves.slice(0, 3);
    return moves.length >= 2 && !roster.some(other => other.id !== card.id && moves.every(move => normalized(other.signatureMoves).includes(normalizeName(move))) && normalized(other.abilityTags).join(':') === normalized(card.abilityTags).join(':'));
  });
}
export function makeRounds(roster, settings, seed) {
  const pool = eligibleCards(roster, settings);
  if (pool.length < MINI.rounds) throw new Error('Not enough unambiguous fighters for this game/filter.');
  const targets = shuffle(pool, `${seed}:targets`).slice(0, MINI.rounds);
  return targets.map((target, index) => {
    if (settings.mode === 'power') {
      const opponents = pool.filter(card => card.id !== target.id && card.powerScore !== target.powerScore);
      if (!opponents.length) throw new Error('This pool has no unequal power pairs.');
      const opponent = shuffle(opponents, `${seed}:opponent:${index}`)[0];
      return { pair: shuffle([lockCard(target), lockCard(opponent)], `${seed}:sides:${index}`) };
    }
    const others = shuffle(pool.filter(card => card.id !== target.id), `${seed}:choices:${index}`).slice(0, 3);
    const options = shuffle([target, ...others].map(card => ({ id: card.id, name: card.name, anime: card.anime })), `${seed}:order:${index}`);
    return { target: lockCard(target), options, moves: settings.mode === 'move' && !settings.hard ? target.signatureMoves.slice(0, 3) : [] };
  });
}
