import { useState } from 'react';
import TaskItem from '../common/TaskItem';
import { today, toMin } from '../../utils';

export default function TaskPanel({ tasks, duties, otherStaff, onAddTask, onToggleDone, onDelete, onSave, onStatusChange, onReassign, onReleaseToPool }) {
  const [text, setText] = useState('');
  const [duty, setDuty] = useState(duties[0] || 'その他');
  const [deadline, setDeadline] = useState(today);
  const [timeValue, setTimeValue] = useState('');
  const [unit, setUnit] = useState('min');

  const dutyOptions = [...new Set([...duties, 'その他'])];

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddTask({ text: trimmed, duty: duty || 'その他', deadline: deadline || today, minutes: toMin(timeValue, unit) });
    setText('');
    setTimeValue('');
  };

  return (
    <div>
      <div className="text-[11px] text-stone-400 mb-2">完了タスクは完了日から4ヶ月後に自動削除されます</div>
      <div className="text-xs font-medium text-stone-500 mb-1.5">タスク追加</div>
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1.5 mb-1.5 items-center">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="タスク名を入力..." className="px-[9px] py-1.5 rounded-md border border-stone-300 text-[13px]" />
        <select value={duty} onChange={(e) => setDuty(e.target.value)} className="px-1.5 py-1 rounded-md border border-stone-300 text-xs">
          {dutyOptions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="px-1.5 py-1 rounded-md border border-stone-300 text-xs" />
        <button type="button" onClick={submit} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-[13px]">＋ 追加</button>
      </div>
      <div className="flex gap-1.5 mb-2.5 items-center">
        <span className="text-xs text-stone-500">目標作業時間</span>
        <input type="text" value={timeValue} onChange={(e) => setTimeValue(e.target.value)} placeholder="例：30" className="w-[52px] px-1.5 py-1 rounded-md border border-stone-300 text-[13px]" />
        <div className="flex border border-stone-300 rounded-md overflow-hidden">
          <button type="button" onClick={() => setUnit('min')} className={`px-[9px] py-[3px] text-xs ${unit === 'min' ? 'bg-stone-100 font-medium' : 'text-stone-500'}`}>分</button>
          <button type="button" onClick={() => setUnit('hr')} className={`px-[9px] py-[3px] text-xs ${unit === 'hr' ? 'bg-stone-100 font-medium' : 'text-stone-500'}`}>時間</button>
        </div>
      </div>
      <div>
        {tasks.length === 0 && <p className="text-xs text-stone-500 py-1.5">タスクがありません</p>}
        {tasks.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            duties={duties}
            otherStaff={otherStaff}
            onToggleDone={() => onToggleDone(t.id)}
            onDelete={() => onDelete(t.id)}
            onSave={(updates) => onSave(t.id, updates)}
            onStatusChange={(status) => onStatusChange(t.id, status)}
            onReassign={(newKey) => onReassign(t.id, newKey)}
            onReleaseToPool={() => onReleaseToPool(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
