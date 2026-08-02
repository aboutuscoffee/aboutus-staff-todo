import { isoDate } from '../utils';

const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];
export { WEEKDAY_LABELS };

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().split('T')[0];
}

export function isOccurrenceDate(rt, dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (rt.kind === 'weekly') {
    const date = new Date(y, m - 1, d);
    return (date.getDay() + 6) % 7 === rt.weekday;
  }
  const daysInMonth = new Date(y, m, 0).getDate();
  const targetDay = Math.min(rt.day_of_month, daysInMonth);
  return d === targetDay;
}

export function pendingOccurrences(rt, todayStr) {
  const startStr = rt.last_generated_date ? addDays(rt.last_generated_date, 1) : isoDate(new Date(rt.created_at));
  const dates = [];
  let cursor = startStr;
  let guard = 0;
  while (cursor <= todayStr && guard < 400) {
    if (isOccurrenceDate(rt, cursor)) dates.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return dates;
}

export function recurrenceLabel(rt) {
  return rt.kind === 'weekly' ? `毎週${WEEKDAY_LABELS[rt.weekday]}曜日` : `毎月${rt.day_of_month}日`;
}
