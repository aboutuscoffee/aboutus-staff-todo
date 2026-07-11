import { useState } from 'react';
import SwipeRow from '../common/SwipeRow';
import { editedLabel } from '../../utils';

function MilestoneRow({ milestone, isOwner, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(milestone.text);

  const saveRename = () => {
    const trimmed = draft.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('このマイルストーンを削除しますか？')) onDelete();
  };

  return (
    <div className="mb-1">
      <SwipeRow canEdit={isOwner} bgClassName="bg-[#F5F3EE]" onEdit={() => { setDraft(milestone.text); setEditing(true); }}>
        {editing ? (
          <div className="flex gap-1.5">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && saveRename()}
              className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-xs"
              autoFocus
            />
            <button type="button" onClick={saveRename} className="px-2 py-1 rounded-md bg-stone-900 text-white text-xs">保存</button>
            <button type="button" onClick={() => setEditing(false)} className="px-2 py-1 rounded-md border border-stone-300 bg-white text-xs">キャンセル</button>
            <button type="button" onClick={handleDelete} className="px-2 py-1 rounded-md border border-stone-300 bg-white text-xs text-[#A32D2D]">削除</button>
          </div>
        ) : (
          <div className="flex items-center gap-[7px] text-xs text-stone-500">
            <input type="checkbox" checked={milestone.done} onChange={onToggle} className="w-[13px] h-[13px] cursor-pointer accent-[#1D9E75] flex-shrink-0" />
            <span className={`flex-1 ${milestone.done ? 'line-through text-stone-400' : ''}`}>{milestone.text}</span>
            {isOwner && (
              <button type="button" onClick={() => { setDraft(milestone.text); setEditing(true); }} className="hidden md:inline-block text-stone-400 hover:bg-stone-200 hover:text-stone-900 px-[3px] py-[1px] rounded text-xs flex-shrink-0">✏️</button>
            )}
          </div>
        )}
      </SwipeRow>
    </div>
  );
}

export default function GoalInitiativeCard({ initiative, isOwner, onToggleMilestone, onAddMilestone, onRenameMilestone, onDeleteMilestone, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initiative.text);
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddMilestone(trimmed);
    setText('');
  };

  const saveRename = () => {
    const trimmed = draft.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('この取り組みを削除すると、中のマイルストーンもすべて削除されます。よろしいですか？')) onDelete();
  };

  return (
    <div className="mb-1.5">
      <SwipeRow canEdit={isOwner} bgClassName="bg-[#F5F3EE]" onEdit={() => { setDraft(initiative.text); setEditing(true); }}>
      <div className="p-[10px_12px]">
        {editing ? (
          <div className="flex gap-1.5">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && saveRename()}
              className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-xs"
              autoFocus
            />
            <button type="button" onClick={saveRename} className="px-2.5 py-1 rounded-md bg-stone-900 text-white text-xs">保存</button>
            <button type="button" onClick={() => setEditing(false)} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">キャンセル</button>
            <button type="button" onClick={handleDelete} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs text-[#A32D2D]">削除</button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="text-xs font-medium">{initiative.text}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {initiative.edited_at && <span className="text-[9px] text-stone-400">{editedLabel(initiative.edited_at)}</span>}
              {isOwner && (
                <button type="button" onClick={() => { setDraft(initiative.text); setEditing(true); }} className="hidden md:inline-block text-stone-400 hover:bg-stone-200 hover:text-stone-900 px-[3px] py-[1px] rounded text-xs">✏️</button>
              )}
            </div>
          </div>
        )}
        {initiative.milestones.map((m) => (
          <MilestoneRow
            key={m.id}
            milestone={m}
            isOwner={isOwner}
            onToggle={() => onToggleMilestone(m.id)}
            onRename={(text) => onRenameMilestone(m.id, text)}
            onDelete={() => onDeleteMilestone(m.id)}
          />
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
      </SwipeRow>
    </div>
  );
}
