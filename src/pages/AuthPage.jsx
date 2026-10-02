import { ONLINE } from '../config/online';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Swords, Trophy, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReturnPath } from '../services/authRouting';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import './Accounts.css';
export default function AuthPage() {
  const location = useLocation();
  const signup = location.pathname === '/signup';
  const { user, loading, error: sessionError, signUp, logIn, logOut } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);
  const destination = getReturnPath(location.state?.from);
  useEffect(() => { setPassword(''); setConfirm(''); setError(''); setShow(false); }, [signup]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (signup && password !== confirm) { setError('Your passwords do not match.'); return; }
    setBusy(true);
    try {
      await (signup ? signUp : logIn)({ username, password });
      setPassword(''); setConfirm('');
    } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }
  if (loading) return <section className="placeholder container"><p role="status">Loading your account…</p></section>;
  if (user) return <Navigate to={destination} replace />;
  return <div className="container account-layout">
    <section className="account-intro"><Badge>YOUR NEXT ARC STARTS HERE</Badge><h1>ONE PROFILE.<br /><span>THREE WORLDS.</span></h1><p>Pick your identity. Keep your progress. Get ready for the clash.</p>
      <ul className="account-perks"><li><Swords /><div><strong>Build your battle record</strong><span>Wins, streaks and rank points from your arena matches.</span></div></li><li><Trophy /><div><strong>Climb from Rookie to Legend</strong><span>Your player rank is separate from character rarity.</span></div></li><li><Sparkles /><div><strong>Make it your own</strong><span>Six anime-themed avatars. One profile for every mode.</span></div></li></ul>
      <p className="local-account-note">{ONLINE ? 'Your online profile follows your account across devices. Use a unique password of at least 12 characters. Email password recovery is not available yet.' : 'This demo profile stays in this browser. Use a demo password; it won’t sync between devices.'}</p>
    </section>
    <Card className="auth-card"><div className="auth-switch"><Link to="/login" state={location.state} aria-current={!signup ? 'page' : undefined}>Log in</Link><Link to="/signup" state={location.state} aria-current={signup ? 'page' : undefined}>Create account</Link></div>
      <h2>{signup ? 'CHOOSE YOUR PLAYER NAME' : 'WELCOME BACK, FIGHTER'}</h2><p>{signup ? 'Your first rank is Rookie. Your next arc is yours.' : ONLINE ? 'Sign in to your online profile.' : 'Your local profile is waiting for you.'}</p>
      {sessionError && <div className="account-error" role="alert"><p>{sessionError}</p><button type="button" className="text-link reset-session" onClick={async () => { try { await logOut(); } catch (reason) { setError(reason.message); } }}>Clear this login session</button></div>}
      <form noValidate onSubmit={submit} aria-busy={busy}>
        <label htmlFor="username">Username<input id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={24} value={username} onChange={event => setUsername(event.target.value)} disabled={busy} required aria-describedby="username-help" /></label><p id="username-help" className="field-help">3–24 letters, numbers or underscores.</p>
        <label htmlFor="password">Password<div className="password-field"><input id="password" name="password" type={show ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? (ONLINE ? 12 : 8) : 1} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} required aria-describedby={signup ? 'password-help' : undefined} /><button type="button" className="password-toggle" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} onClick={() => setShow(!show)} disabled={busy}>{show ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></label>
        {signup && <><p id="password-help" className="field-help">{ONLINE ? '12–128' : '8–128'} characters. Spaces count as characters.</p><label htmlFor="confirm-password">Confirm password<input id="confirm-password" name="confirmPassword" type={show ? 'text' : 'password'} autoComplete="new-password" maxLength={128} value={confirm} onChange={event => setConfirm(event.target.value)} disabled={busy} required /></label></>}
        {error && <p ref={errorRef} tabIndex={-1} className="account-error" role="alert">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'Saving your session…' : signup ? 'Create my profile' : 'Log in'}</Button>
      </form><p className="auth-bottom">{signup ? 'Already have an account?' : 'New to the playground?'} <Link className="text-link" to={signup ? '/login' : '/signup'} state={location.state}>{signup ? 'Log in' : 'Create an account'}</Link></p>
    </Card>
  </div>;
}
