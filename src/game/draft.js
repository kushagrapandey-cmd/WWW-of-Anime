import { GAME } from './config.js';
import { seededRandom, shuffle } from './random.js';
export function createDraft(seed) {
  return { seed, teams: [[], []], excluded: [], rerolls: [GAME.rerolls, GAME.rerolls], drawIndex: 0 };
}
export function pull(pool, excluded, random) {
  const available = pool.filter(card => !excluded.includes(card.id));
  const tiers = Object.entries(GAME.rarityWeights).filter(([rarity]) => available.some(card => card.rarity === rarity));
  if (!tiers.length) throw new Error('Not enough unique fighters in this pool.');
  let ticket = random() * tiers.reduce((sum, [, weight]) => sum + weight, 0);
  const rarity = (tiers.find(([, weight]) => (ticket -= weight) < 0) ?? tiers.at(-1))[0];
  const cards = available.filter(card => card.rarity === rarity);
  // Choose identity before form: a large form inventory cannot multiply its odds within a tier.
  const identities = [...new Set(cards.map(card => card.id))];
  const identity = identities[Math.floor(random() * identities.length)];
  const forms = cards.filter(card => card.id === identity);
  return structuredClone(forms[Math.floor(random() * forms.length)]);
}
export function drawCard(state, pool, player, rerollIndex = null) {
  if (![0, 1].includes(player)) throw new Error('Unknown player.');
  const team = state.teams[player];
  if (rerollIndex !== null && (!state.rerolls[player] || !Number.isInteger(rerollIndex) || !team[rerollIndex])) throw new Error('No reroll available for that card.');
  if (rerollIndex === null && team.length >= GAME.teamSize) throw new Error('Team is already full.');
  const card = pull(pool, state.excluded, seededRandom(`${state.seed}:draft:${state.drawIndex}`));
  const next = structuredClone(state);
  if (rerollIndex === null) next.teams[player].push(card);
  else { next.teams[player][rerollIndex] = card; next.rerolls[player]--; }
  // A discarded identity stays excluded for the entire draft.
  next.excluded.push(card.id); next.drawIndex++;
  return next;
}
export function draftCpu(state, pool) {
  let next = state;
  while (next.teams[1].length < GAME.teamSize) next = drawCard(next, pool, 1);
  const weakest = next.teams[1].reduce((best, card, index, cards) => card.powerScore < cards[best].powerScore ? index : best, 0);
  if (next.teams[1][weakest].rarity === 'Common') next = drawCard(next, pool, 1, weakest);
  next.teams[1] = shuffle(next.teams[1], `${next.seed}:cpu-lineup`);
  return next;
}
