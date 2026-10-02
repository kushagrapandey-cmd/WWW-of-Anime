import { GAME } from './config.js';
import { seededRandom } from './random.js';
export function validateTeams(teams) {
  if (!Array.isArray(teams) || teams.length !== 2 || teams.some(team => !Array.isArray(team) || team.length !== GAME.teamSize)) throw new Error('Each team needs five locked fighters.');
  const fighters = teams.flat();
  if (fighters.some(card => !card || typeof card.id !== 'string' || typeof card.name !== 'string' || typeof card.anime !== 'string' || !(card.formId === null || typeof card.formId === 'string') || !Number.isFinite(card.powerScore) || card.powerScore <= 0 || card.powerScore > 1000 || !Number.isFinite(card.stats?.speed) || card.stats.speed < 0 || card.stats.speed > 100 || !Array.isArray(card.abilityTags) || card.abilityTags.some(tag => typeof tag !== 'string'))) throw new Error('Invalid locked fighter data.');
  if (new Set(fighters.map(card => card.id)).size !== fighters.length) throw new Error('An identity can appear only once across both teams.');
}
export function matchupModifier(first, second) {
  let bonus = 0;
  for (const [attack, defense, amount] of GAME.counters) {
    if (first.abilityTags.includes(attack) && second.abilityTags.includes(defense)) bonus += amount;
    if (second.abilityTags.includes(attack) && first.abilityTags.includes(defense)) bonus -= amount;
  }
  return 1 + Math.max(-GAME.matchupCap, Math.min(GAME.matchupCap, bonus));
}
export function synergyModifier(team) {
  const shares = field => {
    const counts = new Map();
    for (const card of team) if (card[field]) counts.set(card[field], (counts.get(card[field]) ?? 0) + 1);
    return [...counts.values()].some(count => count >= GAME.synergyCount);
  };
  return 1 + (shares('anime') || shares('faction') ? GAME.synergyBonus : 0);
}
export function resolveRound(cards, synergies, random) {
  const factors = cards.map((card, index) => ({
    base: card.powerScore, matchup: matchupModifier(card, cards[1 - index]), synergy: synergies[index],
    luck: GAME.luckMin + random() * (GAME.luckMax - GAME.luckMin),
  }));
  const powers = factors.map(factor => Math.round(factor.base * factor.matchup * factor.synergy * factor.luck * 100) / 100);
  const tied = powers[0] === powers[1];
  const speedTie = cards[0].stats.speed === cards[1].stats.speed;
  const winner = tied ? (speedTie ? (random() < 0.5 ? 0 : 1) : (cards[0].stats.speed > cards[1].stats.speed ? 0 : 1)) : (powers[0] > powers[1] ? 0 : 1);
  const factor = factors[winner];
  const percent = modifier => `${modifier >= 1 ? '+' : ''}${Math.round((modifier - 1) * 100)}%`;
  const why = tied ? (speedTie ? 'Power and speed tied; the seeded tiebreak decided this round.' : 'Effective power tied; higher speed won.') : `Higher effective power: base ${factor.base}, matchup ${percent(factor.matchup)}, team synergy ${percent(factor.synergy)}, luck ${percent(factor.luck)}.`;
  return { winner, powers, factors, why };
}
export function simulateBattle(teams, seed) {
  validateTeams(teams);
  if (typeof seed !== 'string' || !seed.length || seed.length > 160) throw new Error('Invalid battle seed.');
  const random = seededRandom(seed), synergies = teams.map(synergyModifier), score = [0, 0];
  const rounds = Array.from({ length: GAME.teamSize }, (_, index) => {
    const round = resolveRound(teams.map(team => team[index]), synergies, random);
    score[round.winner]++;
    return { ...round, index };
  });
  const winner = score[0] > score[1] ? 0 : 1;
  const mvpRound = rounds.filter(round => round.winner === winner).reduce((best, round) => round.powers[winner] - round.powers[1 - winner] > best.powers[winner] - best.powers[1 - winner] ? round : best);
  return { rounds, score, winner, mvp: teams[winner][mvpRound.index] };
}
export function replayBattle(record) {
  if (record?.version !== GAME.version) throw new Error('This replay uses an unsupported engine version.');
  return simulateBattle(record.teams, record.seed);
}
