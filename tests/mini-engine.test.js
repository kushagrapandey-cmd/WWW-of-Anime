import { describe, it, expect } from 'vitest';
import { miniRoster } from '../src/data/miniRoster.js';
import aliases from '../src/data/game-aliases.json';
import { MINI, boardKey } from '../src/minigames/config.js';
import { createSession, revealClue, answerRound, advanceRound, scoreSession, correctChoice, applyMiniResult } from '../src/minigames/engine.js';
import { eligibleCards, profileKey } from '../src/minigames/questions.js';
import { validateSession } from '../src/minigames/validation.js';
import { matchName } from '../src/minigames/names.js';
const settings = { mode: 'move', anime: 'all', hard: false, answerMode: 'choice', streak: false };
const make = (options = {}, seed = 'test') => createSession(miniRoster, { ...settings, ...options }, { id: 'mini-test', seed, now: 1000 });
function finish(session, { wrongIndex = -1, hints = 1 } = {}) {
  while (session.status === 'active') {
    const time = session.roundStartedAt + 10;
    while (session.settings.mode === 'clue' && session.hints < hints) session = revealClue(session, time);
    let choice = correctChoice(session, session.cursor);
    if (session.settings.answerMode === 'typed') choice = session.rounds[session.cursor].target.name;
    if (session.cursor === wrongIndex) choice = session.settings.mode === 'power' ? choice === 'higher' ? 'lower' : 'higher' : session.settings.answerMode === 'typed' ? 'unknown person' : session.rounds[session.cursor].options.find(option => option.id !== choice).id;
    session = answerRound(session, choice, time); session = advanceRound(session, time + 1);
  }
  return session;
}
describe('fixed and unambiguous rounds', () => {
  it('builds every anime/game/hard/typed combination with 10 deterministic locked peak rounds', () => {
    for (const anime of ['all', 'naruto', 'onepiece', 'bleach']) for (const mode of ['move', 'clue', 'power']) for (const hard of mode === 'move' ? [false, true] : [false]) {
      const first = make({ anime, mode, hard, answerMode: 'typed', streak: mode === 'power' });
      expect(first).toEqual(make({ anime, mode, hard, answerMode: 'typed', streak: mode === 'power' }));
      expect(first.rounds).toHaveLength(10);
      for (const round of first.rounds) for (const card of round.pair ?? [round.target]) {
        expect(card.formId).toBeNull(); if (anime !== 'all') expect(card.anime).toBe(anime);
      }
      if (mode !== 'power') expect(new Set(first.rounds.map(round => round.target.id)).size).toBe(10);
    }
  });
  it('never duplicates choice identities or produces tied power pairs across 100 seeds', () => {
    for (let i = 0; i < 100; i++) {
      const move = make({}, String(i));
      expect(move.rounds.every(round => new Set(round.options.map(option => option.id)).size === 4 && round.moves.length >= 2)).toBe(true);
      expect(make({ mode: 'power' }, String(i)).rounds.every(round => round.pair[0].id !== round.pair[1].id && round.pair[0].powerScore !== round.pair[1].powerScore)).toBe(true);
    }
  });
  it('rejects shared stat vectors, shared move/tag profiles and duplicate clue sets across identities', () => {
    const original = miniRoster[0], copy = { ...structuredClone(original), id: 'copy', name: 'Other Fighter' };
    const roster = [original, copy, ...miniRoster.slice(1)];
    for (const options of [{ hard: true }, { hard: false }, { mode: 'clue' }]) expect(eligibleCards(roster, { ...settings, ...options }).some(card => [original.id, copy.id].includes(card.id))).toBe(false);
    const hard = make({ hard: true }); expect(new Set(hard.rounds.map(round => profileKey(round.target))).size).toBe(10);
  });
  it('locks snapshot stats and validates corrupt records, small pools and equal-score-only pools', () => {
    const before = miniRoster[0].stats.attack, session = make(); session.rounds[0].target.stats.attack = 1;
    expect(miniRoster[0].stats.attack).toBe(before);
    const typed = make({ answerMode: 'typed' }), aliasEntry = typed.lexicon.find(entry => entry.id === 'edward-newgate');
    aliasEntry.aliases.push('invented alias'); expect(miniRoster.find(card => card.id === aliasEntry.id).aliases).toEqual(['Whitebeard']);
    const bad = make(); bad.deadline++; expect(() => validateSession(bad)).toThrow(/timing/);
    const other = make({ mode: 'power' }); other.rounds[0].pair[1].powerScore = other.rounds[0].pair[0].powerScore; expect(() => validateSession(other)).toThrow(/differ/);
    expect(() => createSession(miniRoster.slice(0, 3), settings, { id: 'mini-test', seed: 'x' })).toThrow(/enough/);
    expect(() => createSession(miniRoster.map(card => ({ ...card, powerScore: 500 })), { ...settings, mode: 'power' }, { id: 'mini-test', seed: 'x' })).toThrow(/unequal/);
  });
});
describe('safe typed answers', () => {
  it('accepts accent/punctuation/case differences, unique first names, small typos and data aliases', () => {
    const lexicon = make({ answerMode: 'typed' }).lexicon;
    expect(matchName('  NARUTO-UZUMAKI! ', lexicon)).toEqual({ kind: 'match', id: 'naruto-uzumaki' });
    expect(matchName('Chōji', lexicon).id).toBe('choji-akimichi'); expect(matchName('Ichgo', lexicon).id).toBe('ichigo-kurosaki');
    expect(matchName('Whitebeard', lexicon).id).toBe('edward-newgate'); expect(matchName('Chad', lexicon).id).toBe('yasutora-sado');
    for (const id of Object.keys(aliases)) expect(miniRoster.some(card => card.id === id)).toBe(true);
  });
  it('rejects shared surnames, tied fuzzy candidates and empty names without consuming an answer', () => {
    const session = make({ answerMode: 'typed' });
    expect(matchName('Uchiha', session.lexicon).kind).toBe('ambiguous');
    expect(matchName('Maris', [{ id: 'a', name: 'Marie' }, { id: 'b', name: 'Mario' }]).kind).toBe('ambiguous');
    expect(() => answerRound(session, 'Uchiha', 1010)).toThrow(/full name/);
    expect(() => answerRound(session, '', 1010)).toThrow(/Enter/); expect(session.answers).toHaveLength(0);
    expect(scoreSession(answerRound(session, 'not a character', 1010)).correct).toBe(0);
  });
});
describe('scoring and timers', () => {
  it('awards Move/Hard points, locks one answer, and requires advancement after feedback', () => {
    const session = make(), choice = correctChoice(session, 0), answered = answerRound(session, choice, 1010);
    expect(scoreSession(answered).score).toBe(100); expect(session.answers).toHaveLength(0);
    expect(() => answerRound(answered, choice, 1011)).toThrow(/already/);
    expect(() => advanceRound(session, 1011)).toThrow(/Answer/);
    expect(scoreSession(finish(make({ hard: true, answerMode: 'typed' }))).score).toBe(1500);
  });
  it('reduces Clue Chain rewards after each reveal, caps clues at three and resets hints on advance', () => {
    for (const hints of [1, 2, 3]) expect(scoreSession(finish(make({ mode: 'clue' }), { hints })).score).toBe(MINI.cluePoints[hints - 1] * 10);
    let session = revealClue(revealClue(make({ mode: 'clue' }), 1010), 1011);
    expect(() => revealClue(session, 1012)).toThrow(/No further/);
    session = answerRound(session, correctChoice(session, 0), 1020); session = advanceRound(session, 1040); expect(session.hints).toBe(1);
  });
  it('scores both power directions and resets/caps streak multipliers after a miss', () => {
    const classic = finish(make({ mode: 'power' })); expect(scoreSession(classic).score).toBe(1000);
    expect(scoreSession(finish(make({ mode: 'power', streak: true }))).score).toBe(2500);
    expect(scoreSession(finish(make({ mode: 'power', streak: true }), { wrongIndex: 3 })).score).toBe(1500);
    expect(scoreSession(classic).bestStreak).toBe(10);
  });
  it('times out exactly at the persisted deadline and starts a fresh timer only on Next', () => {
    const session = make(); expect(session.deadline - session.roundStartedAt).toBe(30000);
    const timeout = answerRound(session, correctChoice(session, 0), session.deadline); expect(timeout.answers[0].timeout).toBe(true); expect(scoreSession(timeout).score).toBe(0);
    const next = advanceRound(timeout, session.deadline + 60000); expect(next.deadline).toBe(session.deadline + 90000);
    const hard = make({ hard: true }); expect(hard.deadline - hard.roundStartedAt).toBe(45000);
    expect(() => revealClue(make({ mode: 'clue' }), session.deadline)).toThrow(/Time/);
  });
  it('keeps scoreboards separate by filter/rules and preserves prior profile high scores', () => {
    const completed = finish(make()); const profile = { gameProgress: { gamesPlayed: 3, highScores: { [completed.board]: 1200, 'clue:all:classic:choice': 3000 } } };
    const result = applyMiniResult(profile, completed); expect(result.gameProgress.gamesPlayed).toBe(4); expect(result.gameProgress.highScores[completed.board]).toBe(1200);
    expect(boardKey({ ...settings, hard: true })).not.toBe(boardKey(settings)); expect(boardKey({ ...settings, anime: 'bleach' })).not.toBe(boardKey(settings));
    expect(() => applyMiniResult(profile, make())).toThrow(/Finish/);
  });
});
