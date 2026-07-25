import { dlLabel } from '../../utils';

export default function DateBadge({ date, cls, prefix }) {
  if (!date) return null;
  const clsMap = {
    overdue: 'bg-[#FCEBEB] text-[#A32D2D]',
    'due-soon': 'bg-[#FCEBEB] text-[#A32D2D]',
  };
  return (
    <span className={`text-[11px] px-[6px] py-[2px] rounded-full whitespace-nowrap ${clsMap[cls] || 'bg-stone-100 text-stone-500'}`}>
      {prefix ? `${prefix} ` : ''}
      {dlLabel(date)}
    </span>
  );
}
