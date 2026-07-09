export const STORE_INFO = {
  fushimi: { label: '伏見店' },
  nijo: { label: '二条城店' },
};
export const STORE_KEYS = Object.keys(STORE_INFO);

export const STATUS_LABELS = { review: '確認待ち' };

export const PRIORITY_OPTIONS = [
  { v: 'high', l: '高' },
  { v: 'mid', l: '中' },
  { v: 'low', l: '低' },
];
export const PRIORITY_LABELS = { high: '高', mid: '中', low: '低' };
export const PRIORITY_CLASSES = {
  high: 'bg-[#FCEBEB] text-[#A32D2D]',
  mid: 'bg-[#FAEEDA] text-[#854F0B]',
  low: 'bg-stone-100 text-stone-400',
};

export const MAX_ATTEMPTS = 5;

export const BASE_ROLE_KEYS = ['staff', 'SM', 'GM', 'owner'];
