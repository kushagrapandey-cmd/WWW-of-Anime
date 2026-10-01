export const animeConfig = [
  { id: 'naruto', name: 'Naruto', subtitle: 'The shinobi world', motif: '忍', label: 'WILL OF FIRE', description: 'Ninja rivalries. Legendary jutsu. Unbreakable bonds.', colors: { primary: '#ff974b', secondary: '#518eff', background: '#2c1b18' } },
  { id: 'onepiece', name: 'One Piece', subtitle: 'The Grand Line', motif: '海', label: 'SET SAIL', description: 'Wild adventures. Devil Fruits. A world without limits.', colors: { primary: '#ff655f', secondary: '#ffc75b', tertiary: '#439de5', background: '#281925' } },
  { id: 'bleach', name: 'Bleach', subtitle: 'The Soul Society', motif: '魂', label: 'SOUL REAPERS', description: 'Clashing blades. Bankai. Power beyond the living.', colors: { primary: '#ff893e', secondary: '#a1deff', tertiary: '#090a10', background: '#172634' } },
];
export const animeTheme = (anime) => ({ '--anime-primary': anime.colors.primary, '--anime-secondary': anime.colors.secondary, '--anime-bg': anime.colors.background });
export const rarityColors = { Common: '#a4b0c4', Rare: '#69b7ff', Epic: '#c38cff', Legendary: '#ffc75b', Mythic: '#ff729b' };
