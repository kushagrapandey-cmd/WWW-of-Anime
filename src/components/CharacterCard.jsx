import { rarityColors } from '../data/anime';
import CharacterAvatar from './CharacterAvatar';
import ProgressBar from './ProgressBar';
import Card from './Card';
import Badge from './Badge';
import './CharacterCard.css';
export default function CharacterCard({ character, name, anime, image, role, stats, abilityTags, rarity = 'Common', powerScore, selected = false, onSelect }) {
  const fighter = character || { name, anime, image, role, stats, abilityTags, rarity, powerScore };
  const color = rarityColors[fighter.rarity] || rarityColors.Common;
  const content = <>
    <CharacterAvatar character={fighter} />
    <div className="character-info"><Badge color={color}>{fighter.rarity || 'Common'}</Badge><h3>{fighter.name}</h3><p>{fighter.anime} · {fighter.role || 'Hybrid'}</p>
      {fighter.powerScore != null && <p className="card-power">Power <strong>{fighter.powerScore}</strong><span> / 1000</span></p>}
      {!!fighter.abilityTags?.length && <ul className="character-tags" aria-label="Abilities">{fighter.abilityTags.map(tag => <li key={tag}>{tag.replaceAll('-', ' ')}</li>)}</ul>}
      {fighter.stats && <div className="card-stats">{Object.entries(fighter.stats).map(([stat, value]) => <div key={stat}><div><span>{stat}</span><strong>{value} / 100</strong></div><ProgressBar value={value} label={`${fighter.name}: ${stat}`} color={color} /></div>)}</div>}
    </div>
  </>;
  return onSelect ? <button type="button" className={`card character-card ${selected ? 'selected' : ''}`} style={{ '--rarity': color }} aria-pressed={selected} onClick={onSelect}>{content}</button> : <Card className="character-card" style={{ '--rarity': color }}>{content}</Card>;
}
