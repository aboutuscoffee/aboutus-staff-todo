import { useRef, useState } from 'react';

const SWIPE_OPEN = -56;

export default function SwipeRow({ canEdit, onEdit, bgClassName = 'bg-white', children }) {
  const [offset, setOffset] = useState(0);
  const touch = useRef(null);

  const onTouchStart = (e) => {
    if (!canEdit) return;
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
    <div className="relative overflow-hidden rounded-md">
      {canEdit && (
        <div className="absolute inset-y-0 right-0 flex md:hidden" style={{ width: `${-SWIPE_OPEN}px` }}>
          <button
            type="button"
            onClick={() => { setOffset(0); onEdit(); }}
            className="w-14 flex items-center justify-center bg-stone-200 text-stone-700 text-lg"
          >✎</button>
        </div>
      )}
      <div
        className={`relative ${bgClassName} transition-transform duration-150 ease-out`}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {offset !== 0 && <div className="absolute inset-0 z-10" onClick={() => setOffset(0)} />}
        {children}
      </div>
    </div>
  );
}
