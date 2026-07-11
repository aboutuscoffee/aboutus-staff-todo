import { useState } from 'react';
import { monthLabel } from '../../utils';

function CommentBlock({ record, canEdit, onSaveComment }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(record.comment || '');
  const comment = record.comment || '';

  const save = () => {
    onSaveComment(record.id, draft.trim());
    setEditing(false);
  };

  return (
    <div className="mt-2.5 pt-2 border-t border-stone-200/70">
      <div className="text-[10px] text-stone-500 mb-1">SM/GM/オーナーからのコメント</div>
      {editing ? (
        <div className="flex flex-col gap-1.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            className="w-full px-[7px] py-1 rounded-md border border-stone-300 text-xs resize-none"
          />
          <div className="flex gap-1.5">
            <button type="button" onClick={() => { setDraft(comment); setEditing(false); }} className="px-2 py-0.5 rounded-md border border-stone-300 bg-white text-[11px]">キャンセル</button>
            <button type="button" onClick={save} className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[11px]">保存</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-1.5">
          <p className="text-xs text-stone-600 flex-1 whitespace-pre-wrap">{comment || (canEdit ? '' : 'コメントはありません')}</p>
          {canEdit && (
            <button type="button" onClick={() => { setDraft(comment); setEditing(true); }} className="text-stone-400 hover:text-stone-900 text-xs flex-shrink-0">✎</button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MonthlyEvalView({ records, canEdit, onSaveComment }) {
  if (records.length === 0) {
    return <p className="text-xs text-stone-400 text-center py-8">まだ月次データがありません（毎月1日以降に前月分が保存されます）</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {records.map((r) => (
        <div key={r.id} className="rounded-2xl border border-stone-100 bg-white p-4">
          <div className="text-sm font-medium mb-2.5">{monthLabel(r.year_month)}</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#F5F3EE] rounded-md p-2.5 text-center">
              <div className="text-lg font-medium">{r.completed_tasks}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">完了タスク数</div>
            </div>
            <div className="bg-[#F5F3EE] rounded-md p-2.5 text-center">
              <div className="text-lg font-medium">{r.total_tasks}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">タスク数</div>
            </div>
            <div className="bg-[#F5F3EE] rounded-md p-2.5 text-center">
              <div className="text-lg font-medium">{r.on_time_pct === null ? '—' : `${r.on_time_pct}%`}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">期限内完了率</div>
            </div>
            <div className="bg-[#F5F3EE] rounded-md p-2.5 text-center">
              <div className="text-lg font-medium">{r.goal_pct}%</div>
              <div className="text-[10px] text-stone-500 mt-0.5">成長目標達成率</div>
            </div>
          </div>
          <CommentBlock record={r} canEdit={canEdit} onSaveComment={onSaveComment} />
        </div>
      ))}
    </div>
  );
}
