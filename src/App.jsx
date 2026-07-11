import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAll, upsertItem, deleteItem, renameWithTimestamp, fetchNotifications, markNotificationsRead, deleteNotification, clearNotifications } from './lib/db';
import { sha256, today, pastMonthKeys, monthKey, monthLabel } from './utils';
import { SessionProvider, useSession } from './context/SessionContext';
import { isAdminRole, isOwnerRole, canAssignOwner } from './lib/permissions';
import { computeMonthlyStats } from './lib/selectors';
import { STORE_INFO } from './constants';
import Sidebar from './components/common/Sidebar';
import LoginModal from './components/common/LoginModal';
import LoginScreen from './components/common/LoginScreen';
import QuickAddModal from './components/common/QuickAddModal';
import NotificationPanel from './components/common/NotificationPanel';
import CalendarModal from './components/common/CalendarModal';
import Toast, { showToast } from './components/common/Toast';
import OverviewView from './components/overview/OverviewView';
import StoreTodosView from './components/storetodos/StoreTodosView';
import SettingsView from './components/settings/SettingsView';
import PersonalView from './components/personal/PersonalView';
import OwnerView from './components/owner/OwnerView';
import PrintRecord from './components/personal/PrintRecord';

const VIEW_TITLES = { overview: '全員一覧', storetodos: '店舗月次目標', settings: '設定', owner: 'オーナーページ' };
const MONTHLY_EVAL_START_YM = '2026-07';

export default function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchAll().then(setData).catch((e) => setLoadError(e.message));
  }, []);

  const persistStaff = useCallback(async (staffObj) => {
    const saved = await upsertItem('staff', staffObj, 'key');
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
      <Gate data={data} setData={setData} />
    </SessionProvider>
  );
}

function Gate({ data, setData }) {
  const { loggedInUserKey } = useSession();
  if (!loggedInUserKey) return <LoginScreen staff={data.staff} roles={data.roles} />;
  return <AppShell data={data} setData={setData} />;
}

