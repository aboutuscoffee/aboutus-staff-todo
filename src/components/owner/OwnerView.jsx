import { useState } from 'react';
import ConfirmationQueue from './ConfirmationQueue';
import StaffSummaryList from './StaffSummaryList';

export default function OwnerView({
  staff, roles, tasks, goals, goalMilestones,
  onGoPersonalEval,
  onToggleTaskDone, onDeleteTask, onSaveTaskEdit, onTaskStatusChange, onReassignTask, onReleaseTaskToPool,
}) {
  const [oTab, setOTab] = useState('review');

  return (
    <div>
      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        <button type="button" onClick={() => setOTab('review')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${oTab === 'review' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🔎 確認待ちタスク</button>
        <button type="button" onClick={() => setOTab('summary')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${oTab === 'summary' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🌱 スタッフ成長記録</button>
      </div>

      {oTab === 'review' && (
        <ConfirmationQueue
          staff={staff}
          tasks={tasks}
          onGoPersonalEval={onGoPersonalEval}
          onToggleTaskDone={onToggleTaskDone}
          onDeleteTask={onDeleteTask}
          onSaveTaskEdit={onSaveTaskEdit}
          onTaskStatusChange={onTaskStatusChange}
          onReassignTask={onReassignTask}
          onReleaseTaskToPool={onReleaseTaskToPool}
        />
      )}
      {oTab === 'summary' && (
        <StaffSummaryList
          staff={staff}
          roles={roles}
          tasks={tasks}
          goals={goals}
          goalMilestones={goalMilestones}
          onGoPersonalEval={onGoPersonalEval}
        />
      )}
    </div>
  );
}
