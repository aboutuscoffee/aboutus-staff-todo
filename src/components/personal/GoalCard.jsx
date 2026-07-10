import { useState } from 'react';
import ProgressBar from '../common/ProgressBar';

export default function GoalCard({ goal, onToggleMilestone, onAddMilestone }) {
  const [text, setText] = useState('');
  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddMilestone(trimmed);
    setText('');
  };

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-[14px_16px] mb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium">{goal.title}</span>
        <span className="text-xs text-stone-500">{pct}%</span>
      </div>
      <ProgressBar pct={pct} />
      {goal.milestones.map((m) => (
        <div key={m.id} className="flex items-center gap-[7px] text-xs text-stone-500 mb-1">
          <input type="checkbox" checked={m.done} onChange={() => onToggleMilestone(m.id)} className="w-[13px] h-[13px] cursor-pointer accent-[#1D9E75] flex-shrink-0" />
          <span className={m.done ? 'line-through text-stone-400' : ''}>{m.text}</span>
        </div>
      ))}
      <div className="flex gap-1.5 mt-1.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submit()}
          placeholder="マイルストーンを追加..."
          className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-xs"
        />
        <button type="button" onClick={submit} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">＋</button>
      </div>
    </div>
  );
}
