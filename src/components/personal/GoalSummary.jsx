export default function GoalSummary({ goals }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-[14px_16px] mb-3">
      <div className="text-xs font-medium text-stone-500 mb-2">🌱 目標</div>
      {goals.length === 0 ? (
        <p className="text-xs text-stone-400">目標が設定されていません</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {goals.map((g) => (
            <li key={g.id} className="text-[15px] font-medium flex items-start gap-1.5 leading-snug">
              <span className="text-stone-300 flex-shrink-0">・</span>
              <span>{g.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
