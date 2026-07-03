function isoDate(d) {
  return d.toISOString().split('T')[0];
}

export const today = isoDate(new Date());
export const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoDate(d);
})();
export const monthAgo = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return isoDate(d);
})();
export const fourMoAgo = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 4);
  return isoDate(d);
})();
export const thisMonth = (() => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
})();

export function toMin(value, unit) {
  const n = parseFloat(value);
  if (isNaN(n) || n <= 0) return null;
  return unit === 'hr' ? Math.round(n * 60) : Math.round(n);
}

export function fmtMin(m) {
  if (!m) return null;
  if (m < 60) return `${m}分`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}時間${r}分` : `${h}時間`;
}

export function dlClass(d, done) {
  if (done || !d) return '';
  if (d < today) return 'overdue';
  if (d === today) return 'due-soon';
  return '';
}

export function dlLabel(d) {
  if (!d) return '';
  if (d === today) return '今日';
  if (d === tomorrow) return '明日';
  return d.slice(5).replace('-', '/');
}

export function statusClass(s) {
  return s === 'inprogress' ? 'st-ip' : s === 'review' ? 'st-rv' : '';
}

export async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isHtmlEmpty(html) {
  if (!html) return true;
  const t = document.createElement('div');
  t.innerHTML = html;
  return !t.textContent.trim();
}
