import { useState } from 'react';
import GoalCard from './GoalCard';

export default function GoalPanel({
  goals, isOwner, trainingPct, onOpenTraining,
  onToggleMilestone, onAddMilestone, onRenameMilestone, onDeleteMilestone, onAddGoal, onRenameGoal, onDeleteGoal,
  onAddInitiative, onRenameInitiative, onDeleteInitiative,
}) {
  const [title, setTitle] = useState('');

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddGoal(trimmed);
    setTitle('');
  };

  return (
    <div>
      {goals.map((g) => (
        <GoalCard
          key={g.id}
          goal={g}
          isOwner={isOwner}
          trainingPct={trainingPct}
          onOpenTraining={onOpenTraining}
          onToggleMilestone={onToggleMilestone}
          onAddMilestone={onAddMilestone}
          onRenameMilestone={onRenameMilestone}
          onDeleteMilestone={onDeleteMilestone}
          onRename={(title) => onRenameGoal(g.id, title)}
          onDelete={() => onDeleteGoal(g.id)}
          onAddInitiative={(text) => onAddInitiative(g.id, text)}
          onRenameInitiative={onRenameInitiative}
          onDeleteInitiative={onDeleteInitiative}
        />
      ))}
      <div className="flex gap-1.5 mt-1.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submit()}
          placeholder="新しいテーマ..."
          className="flex-1 px-[9px] py-1.5 rounded-md border border-stone-300 text-[13px]"
        />
        <button type="button" onClick={submit} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-[13px]">＋ 追加</button>
      </div>
    </div>
  );
}
