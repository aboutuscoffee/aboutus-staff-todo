export default function FilterSelect({ value, onChange, active, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`text-xs pl-[10px] pr-5 py-1 rounded-full border appearance-none ${active ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}
      >
        {children}
      </select>
      <span className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] ${active ? 'text-white' : 'text-stone-400'}`}>▼</span>
    </div>
  );
}
