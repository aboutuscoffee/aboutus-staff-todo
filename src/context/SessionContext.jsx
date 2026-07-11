import { createContext, useContext, useState, useCallback } from 'react';
import { MAX_ATTEMPTS } from '../constants';
import { sha256 } from '../utils';

const SessionContext = createContext(null);
const STORAGE_KEY = 'aboutus_login_key';

export function SessionProvider({ staff, onPersistStaff, children }) {
  const [loggedInUserKey, setLoggedInUserKey] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const user = staff.find((s) => s.key === saved);
    return user && !user.blocked ? saved : null;
  });
  const [modal, setModal] = useState({ open: false, subText: '', cancelable: true, onSuccess: null });

  const openLoginModal = useCallback(({ subText = '', onSuccess = null, cancelable = true } = {}) => {
    setModal({ open: true, subText, cancelable, onSuccess });
  }, []);

  const closeLoginModal = useCallback(() => {
    setModal((m) => (m.cancelable ? { ...m, open: false } : m));
  }, []);

  const login = useCallback(async (key, password) => {
    const user = staff.find((s) => s.key === key);
    if (!user) return { ok: false };
    if (user.blocked) return { ok: false, blocked: true };

    const hash = await sha256(password);
    if (hash === user.password_hash) {
      await onPersistStaff({ ...user, attempts: 0 });
      setLoggedInUserKey(key);
      localStorage.setItem(STORAGE_KEY, key);
      setModal((m) => ({ ...m, open: false }));
      if (modal.onSuccess) modal.onSuccess(key);
      return { ok: true };
    }

    const attempts = (user.attempts || 0) + 1;
    const blocked = attempts >= MAX_ATTEMPTS;
    await onPersistStaff({ ...user, attempts, blocked });
    return { ok: false, blocked, attemptsLeft: MAX_ATTEMPTS - attempts };
  }, [staff, onPersistStaff, modal]);

  const logout = useCallback(() => {
    setLoggedInUserKey(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SessionContext.Provider value={{ loggedInUserKey, login, logout, modal, openLoginModal, closeLoginModal }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
