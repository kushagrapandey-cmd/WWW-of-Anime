export const profileAvatars = [
  { id: 'leaf', name: 'Leaf Ninja', anime: 'naruto', role: 'Striker' },
  { id: 'sage', name: 'Sage Scholar', anime: 'naruto', role: 'Tactician' },
  { id: 'pirate', name: 'Grand Line Pirate', anime: 'onepiece', role: 'Hybrid' },
  { id: 'navigator', name: 'Storm Navigator', anime: 'onepiece', role: 'Support' },
  { id: 'reaper', name: 'Soul Reaper', anime: 'bleach', role: 'Striker' },
  { id: 'guardian', name: 'Spirit Guardian', anime: 'bleach', role: 'Tank' },
].map(avatar => ({ ...avatar, rarity: 'Common', image: null }));
export const ranks = [
  { name: 'Rookie', min: 0, color: '#b7b2c8' },
  { name: 'Fighter', min: 100, color: '#64dbc5' },
  { name: 'Elite', min: 300, color: '#99a7ff' },
  { name: 'Master', min: 600, color: '#e0a1ff' },
  { name: 'Legend', min: 1000, color: '#ffca63' },
];
export function getRank(points = 0) {
  const value = Number.isFinite(points) ? Math.max(0, points) : 0;
  const index = ranks.findLastIndex(rank => value >= rank.min);
  const current = ranks[index];
  const next = ranks[index + 1] ?? null;
  return { ...current, next, progress: next ? 100 * (value - current.min) / (next.min - current.min) : 100 };
}
export const getAvatar = id => profileAvatars.find(avatar => avatar.id === id) ?? profileAvatars[0];
