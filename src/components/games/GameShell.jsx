import { MINI, gameNames } from '../../minigames/config';
import { scoreSession } from '../../minigames/engine';
import ProgressBar from '../ProgressBar';
import Button from '../Button';
export default function GameShell({ session, now, highScore, onLeave, children }) {
  const result = scoreSession(session), answer = session.answers[session.cursor];
  const left = Math.max(0, (session.deadline - (answer?.answeredAt ?? now)) / 1000);
  const duration = (session.deadline - session.roundStartedAt) / 1000;
  return <section className="mini-panel game-shell"><div className="mini-game-meta"><span>{gameNames[session.settings.mode]} · ROUND {session.cursor + 1} / {MINI.rounds}</span><strong>{result.score} POINTS · BEST {highScore}</strong></div><div className="mini-timer"><p role="timer" aria-label="Round time remaining">{answer ? answer.timeout ? 'Time is up' : 'Round answered · timer stopped' : `${Math.ceil(left)} seconds left`}</p><ProgressBar value={left} max={duration} label="Round time remaining" color={left < 10 ? '#ff729b' : '#c2ff43'} /></div>{children}<div className="mini-actions"><Button variant="secondary" onClick={onLeave}>Save and leave</Button><span className="mini-note">{session.settings.mode === 'power' && session.settings.streak ? `Correct streak: ${result.streak} · Next correct ×${Math.min(MINI.maxMultiplier, 1 + Math.floor((result.streak + 1) / MINI.streakStep))}` : 'One answer per round. Ten rounds per game.'}</span></div></section>;
}
