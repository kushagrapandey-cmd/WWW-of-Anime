import { COIN_CONFIG } from '../config/coins.js';

// Pure account-ledger operations. Production calls settlement only inside the
// locked match-completion transaction; the explicit local demo uses this too.
export function coinState(profile) {
  const ledger = profile?.coins?.ledger ?? [];
  return {
    ledger,
    balance: ledger.reduce((sum, item) => sum + item.amount, 0),
    streak: profile?.coins?.streak ?? 0,
    shownMilestones: profile?.coins?.shownMilestones ?? [],
  };
}
export function settleCoins(profile, { matchId, won, timestamp = new Date().toISOString() }) {
  if (!profile?.id) return null;
  if (typeof matchId !== 'string' || !matchId || typeof won !== 'boolean') throw new Error('Invalid coin result.');
  const previous = coinState(profile);
  if (previous.ledger.some(item => item.matchId === matchId)) return profile.coins;
  const streak = won ? previous.streak + 1 : 0;
  const bonus = won ? Math.min(COIN_CONFIG.bonusCap, Math.max(0, streak - COIN_CONFIG.bonusAfter) * COIN_CONFIG.bonusStep) : 0;
  const amount = won ? COIN_CONFIG.win + bonus : 0;
  return {
    streak, shownMilestones: previous.shownMilestones,
    ledger: [...previous.ledger, {
      id: `${profile.id}:${matchId}`, userId: profile.id, amount,
      reason: won ? (bonus ? 'win-streak-bonus' : 'win') : 'loss-streak-reset',
      matchId, timestamp,
    }],
  };
}
export function pendingMilestones(profile) {
  const state = coinState(profile);
  return COIN_CONFIG.milestones.filter(value => state.balance >= value && !state.shownMilestones.includes(value));
}
export function acknowledgeMilestone(profile, milestone) {
  const state = coinState(profile);
  if (!COIN_CONFIG.milestones.includes(milestone) || state.balance < milestone) throw new Error('Milestone has not been earned.');
  return { ledger: state.ledger, streak: state.streak, shownMilestones: [...new Set([...state.shownMilestones, milestone])] };
}
