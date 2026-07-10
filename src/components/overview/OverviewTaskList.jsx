import { useMemo, useState } from 'react';
import { STORE_INFO, STORE_KEYS } from '../../constants';
import TaskItem from '../common/TaskItem';
import SortChips from '../common/SortChips';
import FilterSelect from '../common/FilterSelect';
import { useSession } from '../../context/SessionContext';
import { taskCompare } from '../../lib/selectors';
import { isOwnerRole } from '../../lib/permissions';

export default function OverviewTaskList({
  staff, roles, tasks, onToggleDone, onOpenPersonal,
  onDeleteTask, onSaveTaskEdit, onTaskStatusChange, onReassignTask, onReleaseTaskToPool,
}) {
  const { loggedInUserKey } = useSession();
  const viewerIsOwner = loggedInUserKey && isOwnerRole(staff, roles, loggedInUserKey);
  const [roleFilter, setRoleFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  const overviewRoles = roles.filter((r) => r.show_in_overview);

  const rows = useMemo(() => {
    const out = [];
    staff.forEach((s) => {
      const role = roles.find((r) => r.key === s.role);
      if (!role?.show_in_overview) return;
      if (roleFilter !== 'all' && s.role !== roleFilter) return;
      if (storeFilter !== 'all' && !s.stores.includes(storeFilter)) return;
      tasks.filter((t) => t.staff_key === s.key).forEach((t) => {
        let pass = true;
        if (statusFilter === 'open' && t.done) pass = false;
        else if (statusFilter === 'done' && !t.done) pass = false;
        else if (statusFilter === 'review' && (t.status !== 'review' || t.done)) pass = false;
        else if (statusFilter === 'none_status' && (t.status !== '' || t.done)) pass = false;
        if (pass) out.push({ s, t });
      });
    });
    const cmp = taskCompare(sortBy);
    out.sort((a, b) => cmp(a.t, b.t));
    return out;
  }, [staff, roles, tasks, roleFilter, storeFilter, statusFilter, sortBy]);

  return (
    <div>
      <div className="flex flex-col gap-1.5 mb-2.5">
        <SortChips value={sortBy} onChange={setSortBy} />
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">全役職</option>
            {overviewRoles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </FilterSelect>
          <FilterSelect value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
            <option value="all">全店舗</option>
            {STORE_KEYS.map((sk) => <option key={sk} value={sk}>{STORE_INFO[sk].label}</option>)}
          </FilterSelect>
          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">全ステータス</option>
            <option value="open">未完了のみ</option>
            <option value="done">完了のみ</option>
            <option value="review">確認待ち</option>
            <option value="none_status">ステータスなし（未完了）</option>
          </FilterSelect>
        </div>
      </div>
      <div>
        {rows.length === 0 && <p className="text-xs text-stone-500 py-1.5">該当なし</p>}
        {rows.map(({ s, t }) => (
          <TaskItem
            key={t.id}
            task={t}
            duties={s.duties || []}
            otherStaff={staff.filter((x) => x.key !== s.key)}
            staffName={s.name}
            onOpenStaff={() => onOpenPersonal(s.key)}
            isOwner={loggedInUserKey === s.key || viewerIsOwner}
            onToggleDone={() => onToggleDone(s.key, t.id)}
            onDelete={() => onDeleteTask(t.id)}
            onSave={(updates) => onSaveTaskEdit(t.id, updates)}
            onStatusChange={(status) => onTaskStatusChange(t.id, status)}
            onReassign={(newKey) => onReassignTask(t.id, newKey)}
            onReleaseToPool={() => onReleaseTaskToPool(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
