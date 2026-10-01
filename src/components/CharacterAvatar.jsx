import { useState } from 'react';
import { Swords, Shield, HeartHandshake, Brain, Sparkles } from 'lucide-react';
import { animeConfig, animeTheme, rarityColors } from '../data/anime';
import './CharacterAvatar.css';
const roleIcons = { Striker: Swords, Tank: Shield, Support: HeartHandshake, Tactician: Brain, Hybrid: Sparkles };
export default function CharacterAvatar({ character, className = '' }) {
  const { name = 'Unknown', anime, image, rarity = 'Common', role = 'Hybrid' } = character;
  const [failedSource, setFailedSource] = useState(null);
  const theme = animeConfig.find(item => item.id === anime);
  const Icon = roleIcons[role] || Sparkles;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return <div className={`character-avatar ${className}`} role="img" aria-label={`${name} · ${role} · ${rarity}`} style={{ ...(theme ? animeTheme(theme) : {}), '--avatar-rarity': rarityColors[rarity] || rarityColors.Common }}>
    <span className="avatar-monogram" aria-hidden="true">{initials || '?'}</span>
    {image && image !== failedSource && <img key={image} src={image} alt="" loading="lazy" decoding="async" onError={() => setFailedSource(image)} />}
    <span className="avatar-role" aria-hidden="true"><Icon size={20} /></span>
  </div>;
}
