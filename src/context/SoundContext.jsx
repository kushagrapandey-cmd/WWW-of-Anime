import { createContext, useContext, useEffect, useState } from 'react';
import SoundService, { SOUND_KEY } from '../services/SoundService';
const SoundContext = createContext({ enabled: false, error: '', toggle() {}, play() {} });
export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => SoundService.enabled()), [error, setError] = useState('');
  useEffect(() => {
    const sync = event => { if (event.key === null || event.key === SOUND_KEY) setEnabled(SoundService.sync()); };
    const hide = () => { if (document.hidden) SoundService.stop(); };
    window.addEventListener('storage', sync); document.addEventListener('visibilitychange', hide);
    return () => { window.removeEventListener('storage', sync); document.removeEventListener('visibilitychange', hide); SoundService.stop(); };
  }, []);
  function play(cue) { SoundService.play(cue).catch(reason => setError(reason.message)); }
  function toggle() {
    try { SoundService.setEnabled(!enabled); setEnabled(!enabled); setError(''); if (!enabled) play('reveal'); }
    catch (reason) { SoundService.stop(); setEnabled(false); setError(reason.message); }
  }
  return <SoundContext.Provider value={{ enabled, error, toggle, play }}>{children}</SoundContext.Provider>;
}
export const useSound = () => useContext(SoundContext);
