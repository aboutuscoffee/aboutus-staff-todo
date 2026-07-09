import { useRef, useState } from 'react';
import TrashIcon from './TrashIcon';

const TYPE_ICON = {
  pool_posted: '🎯',
  pool_claimed: '✅',
  pool_available: '📥',
  status_review: '🔎',
  review_owner: '📝',
  task_done: '✔️',
  store_comment: '🏪',
  eval_comment: '🗒️',
};

const SWIPE_OPEN = -56;

function fmtTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function MemoRow({ n }) {
  return (
    <div className="px-4 py-2.5 border-b border-stone-50 flex gap-2 items-start">
      <span className="text-sm flex-shrink-0">💬</span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-stone-700 break-words">{n.message}</p>
        <p className="text-[10px] text-stone-400 mt-0.5">{fmtTime(n.created_at)}</p>
      </div>
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
        <button type="button" onClick={onDelete} className="w-14 flex items-center justify-center bg-[#E24B4A] text-white text-lg"><TrashIcon size={18} /></button>
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
        ><TrashIcon size={14} /></button>
      </div>
    </div>
  );
}

export default function NotificationPanel({ open, onClose, notifications, otherStaff, onSendMemo, onDeleteNotification, onClearNotifications }) {
  const [composing, setComposing] = useState(false);
  const [toKey, setToKey] = useState(otherStaff[0]?.key ?? '');
  const [text, setText] = useState('');

  if (!open) return null;

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || !toKey) return;
    onSendMemo(toKey, trimmed);
    setText('');
    setComposing(false);
  };

  const memos = notifications.filter((n) => n.type === 'memo');
  const alerts = notifications.filter((n) => n.type !== 'memo');

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="fixed inset-0 bg-black/20" />
      <div
        className="fixed right-0 top-0 bottom-0 w-[320px] max-w-[90vw] bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold">通知</span>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-900 text-lg leading-none px-1">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 bg-stone-50 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] font-medium text-stone-500">💬 メモ</span>
          </div>
          <div className="px-4 py-2.5 border-b border-stone-100 flex-shrink-0">
            {!composing ? (
              <button type="button" onClick={() => setComposing(true)} className="w-full py-1.5 rounded-md border border-stone-300 bg-white text-xs font-medium">💬 メモを送る</button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <select value={toKey} onChange={(e) => setToKey(e.target.value)} className="px-1.5 py-1 rounded-md border border-stone-300 text-xs">
                  {otherStaff.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
                </select>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="メモを入力..."
                  rows={2}
                  className="w-full px-[9px] py-1.5 rounded-md border border-stone-300 text-[13px] resize-none"
                />
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => { setComposing(false); setText(''); }} className="flex-1 py-1.5 rounded-md border border-stone-300 bg-white text-xs">キャンセル</button>
                  <button type="button" onClick={send} className="flex-1 py-1.5 rounded-md bg-stone-900 text-white text-xs font-medium">送信</button>
                </div>
              </div>
            )}
          </div>
          {memos.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-4">メモはありません</p>
          ) : memos.map((n) => <MemoRow key={n.id} n={n} />)}

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
