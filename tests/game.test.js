import { describe, it, expect } from 'vitest';
import { GAME } from '../src/game/config.js';
import { seededRandom, shuffle } from '../src/game/random.js';
import { buildPool } from '../src/game/pool.js';
import { createDraft, drawCard, draftCpu, pull } from '../src/game/draft.js';
import { matchupModifier, synergyModifier, resolveRound, simulateBattle, replayBattle } from '../src/game/engine.js';
import { applyBattleResult } from '../src/game/profileResult.js';
import { characters, characterForms } from '../src/data/index.js';
const card = (id, extra = {}) => ({ id, name: id, anime: id, faction: '', formId: null, powerScore: 500, stats: { speed: 50 }, abilityTags: [], rarity: 'Common', ...extra });
const teams = () => [Array.from({ length: 5 }, (_, i) => card(`a${i}`)), Array.from({ length: 5 }, (_, i) => card(`b${i}`))];
function complete(seed, variants = false) {
  const pool = buildPool(characters, characterForms, { variants });
  let draft = createDraft(seed);
  for (let i = 0; i < 5; i++) draft = drawCard(draft, pool, 0);
  draft = drawCard(draft, pool, 0, 4);
  return { pool, draft: draftCpu(draft, pool) };
}
describe('locked form pools and seeded drafting', () => {
  it('keeps default peaks, includes explicit forms only in variants, and preserves identities', () => {
    const peak = buildPool(characters, characterForms);
    expect(peak).toHaveLength(120); expect(peak.every(item => item.formId === null)).toBe(true);
    const forms = buildPool(characters, characterForms, { anime: 'naruto', variants: true });
    expect(forms).toHaveLength(210); expect(forms.every(item => item.anime === 'naruto')).toBe(true);
    const example = characterForms.find(form => characters.some(item => item.id === form.characterId && item.anime === 'naruto')), drawn = forms.find(item => item.formId === example.id);
    expect(drawn.id).toBe(example.characterId); expect(drawn.stats).toEqual(example.stats);
    drawn.stats.speed = 0; expect(example.stats.speed).not.toBe(0);
    expect(buildPool(characters, characterForms, { anime: 'bleach', variants: true })).toHaveLength(40);
  });
  it('produces deterministic teams with no identity duplicates across 250 seeds and both pool modes', () => {
    for (let i = 0; i < 250; i++) {
      const { draft } = complete(String(i), i % 2 === 0);
      expect(draft.teams.map(team => team.length)).toEqual([5, 5]);
      expect(new Set(draft.teams.flat().map(item => item.id)).size).toBe(10);
      expect(new Set(draft.excluded).size).toBe(draft.excluded.length);
      expect(draft.rerolls[0]).toBe(0);
    }
    expect(complete('reproduce', true).draft).toEqual(complete('reproduce', true).draft);
  });
  it('burns rerolled identities and rejects spent tokens, full teams and empty pools', () => {
    const { draft, pool } = complete('tokens');
    expect(draft.excluded.length).toBeGreaterThan(10);
    expect(() => drawCard(draft, pool, 0, 0)).toThrow(/reroll/);
    expect(() => drawCard(draft, pool, 0)).toThrow(/full/);
    expect(() => pull([], [], seededRandom('empty'))).toThrow(/unique/);
    expect(() => drawCard(draft, pool, 2)).toThrow(/player/);
  });
  it('weights rarity tiers without multiplying odds by form count', () => {
    const pool = Object.keys(GAME.rarityWeights).map((rarity, i) => card(`tier-${i}`, { rarity }));
    const counts = Object.fromEntries(Object.keys(GAME.rarityWeights).map(rarity => [rarity, 0]));
    const rng = seededRandom('rarity-distribution');
    for (let i = 0; i < 10000; i++) counts[pull(pool, [], rng).rarity]++;
    for (const [rarity, weight] of Object.entries(GAME.rarityWeights)) expect(Math.abs(counts[rarity] / 10000 - weight / 100)).toBeLessThan(.02);
    const manyForms = [card('first'), ...Array.from({ length: 50 }, (_, i) => card('second', { formId: `form-${i}` }))];
    const random = seededRandom('identities'); let first = 0;
    for (let i = 0; i < 2000; i++) first += Number(pull(manyForms, [], random).id === 'first');
    expect(first).toBeGreaterThan(900); expect(first).toBeLessThan(1100);
  });
  it('renormalizes weights to present tiers and shuffles deterministically without mutation', () => {
    const single = [card('only', { rarity: 'Mythic' })];
    expect(pull(single, [], seededRandom('single')).id).toBe('only');
    const items = [1, 2, 3, 4, 5]; expect(shuffle(items, 'order')).toEqual(shuffle(items, 'order')); expect(items).toEqual([1, 2, 3, 4, 5]);
  });
});
describe('readable bounded engine', () => {
  it('caps stacked counters and gives exactly one synergy bonus for either shared field', () => {
    const attacker = card('a', { abilityTags: ['water', 'lightning', 'haki', 'sealing'] });
    const defender = card('b', { abilityTags: ['fire', 'water', 'logia', 'regeneration'] });
    expect(matchupModifier(attacker, defender)).toBe(1.1); expect(matchupModifier(defender, attacker)).toBe(.9);
    const team = teams()[0]; expect(synergyModifier(team)).toBe(1);
    team.slice(0, 3).forEach(item => { item.anime = 'naruto'; item.faction = 'leaf'; });
    expect(synergyModifier(team)).toBe(1.05);
    team.forEach(item => { item.anime = item.id; }); expect(synergyModifier(team)).toBe(1.05);
  });
  it('replays exact powers, scores and MVP from immutable snapshots, without touching inputs', () => {
    const { draft } = complete('battle-replay', true), before = structuredClone(draft.teams);
    const first = simulateBattle(draft.teams, 'seed');
    expect(replayBattle({ version: 1, teams: before, seed: 'seed' })).toEqual(first);
    expect(draft.teams).toEqual(before); expect(first.score.reduce((a, b) => a + b)).toBe(5);
    expect(first.rounds.filter(round => round.winner === first.winner).map(round => before[first.winner][round.index].id)).toContain(first.mvp.id);
    for (const round of first.rounds) for (const factor of round.factors) {
      expect(factor.luck).toBeGreaterThanOrEqual(.92); expect(factor.luck).toBeLessThanOrEqual(1.08);
      expect(round.why).toContain('Higher effective power');
    }
    expect(() => replayBattle({ version: 2, teams: before, seed: 'seed' })).toThrow(/version/);
  });
  it('uses speed after tied power and seeded tiebreak only after speed ties', () => {
    const pair = [card('fast', { stats: { speed: 80 } }), card('slow')];
    expect(resolveRound(pair, [1, 1], () => .5).winner).toBe(0);
    expect(resolveRound(pair, [1, 1], () => .5).why).toContain('higher speed');
    pair[1].stats.speed = 80; expect(resolveRound(pair, [1, 1], () => .9).why).toContain('seeded tiebreak');
  });
  it('rejects malformed teams, duplicate identities including alternate forms, bad scores and seeds', () => {
    const invalid = teams(); invalid[1][0] = { ...invalid[0][0], formId: 'alternate' };
    expect(() => simulateBattle(invalid, 'seed')).toThrow(/identity/);
    expect(() => simulateBattle([[], []], 'seed')).toThrow(/five/);
    const bad = teams(); bad[0][0].powerScore = NaN; expect(() => simulateBattle(bad, 'seed')).toThrow(/Invalid/);
    expect(() => simulateBattle(teams(), '')).toThrow(/seed/);
  });
  it('allows close-score upsets but reliably rewards a large power gap', () => {
    let upsets = 0;
    for (let i = 0; i < 100; i++) {
      const pair = [card('strong', { powerScore: 510 }), card('close')];
      upsets += Number(resolveRound(pair, [1, 1], seededRandom(i)).winner === 1);
      pair[1].powerScore = 300; expect(resolveRound(pair, [1, 1], seededRandom(i)).winner).toBe(0);
    }
    expect(upsets).toBeGreaterThan(10); expect(upsets).toBeLessThan(50);
  });
});
it('updates rank/streak/achievements with a zero floor and preserves other profile progress', () => {
  const profile = { battleStats: { wins: 0, losses: 0, winStreak: 0, bestStreak: 0, rankPoints: 0 }, achievements: ['quiz-award'] };
  const loss = applyBattleResult(profile, { won: false, opponentPoints: 300 });
  expect(loss.delta).toBe(0); expect(loss.battleStats.losses).toBe(1);
  const win = applyBattleResult(profile, { won: true, opponentPoints: 300 });
  expect(win.delta).toBe(27); expect(win.achievements).toEqual(['quiz-award', 'first-victory']);
  profile.battleStats.winStreak = 2; profile.battleStats.bestStreak = 2;
  expect(applyBattleResult(profile, { won: true, opponentPoints: 0 }).achievements).toContain('three-win-streak');
});
