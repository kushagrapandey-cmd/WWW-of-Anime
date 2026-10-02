import { describe, it, expect } from 'vitest';
import { quizQuestions } from '../src/data/quizzes/index.js';
import { QUIZ } from '../src/quiz/config.js';
import { challengeDate, challengeDeadline, previousDate, validDate } from '../src/quiz/date.js';
import { createAttempt, answerAttempt, advanceAttempt, finishAttempt, scoreAttempt, validateAttempt, validateQuestions } from '../src/quiz/engine.js';
import { applyQuizResult, currentDailyStreak } from '../src/quiz/profileResult.js';
const start = Date.parse('2026-10-02T09:00:00Z');
const make = (settings = {}) => createAttempt(quizQuestions, { mode: 'classic', ...settings }, { id: 'quiz-test', seed: 'repeatable', now: start, ownerId: 'tester' });
function complete(attempt, choices = []) {
  while (attempt.status === 'active') {
    const index = attempt.cursor, question = attempt.questions[index];
    attempt = answerAttempt(attempt, choices[index] === false ? (question.answerIndex + 1) % 4 : question.answerIndex, start + index * 10);
    attempt = advanceAttempt(attempt, start + index * 10 + 1);
  }
  return attempt;
}
describe('quiz bank and selection', () => {
  it('has 90 unique four-option high-confidence manga questions, 10 per anime/difficulty', () => {
    validateQuestions(quizQuestions); expect(quizQuestions).toHaveLength(90);
    for (const anime of ['naruto', 'onepiece', 'bleach']) for (const difficulty of ['easy', 'medium', 'hard']) expect(quizQuestions.filter(question => question.anime === anime && question.difficulty === difficulty)).toHaveLength(10);
    expect(quizQuestions.every(question => question.canonReference.medium === 'manga')).toBe(true);
  });
  it('filters anime/difficulty and reproducibly shuffles questions and their answer mappings', () => {
    const settings = { anime: 'bleach', difficulty: 'hard' }, first = make(settings);
    expect(first.questions).toEqual(make(settings).questions);
    expect(new Set(first.questions.map(question => question.id)).size).toBe(10);
    expect(first.questions.every(question => question.anime === 'bleach' && question.difficulty === 'hard')).toBe(true);
    for (const question of first.questions) {
      const original = quizQuestions.find(item => item.id === question.id);
      expect(question.options[question.answerIndex]).toBe(original.options[original.answerIndex]);
    }
    expect(first.questions.some(question => question.answerIndex !== 0)).toBe(true);
  });
  it('gives every account the same five daily questions/options regardless of filters, identity or random seed', () => {
    const first = make({ mode: 'daily' });
    const second = createAttempt(quizQuestions, { mode: 'daily', anime: 'bleach', difficulty: 'hard' }, { id: 'quiz-other', seed: 'different', now: start + 1000, ownerId: 'other' });
    expect(first.questions).toEqual(second.questions); expect(first.questions).toHaveLength(5);
    const tomorrow = createAttempt(quizQuestions, { mode: 'daily' }, { id: 'quiz-tomorrow', seed: 'different', now: start + QUIZ.dayMs });
    expect(first.questions.map(question => question.id)).not.toEqual(tomorrow.questions.map(question => question.id));
  });
  it('rejects bad pools, options, confidence, unknown settings and corrupt saved attempts', () => {
    expect(() => createAttempt([], {}, {})).toThrow(/question/);
    expect(() => make({ anime: 'missing' })).toThrow(/Not enough/);
    expect(() => make({ mode: 'invalid' })).toThrow(/settings/);
    const bad = make(); bad.questions[0].options[1] = bad.questions[0].options[0]; expect(() => validateAttempt(bad)).toThrow(/question/);
    const wrong = make(); wrong.answers = [{ questionId: 'unknown', optionIndex: 0, answeredAt: start }]; expect(() => validateAttempt(wrong)).toThrow(/answers/);
    const clock = make({ mode: 'blitz' }); clock.deadline++; expect(() => validateAttempt(clock)).toThrow(/timing/);
  });
});
describe('answers, scores and deadlines', () => {
  it('locks an answer once, requires feedback advancement and does not mutate snapshots', () => {
    const first = make(), before = structuredClone(first);
    expect(() => advanceAttempt(first, start)).toThrow(/Answer/);
    const answered = answerAttempt(first, first.questions[0].answerIndex, start);
    expect(first).toEqual(before); expect(answered.revision).toBe(1);
    expect(() => answerAttempt(answered, 0, start)).toThrow(/already/);
    expect(advanceAttempt(answered, start).cursor).toBe(1);
    expect(() => finishAttempt(first, start)).toThrow(/progress/);
  });
  it('scores classic accuracy/XP against all 10 questions without a streak multiplier', () => {
    const finished = complete(make({ difficulty: 'easy' }), [true, false, true, false]);
    expect(scoreAttempt(finished)).toMatchObject({ correct: 8, answered: 10, accuracy: 80, score: 800, xp: 80, bestStreak: 6 });
  });
  it('caps the Blitz multiplier, resets it on misses and uses answered accuracy', () => {
    const finished = complete(make({ mode: 'blitz', anime: 'naruto', difficulty: 'easy' }));
    expect(scoreAttempt(finished)).toMatchObject({ score: 2500, accuracy: 100, xp: 250, bestStreak: 10 });
    const missed = complete(make({ mode: 'blitz', anime: 'naruto', difficulty: 'easy' }), [true, true, true, false]);
    expect(scoreAttempt(missed).score).toBe(1500);
    let partial = make({ mode: 'blitz' }); partial = answerAttempt(partial, partial.questions[0].answerIndex, start);
    partial = finishAttempt(partial, start + 60000); expect(scoreAttempt(partial).accuracy).toBe(100);
    expect(scoreAttempt(finishAttempt(make({ mode: 'blitz' }), start + 60000)).accuracy).toBe(0);
  });
  it('counts partial Daily unanswered questions as incorrect and rejects answers at/after deadline', () => {
    let daily = make({ mode: 'daily' }); daily = answerAttempt(daily, daily.questions[0].answerIndex, start);
    const result = scoreAttempt(finishAttempt(daily, daily.deadline)); expect(result.accuracy).toBe(20);
    const blitz = make({ mode: 'blitz' }); expect(() => answerAttempt(blitz, 0, blitz.deadline)).toThrow(/Time/);
    expect(() => answerAttempt(blitz, 0, start - 1)).toThrow(/answers/);
  });
  it('resolves the India-time midnight boundary and leap days correctly', () => {
    expect(challengeDate(Date.parse('2026-10-02T18:29:59Z'))).toBe('2026-10-02');
    expect(challengeDate(Date.parse('2026-10-02T18:30:00Z'))).toBe('2026-10-03');
    expect(challengeDeadline('2026-10-02')).toBe(Date.parse('2026-10-02T18:30:00Z'));
    expect(previousDate('2028-03-01')).toBe('2028-02-29'); expect(validDate('2026-02-30')).toBe(false);
  });
});
it('adds XP/high scores, preserves battle stats and maintains daily streaks across gaps and delayed saves', () => {
  const profile = { quizStats: { quizzesPlayed: 0, bestScore: 0, xp: 0, dailyStreak: 2, bestDailyStreak: 2 }, quizProgress: { lastDailyDate: '2026-10-01', bestScores: { blitz: 900 } }, achievements: ['first-victory'] };
  const result = applyQuizResult(profile, complete(make({ mode: 'daily' })));
  expect(result.quizStats.dailyStreak).toBe(3); expect(result.achievements).toContain('three-day-scholar'); expect(result.achievements).toContain('first-victory');
  expect(result.quizProgress.bestScores.blitz).toBe(900);
  profile.quizProgress.lastDailyDate = '2026-09-29'; expect(applyQuizResult(profile, complete(make({ mode: 'daily' }))).quizStats.dailyStreak).toBe(1);
  profile.quizProgress.lastDailyDate = '2026-10-03'; expect(applyQuizResult(profile, complete(make({ mode: 'daily' }))).quizProgress.lastDailyDate).toBe('2026-10-03');
  expect(currentDailyStreak(profile, '2026-10-06')).toBe(0);
  expect(() => applyQuizResult(profile, make())).toThrow(/Finish/);
});
