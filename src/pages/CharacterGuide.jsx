import { useState } from 'react';
import { characters, characterForms, getFormsForCharacter, getRatedCharacter } from '../data';
import { peakFormNames } from '../data/peakForms';
import { powerTiers, statWeights } from '../data/power';
import { rarityColors, animeConfig } from '../data/anime';
import Card from '../components/Card';
import Badge from '../components/Badge';
import './CharacterGuide.css';
const roster = [...characters].sort((a, b) => a.name.localeCompare(b.name));
const coverage = new Set(characterForms.map(form => form.characterId)).size;
export default function CharacterGuide() {
  const [characterId, setCharacterId] = useState('monkey-d-luffy');
  const [formId, setFormId] = useState('monkey-d-luffy--gear-five');
  const forms = getFormsForCharacter(characterId);
  const character = getRatedCharacter(characterId, formId);
  const selectedForm = forms.find(form => form.id === formId);
  const chooseCharacter = event => {
    const id = event.target.value;
    setCharacterId(id);
    setFormId(getFormsForCharacter(id).at(-1)?.id ?? '');
  };
  return <div className="container character-guide">
    <header className="guide-heading">
      <Badge>KNOW YOUR FIGHTER · MANGA SPOILERS</Badge>
      <h1>CHARACTERS <span>& POWER</span></h1>
      <p>Know which version you’re looking at, how it earns its rating, and what the tier means.</p>
    </header>
    <section className="guide-rules" aria-labelledby="selection-heading">
      <Card><h2 id="selection-heading">WHY THESE CHARACTERS?</h2>
        <p>Our launch roster balances main characters, major opponents, popular supporting characters and different fighting roles across Naruto, One Piece and Bleach. Popularity earns no power bonus.</p>
        <p>We use manga canon within fixed snapshots: Naruto 1–700, One Piece 1–1122 and Bleach 1–686. Forms from films, filler and Boruto are outside this version.</p>
      </Card>
      <Card><h2>WHICH FORM COUNTS?</h2>
        <p>The original roster rates one supported peak state per character. Alternate forms get their own stats, moves, power and tier. An early-series Base is different from a late-series Base.</p>
        <p><strong>Battle selection (planned):</strong> each player drafts five random, rarity-weighted fighters with one reroll. Duplicate character identities are excluded across both teams, even when forms differ. The eligible form pool is fixed before drafting.</p>
        <p>A form keeps one coherent set of abilities. Time limits, preparation, equipment and recovery costs matter. One fighter keeps one identity across forms.</p>
        <p>Luffy’s sequence is Base, then Gears 2–5. “Gear 1” is an informal label for Base. Gear Four also has Boundman, Snakeman and the demonstrated stuffed Tankman.</p>
      </Card>
    </section>
    <section aria-labelledby="form-heading" className="guide-preview">
      <div className="section-heading"><div><span className="eyebrow">FORM EXPLORER</span><h2 id="form-heading">PICK A VERSION</h2></div></div>
      <p>{characters.length} character identities loaded · {characterForms.length} alternate form snapshots across {coverage} characters. These counts show authored snapshots, not completed canon review. Full form coverage is in progress; this is an information preview, not battle setup.</p>
      <ul className="guide-status">{animeConfig.map(anime => {
        const ids = new Set(characters.filter(item => item.anime === anime.id).map(item => item.id));
        const snapshots = characterForms.filter(form => ids.has(form.characterId));
        return <li key={anime.id}>{anime.name}: {snapshots.length} snapshots across {new Set(snapshots.map(form => form.characterId)).size} / {ids.size} identities</li>;
      })}</ul>
      <div className="guide-selectors">
        <label htmlFor="guide-character">Character<select id="guide-character" value={characterId} onChange={chooseCharacter}>{roster.map(item => <option key={item.id} value={item.id}>{item.name} · {animeConfig.find(anime => anime.id === item.anime)?.name}</option>)}</select></label>
        <label htmlFor="guide-form">Form<select id="guide-form" value={formId || ''} onChange={event => setFormId(event.target.value)}>
          {forms.length ? forms.map(form => <option key={form.id} value={form.id}>{form.name}</option>) : <option value="">Selected peak · alternate forms pending</option>}
        </select></label>
      </div>
      <Card className="guide-rating" style={{ '--tier': rarityColors[character.rarity] }}>
        <div className="guide-rating-heading"><div><h3>{character.name}</h3><p>{character.formName || peakFormNames[character.id]}</p>{character.era && <p>Era: {character.era}</p>}</div>
          <div><Badge color={rarityColors[character.rarity]}>{character.rarity} tier</Badge><p className="guide-power">{character.powerScore}<small> / 1000</small></p></div></div>
        <p><strong>Rating confidence:</strong> {character.confidence}. Scores are provisional fan estimates, not official canon levels or a guaranteed duel result.</p>
        <dl className="guide-stats">{Object.entries(character.stats).map(([stat, value]) => <div key={stat}><dt>{stat}</dt><dd>{value}<small> / 100</small></dd></div>)}</dl>
        <p><strong>Moves:</strong> {character.signatureMoves.join(' · ')}</p>
        <p><strong>{formId ? 'Form limits' : 'Rating notes'}:</strong> {character.limitations || character.reasoning}</p>
        {selectedForm && <p><strong>Manga review ranges:</strong> {selectedForm.sourceChapters.map(([start, end]) => start === end ? start : `${start}–${end}`).join(', ')}. Full inventory and panel review remain pending.</p>}
        {!forms.length && <p className="guide-status">This character has a peak record. Alternate forms have not been authored yet.</p>}
      </Card>
    </section>
    <section className="guide-rules" aria-label="Understand power levels">
      <Card><h2>WHAT DOES THE LEVEL MEAN?</h2><p>We show a power score from 1–1000 and its rarity tier. These are game ratings, not official anime levels. Common does not mean unimportant; Mythic does not mean unbeatable.</p>
        <ul className="guide-tiers">{powerTiers.map(tier => <li key={tier.name}><Badge color={rarityColors[tier.name]}>{tier.name}</Badge><span>{tier.min}–{tier.max}</span></li>)}</ul>
        <p>Player rank will be separate from character power. It arrives with accounts and battles.</p>
      </Card>
      <Card><h2>HOW WE RATE POWER</h2><p>Every series uses the same eight stats and weights. A form’s tier follows its calculated score; there are no series or popularity bonuses.</p>
        <ul className="guide-weights">{Object.entries(statWeights).map(([stat, weight]) => <li key={stat}><span>{stat}</span><strong>{weight}%</strong></li>)}</ul>
        <details><summary>See the exact formula and limits</summary><p>Weighted average = sum of each stat × its weight ÷ 100. Power = 1 + round(999 × (weighted average − 1) ÷ 99).</p><p>A score of 600 is not twice the physical strength of 300. Matchups, resource limits and specialized abilities cannot be fully represented by one number.</p></details>
      </Card>
    </section>
  </div>;
}
