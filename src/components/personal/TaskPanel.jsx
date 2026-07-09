import { useState } from 'react';
import TaskItem from '../common/TaskItem';
import SortChips from '../common/SortChips';
import { sortTasks } from '../../lib/selectors';

export default function TaskPanel({ tasks, duties, otherStaff, isOwner, onToggleDone, onDelete, onSave, onStatusChange, onReassign, onReleaseToPool }) {
  const [sortBy, setSortBy] = useState('deadline');
  const sortedTasks = sortTasks(tasks, sortBy);

  return (
    <div>
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
