import { useRef, useState } from 'react';
import { STORE_INFO } from '../../constants';
import { homeTasksForDate } from '../../lib/selectors';
import { today, tomorrow } from '../../utils';
import { useSession } from '../../context/SessionContext';

const dateLabel = (d) => d.slice(5).replace('-', '/');

const DAYS = [
  { date: today, title: 'Today', emptyText: '本日のタスクはありません' },
  { date: tomorrow, title: 'Tomorrow', emptyText: '明日のタスクはありません' },
];

const SWIPE_THRESHOLD = 50;

function DayPage({ day, items }) {
  return (
    <div className="w-full flex-shrink-0 px-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[15px] font-semibold">{day.title}</span>
        <span className="text-[12px] text-stone-400">{dateLabel(day.date)}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-stone-400">{day.emptyText}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-baseline gap-2 text-[13px]">
              <span className="min-w-0 truncate">・{item.text}</span>
              <span className="text-stone-500 flex-shrink-0">{item.staffName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomeView({ staff, roles, tasks, onSetTodayStore }) {
  const { loggedInUserKey } = useSession();
  const me = staff.find((s) => s.key === loggedInUserKey);
  const myStores = me?.stores || [];
  const confirmedTodayStore = me?.today_store_date === today ? me.today_store : null;
  const [selectedStore, setSelectedStore] = useState(myStores.length === 1 ? myStores[0] : confirmedTodayStore);
  const [dayIndex, setDayIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const touch = useRef(null);

  const needsChoice = myStores.length > 1;

  const chooseStore = (sk) => {
    setSelectedStore(sk);
    onSetTodayStore(loggedInUserKey, sk);
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX };
  };
  const onTouchMove = (e) => {
    if (!touch.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touch.current.x;
    if ((dayIndex === 0 && dx > 0) || (dayIndex === DAYS.length - 1 && dx < 0)) {
      setDragOffset(0);
      return;
    }
    setDragOffset(dx);
  };
  const onTouchEnd = () => {
    if (!touch.current) return;
    if (dragOffset < -SWIPE_THRESHOLD && dayIndex < DAYS.length - 1) setDayIndex((i) => i + 1);
    else if (dragOffset > SWIPE_THRESHOLD && dayIndex > 0) setDayIndex((i) => i - 1);
    setDragOffset(0);
    touch.current = null;
  };

  if (!me || myStores.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-white p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[15px] font-semibold">Today</span>
          <span className="text-[12px] text-stone-400">{dateLabel(today)}</span>
        </div>
        <p className="text-xs text-stone-400">所属店舗が設定されていません</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4">
      {needsChoice && (
        <div className="mb-3">
          <div className="text-[11px] text-stone-400 mb-1.5">本日の出勤店舗を選択してください</div>
          <div className="flex gap-1.5">
            {myStores.map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => chooseStore(sk)}
                className={`px-2.5 py-1 rounded-md border text-[12px] ${selectedStore === sk ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-600'}`}
              >{STORE_INFO[sk].label}</button>
            ))}
          </div>
        </div>
      )}

      {selectedStore && (
        <>
          <div className="overflow-hidden -mx-4">
            <div
              className={`flex ${dragOffset === 0 ? 'transition-transform duration-200 ease-out' : ''}`}
              style={{ transform: `translateX(calc(-${dayIndex * 100}% + ${dragOffset}px))` }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {DAYS.map((day) => (
                <DayPage key={day.date} day={day} items={homeTasksForDate(tasks, staff, roles, loggedInUserKey, selectedStore, day.date)} />
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {DAYS.map((day, i) => (
              <span key={day.date} className={`w-1.5 h-1.5 rounded-full ${i === dayIndex ? 'bg-stone-900' : 'bg-stone-200'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
