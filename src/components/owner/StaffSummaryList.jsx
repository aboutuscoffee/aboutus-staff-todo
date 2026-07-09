import { ownerStaffSummaries } from '../../lib/selectors';
import { monthAgo, isHtmlEmpty } from '../../utils';

export default function StaffSummaryList({ staff, roles, tasks, goals, goalMilestones, onGoPersonalEval }) {
  const summaries = ownerStaffSummaries(staff, roles, tasks, goals, goalMilestones, monthAgo);

  return (
    <div className="flex flex-col gap-3">
      {summaries.map((s) => (
        <div key={s.key} className="rounded-2xl border border-stone-100 bg-white p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-medium">{s.name}</span>
            <button type="button" onClick={() => onGoPersonalEval(s.key)} className="text-xs text-stone-500 hover:text-stone-900 underline">評価ページを開く</button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#F5F3EE] rounded-md p-2.5 text-center">
              <div className="text-base font-medium">{s.goalPct}%</div>
              <div className="text-[10px] text-stone-500 mt-0.5">目標進捗率</div>
            </div>
            <div className="bg-[#F5F3EE] rounded-md p-2.5 text-center">
              <div className="text-base font-medium">{s.poolDoneCount}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">依頼タスク遂行数</div>
            </div>
            <div className="bg-[#F5F3EE] rounded-md p-2.5 text-center">
              <div className="text-base font-medium">{s.onTimePct === null ? '—' : `${s.onTimePct}%`}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">期限内完了率</div>
            </div>
          </div>
          <div className="text-[11px] text-stone-500 mb-1">担当業務</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {s.duties.length === 0 ? (
              <span className="text-xs text-stone-300">未設定</span>
            ) : s.duties.map((d) => (
              <span key={d} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{d}</span>
            ))}
          </div>
          <div className="text-[11px] text-stone-500 mb-1">SM/GMからの総評</div>
          {isHtmlEmpty(s.overallEvalHtml) ? (
            <p className="text-xs text-stone-300">まだ総評コメントがありません</p>
          ) : (
            <div className="text-[13px] text-stone-700 leading-loose break-words" dangerouslySetInnerHTML={{ __html: s.overallEvalHtml }} />
          )}
        </div>
      ))}
    </div>
  );
}
