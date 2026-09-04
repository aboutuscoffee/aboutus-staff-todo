import { useState } from 'react';
import TaskItem from '../common/TaskItem';
import { ownerTaskFeed } from '../../lib/selectors';
import { today } from '../../utils';

const FILTERS = [
  { v: 'all', l: 'すべて' },
  { v: 'review', l: '確認待ち' },
  { v: 'delegated', l: '依頼タスク' },
  { v: 'own', l: '自分のタスク' },
];

export default function OwnerTaskFeed({
  staff, tasks, ownerKey,
  onGoPersonalEval,
  onToggleTaskDone, onDeleteTask, onSaveTaskEdit, onTaskStatusChange, onReleaseTaskToPool, onConvertToRequest, onStopRecurringTask,
}) {
  const [filter, setFilter] = useState('all');
  const feed = ownerTaskFeed(tasks, ownerKey, today);
  const listByFilter = { all: feed.merged, review: feed.reviewTasks, delegated: feed.delegatedTasks, own: feed.ownTasks };
  const shown = listByFilter[filter];

  const tile = (label, count, targetFilter) => (
    <button
      type="button"
      onClick={() => setFilter(targetFilter)}
      className={`flex-1 min-w-[92px] text-left px-3 py-2 rounded-md border ${filter === targetFilter ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-900'}`}
    >
      <div className="text-[11px] opacity-70">{label}</div>
      <div className="text-lg font-bold leading-tight">{count}</div>
    </button>
  );

  return (
    <div>
      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        {tile('今日のタスク', feed.todayCount, 'all')}
        {tile('期限超過の依頼', feed.overdueDelegatedCount, 'delegated')}
        {tile('確認待ち', feed.reviewCount, 'review')}
      </div>

      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.v}
            type="button"
            onClick={() => setFilter(f.v)}
            className={`text-xs px-[10px] py-1 rounded-full border ${filter === f.v ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}
          >{f.l}</button>
        ))}
      </div>

      {shown.length === 0 && <p className="text-xs text-stone-500 py-1.5">該当するタスクはありません</p>}
      {shown.map((t) => {
        const s = staff.find((x) => x.key === t.staff_key);
        return (
          <TaskItem
            key={t.id}
            task={t}
            duties={s?.duties || []}
            staffName={t.staff_key === ownerKey ? null : s?.name}
            onOpenStaff={() => onGoPersonalEval(t.staff_key)}
            isOwner
            onToggleDone={() => onToggleTaskDone(t.staff_key, t.id)}
            onDelete={() => onDeleteTask(t.id)}
            onSave={(updates) => onSaveTaskEdit(t.id, updates)}
            onStatusChange={(status) => onTaskStatusChange(t.id, status)}
            onConvertToRequest={() => onConvertToRequest(t)}
            onStopRecurrence={() => onStopRecurringTask(t.recurring_task_id)}
            onReleaseToPool={() => onReleaseTaskToPool(t.id)}
          />
        );
      })}
    </div>
  );
}
