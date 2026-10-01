export const statWeights = { attack: 25, defense: 10, speed: 15, durability: 12, intelligence: 8, versatility: 10, stamina: 10, feats: 10 };
export const powerTiers = [
  { name: 'Common', min: 1, max: 399 },
  { name: 'Rare', min: 400, max: 599 },
  { name: 'Epic', min: 600, max: 749 },
  { name: 'Legendary', min: 750, max: 899 },
  { name: 'Mythic', min: 900, max: 1000 },
];
export const calculatePower = stats => 1 + Math.round(999 * (
  Object.entries(statWeights).reduce((total, [key, weight]) => total + stats[key] * weight, 0) / 100 - 1
) / 99);
export const getPowerTier = score => powerTiers.find(tier => score >= tier.min && score <= tier.max)?.name ?? null;
