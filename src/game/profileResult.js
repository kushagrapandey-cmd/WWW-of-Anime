import { GAME } from './config.js';
export function applyBattleResult(profile, { won, opponentPoints }) {
  if (typeof won !== 'boolean' || !Number.isFinite(opponentPoints) || opponentPoints < 0) throw new Error('Invalid battle rating.');
  const previous = profile.battleStats;
  const expected = 1 / (1 + 10 ** ((opponentPoints - previous.rankPoints) / GAME.rankScale));
  const rankPoints = Math.max(0, previous.rankPoints + Math.round(GAME.rankK * ((won ? 1 : 0) - expected)));
  const winStreak = won ? previous.winStreak + 1 : 0;
  const battleStats = { wins: previous.wins + Number(won), losses: previous.losses + Number(!won), winStreak, bestStreak: Math.max(previous.bestStreak, winStreak), rankPoints };
  const achievements = [...new Set([...profile.achievements, ...(won ? ['first-victory'] : []), ...(winStreak >= 3 ? ['three-win-streak'] : [])])];
  return { battleStats, achievements, delta: rankPoints - previous.rankPoints };
}
