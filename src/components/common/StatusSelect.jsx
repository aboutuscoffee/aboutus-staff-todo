import { STATUS_OPTIONS } from '../../constants';
import { statusClass } from '../../utils';

export default function StatusSelect({ value, onChange, disabled }) {
  const clsMap = {
    'st-ip': 'bg-[#E6F1FB] text-[#185FA5] border-[#B5D4F4]',
    'st-rv': 'bg-[#EEEDFE] text-[#3C3489] border-[#CECBF6]',
  };
  const cls = clsMap[statusClass(value)] || 'bg-stone-100 text-stone-500 border-stone-200';
  return (
    <select
      className={`text-[11px] px-[5px] py-[2px] rounded-full border font-medium outline-none cursor-pointer disabled:cursor-default disabled:opacity-60 ${cls}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}
