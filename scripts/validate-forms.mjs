import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { calculatePower, getPowerTier, statWeights } from '../src/data/power.js';
const root = new URL('../', import.meta.url);
const characters = [];
for (const anime of ['naruto', 'onepiece', 'bleach']) {
  characters.push(...JSON.parse(await readFile(new URL(`src/data/characters/${anime}.json`, root), 'utf8')));
}
const byId = new Map(characters.map(character => [character.id, character]));
const fields = ['id', 'characterId', 'name', 'era', 'stats', 'powerScore', 'rarity', 'abilityTags', 'signatureMoves', 'limitations', 'sourceChapters', 'confidence'];
const ids = new Set();
const names = new Set();
let count = 0;
for (const filename of (await readdir(new URL('src/data/forms/', root))).filter(file => file.endsWith('.json'))) {
  const data = JSON.parse(await readFile(new URL(`src/data/forms/${filename}`, root), 'utf8'));
  assert(Array.isArray(data) && data.length > 0, `${filename}: expected populated array`);
  for (const form of data) {
    const label = `${filename}/${form.id}`;
    assert.deepEqual(Object.keys(form).sort(), [...fields].sort(), `${label}: fields`);
    assert(byId.has(form.characterId), `${label}: unknown character`);
    assert.match(form.id, new RegExp(`^${form.characterId}--[a-z0-9]+(?:-[a-z0-9]+)*$`), `${label}: form ID`);
    assert(!ids.has(form.id), `${label}: duplicate ID`); ids.add(form.id);
    const name = `${form.characterId}/${form.name.toLowerCase()}`;
    assert(!names.has(name), `${label}: duplicate form name`); names.add(name);
    for (const key of ['name', 'era', 'limitations']) assert(typeof form[key] === 'string' && form[key].trim(), `${label}/${key}: text`);
    assert.deepEqual(Object.keys(form.stats).sort(), Object.keys(statWeights).sort(), `${label}: stats`);
    for (const stat of Object.values(form.stats)) assert(Number.isInteger(stat) && stat >= 1 && stat <= 100, `${label}: stat range`);
    assert.equal(form.powerScore, calculatePower(form.stats), `${label}: formula`);
    assert.equal(form.rarity, getPowerTier(form.powerScore), `${label}: tier`);
    for (const [key, min, max] of [['abilityTags', 3, 5], ['signatureMoves', 2, 3]]) {
      assert(Array.isArray(form[key]) && form[key].length >= min && form[key].length <= max, `${label}/${key}: count`);
      assert.equal(new Set(form[key]).size, form[key].length, `${label}/${key}: duplicate`);
      for (const value of form[key]) assert(typeof value === 'string' && value.trim(), `${label}/${key}: text`);
    }
    form.abilityTags.forEach(tag => assert.match(tag, /^[a-z0-9]+(?:-[a-z0-9]+)*$/));
    assert(['high', 'medium', 'low'].includes(form.confidence), `${label}: confidence`);
    const cutoff = { naruto: 700, onepiece: 1122, bleach: 686 }[byId.get(form.characterId).anime];
    assert(Array.isArray(form.sourceChapters) && form.sourceChapters.length > 0, `${label}: sources`);
    for (const range of form.sourceChapters) {
      assert(Array.isArray(range) && range.length === 2 && range.every(Number.isInteger), `${label}: chapter range`);
      assert(range[0] >= 1 && range[0] <= range[1] && range[1] <= cutoff, `${label}: cutoff`);
    }
    count++;
  }
}
console.log(`Validated ${count} form snapshots for ${new Set([...names].map(name => name.split('/')[0])).size} character identities.`);
