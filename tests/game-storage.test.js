import { it, expect } from 'vitest';
import { LocalBattleService, BATTLES_KEY } from '../src/services/BattleService.js';
import { LocalAuthService } from '../src/services/LocalAuthService.js';
import { GAME } from '../src/game/config.js';
import { replayBattle } from '../src/game/engine.js';
import { USERS_KEY } from '../src/services/localStorageStore.js';
function setup() {
  const values = new Map();
  let blockedKey = '';
  const storage = { getItem: key => values.get(key) ?? null, setItem(key, value) { if (blockedKey === key) throw Error('quota'); values.set(key, value); }, removeItem: key => values.delete(key) };
  const auth = new LocalAuthService({ getStorage: () => storage, iterations: 1000 });
  return { values, auth, battles: new LocalBattleService({ getStorage: () => storage, auth }), block: key => { blockedKey = key; } };
}
const make = (ownerId = null, id = 'battle-test') => ({ id, ownerId, version: GAME.version, createdAt: new Date().toISOString(), names: ['Hero', 'CPU'], seed: 'test', opponentPoints: 300, saved: false, teams: [0, 1].map(player => Array.from({ length: 5 }, (_, index) => ({ id: `${player}-${index}`, name: `Fighter ${index}`, anime: 'naruto', formId: null, abilityTags: [], stats: { speed: 50 }, powerScore: player === 0 ? 900 : 300 }))) });
it('saves guest history, caps all device records at 20 and replays snapshot stats', async () => {
  const { battles, values } = setup();
  for (let i = 0; i < 25; i++) await battles.save(make(null, `battle-${i}`));
  const history = battles.history(); expect(history).toHaveLength(20); expect(history[0].id).toBe('battle-24');
  expect(history.every(record => record.saved && record.rank === null)).toBe(true);
  expect(JSON.parse(values.get(BATTLES_KEY))).toHaveLength(20);
  expect(replayBattle(history[0]).score).toEqual([5, 0]);
});
it('updates profile through AuthService once, including repeated saves and post-result retries', async () => {
  const { auth, battles } = setup();
  const user = await auth.signUp({ username: 'Tester', password: 'test password' });
  const record = make(user.id);
  const saved = await battles.save(record); expect(saved.rank.delta).toBe(27);
  await battles.save(record); await battles.save(saved);
  const profile = await auth.getCurrentUser(); expect(profile.battleStats.wins).toBe(1); expect(profile.battleStats.rankPoints).toBe(27);
  expect(profile.achievements).toEqual(['first-victory']); expect(profile).not.toHaveProperty('battleReceipts');
});
it('preserves a pending replay after profile write failure and retries without duplicate counting', async () => {
  const { auth, battles, block } = setup();
  const user = await auth.signUp({ username: 'Tester', password: 'test password' });
  const record = make(user.id); block(USERS_KEY);
  await expect(battles.save(record)).rejects.toThrow(/save/);
  expect(battles.history(user.id)[0].saved).toBe(false);
  block(''); await battles.save(record); expect((await auth.getCurrentUser()).battleStats.wins).toBe(1);
});
it('uses a receipt when the final history write fails after profile statistics were applied', async () => {
  const { auth, battles, block } = setup();
  const user = await auth.signUp({ username: 'Tester', password: 'test password' });
  const record = make(user.id);
  await expect(battles.save(record, async (...args) => {
    const result = await auth.updateStats(...args); block(BATTLES_KEY); return result;
  })).rejects.toThrow(/history/);
  expect((await auth.getCurrentUser()).battleStats.wins).toBe(1); expect(battles.history(user.id)[0].saved).toBe(false);
  block(''); const saved = await battles.save(record); expect(saved.rank.delta).toBe(27);
  expect((await auth.getCurrentUser()).battleStats.wins).toBe(1);
});
it('rejects account switching and keeps malformed history unchanged', async () => {
  const { auth, battles, values } = setup();
  const first = await auth.signUp({ username: 'First', password: 'test password' });
  const second = await auth.signUp({ username: 'Second', password: 'test password' });
  await expect(battles.save(make(first.id))).rejects.toThrow(/original/);
  await expect(auth.updateStats({}, { id: 'battle-test', ownerId: first.id, won: true, opponentPoints: 300 })).rejects.toThrow(/changed/);
  expect((await auth.getCurrentUser()).battleStats.wins).toBe(0); expect(battles.history(second.id)).toEqual([]);
  values.set(BATTLES_KEY, '{broken'); await expect(battles.save(make(second.id))).rejects.toThrow(/preserved/);
  expect(values.get(BATTLES_KEY)).toBe('{broken');
});
