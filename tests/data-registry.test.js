import { describe, expect, it } from 'vitest';
import { indexAnimeFiles } from '../src/data/registry.js';
import { animeConfig } from '../src/data/anime.js';
import { charactersByAnime, characters, characterForms } from '../src/data/index.js';
import { quizBanks, quizQuestions } from '../src/data/quizzes/index.js';
describe('data-driven expansion', () => {
  it('loads the accepted roster, forms and quiz banks in catalog order', () => {
    expect(Object.keys(charactersByAnime)).toEqual(animeConfig.map(item => item.id));
    expect(Object.keys(quizBanks)).toEqual(animeConfig.map(item => item.id));
    expect(characters).toHaveLength(120); expect(characterForms).toHaveLength(237); expect(quizQuestions).toHaveLength(90);
    expect(charactersByAnime.naruto.every(card => card.anime === 'naruto')).toBe(true);
  });
  it('registers a fourth anime using metadata and matching files without series-specific code', () => {
    const catalog = [{ id: 'launch' }, { id: 'new-world' }];
    const files = { './characters/new-world.json': [{ id: 'new-hero' }], './characters/launch.json': [{ id: 'original' }] };
    expect(Object.keys(indexAnimeFiles(catalog, files, './characters/'))).toEqual(['launch', 'new-world']);
    expect(indexAnimeFiles(catalog, files, './characters/')['new-world'][0].id).toBe('new-hero');
  });
  it('fails clearly on missing, non-array or empty registered data', () => {
    for (const records of [undefined, {}, []]) expect(() => indexAnimeFiles([{ id: 'new-world' }], { './new-world.json': records }, './')).toThrow('Missing or empty data for new-world.');
  });
});
