// Supabase AuthのセッションはFreeプランのためInactivity timeoutを設定できない。
// その代わりに、アプリ側で「最後の操作から72時間」を独自に計測し、
// 超過していたらsupabase.auth.signOut()する運用上のタイムアウトを実装する。
// あくまでUX上の制御であり、Supabase Auth自体のセッション期限を変更するものではない。
const STORAGE_KEY = 'aboutus_staff_todo_last_activity_at';
export const INACTIVITY_TIMEOUT_MS = 72 * 60 * 60 * 1000; // 259200000
export const CHECK_INTERVAL_MS = 60 * 1000;
const WRITE_THROTTLE_MS = 60 * 1000;

export function getLastActivityAt() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setLastActivityAt(ts = Date.now()) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ts));
  } catch {
    // noop
  }
}

export function clearLastActivityAt() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

export function isInactivityExpired(lastActivityAt) {
  return lastActivityAt != null && Date.now() - lastActivityAt >= INACTIVITY_TIMEOUT_MS;
}

export { STORAGE_KEY as ACTIVITY_STORAGE_KEY, WRITE_THROTTLE_MS };
