import { QUIZ } from './config.js';
export function challengeDate(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: QUIZ.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now));
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}
export function previousDate(date) { return new Date(Date.parse(date) - QUIZ.dayMs).toISOString().slice(0, 10); }
export function challengeDeadline(date) { return Date.parse(`${date}T00:00:00+05:30`) + QUIZ.dayMs; }
