import { randomBytes, createHash, createHmac, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(derive);
export const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
export const token = () => randomBytes(32).toString('hex');
export const digest = value => createHash('sha256').update(value).digest('hex');
export function credentials(data, signup = false) {
  const username = typeof data.username === 'string' ? data.username.trim() : '';
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) fail(400, 'Use 3–24 letters, numbers or underscores for your username.');
  if (typeof data.password !== 'string' || data.password.length < (signup ? 12 : 1) || data.password.length > 128) fail(400, 'Use a password of 12–128 characters.');
  return { username, normalized: username.toLowerCase(), password: data.password };
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt:32768:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [algorithm, cost, salt, hash] = encoded.split(':');
  if (algorithm !== 'scrypt' || cost !== '32768' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hash)) return false;
  const key = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(key, Buffer.from(hash, 'hex'));
}
export function sessionCookie(value, secure, clear = false) {
  return `${secure ? '__Host-aniclash' : 'aniclash-dev'}=${value}; Path=/; HttpOnly; SameSite=Lax; ${secure ? 'Secure; ' : ''}Max-Age=${clear ? 0 : 604800}`;
}
export function readSession(req, secure) {
  const name = secure ? '__Host-aniclash' : 'aniclash-dev';
  const value = (req.headers.cookie ?? '').split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`))?.slice(name.length + 1);
  return /^[a-f0-9]{64}$/.test(value ?? '') ? value : null;
}
export function checkOrigin(req, origin) {
  if (!['GET', 'HEAD'].includes(req.method) && (req.headers.origin !== origin || !String(req.headers['content-type'] ?? '').startsWith('application/json'))) fail(403, 'Request origin or content type is not allowed.');
  if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, 'Cross-site requests are not allowed.');
}
export async function rateLimit(db, key, limit, windowSeconds = 900) {
  const result = await db.query(`INSERT INTO app_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 second')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN app_limits.expires_at<=now() THEN 1 ELSE app_limits.count+1 END,
    expires_at=CASE WHEN app_limits.expires_at<=now() THEN EXCLUDED.expires_at ELSE app_limits.expires_at END RETURNING count`, [key, windowSeconds]);
  if (result.rows[0].count > limit) fail(429, 'Too many requests. Please wait before trying again.');
}
export function rateKey(req, secret) {
  // x-vercel-forwarded-for is set by Vercel. In local development use the socket address.
  const ip = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] : req.socket?.remoteAddress;
  return createHmac('sha256', secret).update(String(ip ?? 'unknown').split(',')[0].trim()).digest('hex');
}
