import { indexAnimeFiles } from '../registry.js';
import { animeConfig } from '../anime.js';
const banks = import.meta.glob('./*.json', { eager: true, import: 'default' });
export const quizBanks = indexAnimeFiles(animeConfig, banks, './');
export const quizQuestions = Object.values(quizBanks).flat();
