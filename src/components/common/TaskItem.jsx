import { useState } from 'react';
import DutyBadge from './DutyBadge';
import TimeBadge from './TimeBadge';
import DateBadge from './DateBadge';
import StatusSelect from './StatusSelect';
import TaskEditPanel from '../personal/TaskEditPanel';
import { dlClass } from '../../utils';

export default function TaskItem({ task, duties, otherStaff, onToggleDone, onDelete, onSave, onStatusChange, onReassign, onReleaseToPool }) {
  const [editing, setEditing] = useState(false);
  const dc = dlClass(task.deadline, task.done);

  return (
    <div
      className={`grid grid-cols-[1fr_auto] gap-x-2 px-[11px] py-[9px] rounded-md border bg-white mb-[5px] ${
        dc === 'overdue' ? 'border-stone-100 border-l-2 border-l-[#E24B4A] rounded-l-none' :
        dc === 'due-soon' ? 'border-stone-100 border-l-2 border-l-[#EF9F27] rounded-l-none' : 'border-stone-100'
      } ${task.done ? 'opacity-45' : ''}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-[7px]">
          <input
            type="checkbox"
            checked={task.done}
            onChange={onToggleDone}
            className="w-[15px] h-[15px] cursor-pointer accent-[#1D9E75] flex-shrink-0"
          />
          <span className={`text-[13px] break-words flex-1 min-w-0 ${task.done ? 'line-through text-stone-500' : ''}`}>{task.text}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-[5px] pl-[22px]">
          <DutyBadge duty={task.duty} />
          <TimeBadge minutes={task.minutes} />
          <DateBadge date={task.workdate} prefix="作業" />
          <DateBadge date={task.deadline} prefix="期限" cls={dc} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex gap-0.5">
          <button type="button" onClick={() => setEditing((e) => !e)} className="text-stone-400 hover:bg-stone-100 hover:text-stone-900 px-[3px] py-[1px] rounded text-xs">✏️</button>
          <button type="button" onClick={onDelete} className="text-stone-400 hover:bg-[#FCEBEB] hover:text-[#A32D2D] px-[3px] py-[1px] rounded text-xs">✕</button>
        </div>
        <StatusSelect value={task.status} onChange={onStatusChange} disabled={task.done} />
      </div>

      {editing && (
        <TaskEditPanel
          task={task}
          duties={duties}
          otherStaff={otherStaff}
          onSave={(updates) => { onSave(updates); setEditing(false); }}
          onReassign={(newKey) => { onReassign(newKey); setEditing(false); }}
          onReleaseToPool={() => { onReleaseToPool(); setEditing(false); }}
        />
      )}
    </div>
  );
}
