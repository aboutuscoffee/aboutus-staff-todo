import { isHtmlEmpty } from '../../utils';

function DutyChipsView({ list }) {
  if (!list || !list.length) return <div className="text-sm text-stone-400 italic">未設定</div>;
  return (
    <div>
      {list.map((d) => (
        <span key={d} className={`inline-block text-[11px] px-[9px] py-[3px] rounded-full mr-1.5 mb-1.5 font-medium ${d === 'その他' ? 'bg-stone-100 text-stone-400' : 'bg-[#EEEDFE] text-[#3C3489]'}`}>{d}</span>
      ))}
    </div>
  );
}

function Block({ title, html }) {
  const empty = isHtmlEmpty(html);
  return (
    <div className="mb-[18px]">
      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wide mb-1.5">{title}</div>
      {empty ? <div className="text-[13px] text-stone-400 italic">未記入</div> : <div className="text-sm leading-loose break-words" dangerouslySetInnerHTML={{ __html: html }} />}
    </div>
  );
}

export default function EvalProfileView({ staffMember, canEdit, onEdit }) {
  const p = staffMember;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <span className="text-[11px] text-stone-400">入社日：{p.hire_date || '未記入'}</span>
      </div>
      <div className="text-sm font-semibold mb-[18px] pb-2.5 border-b border-stone-100">{p.position || '役職未設定'}</div>
      <div className="mb-[18px]">
        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wide mb-1.5">担当業務</div>
        <DutyChipsView list={p.duties} />
      </div>
      <Block title="強み・得意なこと" html={p.strengths_html} />
      <Block title="特記事項・課題" html={p.notes_html} />
      <div className="bg-stone-100 rounded-2xl p-4 mt-1.5">
        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wide mb-2">GM / SM からの総評</div>
        {isHtmlEmpty(p.overall_eval_html) ? <div className="text-[13px] text-stone-400 italic">未記入</div> : <div className="text-sm leading-loose break-words" dangerouslySetInnerHTML={{ __html: p.overall_eval_html }} />}
      </div>
      {canEdit && (
        <div className="mt-6 pt-3 border-t border-stone-100 flex justify-end">
          <button type="button" onClick={onEdit} className="flex items-center gap-1 px-3.5 py-1.5 rounded-md border border-stone-300 bg-white text-xs">✎ プロファイルを編集</button>
        </div>
      )}
    </div>
  );
}