function AppShell({ data, setData }) {
  const { loggedInUserKey, logout } = useSession();
  const [collapsed, setCollapsed] = useState(true);
  const isOwnerLogin = loggedInUserKey && isOwnerRole(data.staff, data.roles, loggedInUserKey);
  const [view, setView] = useState(isOwnerLogin ? 'personal' : 'overview');
  const [si, setSi] = useState(isOwnerLogin ? loggedInUserKey : null);
  const [personalTab, setPersonalTab] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState('task');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const { staff, roles, tasks, poolTasks, goals, goalInitiatives, goalMilestones, storeTodos, evalRecords, monthlyEvalRecords, storeMonthNotes } = data;
  const loggedInStaff = staff.find((s) => s.key === loggedInUserKey);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const viewerIsOwner = loggedInUserKey && isOwnerRole(staff, roles, loggedInUserKey);

  useEffect(() => {
    if (loggedInUserKey) fetchNotifications(loggedInUserKey).then(setNotifications).catch(() => {});
  }, [loggedInUserKey]);

  // --- 月次評価スナップショット：先月以前の未保存分を自動生成 ---
  const didBackfillMonthly = useRef(false);
  useEffect(() => {
    if (didBackfillMonthly.current) return;
    didBackfillMonthly.current = true;
    const missing = [];
    pastMonthKeys(3).filter((ym) => ym >= MONTHLY_EVAL_START_YM).forEach((ym) => {
      staff.forEach((s) => {
        if (monthlyEvalRecords.some((r) => r.staff_key === s.key && r.year_month === ym)) return;
        const stats = computeMonthlyStats(tasks, goals, goalInitiatives, goalMilestones, s.key, ym);
        missing.push({
          staff_key: s.key,
          year_month: ym,
          total_tasks: stats.totalTasks,
          completed_tasks: stats.completedTasks,
          on_time_pct: stats.onTimePct,
          goal_pct: stats.goalPct,
        });
      });
    });
    if (missing.length) {
      Promise.all(missing.map((m) => upsertItem('monthly_eval_records', m, 'id')))
        .then((saved) => setData((d) => ({ ...d, monthlyEvalRecords: [...d.monthlyEvalRecords, ...saved] })))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notify = useCallback((staffKey, type, message, fromKey) => {
    upsertItem('notifications', { staff_key: staffKey, type, message, from_key: fromKey || null, read: false }, 'id')
      .then((saved) => {
        if (staffKey === loggedInUserKey) setNotifications((n) => [saved, ...n]);
      })
      .catch(() => {});
  }, [loggedInUserKey]);

  const openNotifications = () => {
    setNotifOpen(true);
    if (unreadCount > 0) {
      markNotificationsRead(loggedInUserKey)
        .then(() => setNotifications((n) => n.map((x) => ({ ...x, read: true }))))
        .catch(() => {});
    }
  };

  const onSendMemo = (toKey, text) => {
    if (toKey === loggedInUserKey) {
      notify(loggedInUserKey, 'memo', text);
      showToast('メモを保存しました');
      return;
    }
    const toName = staff.find((s) => s.key === toKey)?.name || '';
    notify(toKey, 'memo', `${loggedInStaff?.name}さんからのメモ: ${text}`, loggedInUserKey);
    notify(loggedInUserKey, 'memo_sent', `${toName}さんへメモを送信しました: ${text}`, loggedInUserKey);
    showToast('メモを送信しました');
  };

  const onDeleteNotification = (id) => {
    setNotifications((n) => n.filter((x) => x.id !== id));
    deleteNotification(id).catch(() => {});
  };

  const onClearNotifications = () => {
    setNotifications((n) => n.filter((x) => x.type === 'memo'));
    clearNotifications(loggedInUserKey).catch(() => {});
  };

  // --- 汎用ヘルパー：単一行のupsert結果でローカル状態を更新 ---
  const upsertInto = useCallback((key, table, pk = 'id') => async (item) => {
    const saved = await upsertItem(table, item, pk);
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
  const upsertInitiative = upsertInto('goalInitiatives', 'goal_initiatives', 'id');
  const upsertMilestone = upsertInto('goalMilestones', 'goal_milestones', 'id');
  const upsertStoreTodo = upsertInto('storeTodos', 'store_todos', 'id');
  const upsertEvalRecord = upsertInto('evalRecords', 'eval_records', 'id');
  const upsertStoreMonthNote = upsertInto('storeMonthNotes', 'store_month_notes', 'id');
  const upsertMonthlyEvalRecord = upsertInto('monthlyEvalRecords', 'monthly_eval_records', 'id');

  const removeTask = removeFrom('tasks', 'tasks', 'id');
  const removePool = removeFrom('poolTasks', 'pool_tasks', 'id');
  const removeStaffRow = removeFrom('staff', 'staff', 'key');
  const removeRoleRow = removeFrom('roles', 'roles', 'key');
  const removeStoreTodoRow = removeFrom('storeTodos', 'store_todos', 'id');
  const removeGoalRow = removeFrom('goals', 'goals', 'id');
  const removeInitiativeRow = removeFrom('goalInitiatives', 'goal_initiatives', 'id');
  const removeMilestoneRow = removeFrom('goalMilestones', 'goal_milestones', 'id');

  // --- ナビゲーション ---
  const goView = (v) => { setView(v); setCollapsed(true); };
  const goPersonal = (key) => { setView('personal'); setSi(key); setPersonalTab(null); setCollapsed(true); };
  const goPersonalEval = (key) => { setView('personal'); setSi(key); setPersonalTab('eval'); setCollapsed(true); };
  const trySettings = () => { setCollapsed(true); setView('settings'); };

  // --- 全員一覧・担当者募集プール ---
  const onAddPool = (text, kind, deadline, priority, targetKeys) => {
    const recipients = targetKeys && targetKeys.length ? targetKeys : staff.filter((s) => s.key !== loggedInUserKey).map((s) => s.key);
    upsertPool({ text, kind, deadline, workdate: null, minutes: null, priority: priority || 'mid', target_keys: targetKeys && targetKeys.length ? targetKeys : null, created_by: loggedInUserKey, created_at: today }).then(() => {
      showToast();
      notify(loggedInUserKey, 'pool_posted', `「${text}」を依頼タスクとして投稿しました`);
      recipients.forEach((key) => notify(key, 'pool_available', `新しい依頼タスク「${text}」が届きました`));
    });
  };
  const onClaimPool = async (poolId, staffKey) => {
    const p = poolTasks.find((x) => x.id === poolId);
    const s = staff.find((x) => x.key === staffKey);
    if (!p || !s) { alert('担当者を選択してください'); return; }
    if (p.target_keys && p.target_keys.length && !p.target_keys.includes(staffKey)) return;
    await removePool(poolId);
    if (p.kind === 'assign') {
      if (!s.duties.includes(p.text)) await upsertStaff({ ...s, duties: [...s.duties, p.text] });
    } else {
      await upsertTask({ staff_key: staffKey, text: p.text, duty: 'その他', priority: p.priority || 'mid', status: '', done: false, done_date: null, deadline: p.deadline || today, workdate: today, minutes: p.minutes, from_pool: true });
    }
    if (p.created_by && p.created_by !== staffKey) {
      notify(p.created_by, 'pool_claimed', `「${p.text}」を${s.name}さんが受け取りました`);
    }
    showToast();
  };
  const onDeletePool = (id) => removePool(id);

  const onToggleTaskDone = async (staffKey, taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    const done = !t.done;
    await upsertTask({ ...t, done, done_date: done ? today : null, status: done ? '' : t.status });
    if (done) notify(staffKey, 'task_done', `「${t.text}」を完了しました`);
  };

  // --- 店舗月次目標 ---
  const onAddStoreTodo = (storeKey, text) => {
    const ym = monthKey();
    const order = storeTodos.filter((t) => t.store_key === storeKey && t.year_month === ym).length;
    upsertStoreTodo({ store_key: storeKey, text, done: false, sort_order: order, year_month: ym });
  };
  const onToggleStoreTodo = (id) => {
    const t = storeTodos.find((x) => x.id === id);
    if (t) upsertStoreTodo({ ...t, done: !t.done });
  };
  const onDeleteStoreTodo = (id) => removeStoreTodoRow(id);
  const onSaveStoreMonthComment = (storeKey, ym, comment) => {
    const existing = storeMonthNotes.find((n) => n.store_key === storeKey && n.year_month === ym);
    upsertStoreMonthNote(existing ? { ...existing, comment } : { store_key: storeKey, year_month: ym, comment }).then(() => {
      showToast();
      staff
        .filter((s) => s.stores.includes(storeKey) && s.key !== loggedInUserKey)
        .forEach((s) => notify(s.key, 'store_comment', `${STORE_INFO[storeKey].label}の${monthLabel(ym)}目標にコメントが届きました`));
    });
  };

  // --- 設定 ---
  const onReorderStaff = (newOrderArr) => {
    const withOrder = newOrderArr.map((s, i) => ({ ...s, sort_order: i }));
    setData((d) => ({ ...d, staff: withOrder }));
    withOrder.forEach((s) => upsertItem('staff', s, 'key').catch(() => {}));
    showToast();
  };
  const onUpdateStaffField = (key, partial) => {
    const s = staff.find((x) => x.key === key);
    if (!s) return;
    if (partial.role) {
      const newRole = roles.find((r) => r.key === partial.role);
      if (newRole?.is_owner) {
        const prevOwner = staff.find((x) => x.key !== key && roles.find((r) => r.key === x.role)?.is_owner);
        if (prevOwner) upsertStaff({ ...prevOwner, role: 'GM' });
      }
    }
    upsertStaff({ ...s, ...partial }).then(() => showToast());
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
    if (roles.find((r) => r.key === role)?.is_owner) {
      const prevOwner = staff.find((x) => roles.find((r) => r.key === x.role)?.is_owner);
      if (prevOwner) upsertStaff({ ...prevOwner, role: 'GM' });
    }
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
  const onChangeOwnPassword = async (currentPassword, newPassword) => {
    const s = staff.find((x) => x.key === loggedInUserKey);
    if (!s) return { ok: false, message: 'エラーが発生しました' };
    const hash = await sha256(currentPassword);
    if (hash !== s.password_hash) return { ok: false, message: '現在のパスワードが正しくありません' };
    const password_hash = await sha256(newPassword);
    await upsertStaff({ ...s, password_hash, attempts: 0, blocked: false });
    showToast('パスワードを変更しました');
    return { ok: true };
  };

  // --- 個人ページ：タスク ---
  const onAddTask = (staffKey, fields) => {
    upsertTask({ staff_key: staffKey, text: fields.text, duty: fields.duty, priority: fields.priority || 'mid', status: '', done: false, done_date: null, deadline: fields.deadline, workdate: fields.workdate || today, minutes: fields.minutes }).then(() => showToast());
  };
  const onDeleteTask = (id) => removeTask(id);
  const onSaveTaskEdit = (id, updates) => {
    const t = tasks.find((x) => x.id === id);
    if (t) upsertTask({ ...t, ...updates }).then(() => showToast());
  };
  const onTaskStatusChange = (id, status) => {
    const t = tasks.find((x) => x.id === id);
    if (t) {
      upsertTask({ ...t, status });
      if (status === 'review' && t.status !== 'review') {
        notify(t.staff_key, 'status_review', `「${t.text}」を確認待ちにしました`);
        const staffName = staff.find((x) => x.key === t.staff_key)?.name || '';
        staff.filter((o) => o.key !== t.staff_key && isOwnerRole(staff, roles, o.key))
          .forEach((o) => notify(o.key, 'review_owner', `${staffName}さんが「${t.text}」を確認待ちにしました`));
      }
    }
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
  const notifyAdmins = (message) => {
    staff
      .filter((s) => s.key !== loggedInUserKey && isAdminRole(staff, roles, s.key))
      .forEach((s) => notify(s.key, 'goal_deleted', message));
  };
  const onAddGoal = (staffKey, title) => {
    const order = goals.filter((g) => g.staff_key === staffKey).length;
    upsertGoal({ staff_key: staffKey, title, sort_order: order });
  };
  const onRenameGoal = (goalId, title) => {
    const g = goals.find((x) => x.id === goalId);
    if (!g || title === g.title) return;
    renameWithTimestamp('goals', goalId, { title }).then((saved) => {
      setData((d) => ({ ...d, goals: d.goals.map((x) => (x.id === goalId ? saved : x)) }));
    });
  };
  const onDeleteGoal = (goalId) => {
    const g = goals.find((x) => x.id === goalId);
    if (!g) return;
    const staffName = staff.find((s) => s.key === g.staff_key)?.name || '';
    const removedInitiativeIds = goalInitiatives.filter((i) => i.goal_id === goalId).map((i) => i.id);
    removeGoalRow(goalId).then(() => {
      setData((d) => ({
        ...d,
        goalInitiatives: d.goalInitiatives.filter((i) => i.goal_id !== goalId),
        goalMilestones: d.goalMilestones.filter((m) => !removedInitiativeIds.includes(m.initiative_id)),
      }));
      showToast();
      notifyAdmins(`${staffName}さんの目標「${g.title}」が削除されました`);
    });
  };
  const onAddInitiative = (goalId, text) => {
    const order = goalInitiatives.filter((i) => i.goal_id === goalId).length;
    upsertInitiative({ goal_id: goalId, text, sort_order: order });
  };
  const onRenameInitiative = (initiativeId, text) => {
    const i = goalInitiatives.find((x) => x.id === initiativeId);
    if (!i || text === i.text) return;
    renameWithTimestamp('goal_initiatives', initiativeId, { text }).then((saved) => {
      setData((d) => ({ ...d, goalInitiatives: d.goalInitiatives.map((x) => (x.id === initiativeId ? saved : x)) }));
    });
  };
  const onDeleteInitiative = (initiativeId) => {
    const i = goalInitiatives.find((x) => x.id === initiativeId);
    if (!i) return;
    const g = goals.find((x) => x.id === i.goal_id);
    const staffName = g ? staff.find((s) => s.key === g.staff_key)?.name || '' : '';
    removeInitiativeRow(initiativeId).then(() => {
      setData((d) => ({ ...d, goalMilestones: d.goalMilestones.filter((m) => m.initiative_id !== initiativeId) }));
      showToast();
      notifyAdmins(`${staffName}さんの取り組み「${i.text}」が削除されました`);
    });
  };
  const onAddMilestone = (initiativeId, text) => {
    const order = goalMilestones.filter((m) => m.initiative_id === initiativeId).length;
    upsertMilestone({ initiative_id: initiativeId, text, done: false, sort_order: order });
  };
  const onToggleMilestone = (milestoneId) => {
    const m = goalMilestones.find((x) => x.id === milestoneId);
    if (m) upsertMilestone({ ...m, done: !m.done });
  };
  const onRenameMilestone = (milestoneId, text) => {
    const m = goalMilestones.find((x) => x.id === milestoneId);
    if (!m || text === m.text) return;
    upsertMilestone({ ...m, text });
  };
  const onDeleteMilestone = (milestoneId) => {
    const m = goalMilestones.find((x) => x.id === milestoneId);
    if (!m) return;
    const i = goalInitiatives.find((x) => x.id === m.initiative_id);
    const g = i ? goals.find((x) => x.id === i.goal_id) : null;
    const staffName = g ? staff.find((s) => s.key === g.staff_key)?.name || '' : '';
    removeMilestoneRow(milestoneId).then(() => {
      showToast();
      notifyAdmins(`${staffName}さんのマイルストーン「${m.text}」が削除されました`);
    });
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
  const onSaveMonthlyEvalComment = (recordId, comment) => {
    const r = monthlyEvalRecords.find((x) => x.id === recordId);
    if (!r) return;
    upsertMonthlyEvalRecord({ ...r, comment }).then(() => {
      showToast();
      notify(r.staff_key, 'eval_comment', `${monthLabel(r.year_month)}の月次評価にコメントが届きました`);
    });
  };

  const topbarTitle = view === 'personal' ? (staff.find((s) => s.key === si)?.name ?? '') : (VIEW_TITLES[view] || view);

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
        <div className="px-2.5 sm:px-3.5 pb-2.5 pt-11 sm:pt-[max(0.625rem,env(safe-area-inset-top))] border-b border-stone-100 flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <button type="button" onClick={() => setCollapsed((c) => !c)} className="text-stone-500 text-lg px-1.5 py-0.5 rounded hover:bg-stone-100 md:hidden">☰</button>
          <span className="text-base font-semibold flex-1 min-w-0 truncate">{topbarTitle}</span>
          <button type="button" onClick={() => { setQuickAddMode('task'); setQuickAddOpen(true); }} className="text-stone-900 text-base font-semibold leading-none px-1 flex-shrink-0" aria-label="タスク追加">＋</button>
          <button type="button" onClick={() => setCalendarOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-stone-100 flex-shrink-0" aria-label="カレンダー">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          {loggedInStaff && (
            <button type="button" onClick={() => goPersonal(loggedInUserKey)} className="text-[11px] text-stone-500 hover:text-stone-900 flex-shrink-0 whitespace-nowrap">
              {loggedInStaff.name}<span className="hidden sm:inline">（{roles.find((r) => r.key === loggedInStaff.role)?.label}）</span>
            </button>
          )}
          <button type="button" onClick={openNotifications} className="relative w-7 h-7 flex items-center justify-center rounded-full hover:bg-stone-100 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-[7px] h-[7px] rounded-full bg-[#E24B4A] border border-white" />
            )}
          </button>
          {loggedInStaff && (
            <button type="button" onClick={logout} className="px-2 sm:px-2.5 py-1 rounded-md border border-stone-300 bg-white text-[11px] flex-shrink-0 whitespace-nowrap">ログアウト</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'overview' && (
            <OverviewView
              staff={staff} roles={roles} tasks={tasks} poolTasks={poolTasks}
              onClaimPool={onClaimPool} onDeletePool={onDeletePool}
              onToggleTaskDone={onToggleTaskDone} onOpenPersonal={goPersonal}
              onDeleteTask={onDeleteTask} onSaveTaskEdit={onSaveTaskEdit} onTaskStatusChange={onTaskStatusChange}
              onReassignTask={onReassignTask} onReleaseTaskToPool={onReleaseTaskToPool}
            />
          )}
          {view === 'storetodos' && (
            <StoreTodosView
              staff={staff} roles={roles} storeTodos={storeTodos} storeMonthNotes={storeMonthNotes}
              onAdd={onAddStoreTodo} onToggle={onToggleStoreTodo} onDelete={onDeleteStoreTodo}
              onSaveComment={onSaveStoreMonthComment}
            />
          )}
          {view === 'settings' && loggedInUserKey && (
            <SettingsView
              staff={staff} roles={roles}
              isAdmin={isAdminRole(staff, roles, loggedInUserKey)}
              canAssignOwner={canAssignOwner(staff, roles, loggedInUserKey)}
              onReorderStaff={onReorderStaff} onUpdateStaffField={onUpdateStaffField} onDeleteStaff={onDeleteStaff} onAddStaff={onAddStaff}
              onTogglePerm={onTogglePerm} onToggleViewScope={onToggleViewScope} onAddRole={onAddRole} onDeleteRole={onDeleteRole}
              onResetPassword={onResetPassword} onChangeOwnPassword={onChangeOwnPassword}
            />
          )}
          {view === 'owner' && (
            viewerIsOwner ? (
              <OwnerView
                staff={staff} roles={roles} tasks={tasks} goals={goals} goalInitiatives={goalInitiatives} goalMilestones={goalMilestones}
                onGoPersonalEval={goPersonalEval}
                onToggleTaskDone={onToggleTaskDone} onDeleteTask={onDeleteTask} onSaveTaskEdit={onSaveTaskEdit}
                onTaskStatusChange={onTaskStatusChange} onReassignTask={onReassignTask} onReleaseTaskToPool={onReleaseTaskToPool}
              />
            ) : null
          )}
          {view === 'personal' && si && (
            <PersonalView
              staffKey={si} staff={staff} roles={roles} tasks={tasks} goals={goals} goalInitiatives={goalInitiatives} goalMilestones={goalMilestones}
              storeTodos={storeTodos} evalRecords={evalRecords} monthlyEvalRecords={monthlyEvalRecords}
              initialTab={personalTab}
              onToggleTaskDone={onToggleTaskDone} onDeleteTask={onDeleteTask}
              onSaveTaskEdit={onSaveTaskEdit} onTaskStatusChange={onTaskStatusChange} onReassignTask={onReassignTask} onReleaseTaskToPool={onReleaseTaskToPool}
              onAddGoal={onAddGoal} onRenameGoal={onRenameGoal} onDeleteGoal={onDeleteGoal}
              onAddInitiative={onAddInitiative} onRenameInitiative={onRenameInitiative} onDeleteInitiative={onDeleteInitiative}
              onAddMilestone={onAddMilestone} onToggleMilestone={onToggleMilestone}
              onRenameMilestone={onRenameMilestone} onDeleteMilestone={onDeleteMilestone}
              onSaveProfile={onSaveProfile} onCreateRecord={onCreateRecord} onSaveRecord={onSaveRecord} onPrint={onPrint}
              onSaveMonthlyEvalComment={onSaveMonthlyEvalComment}
            />
          )}
        </div>
      </div>
      <LoginModal staff={staff} roles={roles} />
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        staff={staff}
        duties={loggedInStaff?.duties || []}
        onAddTask={(fields) => onAddTask(loggedInUserKey, fields)}
        onAddPool={onAddPool}
        onSendMemo={onSendMemo}
        initialMode={quickAddMode}
      />
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onDeleteNotification={onDeleteNotification}
        onClearNotifications={onClearNotifications}
        onOpenMemoCompose={() => { setNotifOpen(false); setQuickAddMode('memo'); setQuickAddOpen(true); }}
      />
      <CalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        staff={staff}
        roles={roles}
        tasks={tasks}
        onOpenPersonal={goPersonal}
      />
      <Toast />
      <PrintRecord data={printData} onDone={() => setPrintData(null)} />
    </div>
  );
}
