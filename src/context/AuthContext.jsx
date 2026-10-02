import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AuthService from '../services/AuthService';
import { USERS_KEY, SESSION_KEY } from '../services/localStorageStore';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++generation.current;
    try {
      const current = await AuthService.getCurrentUser();
      if (version === generation.current) { setUser(current); setError(''); }
    } catch (reason) {
      if (version === generation.current) { setUser(null); setError(reason.message); }
    } finally { if (version === generation.current) setLoading(false); }
  }, []);
  useEffect(() => {
    refresh();
    const sync = event => { if (event.key === null || [USERS_KEY, SESSION_KEY].includes(event.key)) refresh(); };
    window.addEventListener('storage', sync);
    return () => { generation.current++; window.removeEventListener('storage', sync); };
  }, [refresh]);
  async function run(method, ...args) {
    const result = await AuthService[method](...args);
    generation.current++;
    setUser(method === 'logOut' ? null : result);
    setError('');
    return result;
  }
  return <AuthContext.Provider value={{ user, loading, error, refresh,
    signUp: data => run('signUp', data), logIn: data => run('logIn', data),
    logOut: () => run('logOut'), updateProfile: data => run('updateProfile', data),
    recordQuizResult: attempt => run('recordQuizResult', attempt),
    updateStats: (data, battle) => run('updateStats', data, battle),
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
