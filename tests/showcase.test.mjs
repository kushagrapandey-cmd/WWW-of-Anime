import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { playerGoals, playerTitle } from '../src/data/progression.js';
const load = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
test('every identity has two local WebP variants and a traceable catalog source', () => {
  const portraits = load('src/data/character-images.json');
  const identities = load('src/data/character-identities.json');
  assert.equal(identities.length, 120);
  assert.deepEqual(new Set(identities.map(item => item.id)), new Set(Object.keys(portraits)));
  for (const [id, portrait] of Object.entries(portraits)) {
    assert.match(portrait.sourcePage, /^https:\/\/myanimelist\.net\/character\//);
    for (const key of ['image', 'thumbnail']) {
      assert.equal(portrait[key], `/characters/${id}${key === 'thumbnail' ? '-small' : ''}.webp`);
      const path = new URL(`../public${portrait[key]}`, import.meta.url);
      assert(existsSync(path));
      const data = readFileSync(path); assert.equal(data.toString('ascii', 0, 4), 'RIFF'); assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    }
  }
});
test('cosmetic goals derive from persisted records without changing coins or profiles', () => {
  assert.equal(playerTitle(null), 'New Challenger');
  const user = { battleStats: { wins: 5 }, quizStats: { quizzesPlayed: 3, xp: 1000, bestDailyStreak: 3 }, gameProgress: { gamesPlayed: 5 }, coins: { ledger: [] } };
  const before = structuredClone(user);
  assert(playerGoals(user).every(goal => goal.unlocked));
  assert.equal(playerGoals({ battleStats: { wins: 1 } }).filter(goal => goal.unlocked).length, 1);
  assert.deepEqual(user, before);
});
