import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { coinState, pendingMilestones } from '../services/CoinsService';
import { COIN_CONFIG } from '../config/coins';
import Modal from './Modal';
import Button from './Button';
export default function CoinRewards() {
  const { user, acknowledgeCoinMilestone } = useAuth();
  const previous = useRef(null);
  const [toast, setToast] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const milestone = pendingMilestones(user)[0];
  useEffect(() => {
    const state = coinState(user);
    if (user && previous.current?.id === user.id) {
      const known = previous.current.ids;
      const earned = state.ledger.filter(item => !known.has(item.id)).reduce((sum, item) => sum + item.amount, 0);
      if (earned > 0) setToast(`+${earned} coins`);
    } else { setToast(''); setError(''); }
    previous.current = user ? { id: user.id, ids: new Set(state.ledger.map(item => item.id)) } : null;
  }, [user]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  async function close() {
    if (busy) return;
    setBusy(true); setError('');
    try { await acknowledgeCoinMilestone(milestone); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  return <>{toast && <div className="coin-toast" role="status">{toast}<button aria-label="Dismiss coin reward" onClick={() => setToast('')}>×</button></div>}<Modal open={Boolean(user && milestone)} title={`${milestone ?? ''} COINS EARNED!`} onClose={close}><p>{COIN_CONFIG.milestoneMessage}</p><Button onClick={close} disabled={busy}>{busy ? 'Saving…' : 'Keep earning'}</Button>{error && <p role="alert">{error}</p>}</Modal></>;
}
