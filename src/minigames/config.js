export const MINI = Object.freeze({
  version: 1, rounds: 10, roundMs: 30000, hardRoundMs: 45000,
  historyLimit: 20, receiptLimit: 100,
  movePoints: 100, hardPoints: 150, cluePoints: [300, 200, 100],
  powerPoints: 100, streakStep: 3, maxMultiplier: 4,
  statKeys: ['attack', 'defense', 'speed', 'durability', 'intelligence', 'versatility', 'stamina', 'feats'],
});
export const gameNames = { move: 'Move Match', clue: 'Clue Chain', power: 'Higher or Lower' };
export const boardKey = settings => [settings.mode, settings.anime, settings.mode === 'move' ? settings.hard ? 'hard' : 'normal' : settings.mode === 'power' && settings.streak ? 'streak' : 'classic', settings.mode === 'move' ? settings.answerMode : 'choice'].join(':');
export function boardLabel(key) {
  const [mode, anime, rules, answer] = key.split(':');
  return `${gameNames[mode]} · ${anime === 'all' ? 'All anime' : anime} · ${rules}${mode === 'move' ? ` · ${answer}` : ''}`;
}
