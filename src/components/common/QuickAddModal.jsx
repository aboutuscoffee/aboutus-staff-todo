import { useEffect, useState } from 'react';
import { today, toMin } from '../../utils';
import { showErrorToast } from './Toast';
import { PRIORITY_OPTIONS } from '../../constants';
import { useSession } from '../../context/SessionContext';

export default function QuickAddModal({ open, onClose, staff, duties, onAddTask, onAddPool, onSendMemo, initialMode, prefill }) {
  const { loggedInUserKey } = useSession();
  const [mode, setMode] = useState('task');
  const [text, setText] = useState('');
  const [duty, setDuty] = useState(duties[0] || 'その他');
  const [priority, setPriority] = useState('mid');
  const [workdate, setWorkdate] = useState(today);
  const [taskDeadline, setTaskDeadline] = useState(today);
  const [timeValue, setTimeValue] = useState('');
  const [unit, setUnit] = useState('min');
  const [poolKind, setPoolKind] = useState('todo');
  const [poolDeadline, setPoolDeadline] = useState('');
  const [targetKeys, setTargetKeys] = useState([]);
  const [memoTo, setMemoTo] = useState(loggedInUserKey);
  const [memoText, setMemoText] = useState('');

  useEffect(() => {
    if (open) {
      setMode(prefill ? 'pool' : (initialMode || 'task'));
      setText(prefill?.text || '');
      setDuty(duties[0] || 'その他');
      setPriority(prefill?.priority || 'mid');
      setWorkdate(today);
      setTaskDeadline(today);
      setTimeValue('');
      setUnit('min');
      setPoolKind('todo');
      setPoolDeadline(prefill?.deadline || '');
      setTargetKeys([]);
      setMemoTo(loggedInUserKey);
      setMemoText('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill]);

  if (!open) return null;

  const dutyOptions = [...new Set([...duties, 'その他'])];
  const recipients = (staff || []).filter((s) => s.key !== loggedInUserKey);

  const submit = () => {
    if (mode === 'memo') {
      const trimmedMemo = memoText.trim();
      if (!trimmedMemo) {
        showErrorToast('メモを入力してください');
        return;
      }
      onSendMemo(memoTo, trimmedMemo);
      onClose();
      return;
    }
    const trimmed = text.trim();
    if (mode === 'task') {
      const minutes = toMin(timeValue, unit);
      if (!trimmed || minutes == null || !taskDeadline) {
        showErrorToast('タスク名・作業時間・期限は必須です');
        return;
      }
      onAddTask({ text: trimmed, duty: duty || 'その他', priority, workdate: workdate || today, deadline: taskDeadline, minutes });
    } else {
      if (!trimmed) {
        showErrorToast('タスク名を入力してください');
        return;
      }
      onAddPool(trimmed, poolKind, poolKind === 'assign' ? null : (poolDeadline || null), priority, targetKeys);
    }
    onClose();
  };

  const tabClass = (active) => `flex-1 py-1.5 rounded-md text-xs font-medium ${active ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`;

  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[320px] bg-white rounded-2xl px-[20px] py-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1.5 mb-4">
          <button type="button" onClick={() => setMode('task')} className={tabClass(mode === 'task')}>📋 タスク</button>
          <button type="button" onClick={() => setMode('pool')} className={tabClass(mode === 'pool')}>🎯 依頼</button>
          <button type="button" onClick={() => setMode('memo')} className={tabClass(mode === 'memo')}>💬 メモ</button>
        </div>

        {mode !== 'memo' && (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="タスク名を入力...*"
            className="w-full px-[9px] py-1.5 rounded-md border border-stone-300 text-[13px] mb-2"
          />
        )}

        {mode === 'memo' ? (
          <div className="mb-3">
            <div className="text-xs text-stone-500 mb-1">宛先</div>
            <select value={memoTo} onChange={(e) => setMemoTo(e.target.value)} className="w-full px-1.5 py-1.5 rounded-md border border-stone-300 text-xs mb-2">
              <option value={loggedInUserKey}>自分（自分用メモ）</option>
              {recipients.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
            </select>
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="メモを入力..."
              rows={4}
              className="w-full px-[9px] py-1.5 rounded-md border border-stone-300 text-[13px] resize-none"
            />
          </div>
        ) : mode === 'task' ? (
          <>
            <div className="flex flex-wrap gap-1.5 mb-2 items-center">
              <span className="text-xs text-stone-500">担当業務</span>
              <select value={duty} onChange={(e) => setDuty(e.target.value)} className="px-1.5 py-1 rounded-md border border-stone-300 text-xs">
                {dutyOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="text-xs text-stone-500">優先度</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-1.5 py-1 rounded-md border border-stone-300 text-xs">
                {PRIORITY_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2 items-center">
              <span className="text-xs text-stone-500 w-[42px]">作業日</span>
              <input type="date" value={workdate} onChange={(e) => setWorkdate(e.target.value)} className="px-1.5 py-1 rounded-md border border-stone-300 text-xs" />
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2 items-center">
              <span className="text-xs text-stone-500 w-[42px]">期限*</span>
              <input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} className="px-1.5 py-1 rounded-md border border-stone-300 text-xs" />
            </div>
            <div className="flex gap-1.5 mb-3 items-center">
              <span className="text-xs text-stone-500">目標作業時間*</span>
              <input type="text" value={timeValue} onChange={(e) => setTimeValue(e.target.value)} placeholder="例：30" className="w-[52px] px-1.5 py-1 rounded-md border border-stone-300 text-[13px]" />
              <div className="flex border border-stone-300 rounded-md overflow-hidden">
                <button type="button" onClick={() => setUnit('min')} className={`px-[9px] py-[3px] text-xs ${unit === 'min' ? 'bg-stone-100 font-medium' : 'text-stone-500'}`}>分</button>
                <button type="button" onClick={() => setUnit('hr')} className={`px-[9px] py-[3px] text-xs ${unit === 'hr' ? 'bg-stone-100 font-medium' : 'text-stone-500'}`}>時間</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-1.5 mb-3 items-center">
            <div className="flex border border-stone-300 rounded-md overflow-hidden">
              <button type="button" onClick={() => setPoolKind('todo')} className={`px-[9px] py-[3px] text-xs ${poolKind === 'todo' ? 'bg-stone-100 font-medium' : 'text-stone-500'}`}>ToDo</button>
              <button type="button" onClick={() => setPoolKind('assign')} className={`px-[9px] py-[3px] text-xs ${poolKind === 'assign' ? 'bg-stone-100 font-medium' : 'text-stone-500'}`}>担当</button>
            </div>
            {poolKind !== 'assign' && (
              <>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-1.5 py-1 rounded-md border border-stone-300 text-xs">
                  {PRIORITY_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <input type="date" value={poolDeadline} onChange={(e) => setPoolDeadline(e.target.value)} className="px-2 py-1 rounded-md border border-stone-300 text-xs" />
              </>
            )}
            <div className="w-full">
              <div className="text-xs text-stone-500 mb-1">宛先(複数選択可)</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetKeys([])}
                  className={`text-xs px-[10px] py-1 rounded-full border ${targetKeys.length === 0 ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}
                >全員</button>
                {recipients.map((s) => {
                  const selected = targetKeys.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setTargetKeys((keys) => (selected ? keys.filter((k) => k !== s.key) : [...keys, s.key]))}
                      className={`text-xs px-[10px] py-1 rounded-full border ${selected ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-300'}`}
                    >{s.name}</button>
                  );
                })}
              </div>
              <div className="text-[11px] text-stone-400 mt-1.5">
                {targetKeys.length === 0
                  ? '誰でも受け取れる募集ボックスに表示されます'
                  : targetKeys.length === 1
                  ? `${recipients.find((s) => s.key === targetKeys[0])?.name}さんだけが受け取れます`
                  : `選択した${targetKeys.length}人の中で早い者勝ちになります`}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-1.5">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-md border border-stone-300 bg-white text-sm">キャンセル</button>
          <button type="button" onClick={submit} className="flex-1 py-2 rounded-md bg-stone-900 text-white text-sm font-medium">{mode === 'memo' ? '送信' : '＋ 追加'}</button>
        </div>
      </div>
    </div>
  );
}
