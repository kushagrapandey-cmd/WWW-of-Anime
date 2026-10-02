import { it, expect } from 'vitest';
import { LocalQuizService } from '../src/services/QuizService.js';
import { LocalAuthService } from '../src/services/LocalAuthService.js';
import { USERS_KEY } from '../src/services/localStorageStore.js';
import { quizQuestions } from '../src/data/quizzes/index.js';
import { answerAttempt, advanceAttempt, finishAttempt } from '../src/quiz/engine.js';
const start = Date.parse('2026-10-02T09:00:00Z');
function setup() {
  const values = new Map(); let blocked = '', time = start;
  const storage = { getItem: key => values.get(key) ?? null, setItem(key, value) { if (blocked === key) throw Error('quota'); values.set(key, value); }, removeItem: key => values.delete(key) };
  const auth = new LocalAuthService({ getStorage: () => storage, iterations: 1000 });
  return { values, auth, quizzes: new LocalQuizService({ getStorage: () => storage, auth, now: () => time }), block: key => { blocked = key; }, clock: now => { time = now; } };
}
function complete(quizzes, attempt) {
  while (attempt.status !== 'complete') {
    let next = answerAttempt(attempt, attempt.questions[attempt.cursor].answerIndex, start); quizzes.write(next, attempt.revision); attempt = next;
    next = advanceAttempt(attempt, start); quizzes.write(next, attempt.revision); attempt = next;
  }
  return attempt;
}
const account = { username: 'QuizTester', password: 'test password' };
it('reserves one guest Daily attempt, resumes its saved answer and keeps it after 25 practice starts', () => {
  const { quizzes } = setup(); const first = quizzes.start(quizQuestions, { mode: 'daily' });
  const answer = answerAttempt(first, 0, start); quizzes.write(answer, first.revision);
  expect(quizzes.start(quizQuestions, { mode: 'daily' })).toEqual(answer);
  for (let i = 0; i < 25; i++) quizzes.start(quizQuestions, { mode: 'classic' });
  expect(quizzes.start(quizQuestions, { mode: 'daily' }).answers).toHaveLength(1);
  expect(quizzes.history().length).toBeLessThanOrEqual(21);
});
it('saves score/XP once per result, supports legacy profiles and keeps battle/quiz totals separate', async () => {
  const { auth, quizzes } = setup(); const user = await auth.signUp(account);
  const attempt = complete(quizzes, quizzes.start(quizQuestions, { mode: 'classic', difficulty: 'easy' }, user.id));
  const saved = await quizzes.save(attempt); await quizzes.save(attempt); await quizzes.save(saved);
  const profile = await auth.getCurrentUser(); expect(profile.quizStats).toMatchObject({ quizzesPlayed: 1, xp: 100, bestScore: 100 });
  expect(profile.quizProgress.bestScores.classic).toBe(1000); expect(profile.battleStats.wins).toBe(0);
  expect(profile).not.toHaveProperty('quizReceipts'); expect(profile.achievements).toContain('perfect-quiz');
});
it('retains completed pending results when profile writes fail, then retries exactly once', async () => {
  const { auth, quizzes, block } = setup(); const user = await auth.signUp(account);
  const attempt = complete(quizzes, quizzes.start(quizQuestions, { mode: 'daily' }, user.id));
  block(USERS_KEY); await expect(quizzes.save(attempt)).rejects.toThrow(/save/);
  expect(quizzes.history(user.id)[0].saved).toBe(false); block(''); await quizzes.save(attempt);
  expect((await auth.getCurrentUser()).quizStats.dailyStreak).toBe(1);
  expect(quizzes.start(quizQuestions, { mode: 'daily' }, user.id).status).toBe('complete');
});
it('recovers final history write failure using profile receipts and does not repeat XP', async () => {
  const { auth, quizzes, block } = setup(); const user = await auth.signUp(account);
  const attempt = complete(quizzes, quizzes.start(quizQuestions, { mode: 'classic' }, user.id));
  await expect(quizzes.save(attempt, async next => { const profile = await auth.recordQuizResult(next); block(quizzes.key(user.id)); return profile; })).rejects.toThrow(/save/);
  const xp = (await auth.getCurrentUser()).quizStats.xp; block(''); await quizzes.save(attempt);
  expect((await auth.getCurrentUser()).quizStats.xp).toBe(xp); expect((await auth.getCurrentUser()).quizStats.quizzesPlayed).toBe(1);
});
it('blocks stale tab revisions, another account’s credit and overwriting corrupt history', async () => {
  const { auth, quizzes, values } = setup(); const first = await auth.signUp(account);
  const attempt = quizzes.start(quizQuestions, { mode: 'blitz' }, first.id), answer = answerAttempt(attempt, 0, start);
  quizzes.write(answer, attempt.revision); expect(() => quizzes.write(answer, attempt.revision)).toThrow(/another tab/);
  const expired = finishAttempt(answer, start + 60000); quizzes.write(expired, answer.revision);
  await auth.signUp({ ...account, username: 'Second' }); await expect(quizzes.save(expired)).rejects.toThrow(/original/);
  await expect(auth.recordQuizResult(expired)).rejects.toThrow(/changed/);
  values.set(quizzes.key(null), '{broken'); expect(() => quizzes.start(quizQuestions, { mode: 'daily' })).toThrow(/preserved/);
  expect(values.get(quizzes.key(null))).toBe('{broken');
});
it('resets daily streak after a missed day and retains the original Blitz deadline on reload', async () => {
  const { auth, quizzes, clock } = setup(); const user = await auth.signUp(account);
  await quizzes.save(complete(quizzes, quizzes.start(quizQuestions, { mode: 'daily' }, user.id)));
  clock(start + 3 * 86400000); const nextDay = quizzes.start(quizQuestions, { mode: 'daily' }, user.id);
  let finished = nextDay;
  while (finished.status !== 'complete') {
    let next = answerAttempt(finished, finished.questions[finished.cursor].answerIndex, nextDay.startedAt); quizzes.write(next, finished.revision); finished = next;
    next = advanceAttempt(finished, nextDay.startedAt); quizzes.write(next, finished.revision); finished = next;
  }
  await quizzes.save(finished); expect((await auth.getCurrentUser()).quizStats.dailyStreak).toBe(1);
  const blitz = quizzes.start(quizQuestions, { mode: 'blitz' }, user.id); clock(blitz.deadline + 1000);
  expect(quizzes.latest(blitz).deadline).toBe(blitz.startedAt + 60000);
  expect(finishAttempt(quizzes.latest(blitz), blitz.deadline + 1000).status).toBe('complete');
});
it('preserves invalid new profile metadata and rejects a duplicate Daily credit under another result ID', async () => {
  const { auth, quizzes, values } = setup(); const user = await auth.signUp(account);
  const completed = complete(quizzes, quizzes.start(quizQuestions, { mode: 'daily' }, user.id));
  await quizzes.save(completed);
  await expect(auth.recordQuizResult({ ...completed, id: 'quiz-other-daily' })).rejects.toThrow(/already/);
  expect((await auth.getCurrentUser()).quizStats.quizzesPlayed).toBe(1);
  const records = JSON.parse(values.get(USERS_KEY)); records[0].quizProgress.bestScores.classic = -1;
  const broken = JSON.stringify(records); values.set(USERS_KEY, broken);
  await expect(auth.recordQuizResult(completed)).rejects.toThrow(/invalid/);
  expect(values.get(USERS_KEY)).toBe(broken);
});
