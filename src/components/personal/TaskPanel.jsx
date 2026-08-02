import { useState } from 'react';
import TaskItem from '../common/TaskItem';
import SortChips from '../common/SortChips';
import { sortTasks } from '../../lib/selectors';

export default function TaskPanel({ tasks, duties, isOwner, onConvertToRequest, onToggleDone, onDelete, onSave, onStatusChange, onReleaseToPool }) {
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
            isOwner={isOwner}
            onConvertToRequest={() => onConvertToRequest(t)}
            onToggleDone={() => onToggleDone(t.id)}
            onDelete={() => onDelete(t.id)}
            onSave={(updates) => onSave(t.id, updates)}
            onStatusChange={(status) => onStatusChange(t.id, status)}
            onReleaseToPool={() => onReleaseToPool(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
