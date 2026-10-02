// Inputs are data, so this module has no React, storage or JSON-loader dependency.
export function buildPool(characters, forms, { anime = 'all', variants = false } = {}) {
  return characters.filter(character => anime === 'all' || character.anime === anime).flatMap(character => {
    const peak = { ...character, formId: null, formName: 'Peak rated form' };
    if (!variants) return [structuredClone(peak)];
    const alternatives = forms.filter(form => form.characterId === character.id).map(form => ({
      ...character, formId: form.id, formName: form.name, era: form.era,
      stats: form.stats, powerScore: form.powerScore, rarity: form.rarity,
      abilityTags: form.abilityTags, signatureMoves: form.signatureMoves,
      limitations: form.limitations, confidence: form.confidence,
    }));
    return structuredClone([peak, ...alternatives]);
  });
}
