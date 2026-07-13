import { useRef, useState } from 'react';
import RichTextField from '../common/RichTextField';
import { today } from '../../utils';

export default function EvalRecordForm({ record, interviewerOptions, onSave, onCancel }) {
  const isEdit = !!record;
  const [date, setDate] = useState(record?.date || today);
  const [byName, setByName] = useState(record?.by_name || interviewerOptions[0] || '');
  const refs = {
    motivation: useRef(null), review: useRef(null), goal: useRef(null), team: useRef(null), other: useRef(null),
    todo: useRef(null), actionPlan: useRef(null), eval: useRef(null),
  };

  const save = () => {
    if (!date) { alert('面談日を入力してください'); return; }
    onSave({
      date,
      by_name: byName,
      motivation_html: refs.motivation.current.getHTML(),
      review_html: refs.review.current.getHTML(),
      goal_html: refs.goal.current.getHTML(),
      team_html: refs.team.current.getHTML(),
      other_html: refs.other.current.getHTML(),
      todo_html: refs.todo.current.getHTML(),
      action_plan_html: refs.actionPlan.current.getHTML(),
      eval_html: refs.eval.current.getHTML(),
    });
  };

  return (
    <div className="flex flex-col gap-2.5 max-w-[560px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <div className="text-[11px] font-medium text-stone-500">面談日</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-[9px] py-1.5 rounded-md border border-stone-300 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[11px] font-medium text-stone-500">面談者</div>
          <select value={byName} onChange={(e) => setByName(e.target.value)} className="px-[9px] py-1.5 rounded-md border border-stone-300 text-sm">
            {interviewerOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="text-[11px] font-semibold text-stone-500 mt-1.5">面談内容</div>
      <RichTextField ref={refs.motivation} label="最近の状態・モチベーション" defaultValue={record?.motivation_html} />
      <RichTextField ref={refs.review} label="前回の目標・振り返り（自己評価）" defaultValue={record?.review_html} />
      <RichTextField ref={refs.goal} label="新しい目標・次の課題" defaultValue={record?.goal_html} />
      <RichTextField ref={refs.team} label="チーム・会社・働き方" defaultValue={record?.team_html} />
      <RichTextField ref={refs.other} label="その他" defaultValue={record?.other_html} />
      <div className="text-[11px] font-semibold text-stone-500 mt-1.5">目標アクションプラン</div>
      <RichTextField ref={refs.todo} label="TO DO" defaultValue={record?.todo_html} />
      <RichTextField ref={refs.actionPlan} label="アクションプラン" defaultValue={record?.action_plan_html} />
      <div className="text-[11px] font-semibold text-stone-500 mt-1.5">この回についての総評</div>
      <RichTextField ref={refs.eval} defaultValue={record?.eval_html} />
      <div className="flex gap-2 mt-1.5">
        <button type="button" onClick={save} className="px-4 py-2 rounded-md bg-stone-900 text-white text-[13px] font-medium">{isEdit ? '保存する' : 'この内容で記録を作成'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border border-stone-300 bg-white text-[13px]">キャンセル</button>
      </div>
    </div>
  );
}
