import { useEffect, useState } from 'react';
import SummaryCards from './SummaryCards';
import GoalSummary from './GoalSummary';
import TaskPanel from './TaskPanel';
import GoalPanel from './GoalPanel';
import EvalPanel from './EvalPanel';
import TrainingPanel from './TrainingPanel';
import StoreCard from '../storetodos/StoreCard';
import TaskOfferCard from './TaskOfferCard';
import { tasksForStaff, goalsForStaff, storeTodosForStore, computeSummary, pendingOffersForStaff, trainingPctForStaff } from '../../lib/selectors';
import { monthAgo, monthStart, monthKey, monthLabel } from '../../utils';
import { isOwnerRole, isAdminRole, canOfferOwnTask, canViewTask, canConfirmTraining } from '../../lib/permissions';
import { useSession } from '../../context/SessionContext';

export default function PersonalView({
  staffKey, staff, roles, tasks, goals, goalInitiatives, goalMilestones, storeTodos, evalRecords, monthlyEvalRecords, trainingProgress,
  initialTab,
  onToggleTaskDone, onDeleteTask, onSaveTaskEdit, onTaskStatusChange, onReassignTask, onReleaseTaskToPool,
  onApproveTaskOffer, onHandOffTaskOffer, onConvertToRequest,
  onAddGoal, onRenameGoal, onDeleteGoal, onAddInitiative, onRenameInitiative, onDeleteInitiative,
  onAddMilestone, onToggleMilestone, onRenameMilestone, onDeleteMilestone,
  onSaveProfile, onCreateRecord, onSaveRecord, onPrint, onSaveMonthlyEvalComment,
  onStartTraining, onToggleTrainingItem, onAddOnlineStoreModule,
}) {
  const [pTab, setPTab] = useState('tasks');
  const { loggedInUserKey } = useSession();
  const staffMember = staff.find((s) => s.key === staffKey);

  useEffect(() => {
    if (initialTab) setPTab(initialTab);
  }, [staffKey, initialTab]);

  if (!staffMember) return null;

  const isOwner = loggedInUserKey === staffKey || isOwnerRole(staff, roles, loggedInUserKey);
  const isSelf = loggedInUserKey === staffKey;
  const canHandOffOffer = isAdminRole(staff, roles, loggedInUserKey);
  const canConvertToRequest = isOwner && canOfferOwnTask(staff, roles, loggedInUserKey);

  const summary = computeSummary(tasks, goals, goalInitiatives, goalMilestones, staffKey, monthAgo, monthStart);
  const myTasks = tasksForStaff(tasks, staffKey).filter((t) => canViewTask(staff, roles, loggedInUserKey, t));
  const myOffers = isSelf ? pendingOffersForStaff(tasks, staffKey) : [];
  const myGoals = goalsForStaff(goals, goalInitiatives, goalMilestones, staffKey);
  const otherStaff = staff.filter((s) => s.key !== staffKey);
  const myTrainingProgress = trainingProgress.filter((p) => p.staff_key === staffKey);
  const canConfirm = canConfirmTraining(staff, roles, loggedInUserKey);

  return (
    <div>
      <SummaryCards summary={summary} />
      <GoalSummary goals={myGoals} />
      {staffMember.stores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {staffMember.stores.map((sk) => (
            <StoreCard
              key={sk}
              storeKey={sk}
              monthText={monthLabel(monthKey())}
              items={storeTodosForStore(storeTodos, sk, monthKey())}
              readonly
            />
          ))}
        </div>
      )}

      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        <button type="button" onClick={() => setPTab('tasks')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${pTab === 'tasks' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>📋 日次タスク</button>
        <button type="button" onClick={() => setPTab('goals')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${pTab === 'goals' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🌱 成長目標</button>
        <button type="button" onClick={() => setPTab('eval')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${pTab === 'eval' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🔒 評価ページ</button>
        {staffMember.training_started_at && (
          <button type="button" onClick={() => setPTab('training')} className={`px-3 py-1.5 rounded-md border border-stone-300 text-xs ${pTab === 'training' ? 'bg-stone-100 font-medium' : 'bg-transparent text-stone-500'}`}>🎓 研修</button>
        )}
      </div>

      {pTab === 'tasks' && (
        <>
          {myOffers.length > 0 && (
            <div className="mb-3">
              {myOffers.map((t) => (
                <TaskOfferCard
                  key={t.id}
                  task={t}
                  offererName={staff.find((s) => s.key === t.offered_by)?.name || ''}
                  canHandOff={canHandOffOffer}
                  otherStaff={staff.filter((s) => s.key !== staffKey)}
                  onApprove={() => onApproveTaskOffer(t.id)}
                  onHandOff={(newKey) => onHandOffTaskOffer(t.id, newKey)}
                />
              ))}
            </div>
          )}
          <TaskPanel
          tasks={myTasks}
          duties={staffMember.duties || []}
          otherStaff={otherStaff}
          isOwner={isOwner}
          canConvertToRequest={canConvertToRequest}
          onConvertToRequest={onConvertToRequest}
          onToggleDone={(id) => onToggleTaskDone(staffKey, id)}
          onDelete={(id) => onDeleteTask(id)}
          onSave={(id, updates) => onSaveTaskEdit(id, updates)}
          onStatusChange={(id, status) => onTaskStatusChange(id, status)}
          onReassign={(id, newKey) => onReassignTask(id, newKey)}
          onReleaseToPool={(id) => onReleaseTaskToPool(id)}
          />
        </>
      )}
      {pTab === 'goals' && (
        <GoalPanel
          goals={myGoals}
          isOwner={isOwner}
          trainingPct={trainingPctForStaff(trainingProgress, staffKey, staffMember.training_online_store)}
          onOpenTraining={() => setPTab('training')}
          onToggleMilestone={onToggleMilestone}
          onAddMilestone={onAddMilestone}
          onRenameMilestone={onRenameMilestone}
          onDeleteMilestone={onDeleteMilestone}
          onAddGoal={(title) => onAddGoal(staffKey, title)}
          onRenameGoal={onRenameGoal}
          onDeleteGoal={onDeleteGoal}
          onAddInitiative={onAddInitiative}
          onRenameInitiative={onRenameInitiative}
          onDeleteInitiative={onDeleteInitiative}
        />
      )}
      {pTab === 'eval' && (
        <EvalPanel
          targetStaff={staffMember}
          staff={staff}
          roles={roles}
          evalRecords={evalRecords}
          monthlyEvalRecords={monthlyEvalRecords}
          onSaveProfile={onSaveProfile}
          onCreateRecord={onCreateRecord}
          onSaveRecord={onSaveRecord}
          onPrint={onPrint}
          onSaveMonthlyEvalComment={onSaveMonthlyEvalComment}
          onStartTraining={onStartTraining}
        />
      )}
      {pTab === 'training' && staffMember.training_started_at && (
        <TrainingPanel
          trainingProgress={myTrainingProgress}
          canConfirm={canConfirm}
          hasOnlineStore={!!staffMember.training_online_store}
          onToggleItem={(itemId, field) => onToggleTrainingItem(staffKey, itemId, field)}
          onAddOnlineStore={() => onAddOnlineStoreModule(staffKey)}
        />
      )}
    </div>
  );
}
