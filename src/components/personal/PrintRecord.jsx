import { useEffect } from 'react';
import { isHtmlEmpty } from '../../utils';

function Sec({ label, value }) {
  return (
    <div className="mb-3.5">
      <div className="text-xs font-semibold text-[#555] mb-1">{label}</div>
      <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{isHtmlEmpty(value) ? '未記入' : <span dangerouslySetInnerHTML={{ __html: value }} />}</div>
    </div>
  );
}

export default function PrintRecord({ data, onDone }) {
  useEffect(() => {
    if (!data) return;
    const handleAfterPrint = () => onDone();
    window.addEventListener('afterprint', handleAfterPrint);
    const t = setTimeout(() => window.print(), 50);
    return () => { clearTimeout(t); window.removeEventListener('afterprint', handleAfterPrint); };
  }, [data, onDone]);

  if (!data) return <div id="print-area" />;
  const { staffName, record: r } = data;

  return (
    <div id="print-area">
      <div className="text-xl font-bold mb-3.5">面談記録</div>
      <div className="flex gap-5 text-[13px] text-[#333] mb-5 flex-wrap">
        <span><b>スタッフ</b>：{staffName}</span>
        <span><b>面談日</b>：{r.date}</span>
        <span><b>面談者</b>：{r.by_name}</span>
      </div>
      <Sec label="最近の状態・モチベーション" value={r.motivation_html} />
      <Sec label="前回の目標・振り返り" value={r.review_html} />
      <Sec label="新しい目標・次の課題" value={r.goal_html} />
      <Sec label="チーム・会社・働き方" value={r.team_html} />
      <Sec label="その他" value={r.other_html} />
      <div className="border-t border-[#ccc] my-[18px]" />
      <div className="text-xs font-semibold text-[#555] mb-2">目標アクションプラン</div>
      <Sec label="短期アクション（1〜2週間）" value={r.short_html} />
      <Sec label="中期アクション（1ヶ月）" value={r.mid_html} />
      <Sec label="習慣化のポイント" value={r.habit_html} />
      <div className="border-t border-[#ccc] my-[18px]" />
      <Sec label="この回についての総評" value={r.eval_html} />
      <div className="text-[11px] text-[#888] mt-6">作成日：{r.created_at}　最終編集日：{r.updated_at}</div>
    </div>
  );
}
