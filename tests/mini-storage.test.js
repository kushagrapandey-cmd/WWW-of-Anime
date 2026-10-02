import { it, expect } from 'vitest';
import { miniRoster } from '../src/data/miniRoster.js';
import { LocalMiniGameService } from '../src/services/MiniGameService.js';
import { LocalAuthService } from '../src/services/LocalAuthService.js';
import { USERS_KEY } from '../src/services/localStorageStore.js';
import { answerRound, advanceRound, correctChoice, scoreSession } from '../src/minigames/engine.js';
const settings = { mode: 'move', anime: 'all', hard: false, answerMode: 'choice', streak: false };
function setup() {
  const values = new Map(); let blocked = '', tick = 1000;
  const storage = { getItem: key => values.get(key) ?? null, setItem(key, value) { if (blocked === key) throw Error('quota'); values.set(key, value); }, removeItem: key => values.delete(key) };
  const auth = new LocalAuthService({ getStorage: () => storage, iterations: 1000 });
  return { values, auth, games: new LocalMiniGameService({ getStorage: () => storage, auth, now: () => tick++ }), block: key => { blocked = key; } };
}
function complete(games, session, wrong = false) {
  while (session.status === 'active') {
    const round = session.rounds[session.cursor];
    const choice = wrong ? round.options.find(option => option.id !== round.target.id).id : correctChoice(session, session.cursor);
    let next = answerRound(session, choice, session.roundStartedAt + 1); games.write(next, session.revision); session = next;
    next = advanceRound(session, session.roundStartedAt + 2); games.write(next, session.revision); session = next;
  }
  return session;
}
const account = { username: 'GameTester', password: 'test password' };
it('persists guest high scores independently of the last 20 histories and resumes fixed snapshots/deadlines', async () => {
  const { games } = setup(); const first = complete(games, games.start(miniRoster, settings)); await games.save(first);
  for (let i = 0; i < 25; i++) games.start(miniRoster, settings);
  expect(games.history()).toHaveLength(20); expect(games.highScores()[first.board]).toBe(1000);
  const session = games.history()[0]; expect(games.latest(session).deadline).toBe(session.deadline); expect(games.latest(session).rounds).toEqual(session.rounds);
});
it('adds completed games once, hides receipts, supports legacy profiles and leaves battle/quiz progress untouched', async () => {
  const { auth, games } = setup(); const user = await auth.signUp(account);
  const session = complete(games, games.start(miniRoster, settings, user.id)); const saved = await games.save(session); await games.save(session); await games.save(saved);
  const profile = await auth.getCurrentUser(); expect(profile.gameProgress.gamesPlayed).toBe(1); expect(profile.gameProgress.highScores[session.board]).toBe(1000);
  expect(profile).not.toHaveProperty('gameReceipts'); expect(profile.battleStats.wins).toBe(0); expect(profile.quizStats.xp).toBe(0);
});
it('keeps a higher score after a lower result and never credits result views again', async () => {
  const { games } = setup(); const first = complete(games, games.start(miniRoster, settings)); await games.save(first);
  const second = complete(games, games.start(miniRoster, settings), true); expect(scoreSession(second).score).toBe(0); await games.save(second); await games.save(first);
  expect(games.highScores()[first.board]).toBe(1000);
});
it('retries a failed profile write from the pending snapshot', async () => {
  const { auth, games, block } = setup(); const user = await auth.signUp(account);
  const session = complete(games, games.start(miniRoster, settings, user.id)); block(USERS_KEY);
  await expect(games.save(session)).rejects.toThrow(/save/); expect(games.history(user.id)[0].saved).toBe(false);
  block(''); await games.save(session); expect((await auth.getCurrentUser()).gameProgress.gamesPlayed).toBe(1);
});
it('uses receipts if final history write fails after the profile update', async () => {
  const { auth, games, block } = setup(); const user = await auth.signUp(account);
  const session = complete(games, games.start(miniRoster, settings, user.id));
  await expect(games.save(session, async next => { const profile = await auth.recordGameResult(next); block(games.key(user.id)); return profile; })).rejects.toThrow(/save/);
  expect((await auth.getCurrentUser()).gameProgress.gamesPlayed).toBe(1); block(''); await games.save(session);
  expect((await auth.getCurrentUser()).gameProgress.gamesPlayed).toBe(1); expect(games.highScores(user.id)[session.board]).toBe(1000);
});
it('rejects stale revisions/account switching and preserves corrupted storage', async () => {
  const { auth, games, values } = setup(); const first = await auth.signUp(account);
  const session = games.start(miniRoster, settings, first.id), answered = answerRound(session, correctChoice(session, 0), session.roundStartedAt + 1);
  games.write(answered, session.revision); expect(() => games.write(answered, session.revision)).toThrow(/another tab/);
  const completed = complete(games, games.start(miniRoster, settings, first.id)); await auth.signUp({ ...account, username: 'Second' });
  await expect(games.save(completed)).rejects.toThrow(/original/); await expect(auth.recordGameResult(completed)).rejects.toThrow(/changed/);
  values.set(games.key(null), '{broken'); expect(() => games.start(miniRoster, settings)).toThrow(/preserved/); expect(values.get(games.key(null))).toBe('{broken');
});
