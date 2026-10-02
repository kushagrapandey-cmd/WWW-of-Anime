import { randomUUID } from 'node:crypto';
import { GAME } from '../src/game/config.js';
import { createDraft, drawCard, draftCpu } from '../src/game/draft.js';
import { buildPool } from '../src/game/pool.js';
import { simulateBattle } from '../src/game/engine.js';
import { characters, forms, catalog } from './catalog.js';
import { fail } from './security.js';
export function newMatch(user, options) {
  const { anime = 'all', variants = false, mode = 'friend' } = options;
  if (!['all', ...catalog.map(item => item.id)].includes(anime) || typeof variants !== 'boolean' || !['friend','cpu'].includes(mode)) fail(400, 'Invalid match options.');
  return { revision: 0, mode, options: { anime, variants }, names: [user.username, mode === 'cpu' ? 'CPU' : 'Waiting for rival'],
    draft: createDraft(randomUUID()), kept: [false,false], locked: [false,false], stage: mode === 'cpu' ? 'draft' : 'waiting', result: null };
}
export function matchPlayer(row, userId) {
  if (row.host_id === userId) return 0;
  if (row.guest_id === userId) return 1;
  fail(404, 'Match not found.');
}
export function changeMatch(state, player, data) {
  if (state.stage !== 'draft') fail(409, 'This match is not accepting draft changes.');
  if (state.locked[player]) fail(409, 'Your lineup is already locked.');
  let next = structuredClone(state);
  const pool = buildPool(characters, forms, state.options);
  if (['draw','reroll'].includes(data.action)) {
    if (state.kept[player]) fail(409, 'Your team is already kept.');
    next.draft = drawCard(state.draft, pool, player, data.action === 'reroll' ? state.draft.teams[player].length - 1 : null);
  } else if (data.action === 'keep') {
    if (state.draft.teams[player].length !== GAME.teamSize) fail(400, 'Reveal all five fighters first.');
    next.kept[player] = true;
    if (state.mode === 'cpu') { next.draft = draftCpu(next.draft, pool); next.kept[1] = true; next.locked[1] = true; }
  } else if (data.action === 'lock') {
    if (!state.kept[player]) fail(409, 'Keep your team before locking the lineup.');
    const ids = data.order;
    if (!Array.isArray(ids) || ids.length !== GAME.teamSize || new Set(ids).size !== GAME.teamSize || ids.some(id => !state.draft.teams[player].some(card => card.id === id))) fail(400, 'Lineup must contain your own five fighters exactly once.');
    next.draft.teams[player] = ids.map(id => state.draft.teams[player].find(card => card.id === id));
    next.locked[player] = true;
    if (next.locked.every(Boolean)) {
      next.stage = 'complete';
      next.result = { seed: randomUUID(), version: GAME.version, teams: next.draft.teams };
      next.result.outcome = simulateBattle(next.result.teams, next.result.seed);
    }
  } else fail(400, 'Unknown draft operation.');
  next.revision++; return next;
}
export function matchView(row, userId) {
  const player = matchPlayer(row, userId), state = row.state;
  return { id: row.id, revision: state.revision, player, stage: state.stage, mode: state.mode,
    names: state.names, options: state.options, expiresAt: row.expires_at,
    team: state.draft.teams[player], rerolls: state.draft.rerolls[player], kept: state.kept[player], locked: state.locked[player],
    opponent: { count: state.draft.teams[1-player].length, locked: state.locked[1-player] },
    ...(state.stage === 'complete' ? { record: { id: row.id, mode: state.mode, names: state.names, ...state.result,
      createdAt: row.created_at, saved: true, rank: state.ranks[player] }, outcome: state.result.outcome } : {}) };
}
