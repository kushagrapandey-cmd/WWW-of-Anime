import { useState } from 'react';
import Button from '../Button';
export default function NameAnswer({ onAnswer, disabled }) {
  const [name, setName] = useState('');
  return <form className="mini-name-form" onSubmit={event => { event.preventDefault(); onAnswer(name); }}><label>Character name<input value={name} maxLength={128} required autoComplete="off" disabled={disabled} onChange={event => setName(event.target.value)} /></label><Button type="submit" disabled={disabled}>Submit guess</Button><p className="mini-note">Use a full name if your guess is shared by several characters.</p></form>;
}
