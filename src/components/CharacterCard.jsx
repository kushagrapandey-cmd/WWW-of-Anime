import { rarityColors } from '../data/anime';
import Card from './Card';
import Badge from './Badge';
export default function CharacterCard({ name, anime, image, rarity = 'Common', powerScore, selected = false, onSelect }) {
  const color = rarityColors[rarity] || rarityColors.Common;
  const content = <><div className="character-image">{image ? <img src={image} alt={name} loading="lazy" onError={(e) => { e.currentTarget.hidden = true; }} /> : null}<span aria-hidden="true">{name?.split(' ').map(word => word[0]).slice(0, 2).join('') || '?'}</span></div><div className="character-info"><Badge color={color}>{rarity}</Badge><h3>{name}</h3><p>{anime}</p>{powerScore != null && <p>Power <strong>{powerScore}</strong></p>}</div></>;
  return onSelect ? <button type="button" className={`card character-card ${selected ? 'selected' : ''}`} style={{ '--rarity': color }} aria-pressed={selected} onClick={onSelect}>{content}</button> : <Card className="character-card" style={{ '--rarity': color }}>{content}</Card>;
}
