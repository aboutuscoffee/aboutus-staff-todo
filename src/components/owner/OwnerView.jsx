import { useState } from 'react';
import OwnerTaskFeed from './OwnerTaskFeed';
import GoalPanel from '../personal/GoalPanel';
import StaffSummaryList from './StaffSummaryList';
import { goalsForStaff } from '../../lib/selectors';
import { currentOwnerKey } from '../../lib/permissions';

export default function OwnerView({
  staff, roles, tasks, goals, goalInitiatives, goalMilestones,
  onGoPersonalEval,
  onToggleTaskDone, onDeleteTask, onSaveTaskEdit, onTaskStatusChange, onReleaseTaskToPool, onConvertToRequest, onStopRecurringTask,
  onApproveTaskOffer, onHandOffTaskOffer,
  onAddGoal, onRenameGoal, onDeleteGoal, onAddInitiative, onRenameInitiative, onDeleteInitiative,
  onAddMilestone, onToggleMilestone, onRenameMilestone, onDeleteMilestone,
}) {
  const [oTab, setOTab] = useState('tasks');
  const ownerKey = currentOwnerKey(staff, roles);
  const myGoals = ownerKey ? goalsForStaff(goals, goalInitiatives, goalMilestones, ownerKey) : [];

  return (
    <div>
      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        <button type="button" onClick={() => setOTab('tasks')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${oTab === 'tasks' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>📋 タスク</button>
        <button type="button" onClick={() => setOTab('goals')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${oTab === 'goals' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🌱 成長目標</button>
        <button type="button" onClick={() => setOTab('summary')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${oTab === 'summary' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🌱 スタッフ成長記録</button>
      </div>

      {oTab === 'tasks' && ownerKey && (
        <OwnerTaskFeed
          staff={staff}
          tasks={tasks}
          ownerKey={ownerKey}
          onGoPersonalEval={onGoPersonalEval}
          onToggleTaskDone={onToggleTaskDone}
          onDeleteTask={onDeleteTask}
          onSaveTaskEdit={onSaveTaskEdit}
          onTaskStatusChange={onTaskStatusChange}
          onReleaseTaskToPool={onReleaseTaskToPool}
          onConvertToRequest={onConvertToRequest}
          onStopRecurringTask={onStopRecurringTask}
          onApproveTaskOffer={onApproveTaskOffer}
          onHandOffTaskOffer={onHandOffTaskOffer}
        />
      )}
      {oTab === 'goals' && ownerKey && (
        <GoalPanel
          goals={myGoals}
          isOwner
          trainingPctByKind={{}}
          onOpenTraining={() => {}}
          onToggleMilestone={onToggleMilestone}
          onAddMilestone={onAddMilestone}
          onRenameMilestone={onRenameMilestone}
          onDeleteMilestone={onDeleteMilestone}
          onAddGoal={(title) => onAddGoal(ownerKey, title)}
          onRenameGoal={onRenameGoal}
          onDeleteGoal={onDeleteGoal}
          onAddInitiative={onAddInitiative}
          onRenameInitiative={onRenameInitiative}
          onDeleteInitiative={onDeleteInitiative}
        />
      )}
      {oTab === 'summary' && (
        <StaffSummaryList
          staff={staff}
          roles={roles}
          tasks={tasks}
          goals={goals}
          goalInitiatives={goalInitiatives}
          goalMilestones={goalMilestones}
          onGoPersonalEval={onGoPersonalEval}
        />
      )}
    </div>
  );
}
