import { Link, useParams } from 'react-router-dom';
import { Swords, CircleHelp, Gamepad2, UserRound, Flame, Anchor, Sword } from 'lucide-react';
import { animeConfig, animeTheme } from '../data/anime';
import Badge from '../components/Badge';
import Button from '../components/Button';
const sections = {
  battle: { title: 'BATTLE ARENA', icon: Swords, phase: 5, text: 'Draft your fighters, build your lineup, and face off across five rounds.' },
  quizzes: { title: 'ANIME QUIZZES', icon: CircleHelp, phase: 6, text: 'Canon questions, timed challenges, and a daily test of your anime knowledge.' },
  games: { title: 'GUESSING GAMES', icon: Gamepad2, phase: 7, text: 'Move Match, clue chains, and higher-or-lower power showdowns.' },
  profile: { title: 'YOUR PROFILE', icon: UserRound, phase: 4, text: 'Your future home for battle stats, ranks, quiz scores, and achievements.' },
  login: { title: 'JOIN THE CLASH', icon: UserRound, phase: 4, text: 'Accounts and login will arrive with the profile phase.' },
};
export default function Placeholder({ section }) {
  const { animeId } = useParams();
  const anime = animeConfig.find(item => item.id === animeId);
  if (animeId && !anime) return <NotFound />;
  const config = anime ? { title: anime.name, icon: { naruto: Flame, onepiece: Anchor, bleach: Sword }[anime.id], phase: 2, text: anime.description } : sections[section];
  const Icon = config.icon;
  return <section className="placeholder container" style={anime ? animeTheme(anime) : undefined}><div className="placeholder-icon"><Icon size={44} /></div><Badge>COMING IN PHASE {config.phase}</Badge><h1>{config.title}</h1><p>{config.text}</p><p className="placeholder-note">This section is a preview. There’s nothing to play here yet.</p><Button to="/" variant="secondary">Back to home</Button><Link className="text-link" to="/characters">Explore characters, forms & power tiers</Link>{section === 'login' && <Link className="text-link" to="/profile">Preview profile</Link>}</section>;
}
export function NotFound() { return <section className="placeholder container"><span className="error-number">404</span><h1>LOST IN ANOTHER ARC?</h1><p>This page doesn’t exist. Head back to your universe.</p><Button to="/">Back to home</Button></section>; }
