import { profileAvatars } from '../data/profile';
import CharacterAvatar from './CharacterAvatar';
export default function AvatarPicker({ value, onChange, disabled = false }) {
  return <fieldset className="avatar-picker" disabled={disabled}><legend>Choose your avatar</legend><div className="avatar-options">{profileAvatars.map(avatar =>
    <label key={avatar.id} className={value === avatar.id ? 'avatar-option chosen' : 'avatar-option'}>
      <input type="radio" name="avatar" value={avatar.id} checked={value === avatar.id} onChange={() => onChange(avatar.id)} />
      <CharacterAvatar character={avatar} /><span>{avatar.name}</span>
    </label>)}</div></fieldset>;
}
