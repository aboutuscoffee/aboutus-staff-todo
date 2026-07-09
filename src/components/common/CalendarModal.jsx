import { useState } from 'react';
import { STORE_KEYS, STORE_INFO } from '../../constants';
import { useSession } from '../../context/SessionContext';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CalendarModal({ open, onClose, staff, tasks, onOpenPersonal }) {
  const { loggedInUserKey } = useSession();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [dateField, setDateField] = useState('workdate'); // 'workdate' | 'deadline'
  const [scope, setScope] = useState('all'); // 'all' | 'store' | 'mine'
  const [storeKey, setStoreKey] = useState(STORE_KEYS[0]);

  if (!open) return null;

  const scopedStaffKeys = (() => {
    if (scope === 'mine') return new Set([loggedInUserKey]);
    if (scope === 'store') return new Set(staff.filter((s) => s.stores.includes(storeKey)).map((s) => s.key));
    return new Set(staff.map((s) => s.key));
  })();

  const tasksByDay = {};
  tasks.forEach((t) => {
    const d = t[dateField];
    if (!d || !scopedStaffKeys.has(t.staff_key)) return;
    const [y, m] = d.split('-').map(Number);
    if (y !== year || m !== month + 1) return;
    (tasksByDay[d] ||= []).push(t);
  });

  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const staffName = (key) => staff.find((s) => s.key === key)?.name || '';
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30" />
      <div
        className="fixed inset-x-2 bottom-4 sm:inset-x-8 md:inset-x-20 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold">📅 カレンダー</span>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-900 text-lg leading-none px-1">✕</button>
        </div>

        <div className="px-4 py-2.5 border-b border-stone-100 flex flex-wrap items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={prevMonth} className="px-2 py-1 rounded-md border border-stone-300 bg-white text-xs">◀</button>
            <span className="text-sm font-medium w-20 text-center">{year}年{month + 1}月</span>
            <button type="button" onClick={nextMonth} className="px-2 py-1 rounded-md border border-stone-300 bg-white text-xs">▶</button>
          </div>

          <div className="flex gap-1.5 ml-auto">
            <button type="button" onClick={() => setDateField('workdate')} className={`text-xs px-[10px] py-1 rounded-full border ${dateField === 'workdate' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}>作業予定日</button>
            <button type="button" onClick={() => setDateField('deadline')} className={`text-xs px-[10px] py-1 rounded-full border ${dateField === 'deadline' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}>期限日</button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-stone-100 flex gap-1.5 flex-wrap items-center flex-shrink-0">
          <button type="button" onClick={() => setScope('all')} className={`text-xs px-[10px] py-1 rounded-full border ${scope === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}>全員</button>
          <button type="button" onClick={() => setScope('store')} className={`text-xs px-[10px] py-1 rounded-full border ${scope === 'store' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}>店舗</button>
          {scope === 'store' && (
            <select value={storeKey} onChange={(e) => setStoreKey(e.target.value)} className="text-xs px-[10px] py-1 rounded-full border border-stone-300 bg-white text-stone-500">
              {STORE_KEYS.map((sk) => <option key={sk} value={sk}>{STORE_INFO[sk].label}</option>)}
            </select>
          )}
          <button type="button" onClick={() => setScope('mine')} className={`text-xs px-[10px] py-1 rounded-full border ${scope === 'mine' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}>個人</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-stone-400 mb-1">
            {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} className="min-h-[70px]" />;
              const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
              const dayTasks = tasksByDay[dateStr] || [];
              const isToday = dateStr === todayStr;
              return (
                <div key={i} className={`min-h-[70px] rounded-md border p-1 ${isToday ? 'border-[#1D9E75] bg-[#EAF6F1]' : 'border-stone-100'}`}>
                  <div className={`text-[10px] mb-0.5 ${isToday ? 'text-[#1D9E75] font-semibold' : 'text-stone-400'}`}>{d}</div>
                  <div className="flex flex-col gap-0.5">
                    {dayTasks.slice(0, 3).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { onOpenPersonal(t.staff_key); onClose(); }}
                        className={`text-left text-[9px] leading-tight px-1 py-0.5 rounded truncate ${t.done ? 'bg-stone-100 text-stone-400 line-through' : 'bg-[#F5F3EE] text-stone-700'}`}
                        title={`${staffName(t.staff_key)}：${t.text}`}
                      >{scope !== 'mine' ? `${staffName(t.staff_key)}：` : ''}{t.text}</button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-stone-400">+{dayTasks.length - 3}件</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
