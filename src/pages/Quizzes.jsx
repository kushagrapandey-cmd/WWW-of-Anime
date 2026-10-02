import { ONLINE } from '../config/online';
import { OnlineActivityService as Remote } from '../services/OnlineActivityService';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CircleHelp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { quizQuestions } from '../data/quizzes';
import { challengeDate } from '../quiz/date';
import { useSound } from '../context/SoundContext';
import { answerAttempt, advanceAttempt, finishAttempt } from '../quiz/engine';
import QuizService from '../services/QuizService';
import Button from '../components/Button';
import QuizSetup from '../components/quiz/QuizSetup';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';
import './Quizzes.css';
export default function Quizzes() {
  const { user, loading, error: authError, refresh, recordQuizResult } = useAuth();
  const [params] = useSearchParams();
  const [attempt, setAttempt] = useState(null), [history, setHistory] = useState([]);
  const [error, setError] = useState(''), [saveError, setSaveError] = useState(''), [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());
  const active = useRef(null), actor = useRef(user?.id ?? null), busy = useRef(new Set()), section = useRef(null);
  const { play } = useSound();
  const ownerId = user?.id ?? null;
  const requestPending = useRef(false);
  function replace(next) { active.current = next; setAttempt(next); }
  async function readHistory(id = ownerId) {
    try { const records = ONLINE && id ? await Remote.history('quiz') : QuizService.history(id);
      if (actor.current === id) setHistory(records); } catch (reason) { setError(reason.message); }
  }
  useEffect(() => {
    if (actor.current !== ownerId) { actor.current = ownerId; replace(null); setError(''); setSaveError(''); setSaving(false); }
    if (!loading) readHistory(ownerId);
    const sync = event => { if (event.key === null || event.key === QuizService.key(ownerId)) readHistory(ownerId); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, loading]);
  useEffect(() => {
    const timer = setInterval(() => {
      const time = Date.now(); setNow(time);
      const current = active.current;
      if (current?.status === 'active' && current.deadline !== null && time >= current.deadline) act(() => finishAttempt(current, time), 'timeout');
    }, 250);
    return () => clearInterval(timer);
    // The ref tracks current state without restarting the wall-clock timer on each answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (attempt) section.current?.querySelector(attempt.status === 'active' ? '.quiz-question-title' : '.quiz-result-title')?.focus();
  }, [attempt?.id, attempt?.cursor, attempt?.status]);
  async function save(next) {
    const saveKey = `${next.ownerId ?? 'guest'}:${next.id}`;
    if (busy.current.has(saveKey)) return;
    busy.current.add(saveKey); setSaving(true); setSaveError('');
    try {
      const saved = ONLINE && next.ownerId ? await Remote.latest('quiz', next) : await QuizService.save(next, recordQuizResult);
      if (ONLINE && next.ownerId) await refresh();
      if (actor.current === next.ownerId) { if (active.current?.id === next.id) replace(saved); readHistory(next.ownerId); }
    } catch (reason) { if (actor.current === next.ownerId) setSaveError(reason.message); }
    finally { busy.current.delete(saveKey); if (actor.current === next.ownerId) setSaving(false); }
  }
  async function act(transform, action, input) {
    if (requestPending.current) return;
    requestPending.current = true;
    try {
      const previous = active.current;
      const next = ONLINE && previous.ownerId ? await Remote.act('quiz', previous, action, input) : transform();
      if (actor.current !== next.ownerId || active.current?.id !== next.id) return;
      if (!ONLINE || !previous.ownerId) QuizService.write(next, previous.revision);
      replace(next); setError('');
      if (next.answers.length > previous.answers.length) play(next.answers.at(-1).optionIndex === next.questions[previous.cursor].answerIndex ? 'correct' : 'wrong');
      else if (next.status === 'complete' && previous.status !== 'complete') play('victory');
      if (next.status === 'complete' && !next.saved) save(next);
    } catch (reason) { setError(reason.message); }
    finally { requestPending.current = false; }
  }
  async function open(item) {
    try {
      let latest = ONLINE && item.ownerId ? await Remote.latest('quiz', item) : QuizService.latest(item);
      if (latest.status === 'active' && latest.deadline !== null && Date.now() >= latest.deadline) {
        if (ONLINE && latest.ownerId) latest = await Remote.act('quiz', latest, 'timeout');
        else { const finished = finishAttempt(latest); QuizService.write(finished, latest.revision); latest = finished; }
      }
      if (actor.current !== latest.ownerId) return;
      replace(latest); setNow(Date.now()); setError(''); setSaveError('');
      if (latest.status === 'complete' && !latest.saved) save(latest);
    } catch (reason) { setError(reason.message); }
  }
  function leave() { replace(null); setError(''); readHistory(); }
  const today = challengeDate(now);
  return <div ref={section} className="container quiz-page"><header className="quiz-heading"><span className="eyebrow"><CircleHelp size={18} /> THE KNOWLEDGE ARC</span><h1>ANIME <span>QUIZZES.</span></h1><p>{quizQuestions.length} questions. Bring your memory.</p></header>
    {authError && <p role="alert" className="account-error">{authError}<Button onClick={refresh}>Reload profile</Button></p>}
    {error && <div role="alert" className="account-error">{error}{attempt && <Button variant="secondary" onClick={() => open(attempt)}>Load saved attempt</Button>}</div>}
    {!attempt && <QuizSetup key={`${ownerId}:${params.get('mode')}`} user={user} initialMode={params.get('mode') === 'daily' ? 'daily' : 'classic'} today={today} history={history} disabled={loading || Boolean(authError) || saving} onStart={async settings => { try { open(ONLINE && ownerId ? await Remote.start('quiz', settings) : QuizService.start(quizQuestions, settings, ownerId)); } catch (reason) { setError(reason.message); } }} onOpen={open} />}
    {attempt?.status === 'active' && <QuizQuestion attempt={attempt} now={now} onAnswer={index => act(() => answerAttempt(active.current, index), 'answer', index)} onNext={() => act(() => advanceAttempt(active.current), 'next')} onLeave={leave} />}
    {attempt?.status === 'complete' && <QuizResults attempt={attempt} user={user} saving={saving} saveError={saveError} onSave={() => save(active.current)} onNew={leave} />}
    <p className="quiz-note quiz-footer">{ONLINE && user ? 'Your attempts and results follow your online account. Daily reset: midnight Asia/Kolkata. Timers are enforced by the server.' : 'Guest progress stays in this browser. Daily reset: midnight Asia/Kolkata.'}</p>
  </div>;
}
