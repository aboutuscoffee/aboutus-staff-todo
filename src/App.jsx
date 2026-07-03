import { useState, useEffect, useCallback } from 'react';
import { fetchAll, upsertItem, deleteItem } from './lib/db';
import { sha256, today } from './utils';
import { SessionProvider, useSession } from './context/SessionContext';
import { isAdminRole } from './lib/permissions';
import Sidebar from './components/common/Sidebar';
import LoginModal from './components/common/LoginModal';
import Toast, { showToast } from './components/common/Toast';
import OverviewView from './components/overview/OverviewView';
import StoreTodosView from './components/storetodos/StoreTodosView';
import SettingsView from './components/settings/SettingsView';
import PersonalView from './components/personal/PersonalView';
import PrintRecord from './components/personal/PrintRecord';

const VIEW_TITLES = { overview: '全員一覧', storetodos: '店舗月次目標', settings: '設定' };

export default function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchAll().then(setData).catch((e) => setLoadError(e.message));
  }, []);

  const persistStaff = useCallback(async (staffObj) => {
    const saved = await upsertItem('staff', staffObj);
    setData((d) => ({ ...d, staff: d.staff.map((s) => (s.key === saved.key ? saved : s)) }));
    return saved;
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4efe9' }}>
        <p className="text-sm text-red-500">データの読み込みに失敗しました: {loadError}</p>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4efe9' }}>
        <p className="text-sm text-stone-400 tracking-widest">読み込み中...</p>
      </div>
    );
  }

  return (
    <SessionProvider staff={data.staff} onPersistStaff={persistStaff}>
      <AppShell data={data} setData={setData} />
    </SessionProvider>
  );
}

