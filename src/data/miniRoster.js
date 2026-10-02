import { characters } from './index.js';
import aliases from './game-aliases.json';
export const miniRoster = characters.map(card => ({ ...card, aliases: aliases[card.id] ?? [] }));
