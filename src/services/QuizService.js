import AuthService from './AuthService.js';
import { QUIZ } from '../quiz/config.js';
import { challengeDate } from '../quiz/date.js';
import { createAttempt, validateAttempt } from '../quiz/engine.js';
export const QUIZZES_KEY = 'www-of-anime:quizzes:v1';
export class LocalQuizService {
  constructor({ getStorage = () => globalThis.localStorage, auth = AuthService, getId = () => globalThis.crypto.randomUUID(), now = () => Date.now() } = {}) {
    this.getStorage = getStorage; this.auth = auth; this.getId = getId; this.now = now;
  }
  key(ownerId) { return `${QUIZZES_KEY}:${ownerId ?? 'guest'}`; }
  history(ownerId = null) {
    try {
      const records = JSON.parse(this.getStorage().getItem(this.key(ownerId)) ?? '[]');
      if (!Array.isArray(records) || new Set(records.map(item => item?.id)).size !== records.length) throw new Error();
      records.forEach(record => { validateAttempt(record); if (record.ownerId !== ownerId) throw new Error(); });
      return records;
    } catch { throw new Error('Quiz history could not be read. Existing data has been preserved.'); }
  }
  write(attempt, expectedRevision = null) {
    validateAttempt(attempt);
    const records = this.history(attempt.ownerId), existing = records.find(record => record.id === attempt.id);
    if (existing && expectedRevision !== null && existing.revision !== expectedRevision) throw new Error('This quiz changed in another tab. Resume the latest saved attempt.');
    const others = records.filter(record => record.id !== attempt.id);
    const today = challengeDate(this.now());
    const retained = [attempt, ...others].sort((a, b) => b.startedAt - a.startedAt);
    const recent = retained.slice(0, QUIZ.historyLimit);
    // Keep today’s attempt even after many practice quizzes, including for guests.
    for (const daily of retained.filter(record => record.mode === 'daily' && record.date === today)) if (!recent.some(record => record.id === daily.id)) recent.push(daily);
    try { this.getStorage().setItem(this.key(attempt.ownerId), JSON.stringify(recent)); }
    catch { throw new Error('Could not save quiz progress. Browser storage may be blocked or full.'); }
    return attempt;
  }
  start(bank, settings, ownerId = null) {
    if (settings.mode === 'daily') {
      const existing = this.history(ownerId).find(record => record.mode === 'daily' && record.date === challengeDate(this.now()));
      if (existing) return existing;
    }
    const now = this.now();
    const id = settings.mode === 'daily' ? `quiz-daily-${challengeDate(now)}` : `quiz-${this.getId()}`;
    const attempt = createAttempt(bank, settings, { id, ownerId, seed: this.getId(), now });
    return this.write(attempt);
  }
  latest(attempt) { return this.history(attempt.ownerId).find(record => record.id === attempt.id) ?? attempt; }
  async save(attempt, recordQuizResult = value => this.auth.recordQuizResult(value)) {
    validateAttempt(attempt);
    if (attempt.status !== 'complete') throw new Error('Finish the quiz before saving results.');
    const current = this.latest(attempt);
    if (current.revision !== attempt.revision) throw new Error('This quiz changed in another tab. Resume the latest saved attempt.');
    if (current.saved) return current;
    this.write(attempt, attempt.revision);
    if (attempt.ownerId) {
      if ((await this.auth.getCurrentUser())?.id !== attempt.ownerId) throw new Error('Sign in to the original account to save this quiz result.');
      if (!await this.auth.getQuizReceipt(attempt.id)) await recordQuizResult(attempt);
      if (!await this.auth.getQuizReceipt(attempt.id)) throw new Error('Profile progress could not be verified. Retry saving.');
    }
    return this.write({ ...attempt, saved: true }, attempt.revision);
  }
}
export default new LocalQuizService();