function AppShell({ data, setData }) {
  const { loggedInUserKey, logout, openLoginModal } = useSession();
  const [collapsed, setCollapsed] = useState(true);
  const [view, setView] = useState('overview');
  const [si, setSi] = useState(null);
  const [printData, setPrintData] = useState(null);

  const { staff, roles, tasks, poolTasks, goals, goalMilestones, storeTodos, evalRecords } = data;

  // --- 汎用ヘルパー：単一行のupsert結果でローカル状態を更新 ---
  const upsertInto = useCallback((key, table, pk = 'id') => async (item) => {
    const saved = await upsertItem(table, item);
    setData((d) => {
      const list = d[key];
      const exists = list.some((x) => x[pk] === saved[pk]);
      return { ...d, [key]: exists ? list.map((x) => (x[pk] === saved[pk] ? saved : x)) : [...list, saved] };
    });
    return saved;
  }, [setData]);

  const removeFrom = useCallback((key, table, pk = 'id') => async (id) => {
    await deleteItem(table, id, pk);
    setData((d) => ({ ...d, [key]: d[key].filter((x) => x[pk] !== id) }));
  }, [setData]);

  const upsertStaff = upsertInto('staff', 'staff', 'key');
  const upsertRole = upsertInto('roles', 'roles', 'key');
  const upsertTask = upsertInto('tasks', 'tasks', 'id');
  const upsertPool = upsertInto('poolTasks', 'pool_tasks', 'id');
  const upsertGoal = upsertInto('goals', 'goals', 'id');
  const upsertMilestone = upsertInto('goalMilestones', 'goal_milestones', 'id');
  const upsertStoreTodo = upsertInto('storeTodos', 'store_todos', 'id');
  const upsertEvalRecord = upsertInto('evalRecords', 'eval_records', 'id');

  const removeTask = removeFrom('tasks', 'tasks', 'id');
  const removePool = removeFrom('poolTasks', 'pool_tasks', 'id');
  const removeStaffRow = removeFrom('staff', 'staff', 'key');
  const removeRoleRow = removeFrom('roles', 'roles', 'key');
  const removeStoreTodoRow = removeFrom('storeTodos', 'store_todos', 'id');

  // --- ナビゲーション ---
  const goView = (v) => { setView(v); setCollapsed(true); };
  const goPersonal = (key) => { setView('personal'); setSi(key); setCollapsed(true); };
  const trySettings = () => {
    setCollapsed(true);
    if (loggedInUserKey && isAdminRole(staff, roles, loggedInUserKey)) { setView('settings'); return; }
    openLoginModal({
      subText: '設定の閲覧はGM / オーナーのログインが必要です',
      onSuccess: (key) => {
        if (isAdminRole(staff, roles, key)) setView('settings');
        else { alert('設定はGM / オーナーのみ閲覧できます。'); logout(); }
      },
    });
  };

  // --- 全員一覧・担当者募集プール ---
  const onAddPool = (text, kind, deadline) => {
    upsertPool({ text, kind, deadline, workdate: null, minutes: null, created_at: today }).then(() => showToast());
  };
  const onClaimPool = async (poolId, staffKey) => {
    const p = poolTasks.find((x) => x.id === poolId);
    const s = staff.find((x) => x.key === staffKey);
    if (!p || !s) { alert('担当者を選択してください'); return; }
    await removePool(poolId);
    if (p.kind === 'assign') {
      if (!s.duties.includes(p.text)) await upsertStaff({ ...s, duties: [...s.duties, p.text] });
    } else {
      await upsertTask({ staff_key: staffKey, text: p.text, duty: 'その他', status: '', done: false, done_date: null, deadline: p.deadline || today, workdate: today, minutes: p.minutes });
    }
    showToast();
  };
  const onDeletePool = (id) => removePool(id);

  const onToggleTaskDone = async (staffKey, taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    const done = !t.done;
    await upsertTask({ ...t, done, done_date: done ? today : null, status: done ? '' : t.status });
  };

  // --- 店舗月次目標 ---
  const onAddStoreTodo = (storeKey, text) => {
    const order = storeTodos.filter((t) => t.store_key === storeKey).length;
    upsertStoreTodo({ store_key: storeKey, text, done: false, sort_order: order });
  };
  const onToggleStoreTodo = (id) => {
    const t = storeTodos.find((x) => x.id === id);
    if (t) upsertStoreTodo({ ...t, done: !t.done });
  };
  const onDeleteStoreTodo = (id) => removeStoreTodoRow(id);

  // --- 設定 ---
  const onReorderStaff = (newOrderArr) => {
    const withOrder = newOrderArr.map((s, i) => ({ ...s, sort_order: i }));
    setData((d) => ({ ...d, staff: withOrder }));
    withOrder.forEach((s) => upsertItem('staff', s).catch(() => {}));
    showToast();
  };
  const onUpdateStaffField = (key, partial) => {
    const s = staff.find((x) => x.key === key);
    if (s) upsertStaff({ ...s, ...partial }).then(() => showToast());
  };
  const onDeleteStaff = (key) => {
    removeStaffRow(key).then(() => {
      if (si === key) { setSi(null); setView('overview'); }
      if (loggedInUserKey === key) logout();
      showToast();
    });
  };
  const onAddStaff = ({ name, stores, role }) => {
    const key = `staff_${Date.now()}`;
    upsertStaff({
      key, name, stores, role, duties: [], password_hash: null, attempts: 0, blocked: false,
      sort_order: staff.length, hire_date: today, position: '', strengths_html: '', notes_html: '', overall_eval_html: '',
    }).then(() => showToast());
  };
  const onTogglePerm = (roleKey, permKey, value) => {
    const r = roles.find((x) => x.key === roleKey);
    if (r) upsertRole({ ...r, [permKey]: value }).then(() => showToast());
  };
  const onToggleViewScope = (roleKey, targetKey, checked) => {
    const r = roles.find((x) => x.key === roleKey);
    if (!r) return;
    const scope = checked ? [...r.view_scope, targetKey] : r.view_scope.filter((x) => x !== targetKey);
    upsertRole({ ...r, view_scope: scope }).then(() => showToast());
  };
  const onAddRole = ({ label, can_login, can_edit, show_in_overview, view_scope }) => {
    const key = `role_${Date.now()}`;
    upsertRole({ key, label, can_login, can_edit, show_in_overview, is_owner: false, view_scope, is_base_role: false }).then(() => showToast());
  };
  const onDeleteRole = (roleKey) => {
    removeRoleRow(roleKey).then(() => {
      roles.forEach((r) => {
        if (r.key !== roleKey && r.view_scope.includes(roleKey)) {
          upsertRole({ ...r, view_scope: r.view_scope.filter((x) => x !== roleKey) });
        }
      });
      showToast();
    });
  };
  const onResetPassword = async (key, newPassword) => {
    const s = staff.find((x) => x.key === key);
    if (!s) return;
    const password_hash = await sha256(newPassword);
    await upsertStaff({ ...s, password_hash, attempts: 0, blocked: false });
    showToast();
  };

  // --- 個人ページ：タスク ---
  const onAddTask = (staffKey, fields) => {
    upsertTask({ staff_key: staffKey, text: fields.text, duty: fields.duty, status: '', done: false, done_date: null, deadline: fields.deadline, workdate: today, minutes: fields.minutes }).then(() => showToast());
  };
  const onDeleteTask = (id) => removeTask(id);
  const onSaveTaskEdit = (id, updates) => {
    const t = tasks.find((x) => x.id === id);
    if (t) upsertTask({ ...t, ...updates }).then(() => showToast());
  };
  const onTaskStatusChange = (id, status) => {
    const t = tasks.find((x) => x.id === id);
    if (t) upsertTask({ ...t, status });
  };
  const onReassignTask = (id, newKey) => {
    const t = tasks.find((x) => x.id === id);
    if (t) upsertTask({ ...t, staff_key: newKey, status: '' }).then(() => showToast());
  };
  const onReleaseTaskToPool = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    removeTask(id).then(() => {
      upsertPool({ text: t.text, kind: 'todo', deadline: t.deadline, workdate: null, minutes: t.minutes, created_at: today }).then(() => showToast());
    });
  };

  // --- 個人ページ：成長目標 ---
  const onAddGoal = (staffKey, title) => {
    const order = goals.filter((g) => g.staff_key === staffKey).length;
    upsertGoal({ staff_key: staffKey, title, sort_order: order });
  };
  const onAddMilestone = (goalId, text) => {
    const order = goalMilestones.filter((m) => m.goal_id === goalId).length;
    upsertMilestone({ goal_id: goalId, text, done: false, sort_order: order });
  };
  const onToggleMilestone = (goalId, milestoneId) => {
    const m = goalMilestones.find((x) => x.id === milestoneId);
    if (m) upsertMilestone({ ...m, done: !m.done });
  };

  // --- 個人ページ：評価 ---
  const onSaveProfile = (fields) => {
    const s = staff.find((x) => x.key === si);
    if (s) upsertStaff({ ...s, ...fields }).then(() => showToast());
  };
  const onCreateRecord = async (fields) => {
    const saved = await upsertEvalRecord({ staff_key: si, ...fields, created_at: today, updated_at: today });
    showToast();
    return saved;
  };
  const onSaveRecord = (id, fields) => {
    const r = evalRecords.find((x) => x.id === id);
    if (r) upsertEvalRecord({ ...r, ...fields, updated_at: today }).then(() => showToast());
  };
  const onPrint = (staffName, record) => setPrintData({ staffName, record });

  const topbarTitle = view === 'personal' ? (staff.find((s) => s.key === si)?.name ?? '') : (VIEW_TITLES[view] || view);
  const loggedInStaff = staff.find((s) => s.key === loggedInUserKey);

  return (
    <div className="flex h-screen overflow-hidden text-[14px] text-stone-900" style={{ fontFamily: 'inherit' }}>
      <Sidebar
        collapsed={collapsed}
        staff={staff}
        roles={roles}
        view={view}
        si={si}
        onGoView={goView}
        onGoPersonal={goPersonal}
        onTrySettings={trySettings}
        onClose={() => setCollapsed(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="px-3.5 py-2.5 border-b border-stone-100 flex items-center gap-2.5 flex-shrink-0">
          <button type="button" onClick={() => setCollapsed((c) => !c)} className="text-stone-500 text-lg px-1.5 py-0.5 rounded hover:bg-stone-100 md:hidden">☰</button>
          <span className="text-base font-semibold flex-1 min-w-0 truncate">{topbarTitle}</span>
          {loggedInStaff && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] text-stone-400">{loggedInStaff.name}（{roles.find((r) => r.key === loggedInStaff.role)?.label}）</span>
              <button type="button" onClick={logout} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-[11px]">ログアウト</button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'overview' && (
            <OverviewView
              staff={staff} roles={roles} tasks={tasks} poolTasks={poolTasks}
              onAddPool={onAddPool} onClaimPool={onClaimPool} onDeletePool={onDeletePool}
              onToggleTaskDone={onToggleTaskDone} onOpenPersonal={goPersonal}
            />
          )}
          {view === 'storetodos' && (
            <StoreTodosView storeTodos={storeTodos} onAdd={onAddStoreTodo} onToggle={onToggleStoreTodo} onDelete={onDeleteStoreTodo} />
          )}
          {view === 'settings' && (
            loggedInUserKey && isAdminRole(staff, roles, loggedInUserKey) ? (
              <SettingsView
                staff={staff} roles={roles}
                onReorderStaff={onReorderStaff} onUpdateStaffField={onUpdateStaffField} onDeleteStaff={onDeleteStaff} onAddStaff={onAddStaff}
                onTogglePerm={onTogglePerm} onToggleViewScope={onToggleViewScope} onAddRole={onAddRole} onDeleteRole={onDeleteRole}
                onResetPassword={onResetPassword}
              />
            ) : null
          )}
          {view === 'personal' && si && (
            <PersonalView
              staffKey={si} staff={staff} roles={roles} tasks={tasks} goals={goals} goalMilestones={goalMilestones}
              storeTodos={storeTodos} evalRecords={evalRecords}
              onGoStoreTodos={() => goView('storetodos')}
              onAddTask={onAddTask} onToggleTaskDone={onToggleTaskDone} onDeleteTask={onDeleteTask}
              onSaveTaskEdit={onSaveTaskEdit} onTaskStatusChange={onTaskStatusChange} onReassignTask={onReassignTask} onReleaseTaskToPool={onReleaseTaskToPool}
              onAddGoal={onAddGoal} onAddMilestone={onAddMilestone} onToggleMilestone={onToggleMilestone}
              onSaveProfile={onSaveProfile} onCreateRecord={onCreateRecord} onSaveRecord={onSaveRecord} onPrint={onPrint}
            />
          )}
        </div>
      </div>
      <LoginModal staff={staff} roles={roles} />
      <Toast />
      <PrintRecord data={printData} onDone={() => setPrintData(null)} />
    </div>
  );
}
