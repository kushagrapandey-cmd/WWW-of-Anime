import assert from 'node:assert/strict';
import { animeConfig } from '../src/data/anime.js';
import { readFile } from 'node:fs/promises';
import { validateQuestions } from '../src/quiz/engine.js';
const all = [];
for (const { id: anime, cutoffChapter: cutoff } of animeConfig) {
  const questions = JSON.parse(await readFile(new URL(`../src/data/quizzes/${anime}.json`, import.meta.url), 'utf8'));
  validateQuestions(questions); assert.equal(questions.length, 60);
  for (const difficulty of ['easy', 'medium', 'hard']) assert.equal(questions.filter(item => item.difficulty === difficulty).length, 20);
  for (const question of questions) {
    if (question.dailyFrom) assert.match(question.dailyFrom, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(question.anime, anime); assert.equal(question.canonReference?.medium, 'manga');
    assert.equal(question.canonReference.cutoffChapter, cutoff); assert(question.canonReference.arc.trim());
  }
  all.push(...questions); console.log(`${anime}: 60 valid quiz questions (20 per difficulty)`);
}
validateQuestions(all); assert.equal(new Set(all.map(item => item.question)).size, all.length);
console.log(`Validated ${all.length} unique, four-option high-confidence questions. Schema checks do not certify canon accuracy.`);
