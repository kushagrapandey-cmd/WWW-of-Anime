import AuthService from './AuthService.js';
import { MINI } from '../minigames/config.js';
import { createSession, scoreSession } from '../minigames/engine.js';
import { validateSession } from '../minigames/validation.js';
export const MINI_KEY = 'www-of-anime:minigames:v1';
export class LocalMiniGameService {
  constructor({ getStorage = () => globalThis.localStorage, auth = AuthService, getId = () => globalThis.crypto.randomUUID(), now = () => Date.now() } = {}) {
    this.getStorage = getStorage; this.auth = auth; this.getId = getId; this.now = now;
  }
  key(ownerId) { return `${MINI_KEY}:${ownerId ?? 'guest'}`; }
  read(ownerId = null) {
    try {
      const store = JSON.parse(this.getStorage().getItem(this.key(ownerId)) ?? 'null') ?? { version: MINI.version, records: [], highScores: {} };
      if (store.version !== MINI.version || !Array.isArray(store.records) || new Set(store.records.map(record => record?.id)).size !== store.records.length || !store.highScores || typeof store.highScores !== 'object' || Array.isArray(store.highScores) || Object.entries(store.highScores).some(([key, score]) => !/^(move|clue|power):[a-z0-9-]+:(normal|hard|streak|classic):(choice|typed)$/.test(key) || !Number.isSafeInteger(score) || score < 0)) throw new Error();
      store.records.forEach(record => { validateSession(record); if (record.ownerId !== ownerId) throw new Error(); });
      return store;
    } catch { throw new Error('Game history could not be read. Existing data has been preserved.'); }
  }
  history(ownerId = null) { return this.read(ownerId).records; }
  highScores(ownerId = null) { return this.read(ownerId).highScores; }
  write(session, expectedRevision = null, saveScore = false) {
    validateSession(session);
    const store = this.read(session.ownerId), current = store.records.find(record => record.id === session.id);
    if (current && expectedRevision !== null && current.revision !== expectedRevision) throw new Error('This game changed in another tab. Load the latest saved session.');
    const highScores = { ...store.highScores };
    if (saveScore) highScores[session.board] = Math.max(highScores[session.board] ?? 0, scoreSession(session).score);
    const records = [session, ...store.records.filter(record => record.id !== session.id)].sort((a, b) => b.startedAt - a.startedAt).slice(0, MINI.historyLimit);
    try { this.getStorage().setItem(this.key(session.ownerId), JSON.stringify({ version: MINI.version, records, highScores })); }
    catch { throw new Error('Could not save game progress. Browser storage may be blocked or full.'); }
    return session;
  }
  start(roster, settings, ownerId = null) {
    return this.write(createSession(roster, settings, { id: `mini-${this.getId()}`, ownerId, seed: this.getId(), now: this.now() }));
  }
  latest(session) { return this.history(session.ownerId).find(record => record.id === session.id) ?? session; }
  async save(session, recordGameResult = value => this.auth.recordGameResult(value)) {
    validateSession(session);
    if (session.status !== 'complete') throw new Error('Finish all ten rounds before saving a high score.');
    const current = this.latest(session);
    if (current.revision !== session.revision) throw new Error('This game changed in another tab. Load the latest saved session.');
    if (current.saved) return current;
    this.write(session, session.revision);
    if (session.ownerId) {
      if ((await this.auth.getCurrentUser())?.id !== session.ownerId) throw new Error('Sign in to the original account to save this game result.');
      if (!await this.auth.getGameReceipt(session.id)) await recordGameResult(session);
      if (!await this.auth.getGameReceipt(session.id)) throw new Error('Profile result could not be verified. Retry saving.');
    }
    return this.write({ ...session, saved: true }, session.revision, true);
  }
}
export default new LocalMiniGameService();
