import identities from '../data/character-identities.json';
const identityIds = new Set(identities.map(character => character.id));
import { useState } from 'react';
import { Swords, Shield, HeartHandshake, Brain, Sparkles } from 'lucide-react';
import { animeConfig, animeTheme, rarityColors } from '../data/anime';
import './CharacterAvatar.css';
const roleIcons = { Striker: Swords, Tank: Shield, Support: HeartHandshake, Tactician: Brain, Hybrid: Sparkles };
export default function CharacterAvatar({ character, className = '', thumbnail = false }) {
  const { name = 'Unknown', anime, rarity = 'Common', role = 'Hybrid' } = character;
  const identity = identityIds.has(character.id) ? character.id : identityIds.has(character.characterId) ? character.characterId : null;
  const image = character.image || (identity ? `/characters/${identity}${thumbnail ? '-small' : ''}.webp` : null);
  const [failedSource, setFailedSource] = useState(null);
  const theme = animeConfig.find(item => item.id === anime);
  const Icon = roleIcons[role] || Sparkles;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return <div className={`character-avatar ${className}`} role="img" aria-label={`${name} · ${role} · ${rarity}`} style={{ ...(theme ? animeTheme(theme) : {}), '--avatar-rarity': rarityColors[rarity] || rarityColors.Common }}>
    <span className="avatar-monogram" aria-hidden="true">{initials || '?'}</span>
    {image && image !== failedSource && <img key={image} src={image} alt="" loading="lazy" decoding="async" width="225" height="300" onError={() => setFailedSource(image)} />}
    <span className="avatar-role" aria-hidden="true"><Icon size={20} /></span>
  </div>;
}
