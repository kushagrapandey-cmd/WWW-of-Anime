import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import ArenaRounds from './ArenaRounds';
import ArenaResults from './ArenaResults';
import Button from '../Button';

// Presentation only: the completed server outcome is never recalculated here.
export default function Showdown({ match, onRematch, onNew }) {
  const reduced = useReducedMotion();
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(false);
  const [automatic, setAutomatic] = useState(!reduced);
  const [replay, setReplay] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const changed = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', changed);
    return () => document.removeEventListener('visibilitychange', changed);
  }, []);
  const next = () => round + 1 < match.outcome.rounds.length ? setRound(value => value + 1) : setFinished(true);
  useEffect(() => {
    if (!automatic || finished || !visible) return;
    const timer = setTimeout(() => round + 1 < match.outcome.rounds.length ? setRound(value => value + 1) : setFinished(true), 4500);
    return () => clearTimeout(timer);
  }, [automatic, finished, round, visible, match.outcome.rounds.length]);
  if (finished) return <>
    <ArenaResults record={match.record} outcome={match.outcome} replay={false} saveState={{ busy: false, error: '' }} onRematch={onRematch} onNew={onNew} />
    <Button variant="secondary" onClick={() => { setRound(0); setReplay(true); setFinished(false); }}>Replay showdown</Button>
  </>;
  return <div className="showdown"><div className="showdown-toolbar"><span className="eyebrow">{replay ? 'REPLAY' : 'THE SHOWDOWN'} · SERVER RESULT</span><div className="arena-actions"><Button variant="secondary" aria-pressed={automatic} onClick={() => setAutomatic(value => !value)}>{automatic ? 'Pause auto-play' : 'Auto-play'}</Button><Button variant="secondary" onClick={() => setFinished(true)}>Skip to results</Button></div></div>
    <ArenaRounds record={match.record} outcome={match.outcome} roundIndex={round} onNext={next} replay={replay} />
  </div>;
}
