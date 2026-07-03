export const STORE_INFO = {
  fushimi: { label: '伏見店' },
  nijo: { label: '二条城店' },
};
export const STORE_KEYS = Object.keys(STORE_INFO);

export const STATUS_OPTIONS = [
  { v: '', l: '— なし' },
  { v: 'inprogress', l: '取組中' },
  { v: 'review', l: '確認待ち' },
];
export const STATUS_LABELS = { inprogress: '取組中', review: '確認待ち' };

export const MAX_ATTEMPTS = 5;

export const BASE_ROLE_KEYS = ['staff', 'SM', 'GM', 'owner'];
