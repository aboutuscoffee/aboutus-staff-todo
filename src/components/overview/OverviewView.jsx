import PoolDashboard from './PoolDashboard';
import OverviewTaskList from './OverviewTaskList';

export default function OverviewView({
  staff, roles, tasks, poolTasks, onClaimPool, onDeletePool, onToggleTaskDone, onOpenPersonal,
  onDeleteTask, onSaveTaskEdit, onTaskStatusChange, onReassignTask, onReleaseTaskToPool, onConvertToRequest,
}) {
  return (
    <div>
      <PoolDashboard poolTasks={poolTasks} onClaim={onClaimPool} onDelete={onDeletePool} />
      <OverviewTaskList
        staff={staff} roles={roles} tasks={tasks} onToggleDone={onToggleTaskDone} onOpenPersonal={onOpenPersonal}
        onDeleteTask={onDeleteTask} onSaveTaskEdit={onSaveTaskEdit} onTaskStatusChange={onTaskStatusChange}
        onReassignTask={onReassignTask} onReleaseTaskToPool={onReleaseTaskToPool} onConvertToRequest={onConvertToRequest}
      />
    </div>
  );
}
