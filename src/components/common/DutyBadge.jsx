export default function DutyBadge({ duty }) {
  const d = duty || 'その他';
  return (
    <span className="text-[11px] px-[7px] py-[2px] rounded-full font-medium whitespace-nowrap bg-stone-100 text-stone-500">
      {d}
    </span>
  );
}
