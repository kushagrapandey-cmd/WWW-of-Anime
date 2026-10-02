import { useState } from 'react';
import { Swords } from 'lucide-react';
import { REQUIRE_LOGIN } from '../config/auth';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Button from '../components/Button';
import './Accounts.css';
export default function BattleEntry() {
  const { user } = useAuth();
  const [player1, setPlayer1] = useState('Player 1');
  const [player2, setPlayer2] = useState('Player 2');
  return <section className="placeholder container"><div className="placeholder-icon"><Swords size={44} /></div><Badge>COMING IN PHASE 5</Badge><h1>BATTLE ARENA</h1><p>Five fighters. A hidden lineup. One winner.</p>{REQUIRE_LOGIN ? <p>Signed in as <strong>{user?.username}</strong>. Your profile is ready for the arena.</p> : <div className="guest-names"><h2>GUEST PLAYERS</h2><label htmlFor="player-one">Player 1 name<input id="player-one" maxLength={24} value={player1} onChange={event => setPlayer1(event.target.value)} /></label><label htmlFor="player-two">Player 2 name<input id="player-two" maxLength={24} value={player2} onChange={event => setPlayer2(event.target.value)} /></label><p>{player1.trim() || 'Player 1'} vs {player2.trim() || 'Player 2'}</p></div>}<p className="placeholder-note">Drafting and battles arrive next. This is an arena preview.</p><Button to={user ? '/profile' : '/login'} variant="secondary">{user ? 'View my profile' : 'Create a local profile'}</Button><Button to="/characters" variant="secondary">Explore fighters</Button></section>;
}
