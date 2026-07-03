import PoolDashboard from './PoolDashboard';
import OverviewTable from './OverviewTable';

export default function OverviewView({ staff, roles, tasks, poolTasks, onAddPool, onClaimPool, onDeletePool, onToggleTaskDone, onOpenPersonal }) {
  return (
    <div>
      <PoolDashboard poolTasks={poolTasks} staff={staff} onAdd={onAddPool} onClaim={onClaimPool} onDelete={onDeletePool} />
      <OverviewTable staff={staff} roles={roles} tasks={tasks} onToggleDone={onToggleTaskDone} onOpenPersonal={onOpenPersonal} />
    </div>
  );
}
