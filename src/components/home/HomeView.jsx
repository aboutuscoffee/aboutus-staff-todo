import { useEffect, useRef, useState } from 'react';
import { STORE_INFO, STORE_KEYS } from '../../constants';
import { homeTasksForDate, homeTasksForRoleView, pendingReviewDueToday } from '../../lib/selectors';
import { findRole } from '../../lib/permissions';
import { isoDate } from '../../utils';
import { useSession } from '../../context/SessionContext';
import WeeklyTasksSection from './WeeklyTasksSection';

const dateLabel = (d) => d.slice(5).replace('-', '/');
const weekdayLabel = (d) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { weekday: 'short' });
};

const SWIPE_THRESHOLD = 50;

function DayPage({ day, items }) {
  return (
    <div className="w-full flex-shrink-0 px-4">
      <div className="mb-3">
        <div className="text-[22px] font-bold leading-tight">{day.title}</div>
        <div className="text-[12px] text-stone-400 mt-0.5">{dateLabel(day.date)} {weekdayLabel(day.date)}</div>
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

export default function HomeView({ staff, roles, tasks, onSetTodayStore, storeWeeklyTasks, onAddWeeklyTask, onDeleteWeeklyTask }) {
  const { loggedInUserKey } = useSession();
  const me = staff.find((s) => s.key === loggedInUserKey);
  const meRole = findRole(roles, me?.role);
  const isRoleView = !!(meRole?.is_owner || meRole?.key === 'GM');
  const myStores = me?.stores || [];

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  const todayStr = isoDate(now);
  const tomorrowStr = isoDate(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const todayWeekday = (now.getDay() + 6) % 7;
  const DAYS = [
    { date: todayStr, title: 'Today', emptyText: '本日のタスクはありません' },
    { date: tomorrowStr, title: 'Tomorrow', emptyText: '明日のタスクはありません' },
  ];

  const canChooseStore = !isRoleView && myStores.length > 1;
  const confirmedTodayStore = me?.today_store_date === todayStr ? me.today_store : null;
  const [pendingStore, setPendingStore] = useState(null);
  useEffect(() => { setPendingStore(null); }, [todayStr]);
  const selectedStore = pendingStore ?? (myStores.length === 1 ? myStores[0] : confirmedTodayStore);
  const needsChoice = canChooseStore && !selectedStore;

  const [pickerOpen, setPickerOpen] = useState(needsChoice);
  useEffect(() => {
    if (needsChoice) setPickerOpen(true);
  }, [needsChoice]);

  const [dayIndex, setDayIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const touch = useRef(null);

  const chooseStore = (sk) => {
    setPendingStore(sk);
    onSetTodayStore(loggedInUserKey, sk);
    setPickerOpen(false);
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

  if (!me) return null;

  if (!isRoleView && myStores.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-white p-4">
        <div className="text-[22px] font-bold leading-tight">Today</div>
        <div className="text-[12px] text-stone-400 mt-0.5 mb-3">{dateLabel(todayStr)} {weekdayLabel(todayStr)}</div>
        <p className="text-xs text-stone-400">所属店舗が設定されていません</p>
      </div>
    );
  }

  const canShowDays = isRoleView || !!selectedStore;
  const getItems = (dateStr) => (isRoleView
    ? homeTasksForRoleView(tasks, staff, roles, loggedInUserKey, dateStr)
    : homeTasksForDate(tasks, staff, roles, loggedInUserKey, selectedStore, dateStr));
  const reviewToday = meRole?.is_owner ? pendingReviewDueToday(tasks, staff, roles, loggedInUserKey, todayStr) : [];

  return (
    <div className={`relative rounded-2xl border border-stone-100 bg-white p-4 ${canChooseStore ? 'pt-11' : ''}`}>
      {canChooseStore && (
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          className="absolute top-3 right-3 px-2 py-1 rounded-md border border-stone-300 bg-white text-[11px] text-stone-600 hover:border-[#1D9E75] hover:text-[#1D9E75]"
        >🏪 出勤店舗を変更</button>
      )}

      {canChooseStore && pickerOpen && (
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

      {canShowDays && (
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
                <DayPage key={day.date} day={day} items={getItems(day.date)} />
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

      {!isRoleView && selectedStore && (
        <>
          <div className="h-px bg-stone-100 my-3" />
          <WeeklyTasksSection
            storeKey={selectedStore}
            label={STORE_INFO[selectedStore].label}
            weekday={todayWeekday}
            tasks={storeWeeklyTasks}
            canEdit={meRole?.key === 'SM'}
            onAddWeeklyTask={onAddWeeklyTask}
            onDeleteWeeklyTask={onDeleteWeeklyTask}
          />
        </>
      )}

      {isRoleView && meRole?.key === 'GM' && (
        <>
          <div className="h-px bg-stone-100 my-3" />
          {STORE_KEYS.map((sk, i) => (
            <div key={sk}>
              {i > 0 && <div className="h-px bg-stone-100 my-3" />}
              <WeeklyTasksSection
                storeKey={sk}
                label={STORE_INFO[sk].label}
                weekday={todayWeekday}
                tasks={storeWeeklyTasks}
                canEdit
                onAddWeeklyTask={onAddWeeklyTask}
                onDeleteWeeklyTask={onDeleteWeeklyTask}
              />
            </div>
          ))}
        </>
      )}

      {meRole?.is_owner && (
        <>
          <div className="h-px bg-stone-100 my-3" />
          <div className="text-[11px] text-stone-400 mb-1.5">確認待ち（期限：今日）</div>
          {reviewToday.length === 0 ? (
            <p className="text-xs text-stone-400">該当するタスクはありません</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {reviewToday.map((item) => (
                <div key={item.id} className="flex justify-between items-baseline gap-2 text-[13px]">
                  <span className="min-w-0 truncate">・{item.text}</span>
                  <span className="text-stone-500 flex-shrink-0">{item.staffName}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
