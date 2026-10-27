// Cosmetic goals use already-verified profile statistics. They never award coins.
export const PLAYER_GOALS = [
  { id: 'first-victory', title: 'Arena Challenger', description: 'Win your first arena match', target: 1, metric: 'wins', href: '/battle' },
  { id: 'five-victories', title: 'Battle Tactician', description: 'Win five arena matches', target: 5, metric: 'wins', href: '/battle' },
  { id: 'quiz-explorer', title: 'Lore Seeker', description: 'Complete three quizzes', target: 3, metric: 'quizzes', href: '/quizzes' },
  { id: 'quiz-scholar', title: 'Anime Scholar', description: 'Earn 1,000 quiz XP', target: 1000, metric: 'xp', href: '/quizzes' },
  { id: 'game-explorer', title: 'Clue Hunter', description: 'Finish five guessing games', target: 5, metric: 'games', href: '/games' },
  { id: 'daily-devotion', title: 'Daily Adventurer', description: 'Reach a three-day daily quiz streak', target: 3, metric: 'daily', href: '/quizzes?mode=daily' },
];
export function playerGoals(user) {
  const values = { wins: user?.battleStats?.wins ?? 0, quizzes: user?.quizStats?.quizzesPlayed ?? 0, xp: user?.quizStats?.xp ?? 0, games: user?.gameProgress?.gamesPlayed ?? 0, daily: user?.quizStats?.bestDailyStreak ?? 0 };
  return PLAYER_GOALS.map(goal => ({ ...goal, value: values[goal.metric], unlocked: values[goal.metric] >= goal.target }));
}
export function playerTitle(user) { return playerGoals(user).filter(goal => goal.unlocked).at(-1)?.title ?? 'New Challenger'; }
