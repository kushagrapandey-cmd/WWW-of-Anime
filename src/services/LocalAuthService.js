import { GAME } from '../game/config.js';
import { applyBattleResult } from '../game/profileResult.js';
import { profileAvatars } from '../data/profile.js';
import { createLocalStore, USERS_KEY, SESSION_KEY } from './localStorageStore.js';
import { createPasswordTools } from './passwords.js';
const avatarIds = new Set(profileAvatars.map(avatar => avatar.id));
const battleDefaults = { wins: 0, losses: 0, winStreak: 0, bestStreak: 0, rankPoints: 0 };
const quizDefaults = { quizzesPlayed: 0, bestScore: 0, xp: 0, dailyStreak: 0, bestDailyStreak: 0 };
function validateCredentials(username, password, signingUp) {
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,24}$/.test(username.trim())) throw new Error('Use a username of 3–24 letters, numbers or underscores.');
  if (typeof password !== 'string' || password.length > 128 || password.length < (signingUp ? 8 : 1)) throw new Error(signingUp ? 'Use a password of 8–128 characters.' : 'Enter your password (up to 128 characters).');
  return username.trim();
}
function publicUser(record) {
  const { credential, battleReceipts, ...profile } = record;
  return structuredClone(profile);
}
function numericStats(current, updates, allowed) {
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) throw new Error('Invalid profile statistics.');
  const next = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (!Object.hasOwn(allowed, key) || !Number.isSafeInteger(value) || value < 0) throw new Error('Statistics must be non-negative whole numbers with known fields.');
    next[key] = value;
  }
  return next;
}
// PROTOTYPE ONLY: users, hashes, session and stats are editable in localStorage.
// PBKDF2 avoids storing plaintext; it does NOT provide real authentication/security.
// A backend must enforce credentials, sessions, score updates and authorization.
export class LocalAuthService {
  constructor({ getStorage = () => globalThis.localStorage, getCrypto = () => globalThis.crypto, iterations } = {}) {
    this.store = createLocalStore(getStorage);
    this.passwords = createPasswordTools(getCrypto, iterations);
    this.getCrypto = getCrypto;
  }
  readUsers() {
    const users = this.store.read(USERS_KEY, []);
    if (!Array.isArray(users) || users.some(user => !user || typeof user.id !== 'string' || !/^[a-zA-Z0-9_]{3,24}$/.test(user.username) || !avatarIds.has(user.avatar) || !Number.isFinite(Date.parse(user.createdAt)) || !user.credential || !Array.isArray(user.achievements) || [ [user.battleStats, battleDefaults], [user.quizStats, quizDefaults] ].some(([stats, defaults]) => !stats || Object.keys(defaults).some(key => !Number.isSafeInteger(stats[key]) || stats[key] < 0)))) throw new Error('Saved account data is invalid. Your existing data has not been replaced.');
    return users;
  }
  async getCurrentUser() {
    const session = this.store.read(SESSION_KEY, null);
    if (!session) return null;
    if (typeof session.userId !== 'string') throw new Error('Saved session data could not be read. Try signing out.');
    const user = this.readUsers().find(record => record.id === session.userId);
    return user ? publicUser(user) : null;
  }
  async signUp({ username, password, avatar = 'leaf' }) {
    username = validateCredentials(username, password, true);
    if (!avatarIds.has(avatar)) throw new Error('Choose an available avatar.');
    const normalized = username.toLowerCase();
    if (this.readUsers().some(user => user.username.toLowerCase() === normalized)) throw new Error('That username is already taken in this browser.');
    const credential = await this.passwords.hash(password);
    // Re-read after asynchronous hashing so concurrent local submissions do not overwrite one another.
    const users = this.readUsers();
    if (users.some(user => user.username.toLowerCase() === normalized)) throw new Error('That username is already taken in this browser.');
    const user = { id: this.getCrypto().randomUUID(), username, avatar, createdAt: new Date().toISOString(), battleStats: { ...battleDefaults }, quizStats: { ...quizDefaults }, achievements: [], credential };
    this.store.write(USERS_KEY, [...users, user]);
    try { this.store.write(SESSION_KEY, { userId: user.id }); } catch { throw new Error('Your profile was created, but the login session could not be saved. Enable browser storage, then log in.'); }
    return publicUser(user);
  }
  async logIn({ username, password }) {
    username = validateCredentials(username, password, false);
    const user = this.readUsers().find(record => record.username.toLowerCase() === username.toLowerCase());
    if (!user || !await this.passwords.verify(password, user.credential)) throw new Error('Username or password does not match an account in this browser.');
    // Do not resurrect an account deleted while password derivation was in flight.
    const latest = this.readUsers().find(record => record.id === user.id);
    if (!latest) throw new Error('This local account is no longer available.');
    this.store.write(SESSION_KEY, { userId: user.id });
    return publicUser(latest);
  }
  async logOut() { this.store.remove(SESSION_KEY); }
  async updateProfile({ avatar }) {
    if (!avatarIds.has(avatar)) throw new Error('Choose an available avatar.');
    return this.updateCurrent(record => ({ ...record, avatar }));
  }
  async getBattleReceipt(id) {
    const session = this.store.read(SESSION_KEY, null);
    const record = this.readUsers().find(user => user.id === session?.userId);
    return structuredClone(record?.battleReceipts?.find(receipt => receipt.id === id) ?? null);
  }
  async updateStats(updates, battle = null) {
    if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).some(key => !['battleStats', 'quizStats', 'achievements'].includes(key))) throw new Error('Invalid profile update.');
    return this.updateCurrent(record => {
      if (battle) {
        if (record.id !== battle.ownerId) throw new Error('The signed-in account changed. This battle belongs to its original player.');
        if (typeof battle.id !== 'string' || !/^battle-[a-zA-Z0-9-]{1,80}$/.test(battle.id)) throw new Error('Invalid battle ID.');
        const receipts = record.battleReceipts ?? [];
        if (receipts.some(receipt => receipt.id === battle.id)) return record;
        const result = applyBattleResult(record, battle);
        return { ...record, battleStats: result.battleStats, achievements: result.achievements,
          battleReceipts: [...receipts, { id: battle.id, delta: result.delta, rankPoints: result.battleStats.rankPoints }].slice(-GAME.receiptLimit) };
      }
      const battleStats = updates.battleStats === undefined ? record.battleStats : numericStats(record.battleStats, updates.battleStats, battleDefaults);
      const quizStats = updates.quizStats === undefined ? record.quizStats : numericStats(record.quizStats, updates.quizStats, quizDefaults);
      if (battleStats.bestStreak < battleStats.winStreak || quizStats.bestScore > 100 || quizStats.bestDailyStreak < quizStats.dailyStreak) throw new Error('Profile statistics are inconsistent.');
      const achievements = updates.achievements ?? record.achievements;
      if (!Array.isArray(achievements) || achievements.length > 100 || achievements.some(id => typeof id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(id))) throw new Error('Invalid achievement IDs.');
      return { ...record, battleStats, quizStats, achievements: [...new Set(achievements)] };
    });
  }
  async updateCurrent(transform) {
    // Keep the read/modify/write synchronous within this adapter to avoid local lost updates.
    const session = this.store.read(SESSION_KEY, null);
    const users = this.readUsers();
    const index = users.findIndex(record => record.id === session?.userId);
    if (index < 0) throw new Error('Sign in before updating your profile.');
    users[index] = transform(users[index]);
    this.store.write(USERS_KEY, users);
    return publicUser(users[index]);
  }
}
