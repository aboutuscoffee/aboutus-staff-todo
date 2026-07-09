const OPTIONS = [
  { v: 'priority', l: '優先度' },
  { v: 'workdate', l: '作業日' },
  { v: 'deadline', l: '期限' },
];

export default function SortChips({ value, onChange, options }) {
  const shown = options ? OPTIONS.filter((o) => options.includes(o.v)) : OPTIONS;
  return (
    <div className="flex gap-1.5 mb-2.5">
      {shown.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`text-xs px-[10px] py-1 rounded-full border ${
            value === o.v ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'
          }`}
        >{o.l}</button>
      ))}
    </div>
  );
}
