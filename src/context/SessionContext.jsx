import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const SessionContext = createContext(null);

export function SessionProvider({ staff, children }) {
  // undefined = セッション確認中, null = 未ログイン, オブジェクト = ログイン中のSupabase Authセッション
  const [session, setSession] = useState(undefined);
  const [modal, setModal] = useState({ open: false, subText: '', cancelable: true, onSuccess: null });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // staff.auth_user_idはSupabase Authのuser.idと突き合わせるためのキー。
  // 業務データ側は引き続きstaff.keyで紐付いているため、ここでstaff.keyに変換してから渡す
  const loggedInStaff = session?.user ? staff.find((s) => s.auth_user_id === session.user.id) : null;
  const loggedInUserKey = loggedInStaff ? loggedInStaff.key : null;

  const openLoginModal = useCallback(({ subText = '', onSuccess = null, cancelable = true } = {}) => {
    setModal({ open: true, subText, cancelable, onSuccess });
  }, []);

  const closeLoginModal = useCallback(() => {
    setModal((m) => (m.cancelable ? { ...m, open: false } : m));
  }, []);

  const login = useCallback(async (key, password) => {
    const user = staff.find((s) => s.key === key);
    if (!user || !user.email) return { ok: false };
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
    if (error) return { ok: false };
    setModal((m) => ({ ...m, open: false }));
    if (modal.onSuccess) modal.onSuccess(key);
    return { ok: true };
  }, [staff, modal]);

  const logout = useCallback(() => supabase.auth.signOut(), []);

  return (
    <SessionContext.Provider value={{ loggedInUserKey, sessionLoading: session === undefined, login, logout, modal, openLoginModal, closeLoginModal }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
