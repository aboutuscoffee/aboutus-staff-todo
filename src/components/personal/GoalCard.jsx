import { useState } from 'react';
import ProgressBar from '../common/ProgressBar';
import SwipeRow from '../common/SwipeRow';
import GoalInitiativeCard from './GoalInitiativeCard';
import { editedLabel } from '../../utils';

export default function GoalCard({ goal, isOwner, onToggleMilestone, onAddMilestone, onRenameMilestone, onDeleteMilestone, onRename, onDelete, onAddInitiative, onRenameInitiative, onDeleteInitiative }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal.title);
  const [text, setText] = useState('');

  const allMilestones = goal.initiatives.flatMap((i) => i.milestones);
  const total = allMilestones.length;
  const done = allMilestones.filter((m) => m.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddInitiative(trimmed);
    setText('');
  };

  const saveRename = () => {
    const trimmed = draft.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('このテーマを削除すると、中の取り組み・マイルストーンもすべて削除されます。よろしいですか？')) onDelete();
  };

  return (
    <div className="rounded-2xl border border-stone-100 bg-white mb-2 overflow-hidden">
      <SwipeRow canEdit={isOwner} onEdit={() => { setDraft(goal.title); setEditing(true); }}>
        <div className="p-[14px_16px]">
          {editing ? (
            <div className="flex gap-1.5 mb-1.5">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && saveRename()}
                className="flex-1 px-[9px] py-1.5 rounded-md border border-stone-300 text-[13px]"
                autoFocus
              />
              <button type="button" onClick={saveRename} className="px-3 py-1.5 rounded-md bg-stone-900 text-white text-[13px]">保存</button>
              <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-[13px]">キャンセル</button>
              <button type="button" onClick={handleDelete} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-[13px] text-[#A32D2D]">削除</button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium">{goal.title}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {goal.edited_at && <span className="text-[9px] text-stone-300">{editedLabel(goal.edited_at)}</span>}
                <span className="text-xs text-stone-500">{pct}%</span>
                {isOwner && (
                  <button type="button" onClick={() => { setDraft(goal.title); setEditing(true); }} className="hidden md:inline-block text-stone-400 hover:bg-stone-100 hover:text-stone-900 px-[4px] py-[2px] rounded text-sm">✎</button>
                )}
              </div>
            </div>
          )}
          <ProgressBar pct={pct} />

          {goal.initiatives.map((i) => (
            <GoalInitiativeCard
              key={i.id}
              initiative={i}
              editing={editing && isOwner}
              onToggleMilestone={onToggleMilestone}
              onAddMilestone={(text) => onAddMilestone(i.id, text)}
              onRenameMilestone={onRenameMilestone}
              onDeleteMilestone={onDeleteMilestone}
              onRename={(text) => onRenameInitiative(i.id, text)}
              onDelete={() => onDeleteInitiative(i.id)}
            />
          ))}

          <div className="flex gap-1.5 mt-1.5">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submit()}
              placeholder="取り組みを追加..."
              className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-xs"
            />
            <button type="button" onClick={submit} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">＋</button>
          </div>
        </div>
      </SwipeRow>
    </div>
  );
}
