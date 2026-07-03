import { useState } from 'react';
import DateBadge from '../common/DateBadge';
import TimeBadge from '../common/TimeBadge';
import { dlClass } from '../../utils';

export default function PoolDashboard({ poolTasks, staff, onAdd, onClaim, onDelete }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('todo');
  const [deadline, setDeadline] = useState('');
  const [assignSel, setAssignSel] = useState({});

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, kind, kind === 'assign' ? null : deadline || null);
    setText('');
    setDeadline('');
  };

  return (
    <div className="rounded-lg bg-[#F5F3EE] p-[14px_16px] mb-4">
      <div className="text-[13px] font-semibold mb-2.5">🎯 担当者募集中のタスク（誰でも自主的に取れます）</div>
      <div className="mb-1">
        {poolTasks.length === 0 && <div className="text-xs text-stone-400 px-0.5 py-2">現在、担当者募集中のタスクはありません</div>}
        {poolTasks.map((p) => {
          const dc = dlClass(p.deadline, false);
          const selKey = assignSel[p.id] ?? staff[0]?.key ?? '';
          return (
            <div key={p.id} className="flex justify-between items-start gap-2.5 flex-wrap p-[9px_11px] rounded-md border border-stone-100 bg-white mb-1.5">
              <div className="min-w-0 flex-1">
                <div className="text-[13px]">{p.text}</div>
                <div className="flex flex-wrap gap-1 mt-[5px]">
                  <span className={`text-[11px] px-[7px] py-[2px] rounded-full font-medium ${p.kind === 'assign' ? 'bg-[#EEEDFE] text-[#3C3489]' : 'bg-stone-100 text-stone-400'}`}>
                    {p.kind === 'assign' ? '担当' : 'ToDo'}
                  </span>
                  <TimeBadge minutes={p.minutes} />
                  <DateBadge date={p.deadline} prefix="期限" cls={dc} />
                </div>
              </div>
              <div className="flex gap-[5px] items-center flex-shrink-0">
                <select
                  value={selKey}
                  onChange={(e) => setAssignSel((s) => ({ ...s, [p.id]: e.target.value }))}
                  className="px-1.5 py-1 rounded-md border border-stone-300 text-xs"
                >
                  {staff.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
                </select>
                <button type="button" onClick={() => onClaim(p.id, selKey)} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-xs">この担当になる</button>
                <button type="button" onClick={() => onDelete(p.id)} className="text-stone-400 hover:bg-[#FCEBEB] hover:text-[#A32D2D] px-1 py-0.5 rounded text-xs">✕</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1 flex-wrap">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="タスク名を入力..."
          className="flex-1 min-w-[140px] px-[9px] py-1.5 rounded-md border border-stone-300 text-[13px]"
        />
        <div className="flex border border-stone-300 rounded-md overflow-hidden">
          <button type="button" onClick={() => setKind('todo')} className={`px-[9px] py-[3px] text-xs ${kind === 'todo' ? 'bg-stone-100 font-medium' : 'text-stone-500'}`}>ToDo</button>
          <button type="button" onClick={() => setKind('assign')} className={`px-[9px] py-[3px] text-xs ${kind === 'assign' ? 'bg-stone-100 font-medium' : 'text-stone-500'}`}>担当</button>
        </div>
        {kind !== 'assign' && (
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="px-2 py-1 rounded-md border border-stone-300 text-xs" />
        )}
        <button type="button" onClick={submit} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-[13px]">＋ プールに追加</button>
      </div>
    </div>
  );
}
