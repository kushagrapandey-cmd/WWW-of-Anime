import catalog from './anime-catalog.json' with { type: 'json' };
export const animeConfig = catalog;

export const animeTheme = (anime) => ({ '--anime-primary': anime.colors.primary, '--anime-secondary': anime.colors.secondary, '--anime-bg': anime.colors.background });
export const rarityColors = { Common: '#a4b0c4', Rare: '#69b7ff', Epic: '#c38cff', Legendary: '#ffc75b', Mythic: '#ff729b' };
