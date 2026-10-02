import { MINI, boardKey } from './config.js';
import { makeRounds } from './questions.js';
import { matchName } from './names.js';
import { validateRoster, validateSession, validateSettings } from './validation.js';
export function createSession(roster, settings, { id, ownerId = null, seed, now = Date.now() }) {
  validateSettings(settings); validateRoster(roster);
  if (typeof seed !== 'string' || !seed.length) throw new Error('Invalid game seed.');
  const normalized = { ...settings, hard: settings.mode === 'move' && settings.hard, answerMode: settings.mode === 'move' ? settings.answerMode : 'choice', streak: settings.mode === 'power' && settings.streak };
  const duration = normalized.hard ? MINI.hardRoundMs : MINI.roundMs;
  const session = { id, ownerId, version: MINI.version, settings: normalized, board: boardKey(normalized), seed,
    rounds: makeRounds(roster, normalized, seed), lexicon: normalized.answerMode === 'typed' ? roster.map(({ id, name, aliases = [] }) => ({ id, name, aliases: [...aliases] })) : [],
    startedAt: now, roundStartedAt: now, deadline: now + duration, hints: 1, cursor: 0, revision: 0,
    answers: [], status: 'active', completedAt: null, saved: false };
  validateSession(session); return session;
}
export function revealClue(session, now = Date.now()) {
  validateSession(session);
  if (session.settings.mode !== 'clue' || session.status !== 'active' || session.answers.length > session.cursor || session.hints >= 3) throw new Error('No further clue available.');
  if (now >= session.deadline) throw new Error('Time is up.');
  return { ...session, hints: session.hints + 1, revision: session.revision + 1 };
}
export function answerRound(session, input = null, now = Date.now()) {
  validateSession(session);
  if (session.status !== 'active' || session.answers.length > session.cursor) throw new Error('This round is already answered.');
  let choice = input, timeout = now >= session.deadline;
  if (timeout) choice = null;
  else if (session.settings.mode === 'move' && session.settings.answerMode === 'typed') {
    const matched = matchName(input ?? '', session.lexicon);
    if (matched.kind === 'ambiguous') throw new Error('That name matches several fighters. Use a full name.');
    if (matched.kind === 'invalid') throw new Error('Enter a character name.');
    choice = matched.id;
  } else if (session.settings.mode === 'power') {
    if (!['higher', 'lower'].includes(choice)) throw new Error('Choose Higher or Lower.');
  } else if (!session.rounds[session.cursor].options.some(option => option.id === choice)) throw new Error('Choose an available fighter.');
  const next = { ...session, revision: session.revision + 1, answers: [...session.answers, { choice, timeout, input: session.settings.answerMode === 'typed' ? String(input ?? '').trim().slice(0, 128) : null, hints: session.hints, answeredAt: now, roundStartedAt: session.roundStartedAt, deadline: session.deadline }] };
  validateSession(next); return next;
}
export function advanceRound(session, now = Date.now()) {
  validateSession(session);
  if (session.status !== 'active' || session.answers.length <= session.cursor) throw new Error('Answer this round first.');
  const next = session.cursor === MINI.rounds - 1 ? { ...session, status: 'complete', completedAt: now, revision: session.revision + 1 } : {
    ...session, cursor: session.cursor + 1, hints: 1, roundStartedAt: now, deadline: now + (session.settings.hard ? MINI.hardRoundMs : MINI.roundMs), revision: session.revision + 1,
  };
  validateSession(next); return next;
}
export function correctChoice(session, index) {
  if (session.online) return session.correctChoices[index];
  const round = session.rounds[index];
  return session.settings.mode === 'power' ? round.pair[1].powerScore > round.pair[0].powerScore ? 'higher' : 'lower' : round.target.id;
}
export function scoreSession(session) {
  if (session.online) return session.result;
  validateSession(session);
  let score = 0, streak = 0, bestStreak = 0, correct = 0;
  const details = session.answers.map((answer, index) => {
    const won = !answer.timeout && answer.choice === correctChoice(session, index);
    let points = 0;
    if (won) {
      correct++; streak++; bestStreak = Math.max(bestStreak, streak);
      const multiplier = session.settings.streak ? Math.min(MINI.maxMultiplier, 1 + Math.floor(streak / MINI.streakStep)) : 1;
      points = session.settings.mode === 'clue' ? MINI.cluePoints[answer.hints - 1] : session.settings.mode === 'move' ? session.settings.hard ? MINI.hardPoints : MINI.movePoints : MINI.powerPoints * multiplier;
    } else streak = 0;
    score += points; return { correct: won, points, timeout: answer.timeout };
  });
  return { score, correct, answered: session.answers.length, accuracy: Math.round(correct / MINI.rounds * 100), streak, bestStreak, details };
}
export function applyMiniResult(profile, session) {
  if (session.status !== 'complete') throw new Error('Finish all ten rounds before saving a high score.');
  const result = scoreSession(session), previous = profile.gameProgress ?? { gamesPlayed: 0, highScores: {} };
  return { gameProgress: { gamesPlayed: previous.gamesPlayed + 1, highScores: { ...previous.highScores, [session.board]: Math.max(previous.highScores[session.board] ?? 0, result.score) } }, result };
}
