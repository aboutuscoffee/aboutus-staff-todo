import { useState } from 'react';
import TaskItem from '../common/TaskItem';
import SortChips from '../common/SortChips';
import { pendingReviewTasks } from '../../lib/selectors';

export default function ConfirmationQueue({
  staff, tasks,
  onGoPersonalEval,
  onToggleTaskDone, onDeleteTask, onSaveTaskEdit, onTaskStatusChange, onReassignTask, onReleaseTaskToPool,
}) {
  const [sortBy, setSortBy] = useState('deadline');
  const pending = pendingReviewTasks(tasks, sortBy);

  return (
    <div>
      <SortChips value={sortBy} onChange={setSortBy} options={['priority', 'deadline']} />
      <div>
        {pending.length === 0 && <p className="text-xs text-stone-500 py-1.5">確認待ちのタスクはありません</p>}
        {pending.map((t) => {
          const s = staff.find((x) => x.key === t.staff_key);
          if (!s) return null;
          return (
            <TaskItem
              key={t.id}
              task={t}
              duties={s.duties || []}
              otherStaff={staff.filter((x) => x.key !== s.key)}
              staffName={s.name}
              onOpenStaff={() => onGoPersonalEval(s.key)}
              isOwner
              onToggleDone={() => onToggleTaskDone(s.key, t.id)}
              onDelete={() => onDeleteTask(t.id)}
              onSave={(updates) => onSaveTaskEdit(t.id, updates)}
              onStatusChange={(status) => onTaskStatusChange(t.id, status)}
              onReassign={(newKey) => onReassignTask(t.id, newKey)}
              onReleaseToPool={() => onReleaseTaskToPool(t.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
