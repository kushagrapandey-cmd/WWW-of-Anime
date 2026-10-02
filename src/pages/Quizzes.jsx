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
  function replace(next) { active.current = next; setAttempt(next); }
  function readHistory(id = ownerId) {
    try { setHistory(QuizService.history(id)); } catch (reason) { setError(reason.message); }
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
      if (current?.status === 'active' && current.deadline !== null && time >= current.deadline) act(() => finishAttempt(current, time));
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
      const saved = await QuizService.save(next, recordQuizResult);
      if (actor.current === next.ownerId) { if (active.current?.id === next.id) replace(saved); readHistory(next.ownerId); }
    } catch (reason) { if (actor.current === next.ownerId) setSaveError(reason.message); }
    finally { busy.current.delete(saveKey); if (actor.current === next.ownerId) setSaving(false); }
  }
  function act(transform) {
    try {
      const previous = active.current, next = transform();
      if (previous?.id === next.id) QuizService.write(next, previous.revision);
      replace(next); setError('');
      if (next.answers.length > previous.answers.length) play(next.answers.at(-1).optionIndex === next.questions[previous.cursor].answerIndex ? 'correct' : 'wrong');
      else if (next.status === 'complete' && previous.status !== 'complete') play('victory');
      if (next.status === 'complete' && !next.saved) save(next);
    } catch (reason) { setError(reason.message); }
  }
  function open(item) {
    try {
      let latest = QuizService.latest(item);
      if (latest.status === 'active' && latest.deadline !== null && Date.now() >= latest.deadline) {
        const finished = finishAttempt(latest); QuizService.write(finished, latest.revision); latest = finished;
      }
      replace(latest); setNow(Date.now()); setError(''); setSaveError('');
      if (latest.status === 'complete' && !latest.saved) save(latest);
    } catch (reason) { setError(reason.message); }
  }
  function leave() { replace(null); setError(''); readHistory(); }
  const today = challengeDate(now);
  return <div ref={section} className="container quiz-page"><header className="quiz-heading"><span className="eyebrow"><CircleHelp size={18} /> THE KNOWLEDGE ARC</span><h1>ANIME <span>QUIZZES.</span></h1><p>{quizQuestions.length} questions. Bring your memory.</p></header>
    {authError && <p role="alert" className="account-error">{authError}<Button onClick={refresh}>Reload profile</Button></p>}
    {error && <div role="alert" className="account-error">{error}{attempt && <Button variant="secondary" onClick={() => open(attempt)}>Load saved attempt</Button>}</div>}
    {!attempt && <QuizSetup key={`${ownerId}:${params.get('mode')}`} user={user} initialMode={params.get('mode') === 'daily' ? 'daily' : 'classic'} today={today} history={history} disabled={loading || Boolean(authError) || saving} onStart={settings => { try { open(QuizService.start(quizQuestions, settings, ownerId)); } catch (reason) { setError(reason.message); } }} onOpen={open} />}
    {attempt?.status === 'active' && <QuizQuestion attempt={attempt} now={now} onAnswer={index => act(() => answerAttempt(active.current, index))} onNext={() => act(() => advanceAttempt(active.current))} onLeave={leave} />}
    {attempt?.status === 'complete' && <QuizResults attempt={attempt} user={user} saving={saving} saveError={saveError} onSave={() => save(active.current)} onNew={leave} />}
    <p className="quiz-note quiz-footer">Saved on this browser only. Daily reset: midnight Asia/Kolkata. Timers use elapsed wall-clock time. Clearing site data removes local progress.</p>
  </div>;
}
