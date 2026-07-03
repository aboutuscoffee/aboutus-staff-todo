import { dlLabel } from '../../utils';

export default function DateBadge({ date, cls, prefix }) {
  if (!date) return null;
  const clsMap = {
    overdue: 'bg-[#FCEBEB] text-[#A32D2D]',
    'due-soon': 'bg-[#FAEEDA] text-[#854F0B]',
  };
  return (
    <span className={`text-[11px] px-[6px] py-[2px] rounded-full ${clsMap[cls] || 'bg-stone-100 text-stone-500'}`}>
      {prefix ? `${prefix} ` : ''}
      {dlLabel(date)}
    </span>
  );
}
