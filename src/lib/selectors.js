import { monthKeyRange } from '../utils';
import { findRole } from './permissions';
import { STORE_KEYS } from '../constants';
import { TRAINING_TOTAL, ONLINE_STORE_MODULE, ADVANCED_TRAINING_TOTAL } from './trainingData';

const PRIORITY_RANK = { high: 0, mid: 1, low: 2 };

function cmpDate(da, db) {
  da = da || '';
  db = db || '';
  if (da === db) return 0;
  return da < db ? -1 : 1;
}

export function taskCompare(criterion) {
  return (a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (criterion === 'priority') {
      const pa = PRIORITY_RANK[a.priority] ?? 1;
      const pb = PRIORITY_RANK[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
    } else if (criterion === 'workdate') {
      const c = cmpDate(a.workdate, b.workdate);
      if (c !== 0) return c;
    } else {
      const c = cmpDate(a.deadline, b.deadline);
      if (c !== 0) return c;
    }
    const c2 = cmpDate(a.deadline, b.deadline);
    if (c2 !== 0) return c2;
    return (a.duty || '').localeCompare(b.duty || '');
  };
}

export function sortTasks(tasks, criterion = 'deadline') {
  return tasks.slice().sort(taskCompare(criterion));
}

export function tasksForStaff(tasks, staffKey, criterion = 'deadline') {
  return sortTasks(tasks.filter((t) => t.staff_key === staffKey && !t.pending_approval), criterion);
}

export function pendingOffersForStaff(tasks, staffKey) {
  return tasks.filter((t) => t.staff_key === staffKey && t.pending_approval);
}

export function goalsForStaff(goals, goalInitiatives, goalMilestones, staffKey) {
  return goals
    .filter((g) => g.staff_key === staffKey)
    .map((g) => ({
      ...g,
      initiatives: goalInitiatives
        .filter((i) => i.goal_id === g.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({
          ...i,
          milestones: goalMilestones.filter((m) => m.initiative_id === i.id).sort((a, b) => a.sort_order - b.sort_order),
        })),
    }));
}

export function milestonesForStaffGoals(goals, goalInitiatives, goalMilestones, staffKey) {
  const staffGoalIds = new Set(goals.filter((g) => g.staff_key === staffKey).map((g) => g.id));
  const staffInitiativeIds = new Set(goalInitiatives.filter((i) => staffGoalIds.has(i.goal_id)).map((i) => i.id));
  return goalMilestones.filter((m) => staffInitiativeIds.has(m.initiative_id));
}

// item_id は `${groupIndex}-${subcategoryIndex}-${itemIndex}`。追加スキルアップ研修は
// 常に TRAINING_DATA の4グループの直後（groupIndex === 4）に位置するため、
// 通常研修の達成率からは除外し、追加研修側の集計にのみ含める。
const ADVANCED_GROUP_INDEX = 4;

export function trainingPctForStaff(trainingProgress, staffKey, hasOnlineStore) {
  const total = TRAINING_TOTAL + (hasOnlineStore ? ONLINE_STORE_MODULE.items.length : 0);
  const done = trainingProgress.filter(
    (p) => p.staff_key === staffKey && p.can && Number(p.item_id.split('-')[0]) !== ADVANCED_GROUP_INDEX
  ).length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function advancedTrainingPctForStaff(trainingProgress, staffKey) {
  const done = trainingProgress.filter(
    (p) => p.staff_key === staffKey && p.can && Number(p.item_id.split('-')[0]) === ADVANCED_GROUP_INDEX
  ).length;
  return ADVANCED_TRAINING_TOTAL ? Math.round((done / ADVANCED_TRAINING_TOTAL) * 100) : 0;
}

export function evalRecordsForStaff(evalRecords, staffKey) {
  return evalRecords.filter((r) => r.staff_key === staffKey).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function storeTodosForStore(storeTodos, storeKey, ym) {
  return storeTodos
    .filter((t) => t.store_key === storeKey && t.year_month === ym)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function pastStoreMonths(storeTodos, currentYm) {
  const seen = new Set();
  const combos = [];
  storeTodos.forEach((t) => {
    if (t.year_month === currentYm) return;
    const key = `${t.store_key}|${t.year_month}`;
    if (seen.has(key)) return;
    seen.add(key);
    combos.push({ storeKey: t.store_key, yearMonth: t.year_month });
  });
  return combos.sort((a, b) => {
    if (a.yearMonth !== b.yearMonth) return a.yearMonth < b.yearMonth ? 1 : -1;
    return STORE_KEYS.indexOf(a.storeKey) - STORE_KEYS.indexOf(b.storeKey);
  });
}

export function storeMonthNoteFor(storeMonthNotes, storeKey, ym) {
  return storeMonthNotes.find((n) => n.store_key === storeKey && n.year_month === ym) || null;
}

export function allDuties(staff) {
  const set = new Set();
  staff.forEach((s) => (s.duties || []).forEach((d) => set.add(d)));
  set.add('その他');
  return Array.from(set);
}

export function monthlyEvalRecordsForStaff(monthlyEvalRecords, staffKey) {
  return monthlyEvalRecords
    .filter((r) => r.staff_key === staffKey)
    .slice()
    .sort((a, b) => (a.year_month < b.year_month ? 1 : -1));
}

export function computeMonthlyStats(tasks, goals, goalInitiatives, goalMilestones, staffKey, ym) {
  const { start, end, nextStart, nextEnd } = monthKeyRange(ym);
  const staffTasks = tasks.filter((t) => t.staff_key === staffKey && !t.pending_approval);

  const completedTasks = staffTasks.filter(
    (t) => t.done && t.done_date && t.done_date >= start && t.done_date <= end
  ).length;

  const totalTasks = staffTasks.filter((t) => {
    if (!t.deadline) return false;
    if (t.deadline >= start && t.deadline <= end) return true;
    if (t.deadline > end && t.workdate && t.workdate >= start && t.workdate <= end) return true;
    if (t.deadline >= nextStart && t.deadline <= nextEnd && !t.workdate) return true;
    return false;
  }).length;

  const onTimeBucket = staffTasks.filter((t) => {
    if (!t.deadline) return false;
    if (t.deadline >= start && t.deadline <= end) return true;
    if (t.deadline >= nextStart && t.deadline <= nextEnd && t.done && t.done_date && t.done_date >= start && t.done_date <= end) return true;
    return false;
  });
  const onTimePct = onTimeBucket.length
    ? Math.round((onTimeBucket.filter((t) => t.done && t.done_date && t.done_date <= t.deadline).length / onTimeBucket.length) * 100)
    : null;

  const milestones = milestonesForStaffGoals(goals, goalInitiatives, goalMilestones, staffKey);
  const goalPct = milestones.length ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100) : 0;

  return { totalTasks, completedTasks, onTimePct, goalPct };
}

export function computeSummary(tasks, goals, goalInitiatives, goalMilestones, staffKey, monthAgo, monthStart) {
  const staffTasks = tasks.filter((t) => t.staff_key === staffKey && !t.pending_approval);
  const total = staffTasks.length;
  const doneThisMonth = staffTasks.filter((t) => t.done && t.done_date && t.done_date >= monthStart).length;
  const recent = staffTasks.filter((t) => t.done && t.done_date && t.done_date >= monthAgo && t.deadline);
  const onTimePct = recent.length ? Math.round((recent.filter((t) => t.done_date <= t.deadline).length / recent.length) * 100) : null;
  const milestones = milestonesForStaffGoals(goals, goalInitiatives, goalMilestones, staffKey);
  const goalPct = milestones.length ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100) : 0;
  return { total, doneThisMonth, onTimePct, goalPct };
}

export function pendingReviewTasks(tasks, criterion = 'deadline') {
  return tasks.filter((t) => t.status === 'review' && !t.done).sort(taskCompare(criterion));
}

export function ownerStaffSummaries(staff, roles, tasks, goals, goalInitiatives, goalMilestones, monthAgo) {
  return staff
    .filter((s) => !findRole(roles, s.role)?.is_owner)
    .map((s) => {
      const staffTasks = tasks.filter((t) => t.staff_key === s.key && !t.pending_approval);
      const poolDoneCount = staffTasks.filter((t) => t.done && t.from_pool).length;
      const recent = staffTasks.filter((t) => t.done && t.done_date && t.done_date >= monthAgo && t.deadline);
      const onTimePct = recent.length ? Math.round((recent.filter((t) => t.done_date <= t.deadline).length / recent.length) * 100) : null;
      const milestones = milestonesForStaffGoals(goals, goalInitiatives, goalMilestones, s.key);
      const goalPct = milestones.length ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100) : 0;
      return { key: s.key, name: s.name, duties: s.duties || [], overallEvalHtml: s.overall_eval_html, goalPct, poolDoneCount, onTimePct };
    });
}
