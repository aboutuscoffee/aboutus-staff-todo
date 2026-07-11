import { useRef, useState } from 'react';
import DutyBadge from './DutyBadge';
import TimeBadge from './TimeBadge';
import DateBadge from './DateBadge';
import PriorityBadge from './PriorityBadge';
import ProgressSlider from './ProgressSlider';
import StatusSelect from './StatusSelect';
import TaskEditPanel from '../personal/TaskEditPanel';
import { dlClass, today } from '../../utils';

const SWIPE_OPEN = -112;

export default function TaskItem({ task, duties, otherStaff, staffName, onOpenStaff, isOwner = true, onToggleDone, onDelete, onSave, onStatusChange, onReassign, onReleaseToPool }) {
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(task.comment || '');
  const [offset, setOffset] = useState(0);
  const touch = useRef(null);
  const dc = dlClass(task.deadline, task.done);
  const wc = !task.done && task.workdate === today ? 'due-soon' : '';

  const commitComment = () => {
    if (comment !== (task.comment || '')) onSave({ comment: comment || null });
  };

  const handleDelete = () => {
    if (window.confirm('このタスクを削除しますか？')) onDelete();
  };

  const onTouchStart = (e) => {
    if (!isOwner) return;
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, startOffset: offset, locked: null };
  };
  const onTouchMove = (e) => {
    if (!touch.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (touch.current.locked === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      touch.current.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (touch.current.locked !== 'x') return;
    setOffset(Math.max(SWIPE_OPEN, Math.min(0, touch.current.startOffset + dx)));
  };
  const onTouchEnd = () => {
    if (!touch.current) return;
    if (touch.current.locked === 'x') {
      setOffset((o) => (o < SWIPE_OPEN / 2 ? SWIPE_OPEN : 0));
    }
    touch.current = null;
  };

  return (
    <div
      className={`rounded-md border mb-[6px] ${
        dc === 'overdue' ? 'border-stone-100 border-l-2 border-l-[#E24B4A] rounded-l-none' :
        dc === 'due-soon' ? 'border-stone-100 border-l-2 border-l-[#EF9F27] rounded-l-none' : 'border-stone-100'
      } ${task.done ? 'opacity-45' : ''}`}
    >
      <div className="relative overflow-hidden rounded-md">
        {isOwner && (
          <div className="absolute inset-y-0 right-0 flex md:hidden" style={{ width: `${-SWIPE_OPEN}px` }}>
            <button
              type="button"
              onClick={() => { setEditing(true); setOffset(0); }}
              className="w-14 flex items-center justify-center bg-stone-200 text-stone-700 text-lg"
            >✎</button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-14 flex items-center justify-center bg-[#E24B4A] text-white text-lg"
            >✕</button>
          </div>
        )}
        <div
          className="relative bg-white px-[12px] py-[10px] transition-transform duration-150 ease-out"
          style={{ transform: `translateX(${offset}px)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {!isOwner && <div className="absolute inset-0 z-10 cursor-default" />}
          {offset !== 0 && <div className="absolute inset-0 z-10" onClick={() => setOffset(0)} />}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={task.done}
              onChange={onToggleDone}
              className="w-[16px] h-[16px] mt-[3px] cursor-pointer accent-[#1D9E75] flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className={`text-[16px] leading-snug break-words ${task.done ? 'line-through text-stone-500' : ''}`}>{task.text}</span>
              {isOwner ? (
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onBlur={commitComment}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.currentTarget.blur(); }}
                  placeholder="コメントを追加..."
                  className="block w-full mt-0.5 bg-transparent text-[12px] outline-none placeholder:text-stone-300"
                  style={{ color: '#78909c' }}
                />
              ) : task.comment ? (
                <span className="block w-full mt-0.5 text-[12px]" style={{ color: '#78909c' }}>{task.comment}</span>
              ) : null}
            </div>
            {staffName && (
              <button
                type="button"
                onClick={onOpenStaff}
                className="relative z-20 bg-white border border-stone-300 rounded-md text-stone-900 text-xs font-medium px-2.5 py-1 hover:border-[#1D9E75] hover:text-[#1D9E75] flex-shrink-0"
              >{staffName}</button>
            )}
            <StatusSelect value={task.status} onChange={onStatusChange} disabled={task.done} />
          </div>

          <div className="flex flex-wrap items-center gap-[7px] mt-2 pl-[26px]">
            <PriorityBadge priority={task.priority} />
            <DutyBadge duty={task.duty} />
            <TimeBadge minutes={task.minutes} />
            <DateBadge date={task.workdate} prefix="作業" cls={wc} />
            <DateBadge date={task.deadline} prefix="期限" cls={dc} />
          </div>

          <div className="flex items-end gap-[7px] mt-2 pl-[26px]">
            <div className="flex-1">
              <ProgressSlider value={task.progress} onCommit={(v) => onSave({ progress: v })} />
            </div>
            {isOwner && (
              <button type="button" onClick={() => setEditing((e) => !e)} className="hidden md:inline-block text-stone-400 hover:bg-stone-100 hover:text-stone-900 px-[4px] py-[2px] rounded text-sm flex-shrink-0">✎</button>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <TaskEditPanel
          task={task}
          duties={duties}
          otherStaff={otherStaff}
          onSave={(updates) => { onSave(updates); setEditing(false); }}
          onDelete={() => { onDelete(); setEditing(false); }}
          onReassign={(newKey) => { onReassign(newKey); setEditing(false); }}
          onReleaseToPool={() => { onReleaseToPool(); setEditing(false); }}
        />
      )}
    </div>
  );
}
