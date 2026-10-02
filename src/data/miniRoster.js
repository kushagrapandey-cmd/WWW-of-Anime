import catalog from './anime-catalog.json';
import { indexAnimeFiles } from './registry.js';
const rosters = import.meta.glob('./characters/*.json', { eager: true, import: 'default' });
const characters = Object.values(indexAnimeFiles(catalog, rosters, './characters/')).flat();
import aliases from './game-aliases.json';
export const miniRoster = characters.map(card => ({ ...card, aliases: aliases[card.id] ?? [] }));
