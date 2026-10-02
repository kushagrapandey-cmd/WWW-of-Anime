import { MINI, boardKey } from './config.js';
export function validateSettings(settings) {
  if (!settings || !['move', 'clue', 'power'].includes(settings.mode) || typeof settings.anime !== 'string' || !/^[a-z0-9-]+$/.test(settings.anime) || typeof settings.hard !== 'boolean' || !['choice', 'typed'].includes(settings.answerMode) || typeof settings.streak !== 'boolean') throw new Error('Invalid mini-game settings.');
}
export function validateRoster(roster) {
  if (!Array.isArray(roster) || !roster.length || new Set(roster.map(card => card?.id)).size !== roster.length) throw new Error('Invalid mini-game roster.');
  roster.forEach(validateCard);
}
export function validateCard(card) {
  if (!card || typeof card.id !== 'string' || !card.id || typeof card.name !== 'string' || !card.name || typeof card.anime !== 'string' || !Number.isInteger(card.powerScore) || card.powerScore < 1 || card.powerScore > 1000 || MINI.statKeys.some(key => !Number.isInteger(card.stats?.[key]) || card.stats[key] < 1 || card.stats[key] > 100) || ['clues', 'signatureMoves', 'abilityTags'].some(key => !Array.isArray(card[key]) || card[key].some(value => typeof value !== 'string' || !value.trim()))) throw new Error('Invalid locked fighter data.');
}
export function validateSession(session) {
  if (!session || session.version !== MINI.version || typeof session.id !== 'string' || !/^mini-[a-zA-Z0-9-]{1,100}$/.test(session.id) || !(session.ownerId === null || typeof session.ownerId === 'string') || !['active', 'complete'].includes(session.status) || !Number.isSafeInteger(session.revision) || session.revision < 0 || !Number.isFinite(session.startedAt) || !Number.isFinite(session.roundStartedAt) || session.roundStartedAt < session.startedAt || !Number.isFinite(session.deadline) || typeof session.seed !== 'string' || !session.seed) throw new Error('Invalid saved mini-game.');
  validateSettings(session.settings);
  if (session.board !== boardKey(session.settings) || session.deadline !== session.roundStartedAt + (session.settings.mode === 'move' && session.settings.hard ? MINI.hardRoundMs : MINI.roundMs) || !Number.isInteger(session.cursor) || session.cursor < 0 || session.cursor >= MINI.rounds || !Array.isArray(session.rounds) || session.rounds.length !== MINI.rounds || !Number.isInteger(session.hints) || session.hints < 1 || session.hints > 3) throw new Error('Invalid mini-game rounds or timing.');
  for (const round of session.rounds) {
    if (session.settings.mode === 'power') {
      if (!Array.isArray(round.pair) || round.pair.length !== 2) throw new Error('Invalid power pair.');
      round.pair.forEach(validateCard);
      if (round.pair[0].id === round.pair[1].id || round.pair[0].powerScore === round.pair[1].powerScore) throw new Error('Power pairs must differ.');
    } else {
      validateCard(round.target);
      if (!Array.isArray(round.options) || round.options.length !== 4 || new Set(round.options.map(option => option?.id)).size !== 4 || round.options.some(option => typeof option?.id !== 'string' || typeof option.name !== 'string') || !round.options.some(option => option.id === round.target.id) || (session.settings.mode === 'clue' && round.target.clues.length < 3) || (session.settings.mode === 'move' && !session.settings.hard && (!Array.isArray(round.moves) || round.moves.length < 2 || round.moves.length > 3 || round.moves.some(move => !round.target.signatureMoves.includes(move))))) throw new Error('Invalid guessing question.');
    }
  }
  if ((session.settings.answerMode === 'typed' && session.lexicon?.length < 4) || !Array.isArray(session.lexicon) || new Set(session.lexicon.map(card => card?.id)).size !== session.lexicon.length || session.lexicon.some(card => typeof card?.id !== 'string' || typeof card.name !== 'string' || (card.aliases !== undefined && (!Array.isArray(card.aliases) || card.aliases.some(alias => typeof alias !== 'string'))))) throw new Error('Invalid saved name dictionary.');
  if (!Array.isArray(session.answers) || session.answers.length < session.cursor || session.answers.length > session.cursor + 1 || session.answers.some((answer, index) => !answer || !Number.isFinite(answer.answeredAt) || answer.answeredAt < (index ? session.answers[index - 1].answeredAt : session.startedAt) || !Number.isInteger(answer.hints) || answer.hints < 1 || answer.hints > 3 || !(answer.choice === null || typeof answer.choice === 'string') || typeof answer.timeout !== 'boolean' || !Number.isFinite(answer.roundStartedAt) || answer.roundStartedAt < session.startedAt || answer.deadline !== answer.roundStartedAt + (session.settings.hard ? MINI.hardRoundMs : MINI.roundMs) || answer.answeredAt < answer.roundStartedAt || (answer.timeout ? answer.answeredAt < answer.deadline : answer.answeredAt >= answer.deadline) || (answer.timeout && answer.choice !== null))) throw new Error('Invalid mini-game answers.');
  if (session.status === 'complete' && (session.answers.length !== MINI.rounds || !Number.isFinite(session.completedAt) || session.completedAt < session.answers.at(-1).answeredAt)) throw new Error('Invalid completed mini-game.');
  return session;
}
