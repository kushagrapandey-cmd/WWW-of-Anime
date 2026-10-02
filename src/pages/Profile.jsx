import AccountSecurity from '../components/AccountSecurity';
import { ONLINE } from '../config/online';
import { useEffect, useState } from 'react';
import { LogOut, Swords, CircleHelp, Trophy, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { challengeDate } from '../quiz/date';
import { currentDailyStreak } from '../quiz/profileResult';
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
    <div className="profile-grid">{ONLINE && <AccountSecurity />}<Card className="profile-section"><h2><Swords size={22} />BATTLE RECORD</h2><dl className="profile-stats">{[['Wins', user.battleStats.wins], ['Losses', user.battleStats.losses], ['Win streak', user.battleStats.winStreak], ['Best streak', user.battleStats.bestStreak]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="profile-empty">Draft a team and build your battle record.</p><Button to="/battle" variant="secondary">Visit Battle Arena</Button></Card>
      <Card className="profile-section"><h2><CircleHelp size={22} />QUIZ PROGRESS</h2><dl className="profile-stats">{[['Quizzes played', user.quizStats.quizzesPlayed], ['Best accuracy', `${user.quizStats.bestScore}%`], ['Quiz XP', user.quizStats.xp], ['Daily streak', currentDailyStreak(user, challengeDate())], ['Best daily streak', user.quizStats.bestDailyStreak]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="profile-empty">Classic, 60-second Blitz and Daily Challenge are ready.</p><p className="profile-empty">Best points · Classic {user.quizProgress?.bestScores?.classic ?? 0} · Blitz {user.quizProgress?.bestScores?.blitz ?? 0} · Daily {user.quizProgress?.bestScores?.daily ?? 0}</p><Button to="/quizzes" variant="secondary">Play quizzes</Button></Card>
      <Card className="profile-section"><h2><Gamepad2 size={22} />GAME RECORD</h2><dl className="profile-stats">{[['Games played', user.gameProgress?.gamesPlayed ?? 0], ['Move Match best', Math.max(0, ...Object.entries(user.gameProgress?.highScores ?? {}).filter(([key]) => key.startsWith('move:')).map(([, score]) => score))], ['Clue Chain best', Math.max(0, ...Object.entries(user.gameProgress?.highScores ?? {}).filter(([key]) => key.startsWith('clue:')).map(([, score]) => score))], ['Higher or Lower best', Math.max(0, ...Object.entries(user.gameProgress?.highScores ?? {}).filter(([key]) => key.startsWith('power:')).map(([, score]) => score))]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="profile-empty">Highest recorded points per game. Filter/rules boards are listed separately in Games.</p><Button to="/games" variant="secondary">Play guessing games</Button></Card>
      <Card className="profile-section"><AvatarPicker value={avatar} onChange={value => { setAvatar(value); setMessage(''); }} disabled={busy} /><Button onClick={saveAvatar} disabled={busy || avatar === user.avatar}>Save avatar</Button><p role="status" className="save-status">{message}</p></Card>
      <Card className="profile-section"><h2><Trophy size={22} />ACHIEVEMENTS</h2>{user.achievements.length ? <ul className="achievement-list">{user.achievements.map(id => <li key={id}><Trophy size={18} />{achievementLabel(id)}</li>)}</ul> : <div className="achievement-empty"><Trophy size={44} /><h3>YOUR TROPHY SHELF</h3><p>No achievements yet. Win an arena match to earn your first trophy.</p></div>}<div className="rank-ladder"><span>Rank ladder</span><p>Rookie → Fighter → Elite → Master → Legend</p></div></Card>
    </div><p className="local-account-note">{ONLINE ? 'Your profile and completed progress are stored with your online account.' : 'Saved in this browser only. Clearing site data removes local profiles and progress.'}</p>
  </div>;
}
