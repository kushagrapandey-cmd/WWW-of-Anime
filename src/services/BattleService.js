import AuthService from './AuthService.js';
import { GAME } from '../game/config.js';
import { replayBattle } from '../game/engine.js';
export const BATTLES_KEY = 'www-of-anime:battles:v1';
export class LocalBattleService {
  constructor({ getStorage = () => globalThis.localStorage, auth = AuthService } = {}) {
    this.getStorage = getStorage; this.auth = auth;
  }
  readAll() {
    try {
      const records = JSON.parse(this.getStorage().getItem(BATTLES_KEY) ?? '[]');
      if (!Array.isArray(records) || records.some(record => !record || typeof record.id !== 'string' || !Array.isArray(record.names) || record.names.length !== 2 || record.names.some(name => typeof name !== 'string') || !Number.isFinite(Date.parse(record.createdAt)))) throw new Error();
      return records;
    } catch { throw new Error('Battle history could not be read. Existing history has been preserved.'); }
  }
  history(ownerId = null) { return this.readAll().filter(record => record.ownerId === ownerId).slice(0, GAME.historyLimit); }
  write(record) {
    const records = this.readAll();
    try { this.getStorage().setItem(BATTLES_KEY, JSON.stringify([record, ...records.filter(item => item.id !== record.id)].slice(0, GAME.historyLimit))); }
    catch { throw new Error('Could not save battle history. Browser storage may be blocked or full.'); }
  }
  async save(record, updateStats = (...args) => this.auth.updateStats(...args)) {
    const outcome = replayBattle(record);
    // Save the replay first. A receipt makes retrying safe if either subsequent write fails.
    this.write(record);
    if (!record.ownerId) {
      const saved = { ...record, saved: true, rank: null }; this.write(saved); return saved;
    }
    const current = await this.auth.getCurrentUser();
    if (current?.id !== record.ownerId) throw new Error('Sign in to the original account to save this battle’s profile result.');
    let receipt = await this.auth.getBattleReceipt(record.id);
    if (!receipt) {
      await updateStats({}, { id: record.id, ownerId: record.ownerId, won: outcome.winner === 0, opponentPoints: record.opponentPoints });
      receipt = await this.auth.getBattleReceipt(record.id);
    }
    if (!receipt) throw new Error('Profile result could not be verified. Try saving again.');
    const saved = { ...record, saved: true, rank: receipt };
    this.write(saved);
    return saved;
  }
}
export default new LocalBattleService();
