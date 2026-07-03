export default function SummaryCards({ summary }) {
  const cards = [
    { num: summary.total, label: '今日のタスク' },
    { num: summary.done, label: '完了タスク' },
    { num: summary.onTimePct === null ? '—' : `${summary.onTimePct}%`, label: <>期限内完了率<br /><span className="text-[9px] text-stone-400">過去30日</span></> },
    { num: `${summary.goalPct}%`, label: '成長目標達成率' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-[#F5F3EE] rounded-md p-2.5 text-center">
          <div className="text-lg font-medium">{c.num}</div>
          <div className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
