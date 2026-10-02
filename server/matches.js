import { randomUUID } from 'node:crypto';
import { newMatch, changeMatch, matchPlayer, matchView } from './matchEngine.js';
import { applyBattleResult } from '../src/game/profileResult.js';
import { GAME } from '../src/game/config.js';
import { token, digest, fail } from './security.js';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export async function matchRoute(db, user, action, data) {
  if (action === 'list') {
    const { rows } = await db.query('SELECT * FROM app_matches WHERE host_id=$1 OR guest_id=$1 ORDER BY created_at DESC LIMIT 20', [user.id]);
    return rows.map(row => {
      const expired = row.state.stage !== 'complete' && new Date(row.expires_at).getTime() <= Date.now();
      return { id: row.id, names: row.state.names, stage: expired ? 'expired' : row.state.stage, createdAt: row.created_at };
    });
  }
  if (action === 'create') {
    const id = randomUUID(), raw = token(), state = newMatch(user, data);
    const { rows } = await db.query("INSERT INTO app_matches(id,host_id,invite_hash,expires_at,state) VALUES($1,$2,$3,now()+interval '24 hours',$4) RETURNING *", [id,user.id,state.mode==='friend'?digest(raw):null,JSON.stringify(state)]);
    return { ...matchView(rows[0],user.id), invite: state.mode==='friend'?raw:null };
  }
  if (action === 'join' && !/^[a-f0-9]{64}$/.test(data.invite ?? '')) fail(404, 'Invite not found.');
  if (action !== 'join' && !uuid.test(data.id ?? '')) fail(404, 'Match not found.');
  return db.transaction(async client => {
    const { rows } = action === 'join'
      ? await client.query('SELECT * FROM app_matches WHERE invite_hash=$1 FOR UPDATE', [digest(data.invite)])
      : await client.query('SELECT * FROM app_matches WHERE id=$1 FOR UPDATE', [data.id]);
    const row = rows[0]; if (!row) fail(404,'Match or invite not found.');
    if (action === 'join') {
      if (row.host_id === user.id) fail(409,'Player 2 must sign in with a different account.');
      if (row.guest_id && row.guest_id !== user.id) fail(409,'This invite has already been accepted.');
      if (new Date(row.expires_at).getTime() <= Date.now()) fail(410,'This invite has expired.');
      if (!row.guest_id) { row.guest_id = user.id; row.state.names[1] = user.username; row.state.stage = 'draft'; row.state.revision++; }
    } else {
      const player = matchPlayer(row,user.id);
      if (row.state.stage !== 'complete' && new Date(row.expires_at).getTime() <= Date.now()) fail(410,'This match has expired. Start a new draft.');
      if (action === 'view') return matchView(row,user.id);
      if (!Number.isInteger(data.revision) || data.revision !== row.state.revision) fail(409,'The match changed. Refresh and try again.');
      if (action === 'invite') {
        if (player !== 0 || row.guest_id || row.state.mode !== 'friend') fail(409,'This match cannot issue another invite.');
        const raw = token(); row.invite_hash = digest(raw); row.state.revision++;
        await client.query('UPDATE app_matches SET invite_hash=$2,state=$3 WHERE id=$1',[row.id,row.invite_hash,JSON.stringify(row.state)]);
        return { ...matchView(row,user.id), invite:raw };
      }
      row.state = changeMatch(row.state,player,{...data,action});
      if (row.state.stage === 'complete') await award(client,row);
    }
    await client.query('UPDATE app_matches SET guest_id=$2,state=$3 WHERE id=$1',[row.id,row.guest_id,JSON.stringify(row.state)]);
    return matchView(row,user.id);
  });
}
async function award(client,row) {
  // Row lock + same transaction makes completion and both profile updates exactly once.
  const ids = [row.host_id,row.guest_id].filter(Boolean).sort();
  const { rows } = await client.query('SELECT id,profile FROM app_users WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[ids]);
  const profiles = [row.host_id,row.guest_id].map(id => rows.find(user=>user.id===id)?.profile);
  const ratings = profiles.map(profile => profile?.battleStats.rankPoints ?? GAME.cpuRating);
  row.state.ranks = [];
  for (const [player,profile] of profiles.entries()) {
    if (!profile) continue;
    const result = applyBattleResult(profile,{won:row.state.result.outcome.winner===player,opponentPoints:ratings[1-player]});
    row.state.ranks[player] = { delta:result.delta,rankPoints:result.battleStats.rankPoints };
    await client.query('UPDATE app_users SET profile=$2 WHERE id=$1',[profile.id,JSON.stringify({...profile,battleStats:result.battleStats,achievements:result.achievements})]);
  }
}
