import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { statWeights as weights, calculatePower as score, getPowerTier } from '../src/data/power.js';

const root = new URL('../', import.meta.url);
const fields = ['id', 'name', 'anime', 'faction', 'role', 'stats', 'powerScore', 'rarity', 'abilityTags', 'signatureMoves', 'clues', 'reasoning', 'confidence', 'imageQuery', 'image'];
const roles = new Set(['Striker', 'Tank', 'Support', 'Tactician', 'Hybrid']);
const ids = new Set();
const string = (value, label) => assert(typeof value === 'string' && value.trim().length > 0, `${label}: expected nonempty string`);
const normalized = value => value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

assert.equal(Object.values(weights).reduce((a, b) => a + b), 100);
assert.equal(score(Object.fromEntries(Object.keys(weights).map(key => [key, 1]))), 1);
assert.equal(score(Object.fromEntries(Object.keys(weights).map(key => [key, 100]))), 1000);
let total = 0;
for (const anime of ['naruto', 'onepiece', 'bleach']) {
  const data = JSON.parse(await readFile(new URL(`src/data/characters/${anime}.json`, root), 'utf8'));
  assert(Array.isArray(data), `${anime}: expected JSON array`);
  const names = new Set();
  for (const character of data) {
    const label = `${anime}/${character.id}`;
    assert.deepEqual(Object.keys(character).sort(), [...fields].sort(), `${label}: schema fields`);
    for (const key of ['id', 'name', 'faction', 'reasoning', 'imageQuery']) string(character[key], `${label}/${key}`);
    assert.match(character.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${label}: slug`);
    assert(!ids.has(character.id), `${label}: duplicate ID`);
    assert(!names.has(normalized(character.name)), `${label}: duplicate name`);
    ids.add(character.id); names.add(normalized(character.name));
    assert.equal(character.anime, anime, `${label}: anime field`);
    assert(roles.has(character.role), `${label}: role`);
    assert.deepEqual(Object.keys(character.stats).sort(), Object.keys(weights).sort(), `${label}: stat keys`);
    for (const [key, value] of Object.entries(character.stats)) assert(Number.isInteger(value) && value >= 1 && value <= 100, `${label}/${key}: stat range`);
    assert.equal(character.powerScore, score(character.stats), `${label}: power formula`);
    assert.equal(character.rarity, getPowerTier(character.powerScore), `${label}: rarity`);
    for (const [key, min, max] of [['abilityTags', 3, 5], ['signatureMoves', 2, 3], ['clues', 3, 3]]) {
      const values = character[key];
      assert(Array.isArray(values) && values.length >= min && values.length <= max, `${label}/${key}: count`);
      values.forEach(value => string(value, `${label}/${key}`));
      assert.equal(new Set(values).size, values.length, `${label}/${key}: duplicate values`);
    }
    character.abilityTags.forEach(tag => assert.match(tag, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${label}: tag format`));
    character.clues.forEach(clue => assert(!normalized(clue).includes(normalized(character.name)), `${label}: clue contains character name`));
    assert(character.reasoning.trim().split(/\s+/).length <= 25, `${label}: reasoning word limit`);
    assert(['high', 'medium', 'low'].includes(character.confidence), `${label}: confidence`);
    assert(character.image === null || (typeof character.image === 'string' && character.image.startsWith('/characters/')), `${label}: image field`);
  }
  console.log(`${anime}: ${data.length} valid records${data.length ? '' : ' (not generated yet)'}`);
  total += data.length;
}
console.log(`Validated ${total} characters; IDs, schema, scores, rarity, tags, moves and clues pass.`);
