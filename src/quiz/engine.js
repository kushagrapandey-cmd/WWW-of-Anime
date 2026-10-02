import { shuffle } from '../game/random.js';
import { QUIZ } from './config.js';
import { challengeDate, challengeDeadline, validDate } from './date.js';
export function validateQuestions(questions) {
  if (!Array.isArray(questions) || !questions.length || new Set(questions.map(item => item?.id)).size !== questions.length || questions.some(item => !item || typeof item.id !== 'string' || typeof item.anime !== 'string' || typeof item.question !== 'string' || !item.question.trim() || !Object.hasOwn(QUIZ.points, item.difficulty) || item.confidence !== 'high' || !Array.isArray(item.options) || item.options.length !== 4 || new Set(item.options).size !== 4 || item.options.some(option => typeof option !== 'string' || !option.trim()) || !Number.isInteger(item.answerIndex) || item.answerIndex < 0 || item.answerIndex > 3 || typeof item.explanation !== 'string' || !item.explanation.trim() || item.canonReference?.medium !== 'manga' || typeof item.canonReference.arc !== 'string' || !item.canonReference.arc.trim() || !Number.isInteger(item.canonReference.cutoffChapter))) throw new Error('Invalid quiz question data.');
}
export function createAttempt(bank, settings, { id, ownerId = null, seed, now = Date.now() }) {
  validateQuestions(bank);
  const { mode = 'classic', anime = 'all', difficulty = 'all' } = settings;
  if (!['classic', 'blitz', 'daily'].includes(mode) || !['all', 'easy', 'medium', 'hard'].includes(difficulty)) throw new Error('Unknown quiz settings.');
  const date = mode === 'daily' ? challengeDate(now) : null;
  const effectiveSeed = date ? `daily:v${QUIZ.version}:${date}` : seed;
  const pool = bank.filter(item => mode === 'daily' || ((anime === 'all' || item.anime === anime) && (difficulty === 'all' || item.difficulty === difficulty)));
  const count = mode === 'daily' ? QUIZ.dailyCount : mode === 'classic' ? QUIZ.classicCount : pool.length;
  if (pool.length < count || !pool.length) throw new Error('Not enough questions for those settings.');
  const questions = shuffle(pool, `${effectiveSeed}:questions`).slice(0, count).map(item => {
    const order = shuffle([0, 1, 2, 3], `${effectiveSeed}:options:${item.id}`);
    return { ...structuredClone(item), options: order.map(index => item.options[index]), answerIndex: order.indexOf(item.answerIndex) };
  });
  const attempt = { id, ownerId, version: QUIZ.version, mode, anime: date ? 'all' : anime, difficulty: date ? 'all' : difficulty,
    seed: effectiveSeed, date, startedAt: now, deadline: mode === 'blitz' ? now + QUIZ.blitzMs : date ? challengeDeadline(date) : null,
    questions, answers: [], cursor: 0, revision: 0, status: 'active', completedAt: null, saved: false };
  validateAttempt(attempt); return attempt;
}
export function validateAttempt(attempt) {
  if (!attempt || attempt.version !== QUIZ.version || typeof attempt.id !== 'string' || !/^quiz-[a-zA-Z0-9-]{1,100}$/.test(attempt.id) || !(attempt.ownerId === null || typeof attempt.ownerId === 'string') || typeof attempt.seed !== 'string' || !attempt.seed.length || !['classic', 'blitz', 'daily'].includes(attempt.mode) || !['active', 'complete'].includes(attempt.status) || !Number.isFinite(attempt.startedAt) || !Number.isSafeInteger(attempt.revision) || attempt.revision < 0) throw new Error('Invalid saved quiz attempt.');
  validateQuestions(attempt.questions);
  const expectedCount = attempt.mode === 'classic' ? QUIZ.classicCount : attempt.mode === 'daily' ? QUIZ.dailyCount : attempt.questions.length;
  if (attempt.questions.length !== expectedCount || (attempt.mode === 'daily' && (!validDate(attempt.date) || attempt.date !== challengeDate(attempt.startedAt) || attempt.deadline !== challengeDeadline(attempt.date))) || (attempt.mode === 'blitz' && attempt.deadline !== attempt.startedAt + QUIZ.blitzMs) || (attempt.mode === 'classic' && attempt.deadline !== null)) throw new Error('Invalid saved quiz timing or size.');
  if (!Array.isArray(attempt.answers) || attempt.answers.length > attempt.questions.length || !Number.isInteger(attempt.cursor) || attempt.cursor < 0 || attempt.cursor >= attempt.questions.length || attempt.answers.length < attempt.cursor || attempt.answers.length > attempt.cursor + 1 || attempt.answers.some((answer, index) => !answer || answer.questionId !== attempt.questions[index].id || !Number.isInteger(answer.optionIndex) || answer.optionIndex < 0 || answer.optionIndex > 3 || !Number.isFinite(answer.answeredAt) || answer.answeredAt < (index ? attempt.answers[index - 1].answeredAt : attempt.startedAt) || (attempt.deadline !== null && answer.answeredAt >= attempt.deadline))) throw new Error('Invalid saved quiz answers.');
  if (attempt.status === 'complete' && (!Number.isFinite(attempt.completedAt) || attempt.completedAt < (attempt.answers.at(-1)?.answeredAt ?? attempt.startedAt) || (attempt.mode === 'classic' && attempt.answers.length !== expectedCount))) throw new Error('Invalid completed quiz.');
  return attempt;
}
export function answerAttempt(attempt, optionIndex, now = Date.now()) {
  validateAttempt(attempt);
  if (attempt.status !== 'active' || attempt.answers.length > attempt.cursor) throw new Error('This question is already answered.');
  if (attempt.deadline !== null && now >= attempt.deadline) throw new Error('Time is up.');
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3) throw new Error('Choose an available answer.');
  const next = { ...attempt, revision: attempt.revision + 1, answers: [...attempt.answers, { questionId: attempt.questions[attempt.cursor].id, optionIndex, answeredAt: now }] };
  validateAttempt(next); return next;
}
export function advanceAttempt(attempt, now = Date.now()) {
  validateAttempt(attempt);
  if (attempt.status !== 'active' || attempt.answers.length <= attempt.cursor) throw new Error('Answer this question first.');
  if (attempt.cursor === attempt.questions.length - 1 || (attempt.deadline !== null && now >= attempt.deadline)) return finishAttempt(attempt, now);
  return { ...attempt, revision: attempt.revision + 1, cursor: attempt.cursor + 1 };
}
export function finishAttempt(attempt, now = Date.now()) {
  validateAttempt(attempt);
  if (attempt.status === 'complete') return attempt;
  if (attempt.answers.length !== attempt.questions.length && (attempt.deadline === null || now < attempt.deadline)) throw new Error('This quiz is still in progress.');
  const next = { ...attempt, revision: attempt.revision + 1, status: 'complete', completedAt: now };
  validateAttempt(next); return next;
}
export function scoreAttempt(attempt) {
  if (attempt.online) return attempt.result;
  validateAttempt(attempt);
  let score = 0, streak = 0, bestStreak = 0, correct = 0;
  for (const [index, answer] of attempt.answers.entries()) {
    if (answer.optionIndex === attempt.questions[index].answerIndex) {
      correct++; streak++; bestStreak = Math.max(bestStreak, streak);
      const multiplier = attempt.mode === 'blitz' ? Math.min(QUIZ.maxMultiplier, 1 + Math.floor(streak / QUIZ.streakStep)) : 1;
      score += QUIZ.points[attempt.questions[index].difficulty] * multiplier;
    } else streak = 0;
  }
  const denominator = attempt.mode === 'blitz' ? attempt.answers.length : attempt.questions.length;
  return { score, correct, answered: attempt.answers.length, total: attempt.questions.length, accuracy: denominator ? Math.round(correct / denominator * 100) : 0,
    xp: Math.floor(score / QUIZ.pointsPerXp), streak, bestStreak };
}
