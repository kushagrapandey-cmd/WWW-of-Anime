import { readFileSync, readdirSync } from 'node:fs';
const load = path => JSON.parse(readFileSync(new URL(`../src/data/${path}`, import.meta.url), 'utf8'));
export const catalog = load('anime-catalog.json');
export const characters = catalog.flatMap(item => load(`characters/${item.id}.json`));
export const forms = readdirSync(new URL('../src/data/forms/', import.meta.url)).filter(name => name.endsWith('.json')).sort().flatMap(name => load(`forms/${name}`));
export const questions = catalog.flatMap(item => load(`quizzes/${item.id}.json`));
const aliases = load('game-aliases.json');
export const miniRoster = characters.map(card => ({ ...card, aliases: aliases[card.id] ?? [] }));
