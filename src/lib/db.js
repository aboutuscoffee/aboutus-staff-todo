import { supabase } from './supabase';
import { fourMoAgo } from '../utils';

function stripMeta(obj) {
  const { updated_at, ...rest } = obj;
  return rest;
}

export async function fetchAll() {
  const [staff, roles, tasks, poolTasks, goals, goalMilestones, storeTodos, evalRecords] = await Promise.all([
    supabase.from('staff').select('*').order('sort_order'),
    supabase.from('roles').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('pool_tasks').select('*'),
    supabase.from('goals').select('*').order('sort_order'),
    supabase.from('goal_milestones').select('*').order('sort_order'),
    supabase.from('store_todos').select('*').order('sort_order'),
    supabase.from('eval_records').select('*').order('date'),
  ]);

  for (const res of [staff, roles, tasks, poolTasks, goals, goalMilestones, storeTodos, evalRecords]) {
    if (res.error) throw new Error(res.error.message);
  }

  // 完了から4ヶ月以上経過したタスクは読み込み時に削除する
  const staleIds = (tasks.data ?? [])
    .filter((t) => t.done && t.done_date && t.done_date <= fourMoAgo)
    .map((t) => t.id);
  const freshTasks = (tasks.data ?? []).filter((t) => !staleIds.includes(t.id));
  if (staleIds.length) {
    supabase.from('tasks').delete().in('id', staleIds);
  }

  return {
    staff: staff.data ?? [],
    roles: roles.data ?? [],
    tasks: freshTasks,
    poolTasks: poolTasks.data ?? [],
    goals: goals.data ?? [],
    goalMilestones: goalMilestones.data ?? [],
    storeTodos: storeTodos.data ?? [],
    evalRecords: evalRecords.data ?? [],
  };
}

export async function upsertItem(table, item) {
  const { data, error } = await supabase.from(table).upsert(stripMeta(item)).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteItem(table, id, pk = 'id') {
  const { error } = await supabase.from(table).delete().eq(pk, id);
  if (error) throw new Error(error.message);
}
