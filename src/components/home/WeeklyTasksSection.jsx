import { useState } from 'react';
import WeeklyTaskEditModal from './WeeklyTaskEditModal';

export default function WeeklyTasksSection({ storeKey, label, weekday, tasks, canEdit, onAddWeeklyTask, onDeleteWeeklyTask }) {
  const [editOpen, setEditOpen] = useState(false);
  const items = tasks
    .filter((t) => t.store_key === storeKey && t.weekday === weekday)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-stone-400">{label}の週間タスク</span>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="text-stone-400 hover:bg-stone-100 hover:text-stone-900 px-[4px] py-[2px] rounded text-sm"
          >✎</button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-stone-400">本日の週間タスクはありません</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((t) => (
            <div key={t.id} className="text-[13px]">・{t.text}</div>
          ))}
        </div>
      )}
      {editOpen && (
        <WeeklyTaskEditModal
          storeKey={storeKey}
          label={label}
          tasks={tasks}
          onAdd={(weekday, text) => onAddWeeklyTask(storeKey, weekday, text)}
          onDelete={onDeleteWeeklyTask}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
