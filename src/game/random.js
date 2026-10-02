export function seededRandom(seed) {
  let state = 2166136261;
  for (const letter of String(seed)) state = Math.imul(state ^ letter.charCodeAt(0), 16777619);
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
export function shuffle(items, seed) {
  const result = [...items], random = seededRandom(seed);
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
