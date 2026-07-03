export function tasksForStaff(tasks, staffKey) {
  return tasks
    .filter((t) => t.staff_key === staffKey)
    .slice()
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const da = a.deadline || '', db = b.deadline || '';
      if (da !== db) return da < db ? -1 : 1;
      return (a.duty || '').localeCompare(b.duty || '');
    });
}

export function goalsForStaff(goals, goalMilestones, staffKey) {
  return goals
    .filter((g) => g.staff_key === staffKey)
    .map((g) => ({
      ...g,
      milestones: goalMilestones.filter((m) => m.goal_id === g.id).sort((a, b) => a.sort_order - b.sort_order),
    }));
}

export function evalRecordsForStaff(evalRecords, staffKey) {
  return evalRecords.filter((r) => r.staff_key === staffKey).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function storeTodosForStore(storeTodos, storeKey) {
  return storeTodos.filter((t) => t.store_key === storeKey).slice().sort((a, b) => a.sort_order - b.sort_order);
}

export function allDuties(staff) {
  const set = new Set();
  staff.forEach((s) => (s.duties || []).forEach((d) => set.add(d)));
  set.add('その他');
  return Array.from(set);
}

export function computeSummary(tasks, goals, goalMilestones, staffKey, monthAgo) {
  const staffTasks = tasks.filter((t) => t.staff_key === staffKey);
  const total = staffTasks.length;
  const done = staffTasks.filter((t) => t.done).length;
  const recent = staffTasks.filter((t) => t.done && t.done_date && t.done_date >= monthAgo && t.deadline);
  const onTimePct = recent.length ? Math.round((recent.filter((t) => t.done_date <= t.deadline).length / recent.length) * 100) : null;
  const milestones = goalMilestones.filter((m) => goals.some((g) => g.staff_key === staffKey && g.id === m.goal_id));
  const goalPct = milestones.length ? Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100) : 0;
  return { total, done, onTimePct, goalPct };
}
