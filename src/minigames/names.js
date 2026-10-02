export const normalizeName = value => String(value).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export function nameAliases(name, aliases = []) {
  return [...new Set([normalizeName(name), normalizeName(name.replace(/\([^)]*\)/g, '')),
    ...aliases.map(normalizeName), ...name.split(/[\s/()-]+/).map(normalizeName).filter(part => part.length >= 3)].filter(Boolean))];
}
export function editDistance(first, second) {
  let previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let i = 1; i <= first.length; i++) {
    const row = [i];
    for (let j = 1; j <= second.length; j++) row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(first[i - 1] !== second[j - 1]));
    previous = row;
  }
  return previous.at(-1);
}
export function matchName(input, lexicon) {
  const value = normalizeName(input);
  if (!value || String(input).length > 128) return { kind: 'invalid', id: null };
  const entries = lexicon.map(card => ({ id: card.id, aliases: nameAliases(card.name, card.aliases ?? []) }));
  const exact = entries.filter(entry => entry.aliases.includes(value));
  if (exact.length) return exact.length === 1 ? { kind: 'match', id: exact[0].id } : { kind: 'ambiguous', id: null };
  if (value.length < 3) return { kind: 'invalid', id: null };
  const tolerance = value.length >= 9 ? 2 : value.length >= 5 ? 1 : 0;
  const candidates = entries.map(entry => ({ id: entry.id, distance: Math.min(...entry.aliases.map(alias => editDistance(value, alias))) }));
  const closest = Math.min(...candidates.map(entry => entry.distance));
  const winners = candidates.filter(entry => entry.distance === closest && closest <= tolerance);
  return winners.length > 1 ? { kind: 'ambiguous', id: null } : winners.length === 1 ? { kind: 'match', id: winners[0].id } : { kind: 'miss', id: null };
}
