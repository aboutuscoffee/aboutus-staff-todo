import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  ACTIVITY_STORAGE_KEY, CHECK_INTERVAL_MS, WRITE_THROTTLE_MS,
  getLastActivityAt, setLastActivityAt, clearLastActivityAt, isInactivityExpired,
} from '../lib/activityTimeout';

const SessionContext = createContext(null);
const ACTIVITY_EVENTS = ['click', 'pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'];

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
  // 業務データ側は引き続きstaff.keyで紐付いているため、ここでstaff.keyに変換してから渡す。
  // is_active=falseのスタッフ（退職・無効化済み）はここで弾き、ログイン中扱いにしない
  const loggedInStaff = session?.user ? staff.find((s) => s.auth_user_id === session.user.id) : null;
  const loggedInUserKey = loggedInStaff && loggedInStaff.is_active ? loggedInStaff.key : null;

  // 既にログイン中のブラウザで、staffデータの再取得によって本人がis_active=falseだと
  // 判明した場合（他の管理者が退職処理をした場合等）、Supabase Authのセッション自体を破棄する
  useEffect(() => {
    if (loggedInStaff && !loggedInStaff.is_active) {
      clearLastActivityAt();
      supabase.auth.signOut();
    }
  }, [loggedInStaff]);

  // Freeプランのため Supabase Auth 側の Inactivity timeout は設定できない。
  // その代替として、最後の操作から72時間経過していたらアプリ側でsignOutする。
  // Supabase Auth自体のセッション/JWT/Refresh Token機構には一切手を加えない
  const lastWriteRef = useRef(0);
  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastWriteRef.current >= WRITE_THROTTLE_MS) {
      lastWriteRef.current = now;
      setLastActivityAt(now);
    }
  }, []);

  const hasSession = !!session;
  useEffect(() => {
    if (!hasSession) return undefined;

    // 戻り値はtrue=期限切れでsignOutした, false=期限内（未設定からの初期化を含む）
    const checkInactivity = () => {
      const last = getLastActivityAt();
      if (last == null) {
        // このタイムアウト機能の導入前からログイン中だったユーザーを、
        // いきなりログアウトさせないよう、復元できたセッションを起点に初期化する
        setLastActivityAt();
        return false;
      }
      if (isInactivityExpired(last)) {
        clearLastActivityAt();
        supabase.auth.signOut();
        return true;
      }
      return false;
    };
    checkInactivity();

    const onActivity = () => recordActivity();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));

    // 復帰時は必ず「先に判定→期限内の場合のみ更新」の順で行う。
    // 先にrecordActivity()してしまうと、判定対象のlastActivityAt自体が
    // 「今」に書き換わってしまい、期限切れが検知できなくなる
    const onVisibleOrFocus = () => {
      if (document.visibilityState === 'visible') {
        const expired = checkInactivity();
        if (!expired) recordActivity();
      }
    };
    document.addEventListener('visibilitychange', onVisibleOrFocus);
    window.addEventListener('focus', onVisibleOrFocus);

    const onStorage = (e) => {
      if (e.key === ACTIVITY_STORAGE_KEY) checkInactivity();
    };
    window.addEventListener('storage', onStorage);

    const interval = setInterval(checkInactivity, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibleOrFocus);
      window.removeEventListener('focus', onVisibleOrFocus);
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, [hasSession, recordActivity]);

  const openLoginModal = useCallback(({ subText = '', onSuccess = null, cancelable = true } = {}) => {
    setModal({ open: true, subText, cancelable, onSuccess });
  }, []);

  const closeLoginModal = useCallback(() => {
    setModal((m) => (m.cancelable ? { ...m, open: false } : m));
  }, []);

  const login = useCallback(async (key, password) => {
    const user = staff.find((s) => s.key === key);
    if (!user || !user.email || !user.is_active) return { ok: false };
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
    if (error) return { ok: false };
    setLastActivityAt();
    setModal((m) => ({ ...m, open: false }));
    if (modal.onSuccess) modal.onSuccess(key);
    return { ok: true };
  }, [staff, modal]);

  const logout = useCallback(() => {
    clearLastActivityAt();
    return supabase.auth.signOut();
  }, []);

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
