import { useEffect, useState } from 'react';
import { LogOut, Swords, CircleHelp, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAvatar, getRank } from '../data/profile';
import CharacterAvatar from '../components/CharacterAvatar';
import AvatarPicker from '../components/AvatarPicker';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import './Accounts.css';
const achievementLabel = id => id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
export default function Profile() {
  const { user, updateProfile, logOut } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar ?? 'leaf');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { setAvatar(user?.avatar ?? 'leaf'); }, [user?.avatar]);
  if (!user) return null;
  const rank = getRank(user.battleStats.rankPoints);
  async function saveAvatar() {
    setBusy(true); setError(''); setMessage('');
    try { await updateProfile({ avatar }); setMessage('Avatar saved.'); } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }
  async function leave() {
    setBusy(true); setError('');
    try { await logOut(); } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }
  return <div className="container profile-page"><header className="profile-heading"><div><span className="eyebrow">YOUR PLAYER CARD</span><h1>THE NEXT ARC <span>IS YOURS.</span></h1></div><Button variant="secondary" onClick={leave} disabled={busy}><LogOut size={17} />Log out</Button></header>
    <Card className="player-card"><CharacterAvatar character={getAvatar(user.avatar)} className="player-avatar" /><div className="player-identity"><Badge color={rank.color}>{rank.name.toUpperCase()}</Badge><h2>{user.username}</h2><p>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><div className="rank-progress"><strong>{user.battleStats.rankPoints} rank points</strong><ProgressBar value={rank.progress} max={100} label={`${rank.name} rank progress`} color={rank.color} /><p>{rank.next ? `${rank.next.min - user.battleStats.rankPoints} points to ${rank.next.name}` : 'You reached the top rank.'}</p></div></Card>
    {error && <p className="account-error" role="alert">{error}</p>}
    <div className="profile-grid"><Card className="profile-section"><h2><Swords size={22} />BATTLE RECORD</h2><dl className="profile-stats">{[['Wins', user.battleStats.wins], ['Losses', user.battleStats.losses], ['Win streak', user.battleStats.winStreak], ['Best streak', user.battleStats.bestStreak]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="profile-empty">Your record starts when Battle Arena opens in Phase 5.</p><Button to="/battle" variant="secondary">Visit Battle Arena</Button></Card>
      <Card className="profile-section"><h2><CircleHelp size={22} />QUIZ PROGRESS</h2><dl className="profile-stats">{[['Quizzes played', user.quizStats.quizzesPlayed], ['Best accuracy', `${user.quizStats.bestScore}%`], ['Quiz XP', user.quizStats.xp], ['Daily streak', user.quizStats.dailyStreak]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="profile-empty">Quizzes and Daily Challenge arrive in Phase 6.</p><Button to="/quizzes" variant="secondary">Explore quizzes</Button></Card>
      <Card className="profile-section"><AvatarPicker value={avatar} onChange={value => { setAvatar(value); setMessage(''); }} disabled={busy} /><Button onClick={saveAvatar} disabled={busy || avatar === user.avatar}>Save avatar</Button><p role="status" className="save-status">{message}</p></Card>
      <Card className="profile-section"><h2><Trophy size={22} />ACHIEVEMENTS</h2>{user.achievements.length ? <ul className="achievement-list">{user.achievements.map(id => <li key={id}><Trophy size={18} />{achievementLabel(id)}</li>)}</ul> : <div className="achievement-empty"><Trophy size={44} /><h3>YOUR TROPHY SHELF</h3><p>No achievements yet. Future games will unlock them here.</p></div>}<div className="rank-ladder"><span>Rank ladder</span><p>Rookie → Fighter → Elite → Master → Legend</p></div></Card>
    </div><p className="local-account-note">Saved in this browser only. Clearing site data removes local profiles and progress.</p>
  </div>;
}
