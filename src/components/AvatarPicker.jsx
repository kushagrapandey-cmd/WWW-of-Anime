import { useState } from 'react';
import { profileAvatars } from '../data/profile';
import CharacterAvatar from './CharacterAvatar';
export default function AvatarPicker({ value, onChange, disabled = false }) {
  const [query, setQuery] = useState('');
  const options = profileAvatars.filter(avatar => avatar.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <fieldset className="avatar-picker" disabled={disabled}><legend>Choose your avatar</legend><label className="avatar-search">Find an avatar<input type="search" value={query} placeholder="Search a character or original avatar" onChange={event => setQuery(event.target.value)} /></label><div className="avatar-options">{options.map(avatar =>
    <label key={avatar.id} className={value === avatar.id ? 'avatar-option chosen' : 'avatar-option'}>
      <input type="radio" name="avatar" value={avatar.id} checked={value === avatar.id} onChange={() => onChange(avatar.id)} />
      <CharacterAvatar character={avatar} thumbnail /><span>{avatar.name}</span>
    </label>)}</div>{!options.length && <p role="status">No avatars found. Try another name.</p>}</fieldset>;
}
