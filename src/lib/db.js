import { supabase } from './supabase';
import { fourMoAgo } from '../utils';

function stripMeta(obj) {
  const { updated_at, ...rest } = obj;
  return rest;
}

export async function fetchAll() {
  const [staff, roles, tasks, poolTasks, goals, goalInitiatives, goalMilestones, storeTodos, evalRecords, monthlyEvalRecords, storeMonthNotes] = await Promise.all([
    supabase.from('staff').select('*').order('sort_order'),
    supabase.from('roles').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('pool_tasks').select('*'),
    supabase.from('goals').select('*').order('sort_order'),
    supabase.from('goal_initiatives').select('*').order('sort_order'),
    supabase.from('goal_milestones').select('*').order('sort_order'),
    supabase.from('store_todos').select('*').order('sort_order'),
    supabase.from('eval_records').select('*').order('date'),
    supabase.from('monthly_eval_records').select('*'),
    supabase.from('store_month_notes').select('*'),
  ]);

  for (const res of [staff, roles, tasks, poolTasks, goals, goalInitiatives, goalMilestones, storeTodos, evalRecords, monthlyEvalRecords, storeMonthNotes]) {
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
    goalInitiatives: goalInitiatives.data ?? [],
    goalMilestones: goalMilestones.data ?? [],
    storeTodos: storeTodos.data ?? [],
    evalRecords: evalRecords.data ?? [],
    monthlyEvalRecords: monthlyEvalRecords.data ?? [],
    storeMonthNotes: storeMonthNotes.data ?? [],
  };
}

export async function upsertItem(table, item, pk = 'id') {
  const clean = stripMeta(item);
  const idVal = clean[pk];
  if (idVal != null) {
    const { [pk]: _omit, ...fields } = clean;
    const { data, error } = await supabase.from(table).update(fields).eq(pk, idVal).select();
    if (error) throw new Error(error.message);
    if (data && data.length > 0) return data[0];
    // pk was pre-assigned client-side (e.g. new staff/role) but no row exists yet — insert it
    const { data: inserted, error: insertError } = await supabase.from(table).insert(clean).select().single();
    if (insertError) throw new Error(insertError.message);
    return inserted;
  }
  const { data, error } = await supabase.from(table).insert(clean).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteItem(table, id, pk = 'id') {
  const { error } = await supabase.from(table).delete().eq(pk, id);
  if (error) throw new Error(error.message);
}

export async function renameWithTimestamp(table, id, fields) {
  const { data, error } = await supabase.from(table).update({ ...fields, edited_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchNotifications(staffKey) {
  // メモは2週間経過したら自動削除する
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('notifications').delete().eq('staff_key', staffKey).eq('type', 'memo').lt('created_at', twoWeeksAgo);

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('staff_key', staffKey)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function markNotificationsRead(staffKey) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('staff_key', staffKey)
    .eq('read', false);
  if (error) throw new Error(error.message);
}

export async function deleteNotification(id) {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function clearNotifications(staffKey) {
  const { error } = await supabase.from('notifications').delete().eq('staff_key', staffKey).neq('type', 'memo');
  if (error) throw new Error(error.message);
}
