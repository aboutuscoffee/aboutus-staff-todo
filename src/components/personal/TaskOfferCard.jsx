import { useState } from 'react';
import DateBadge from '../common/DateBadge';
import TimeBadge from '../common/TimeBadge';
import PriorityBadge from '../common/PriorityBadge';
import { dlClass } from '../../utils';

export default function TaskOfferCard({ task, offererName, canHandOff, otherStaff, onApprove, onHandOff }) {
  const [handingOff, setHandingOff] = useState(false);
  const [target, setTarget] = useState(otherStaff[0]?.key ?? '');
  const dc = dlClass(task.deadline, false);

  return (
    <div className="rounded-md border border-[#EF9F27] bg-[#FAEEDA] p-[10px_12px] mb-1.5">
      <div className="text-[13px]">{task.text}</div>
      <div className="text-[11px] text-stone-500 mt-0.5">{offererName}さんからの依頼</div>
      <div className="flex flex-wrap gap-1 mt-1.5">
        <PriorityBadge priority={task.priority} />
        <TimeBadge minutes={task.minutes} />
        <DateBadge date={task.deadline} prefix="期限" cls={dc} />
      </div>
      {handingOff ? (
        <div className="flex gap-1.5 mt-2">
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="flex-1 px-1.5 py-1 rounded-md border border-stone-300 text-xs bg-white">
            {otherStaff.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
          </select>
          <button type="button" onClick={() => target && onHandOff(target)} className="px-2.5 py-1 rounded-md bg-stone-900 text-white text-xs">送る</button>
          <button type="button" onClick={() => setHandingOff(false)} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">キャンセル</button>
        </div>
      ) : (
        <div className="flex gap-1.5 mt-2">
          <button type="button" onClick={onApprove} className="px-3 py-1.5 rounded-md bg-stone-900 text-white text-xs">承認</button>
          {canHandOff && (
            <button type="button" onClick={() => setHandingOff(true)} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-xs">他の人に振り替える</button>
          )}
        </div>
      )}
    </div>
  );
}
