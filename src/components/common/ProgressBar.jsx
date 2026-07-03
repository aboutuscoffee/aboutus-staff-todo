export default function ProgressBar({ pct }) {
  return (
    <div className="h-1 rounded-full bg-stone-100 overflow-hidden mb-2">
      <div className="h-full rounded-full bg-[#1D9E75] transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
