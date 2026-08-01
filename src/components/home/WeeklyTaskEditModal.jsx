import { useState } from 'react';

const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];

function DaySection({ weekday, tasks, onAdd, onDelete }) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(weekday, trimmed);
    setText('');
  };

  return (
    <div className="mb-3">
      <div className="text-[12px] font-semibold text-stone-500 mb-1">{WEEKDAY_LABELS[weekday]}曜日</div>
      {tasks.map((t) => (
        <div key={t.id} className="flex items-center gap-1.5 mb-1">
          <span className="flex-1 text-[13px] bg-stone-50 rounded px-2 py-1">{t.text}</span>
          <button type="button" onClick={() => onDelete(t.id)} className="text-stone-400 hover:text-[#A32D2D] px-1 text-xs flex-shrink-0">✕</button>
        </div>
      ))}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submit()}
          placeholder="タスクを追加..."
          className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-[13px]"
        />
        <button type="button" onClick={submit} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">＋</button>
      </div>
    </div>
  );
}

export default function WeeklyTaskEditModal({ storeKey, label, tasks, onAdd, onDelete, onClose }) {
  const tasksFor = (weekday) => tasks
    .filter((t) => t.store_key === storeKey && t.weekday === weekday)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[340px] max-h-[80vh] overflow-y-auto bg-white rounded-2xl px-5 py-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-semibold">{label}の週間タスク編集</span>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-900 text-lg leading-none">✕</button>
        </div>
        {WEEKDAY_LABELS.map((_, weekday) => (
          <DaySection key={weekday} weekday={weekday} tasks={tasksFor(weekday)} onAdd={onAdd} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
