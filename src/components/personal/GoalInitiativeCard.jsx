import { useState } from 'react';
import { editedLabel } from '../../utils';

export default function GoalInitiativeCard({ initiative, editing, onToggleMilestone, onAddMilestone, onRenameMilestone, onDeleteMilestone, onRename, onDelete }) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddMilestone(trimmed);
    setText('');
  };

  const commitText = (value) => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== initiative.text) onRename(trimmed);
  };

  const handleDelete = () => {
    if (window.confirm('この取り組みを削除すると、中のマイルストーンもすべて削除されます。よろしいですか？')) onDelete();
  };

  const commitMilestoneText = (m, value) => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== m.text) onRenameMilestone(m.id, trimmed);
  };

  const handleDeleteMilestone = (m) => {
    if (window.confirm('このマイルストーンを削除しますか？')) onDeleteMilestone(m.id);
  };

  return (
    <div className="rounded-md bg-[#F5F3EE] p-[10px_12px] mb-1.5">
      {editing ? (
        <div className="flex items-center gap-1.5 mb-1.5">
          <input
            type="text"
            defaultValue={initiative.text}
            onBlur={(e) => commitText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.currentTarget.blur(); }}
            className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-xs bg-white"
          />
          <button type="button" onClick={handleDelete} className="text-stone-400 hover:text-[#A32D2D] px-1 text-xs flex-shrink-0">✕</button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <span className="text-xs font-medium">{initiative.text}</span>
          {initiative.edited_at && <span className="text-[9px] text-stone-400">{editedLabel(initiative.edited_at)}</span>}
        </div>
      )}
      {initiative.milestones.map((m) => (
        editing ? (
          <div key={`${m.id}-edit`} className="flex items-center gap-1.5 mb-1">
            <input
              type="text"
              defaultValue={m.text}
              onBlur={(e) => commitMilestoneText(m, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.currentTarget.blur(); }}
              className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-xs bg-white"
            />
            <button type="button" onClick={() => handleDeleteMilestone(m)} className="text-stone-400 hover:text-[#A32D2D] px-1 text-xs flex-shrink-0">✕</button>
          </div>
        ) : (
          <div key={`${m.id}-view`} className="flex items-center gap-[7px] text-xs text-stone-500 mb-1">
            <input type="checkbox" checked={m.done} onChange={() => onToggleMilestone(m.id)} className="w-[13px] h-[13px] cursor-pointer accent-[#1D9E75] flex-shrink-0" />
            <span className={m.done ? 'line-through text-stone-400' : ''}>{m.text}</span>
          </div>
        )
      ))}
      <div className="flex gap-1.5 mt-1.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submit()}
          placeholder="マイルストーンを追加..."
          className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-xs bg-white"
        />
        <button type="button" onClick={submit} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">＋</button>
      </div>
    </div>
  );
}
