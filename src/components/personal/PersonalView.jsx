import { useState } from 'react';
import SummaryCards from './SummaryCards';
import TaskPanel from './TaskPanel';
import GoalPanel from './GoalPanel';
import EvalPanel from './EvalPanel';
import StoreCard from '../storetodos/StoreCard';
import { tasksForStaff, goalsForStaff, storeTodosForStore, computeSummary } from '../../lib/selectors';
import { monthAgo } from '../../utils';

export default function PersonalView({
  staffKey, staff, roles, tasks, goals, goalMilestones, storeTodos, evalRecords,
  onGoStoreTodos,
  onAddTask, onToggleTaskDone, onDeleteTask, onSaveTaskEdit, onTaskStatusChange, onReassignTask, onReleaseTaskToPool,
  onAddGoal, onAddMilestone, onToggleMilestone,
  onSaveProfile, onCreateRecord, onSaveRecord, onPrint,
}) {
  const [pTab, setPTab] = useState('tasks');
  const staffMember = staff.find((s) => s.key === staffKey);
  if (!staffMember) return null;

  const summary = computeSummary(tasks, goals, goalMilestones, staffKey, monthAgo);
  const myTasks = tasksForStaff(tasks, staffKey);
  const myGoals = goalsForStaff(goals, goalMilestones, staffKey);
  const otherStaff = staff.filter((s) => s.key !== staffKey);

  return (
    <div>
      <SummaryCards summary={summary} />
      {staffMember.stores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {staffMember.stores.map((sk) => (
            <StoreCard key={sk} storeKey={sk} items={storeTodosForStore(storeTodos, sk)} readonly onGoToEdit={onGoStoreTodos} />
          ))}
        </div>
      )}

      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        <button type="button" onClick={() => setPTab('tasks')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${pTab === 'tasks' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>📋 日次タスク</button>
        <button type="button" onClick={() => setPTab('goals')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${pTab === 'goals' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🌱 成長目標</button>
        <button type="button" onClick={() => setPTab('eval')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${pTab === 'eval' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🔒 評価ページ</button>
      </div>

      {pTab === 'tasks' && (
        <TaskPanel
          tasks={myTasks}
          duties={staffMember.duties || []}
          otherStaff={otherStaff}
          onAddTask={(fields) => onAddTask(staffKey, fields)}
          onToggleDone={(id) => onToggleTaskDone(staffKey, id)}
          onDelete={(id) => onDeleteTask(id)}
          onSave={(id, updates) => onSaveTaskEdit(id, updates)}
          onStatusChange={(id, status) => onTaskStatusChange(id, status)}
          onReassign={(id, newKey) => onReassignTask(id, newKey)}
          onReleaseToPool={(id) => onReleaseTaskToPool(id)}
        />
      )}
      {pTab === 'goals' && (
        <GoalPanel
          goals={myGoals}
          onToggleMilestone={onToggleMilestone}
          onAddMilestone={onAddMilestone}
          onAddGoal={(title) => onAddGoal(staffKey, title)}
        />
      )}
      {pTab === 'eval' && (
        <EvalPanel
          targetStaff={staffMember}
          staff={staff}
          roles={roles}
          evalRecords={evalRecords}
          onSaveProfile={onSaveProfile}
          onCreateRecord={onCreateRecord}
          onSaveRecord={onSaveRecord}
          onPrint={onPrint}
        />
      )}
    </div>
  );
}
