import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coinState, settleCoins, pendingMilestones, acknowledgeMilestone } from '../src/services/CoinsService.js';
const account = () => ({ id: 'player' });
test('ledger awards 10,10,15,20,25,30,35,35, then loss resets and retry is idempotent', () => {
 const profile = account();
 for (const [index, amount] of [10,10,15,20,25,30,35,35].entries()) {
  profile.coins = settleCoins(profile, { matchId: `match-${index}`, won: true });
  assert.equal(profile.coins.ledger.at(-1).amount, amount);
 }
 assert.equal(coinState(profile).balance, 180);
 const before = structuredClone(profile.coins);
 assert.deepEqual(settleCoins(profile, { matchId: 'match-0', won: true }), before);
 profile.coins = settleCoins(profile, { matchId: 'loss', won: false });
 assert.equal(coinState(profile).streak, 0);
 assert.equal(coinState(profile).balance, 180);
 assert.deepEqual(settleCoins(profile, { matchId: 'loss', won: false }), profile.coins);
 profile.coins = settleCoins(profile, { matchId: 'after-loss', won: true });
 assert.equal(profile.coins.ledger.at(-1).amount, 10);
 assert.equal(profile.coins.ledger.at(-1).userId, 'player');
});
test('guests and old accounts default to zero; milestones are per account, earned and acknowledged once', () => {
 assert.equal(settleCoins(null, { matchId: 'x', won: true }), null);
 assert.equal(coinState(account()).balance, 0);
 assert.deepEqual(pendingMilestones(null), []);
 const profile = account();
 assert.throws(() => acknowledgeMilestone(profile, 100));
 for (let i = 0; i < 35; i++) profile.coins = settleCoins(profile, { matchId: `m-${i}`, won: true });
 assert.deepEqual(pendingMilestones(profile), [100,500,1000]);
 for (const value of [100,500,1000]) profile.coins = acknowledgeMilestone(profile, value);
 assert.deepEqual(pendingMilestones(profile), []);
 assert.deepEqual(acknowledgeMilestone(profile,100), profile.coins);
 assert.deepEqual(coinState(account()).shownMilestones, []);
 assert.throws(() => acknowledgeMilestone(profile, 99));
});
