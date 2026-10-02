import { scoreAttempt } from './engine.js';
import { previousDate } from './date.js';
export function applyQuizResult(profile, attempt) {
  if (attempt.status !== 'complete') throw new Error('Finish the quiz before saving progress.');
  const result = scoreAttempt(attempt), previous = profile.quizStats;
  const progress = profile.quizProgress ?? { lastDailyDate: null, bestScores: {} };
  let dailyStreak = previous.dailyStreak, lastDailyDate = progress.lastDailyDate;
  if (attempt.mode === 'daily' && (!lastDailyDate || attempt.date > lastDailyDate)) {
    dailyStreak = lastDailyDate === previousDate(attempt.date) ? dailyStreak + 1 : 1;
    lastDailyDate = attempt.date;
  }
  return {
    quizStats: { ...previous, quizzesPlayed: previous.quizzesPlayed + 1, bestScore: Math.max(previous.bestScore, result.accuracy), xp: previous.xp + result.xp,
      dailyStreak, bestDailyStreak: Math.max(previous.bestDailyStreak, dailyStreak) },
    quizProgress: { lastDailyDate, bestScores: { ...progress.bestScores, [attempt.mode]: Math.max(progress.bestScores[attempt.mode] ?? 0, result.score) } },
    achievements: [...new Set([...profile.achievements, ...(result.accuracy === 100 && result.answered > 0 ? ['perfect-quiz'] : []), ...(dailyStreak >= 3 ? ['three-day-scholar'] : [])])],
    result,
  };
}
export function currentDailyStreak(profile, today) {
  const last = profile?.quizProgress?.lastDailyDate;
  return last && (last === today || last === previousDate(today)) ? profile.quizStats.dailyStreak : 0;
}
