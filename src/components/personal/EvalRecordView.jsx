import { isHtmlEmpty } from '../../utils';

function StaticSec({ label, value }) {
  const empty = isHtmlEmpty(value);
  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1">{label}</div>
      {empty ? <div className="text-[13px] text-stone-400 italic">未記入</div> : <div className="text-[13px] leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: value }} />}
    </div>
  );
}

function ActionRow({ label, value }) {
  const empty = isHtmlEmpty(value);
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="text-[11px] font-semibold text-stone-500 mb-0.5">{label}</div>
      {empty ? <div className="text-xs text-stone-400 italic">未記入</div> : <div className="text-xs leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: value }} />}
    </div>
  );
}

export default function EvalRecordView({ records, selectedId, onSelectId, canEdit, onEdit, onPrint }) {
  const r = records.find((x) => x.id === selectedId);
  const pills = records.slice().reverse().map((rec) => (
    <span
      key={rec.id}
      onClick={() => onSelectId(rec.id)}
      className={`text-[11px] px-2 py-1 rounded-full border border-stone-300 cursor-pointer mr-1 ${rec.id === selectedId ? 'bg-stone-100 font-medium' : ''}`}
    >
      {rec.date}
    </span>
  ));

  if (!r) {
    return (
      <div>
        <div className="mb-3.5">{pills}</div>
        <p className="text-xs text-stone-500">記録がありません</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3.5">{pills}</div>
      <div className="flex justify-between items-start mb-[18px] flex-wrap gap-2.5">
        <div className="flex gap-[18px] flex-wrap">
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-stone-400 font-semibold uppercase">面談日</div>
            <div className="text-[13px] font-medium">{r.date}</div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-stone-400 font-semibold uppercase">面談者</div>
            <div className="text-[13px] font-medium">{r.by_name}</div>
          </div>
        </div>
        <button type="button" onClick={() => onPrint(r.id)} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-[11px]">PDF出力</button>
      </div>
      <StaticSec label="最近の状態・モチベーション" value={r.motivation_html} />
      <StaticSec label="前回の目標・振り返り" value={r.review_html} />
      <StaticSec label="新しい目標・次の課題" value={r.goal_html} />
      <StaticSec label="チーム・会社・働き方" value={r.team_html} />
      <StaticSec label="その他" value={r.other_html} />
      <div className="h-px bg-stone-100 my-[18px]" />
      <div className="bg-stone-100 rounded-2xl p-[14px_16px] mb-[18px]">
        <div className="text-[10px] font-bold text-stone-400 uppercase mb-2.5">目標アクションプラン</div>
        <ActionRow label="TO DO" value={r.todo_html} />
        <ActionRow label="アクションプラン" value={r.action_plan_html} />
      </div>
      <div className="h-px bg-stone-100 my-[18px]" />
      <StaticSec label="この回についての総評" value={r.eval_html} />
      <div className="flex justify-between items-center mt-6 pt-3 border-t border-stone-100">
        <div className="flex gap-4 text-[11px] text-stone-400">
          <span>作成日：{r.created_at}</span>
          <span>最終編集日：{r.updated_at}</span>
        </div>
        {canEdit && (
          <button type="button" onClick={() => onEdit(r.id)} className="flex items-center gap-1 px-3.5 py-1.5 rounded-md border border-stone-300 bg-white text-xs">✎ この記録を編集</button>
        )}
      </div>
    </div>
  );
}
