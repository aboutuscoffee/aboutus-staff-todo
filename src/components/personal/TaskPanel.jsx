import { useState } from 'react';
import TaskItem from '../common/TaskItem';
import SortChips from '../common/SortChips';
import { sortTasks } from '../../lib/selectors';
import { recurrenceLabel } from '../../lib/recurrence';

export default function TaskPanel({ tasks, duties, otherStaff, isOwner, canConvertToRequest, onConvertToRequest, onToggleDone, onDelete, onSave, onStatusChange, onReassign, onReleaseToPool, recurringTasks, onStopRecurringTask }) {
  const [sortBy, setSortBy] = useState('deadline');
  const sortedTasks = sortTasks(tasks, sortBy);

  return (
    <div>
      {isOwner && recurringTasks?.length > 0 && (
        <div className="mb-3 p-2.5 rounded-md bg-[#F5F3EE]">
          <div className="text-[11px] text-stone-400 mb-1.5">定期タスク</div>
          {recurringTasks.map((rt) => (
            <div key={rt.id} className="flex items-center justify-between gap-1.5 text-xs mb-1 last:mb-0">
              <span className="min-w-0 truncate">{rt.text}（{recurrenceLabel(rt)}）</span>
              <button type="button" onClick={() => onStopRecurringTask(rt.id)} className="text-stone-400 hover:text-[#A32D2D] flex-shrink-0">停止</button>
            </div>
          ))}
        </div>
      )}
      <div className="text-[11px] text-stone-400 mb-2">完了タスクは完了日から4ヶ月後に自動削除されます</div>
      <SortChips value={sortBy} onChange={setSortBy} />
      <div>
        {sortedTasks.length === 0 && <p className="text-xs text-stone-500 py-1.5">タスクがありません</p>}
        {sortedTasks.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            duties={duties}
            otherStaff={otherStaff}
            isOwner={isOwner}
            canConvertToRequest={canConvertToRequest}
            onConvertToRequest={onConvertToRequest ? () => onConvertToRequest(t) : undefined}
            onToggleDone={() => onToggleDone(t.id)}
            onDelete={() => onDelete(t.id)}
            onSave={(updates) => onSave(t.id, updates)}
            onStatusChange={(status) => onStatusChange(t.id, status)}
            onReassign={(newKey) => onReassign(t.id, newKey)}
            onReleaseToPool={() => onReleaseToPool(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
