import { fmtMin } from '../../utils';

export default function TimeBadge({ minutes }) {
  const label = fmtMin(minutes);
  if (!label) return null;
  return <span className="text-[11px] px-[6px] py-[2px] rounded-full bg-[#E1F5EE] text-[#085041] whitespace-nowrap">⏱ {label}</span>;
}
