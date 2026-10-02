import { useEffect, useRef, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { miniRoster } from '../data/miniRoster';
import { useSound } from '../context/SoundContext';
import { answerRound, advanceRound, revealClue, scoreSession } from '../minigames/engine';
import MiniGameService from '../services/MiniGameService';
import Button from '../components/Button';
import GameSetup from '../components/games/GameSetup';
import GameShell from '../components/games/GameShell';
import MoveRound from '../components/games/MoveRound';
import ClueRound from '../components/games/ClueRound';
import PowerRound from '../components/games/PowerRound';
import RoundFeedback from '../components/games/RoundFeedback';
import GameResults from '../components/games/GameResults';
import './Games.css';
export default function Games() {
  const { user, loading, error: authError, refresh, recordGameResult } = useAuth();
  const { play } = useSound();
  const ownerId = user?.id ?? null;
  const [session, setSession] = useState(null), [history, setHistory] = useState([]), [highScores, setHighScores] = useState({});
  const [error, setError] = useState(''), [saveError, setSaveError] = useState(''), [saving, setSaving] = useState(false), [now, setNow] = useState(Date.now());
  const active = useRef(null), actor = useRef(ownerId), pending = useRef(new Set()), lastSettings = useRef(null), page = useRef(null);
  function replace(next) { active.current = next; setSession(next); }
  function read(id = ownerId) {
    try { const store = MiniGameService.read(id); setHistory(store.records); const scores = { ...store.highScores };
      for (const [key, score] of Object.entries(user?.id === id ? user.gameProgress?.highScores ?? {} : {})) scores[key] = Math.max(scores[key] ?? 0, score);
      setHighScores(scores); }
    catch (reason) { setError(reason.message); }
  }
  useEffect(() => {
    if (actor.current !== ownerId) { actor.current = ownerId; replace(null); setError(''); setSaveError(''); setSaving(false); lastSettings.current = null; }
    if (!loading) read(ownerId);
    const sync = event => { if (event.key === null || event.key === MiniGameService.key(ownerId)) read(ownerId); };
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, loading]);
  useEffect(() => {
    if (session?.status !== 'active') return;
    const timer = setInterval(() => {
      const time = Date.now(); setNow(time);
      const current = active.current;
      if (current?.status === 'active' && current.answers.length === current.cursor && time >= current.deadline) act(() => answerRound(current, null, time));
    }, 250);
    return () => clearInterval(timer);
    // A stored wall-clock deadline survives reloads; the ref handles current answers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.status]);
  useEffect(() => { if (session) page.current?.querySelector(session.status === 'active' ? '.mini-question-title' : '.mini-result-title')?.focus(); }, [session?.id, session?.cursor, session?.status]);
  async function save(next) {
    const key = `${next.ownerId ?? 'guest'}:${next.id}`;
    if (pending.current.has(key)) return;
    pending.current.add(key); setSaving(true); setSaveError('');
    try {
      const saved = await MiniGameService.save(next, recordGameResult);
      if (actor.current === next.ownerId) { if (active.current?.id === next.id) replace(saved); read(next.ownerId); }
    } catch (reason) { if (actor.current === next.ownerId) setSaveError(reason.message); }
    finally { pending.current.delete(key); if (actor.current === next.ownerId) setSaving(false); }
  }
  function act(transform) {
    try {
      const previous = active.current, next = transform();
      MiniGameService.write(next, previous.revision); replace(next); setError('');
      if (next.answers.length > previous.answers.length) play(scoreSession(next).details.at(-1).correct ? 'correct' : 'wrong');
      else if (next.status === 'complete') play('victory');
      if (next.status === 'complete' && !next.saved) save(next);
    } catch (reason) { setError(reason.message); }
  }
  function open(record) {
    try {
      let latest = MiniGameService.latest(record);
      if (latest.status === 'active' && latest.answers.length === latest.cursor && Date.now() >= latest.deadline) {
        const timedOut = answerRound(latest); MiniGameService.write(timedOut, latest.revision); latest = timedOut;
      }
      lastSettings.current = latest.settings; replace(latest); setNow(Date.now()); setError(''); setSaveError('');
      if (latest.status === 'complete' && !latest.saved) save(latest);
    } catch (reason) { setError(reason.message); }
  }
  function start(settings) { try { open(MiniGameService.start(miniRoster, settings, ownerId)); } catch (reason) { setError(reason.message); } }
  function leave() { replace(null); setError(''); read(); }
  const answered = session && session.answers.length > session.cursor;
  const disabled = Boolean(answered || (session && now >= session.deadline));
  return <div className="container mini-page" ref={page}><header className="mini-heading"><span className="eyebrow"><Gamepad2 size={18} /> THREE WAYS TO GUESS</span><h1>KNOW YOUR <span>FIGHTERS.</span></h1><p>Moves. Clues. Power. Ten rounds to prove your read.</p></header>
    {authError && <p role="alert" className="account-error">{authError}<Button onClick={refresh}>Reload profile</Button></p>}
    {error && <div role="alert" className="account-error">{error}{session && <Button variant="secondary" onClick={() => open(session)}>Load saved session</Button>}</div>}
    {!session && <GameSetup user={user} history={history} highScores={highScores} initialSettings={lastSettings.current} disabled={loading || Boolean(authError) || saving} onStart={start} onOpen={open} />}
    {session?.status === 'active' && <GameShell session={session} now={now} highScore={highScores[session.board] ?? 0} onLeave={leave}>
      {session.settings.mode === 'move' && <MoveRound session={session} disabled={disabled} onAnswer={value => act(() => answerRound(active.current, value))} />}
      {session.settings.mode === 'clue' && <ClueRound session={session} disabled={disabled} onReveal={() => act(() => revealClue(active.current))} onAnswer={value => act(() => answerRound(active.current, value))} />}
      {session.settings.mode === 'power' && <PowerRound session={session} disabled={disabled} revealed={Boolean(answered)} onAnswer={value => act(() => answerRound(active.current, value))} />}
      <RoundFeedback session={session} onNext={() => act(() => advanceRound(active.current))} />
    </GameShell>}
    {session?.status === 'complete' && <GameResults session={session} highScore={Math.max(highScores[session.board] ?? 0, user?.gameProgress?.highScores?.[session.board] ?? 0)} saving={saving} saveError={saveError} onSave={() => save(active.current)} onAgain={() => start(session.settings)} onNew={leave} />}
    <p className="mini-note mini-footer">Saved in this browser. Fixed peak forms. Clearing site data removes local game history.</p>
  </div>;
}
