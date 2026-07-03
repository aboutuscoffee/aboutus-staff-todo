export default function DutyBadge({ duty }) {
  const d = duty || 'その他';
  const other = d === 'その他';
  return (
    <span
      className={`text-[11px] px-[7px] py-[2px] rounded-full font-medium whitespace-nowrap ${
        other ? 'bg-stone-100 text-stone-400' : 'bg-[#EEEDFE] text-[#3C3489]'
      }`}
    >
      {d}
    </span>
  );
}
