export const GAME = Object.freeze({
  version: 1, teamSize: 5, rerolls: 1, historyLimit: 20, receiptLimit: 100,
  matchupCap: 0.10, synergyBonus: 0.05, synergyCount: 3,
  luckMin: 0.92, luckMax: 1.08, rankK: 32, rankScale: 400, cpuRating: 300,
  rarityWeights: { Common: 35, Rare: 30, Epic: 20, Legendary: 11, Mythic: 4 },
  // Gameplay counters, not claims of canon immunity; reverse matchups subtract the same bonus.
  counters: [['water', 'fire', 0.06], ['lightning', 'water', 0.04],
    ['haki', 'logia', 0.06], ['sealing', 'regeneration', 0.06],
    ['sensing', 'traps', 0.04], ['wind', 'ranged', 0.04]],
});
