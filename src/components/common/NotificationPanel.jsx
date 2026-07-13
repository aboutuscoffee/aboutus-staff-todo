import { useRef, useState } from 'react';

const TYPE_ICON = {
  pool_posted: '🎯',
  pool_claimed: '✅',
  pool_available: '📥',
  status_review: '🔎',
  review_owner: '📝',
  task_done: '✔️',
  store_comment: '🏪',
  eval_comment: '🗒️',
  memo_sent: '📤',
  goal_deleted: '🗑️',
  task_offered: '📨',
  task_offer_handoff: '🔁',
  task_offer_done: '✅',
};

const SWIPE_OPEN = -56;

function fmtTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function MemoRow({ n, onDelete }) {
  return (
    <div className="px-4 py-2.5 border-b border-stone-50 flex gap-2 items-start">
      <span className="text-sm flex-shrink-0">💬</span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-stone-700 break-words">{n.message}</p>
        <p className="text-[10px] text-stone-400 mt-0.5">{fmtTime(n.created_at)}</p>
      </div>
      <button type="button" onClick={onDelete} className="text-stone-300 hover:text-[#E24B4A] px-1 text-xs flex-shrink-0">✕</button>
    </div>
  );
}

function NotificationRow({ n, onDelete }) {
  const [offset, setOffset] = useState(0);
  const touch = useRef(null);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, startOffset: offset, locked: null };
  };
  const onTouchMove = (e) => {
    if (!touch.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (touch.current.locked === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      touch.current.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (touch.current.locked !== 'x') return;
    setOffset(Math.max(SWIPE_OPEN, Math.min(0, touch.current.startOffset + dx)));
  };
  const onTouchEnd = () => {
    if (!touch.current) return;
    if (touch.current.locked === 'x') {
      setOffset((o) => (o < SWIPE_OPEN / 2 ? SWIPE_OPEN : 0));
    }
    touch.current = null;
  };

  return (
    <div className="relative overflow-hidden border-b border-stone-50">
      <div className="absolute inset-y-0 right-0 flex md:hidden" style={{ width: `${-SWIPE_OPEN}px` }}>
        <button type="button" onClick={onDelete} className="w-14 flex items-center justify-center bg-[#E24B4A] text-white text-lg">✕</button>
      </div>
      <div
        className="relative bg-white px-4 py-2.5 flex gap-2 items-start transition-transform duration-150 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {offset !== 0 && <div className="absolute inset-0 z-10" onClick={() => setOffset(0)} />}
        <span className="text-sm flex-shrink-0">{TYPE_ICON[n.type] || '🔔'}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-stone-700 break-words">{n.message}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">{fmtTime(n.created_at)}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="hidden md:inline-flex text-stone-300 hover:text-[#E24B4A] px-1 flex-shrink-0"
        >✕</button>
      </div>
    </div>
  );
}

export default function NotificationPanel({ open, onClose, notifications, onDeleteNotification, onClearNotifications, onOpenMemoCompose }) {
  if (!open) return null;

  const memos = notifications.filter((n) => n.type === 'memo');
  const alerts = notifications.filter((n) => n.type !== 'memo');

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="fixed inset-0 bg-black/20" />
      <div
        className="fixed right-0 top-0 bottom-0 w-[320px] max-w-[90vw] bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pb-3 pt-11 sm:pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-stone-100 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold">通知</span>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-900 text-lg leading-none px-1">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 bg-stone-50 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] font-medium text-stone-500">💬 メモ</span>
            <button type="button" onClick={onOpenMemoCompose} className="text-stone-500 hover:text-stone-900 text-base font-semibold leading-none px-1" aria-label="メモを送る">＋</button>
          </div>
          {memos.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-4">メモはありません</p>
          ) : memos.map((n) => <MemoRow key={n.id} n={n} onDelete={() => onDeleteNotification(n.id)} />)}

          <div className="px-4 py-2 bg-stone-50 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] font-medium text-stone-500">🔔 通知</span>
            {alerts.length > 0 && (
              <button type="button" onClick={onClearNotifications} className="text-[10px] text-stone-400 hover:text-[#E24B4A]">すべて削除</button>
            )}
          </div>
          {alerts.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-4">通知はありません</p>
          ) : alerts.map((n) => <NotificationRow key={n.id} n={n} onDelete={() => onDeleteNotification(n.id)} />)}
        </div>
      </div>
    </div>
  );
}
