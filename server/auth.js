import { randomUUID } from 'node:crypto';
import { profileAvatars } from '../src/data/profile.js';
import { credentials, hashPassword, verifyPassword, fail, token, digest, readSession, sessionCookie, rateLimit } from './security.js';
export function initialProfile(id, username) {
  return { id, username, avatar: 'leaf', createdAt: new Date().toISOString(), achievements: [],
    battleStats: { wins: 0, losses: 0, winStreak: 0, bestStreak: 0, rankPoints: 0 },
    quizStats: { quizzesPlayed: 0, bestScore: 0, xp: 0, dailyStreak: 0, bestDailyStreak: 0 },
    quizProgress: { lastDailyDate: null, bestScores: {} }, gameProgress: { gamesPlayed: 0, highScores: {} } };
}
export async function currentUser(db, req, secure) {
  const raw = readSession(req, secure);
  if (!raw) return null;
  const { rows } = await db.query('SELECT u.profile FROM app_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()', [digest(raw)]);
  return rows[0]?.profile ?? null;
}
export async function authRoute(db, action, data, req, res, secure, ipKey) {
  if (action === 'me') return currentUser(db, req, secure);
  if (action === 'logout') {
    const raw = readSession(req, secure);
    if (raw) await db.query('DELETE FROM app_sessions WHERE token_hash=$1', [digest(raw)]);
    res.setHeader('Set-Cookie', sessionCookie('', secure, true)); return null;
  }
  if (!['signup', 'login'].includes(action)) fail(404, 'Unknown account operation.');
  await rateLimit(db, `auth-ip:${ipKey}`, 20);
  const { username, normalized, password } = credentials(data, action === 'signup');
  await rateLimit(db, `auth-name:${digest(normalized)}`, 12);
  let profile, hashForSession;
  if (action === 'signup') {
    const id = randomUUID(), hash = await hashPassword(password); profile = initialProfile(id, username);
    try { await db.query('INSERT INTO app_users(id,username,normalized_name,password_hash,profile) VALUES($1,$2,$3,$4,$5)', [id, username, normalized, hash, JSON.stringify(profile)]); }
    catch (error) { if (error.code === '23505') fail(409, 'That username is unavailable.'); throw error; }
  } else {
    const { rows } = await db.query('SELECT password_hash,profile FROM app_users WHERE normalized_name=$1', [normalized]);
    // Equal password-derivation work for unknown names; avoid exposing account existence.
    const hash = rows[0]?.password_hash ?? `scrypt:32768:${'0'.repeat(32)}:${'0'.repeat(128)}`;
    const valid = await verifyPassword(password, hash);
    if (!rows.length || !valid) fail(401, 'Username or password is incorrect.');
    profile = rows[0].profile; hashForSession = rows[0].password_hash;
  }
  const raw = token(), previous = readSession(req, secure);
  await db.transaction(async client => {
    if (action === 'login') {
      const latest = await client.query('SELECT password_hash FROM app_users WHERE id=$1 FOR UPDATE', [profile.id]);
      if (!latest.rows.length || latest.rows[0].password_hash !== hashForSession) fail(401, 'Your password changed. Sign in again.');
    }
    if (previous) await client.query('DELETE FROM app_sessions WHERE token_hash=$1', [digest(previous)]);
    await client.query('DELETE FROM app_sessions WHERE user_id=$1 AND expires_at<=now()', [profile.id]);
    await client.query("INSERT INTO app_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')", [digest(raw), profile.id]);
  });
  res.setHeader('Set-Cookie', sessionCookie(raw, secure)); return profile;
}
export async function updateAvatar(db, user, avatar) {
  if (!profileAvatars.some(item => item.id === avatar)) fail(400, 'Choose an available avatar.');
  const { rows } = await db.query("UPDATE app_users SET profile=jsonb_set(profile,'{avatar}',to_jsonb($2::text)) WHERE id=$1 RETURNING profile", [user.id, avatar]);
  return rows[0].profile;
}

export async function accountSecurity(db,user,data,action) {
  if (action==='sessions') {
    await db.query('DELETE FROM app_sessions WHERE user_id=$1',[user.id]);return null;
  }
  if (typeof data.currentPassword!=='string') fail(400,'Enter your current password.');
  const {password}=credentials({username:user.username,password:data.newPassword},true);
  const hash=await hashPassword(password);
  await db.transaction(async client=>{
    const {rows}=await client.query('SELECT password_hash FROM app_users WHERE id=$1 FOR UPDATE',[user.id]);
    if(!await verifyPassword(data.currentPassword,rows[0].password_hash))fail(401,'Current password is incorrect.');
    await client.query('UPDATE app_users SET password_hash=$2 WHERE id=$1',[user.id,hash]);
    await client.query('DELETE FROM app_sessions WHERE user_id=$1',[user.id]);
  });
  return null;
}
