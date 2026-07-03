import { useState } from 'react';
import { fmtMin } from '../../utils';

export default function TaskEditPanel({ task, duties, otherStaff, onSave, onReassign, onReleaseToPool }) {
  const [text, setText] = useState(task.text);
  const [duty, setDuty] = useState(task.duty);
  const [minutesValue, setMinutesValue] = useState(task.minutes || '');
  const [unit, setUnit] = useState('min');
  const [workdate, setWorkdate] = useState(task.workdate || '');
  const [deadline, setDeadline] = useState(task.deadline || '');
  const [reassignKey, setReassignKey] = useState(otherStaff[0]?.key ?? '');

  const dutyOptions = [...new Set([...duties, 'その他', task.duty])];

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave({
      text: trimmed,
      duty,
      minutes: minutesValue ? Math.round(unit === 'hr' ? parseFloat(minutesValue) * 60 : parseFloat(minutesValue)) : task.minutes,
      workdate,
      deadline,
    });
  };

  return (
    <div className="col-span-2 mt-[7px] p-[8px_10px] rounded-md bg-stone-100 flex flex-wrap gap-[5px] items-center">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 min-w-[100px] px-[7px] py-1 rounded-md border border-stone-300 text-xs"
      />
      <select value={duty} onChange={(e) => setDuty(e.target.value)} className="px-[7px] py-1 rounded-md border border-stone-300 text-xs">
        {dutyOptions.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <span className="text-[11px] text-stone-500">時間</span>
      <input
        type="text"
        value={minutesValue}
        onChange={(e) => setMinutesValue(e.target.value)}
        placeholder={fmtMin(task.minutes) || ''}
        className="w-10 px-[7px] py-1 rounded-md border border-stone-300 text-xs"
      />
      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-12 px-[7px] py-1 rounded-md border border-stone-300 text-xs">
        <option value="min">分</option>
        <option value="hr">時間</option>
      </select>
      <span className="text-[11px] text-stone-500">作業</span>
      <input type="date" value={workdate} onChange={(e) => setWorkdate(e.target.value)} className="px-[7px] py-1 rounded-md border border-stone-300 text-xs" />
      <span className="text-[11px] text-stone-500">期限</span>
      <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="px-[7px] py-1 rounded-md border border-stone-300 text-xs" />
      <button type="button" onClick={save} className="px-[9px] py-1 rounded-md border border-stone-300 bg-white text-xs">✓ 保存</button>

      <div className="flex gap-[6px] items-center w-full mt-[5px] pt-[7px] border-t border-dashed border-stone-300">
        <span className="text-[11px] text-stone-500">担当変更</span>
        <select value={reassignKey} onChange={(e) => setReassignKey(e.target.value)} className="px-[7px] py-1 rounded-md border border-stone-300 text-xs">
          {otherStaff.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
        </select>
        <button
          type="button"
          onClick={() => reassignKey && onReassign(reassignKey)}
          className="px-[9px] py-1 rounded-md border border-stone-300 bg-white text-xs"
        >変更</button>
        <button type="button" onClick={onReleaseToPool} className="px-[9px] py-1 rounded-md border border-stone-300 bg-white text-xs">🎯 プールに戻す</button>
      </div>
    </div>
  );
}
