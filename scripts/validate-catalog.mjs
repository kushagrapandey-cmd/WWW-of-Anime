import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { animeConfig } from '../src/data/anime.js';
assert(Array.isArray(animeConfig) && animeConfig.length > 0, 'Anime catalog must be populated.');
assert.equal(new Set(animeConfig.map(item => item.id)).size, animeConfig.length, 'Duplicate anime IDs.');
for (const item of animeConfig) {
  assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/); assert.notEqual(item.id, 'all');
  for (const key of ['name', 'subtitle', 'motif', 'label', 'description']) assert(typeof item[key] === 'string' && item[key].trim(), `${item.id}/${key}`);
  assert(Number.isSafeInteger(item.cutoffChapter) && item.cutoffChapter > 0, `${item.id}: manga cutoff`);
  for (const key of ['primary', 'secondary', 'background']) assert.match(item.colors?.[key] ?? '', /^#[0-9a-f]{6}$/i, `${item.id}/${key}: color`);
}
for (const directory of ['characters', 'quizzes']) {
  const files = (await readdir(new URL(`../src/data/${directory}/`, import.meta.url))).filter(name => name.endsWith('.json')).sort();
  assert.deepEqual(files, animeConfig.map(item => `${item.id}.json`).sort(), `${directory}: register every data file in anime-catalog.json`);
}
console.log(`Validated ${animeConfig.length} anime registrations, themes, manga cutoffs and data files.`);
