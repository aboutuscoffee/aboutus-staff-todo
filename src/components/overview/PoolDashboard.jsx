import DateBadge from '../common/DateBadge';
import TimeBadge from '../common/TimeBadge';
import PriorityBadge from '../common/PriorityBadge';
import { dlClass } from '../../utils';
import { useSession } from '../../context/SessionContext';

export default function PoolDashboard({ poolTasks, onClaim, onDelete }) {
  const { loggedInUserKey } = useSession();
  const visibleTasks = poolTasks.filter((p) => !p.target_keys || p.target_keys.length === 0 || p.target_keys.includes(loggedInUserKey));

  if (visibleTasks.length === 0) return null;

  return (
    <div className="rounded-lg bg-[#F5F3EE] p-[14px_16px] mb-4">
      <div className="text-[13px] font-semibold mb-2.5">🎯 担当者募集中のタスク</div>
      <div className="mb-1">
        {visibleTasks.map((p) => {
          const dc = dlClass(p.deadline, false);
          return (
            <div key={p.id} className="flex justify-between items-start gap-2.5 flex-wrap p-[9px_11px] rounded-md border border-stone-100 bg-white mb-1.5">
              <div className="min-w-0 flex-1">
                <div className="text-[13px]">{p.text}</div>
                <div className="flex flex-wrap gap-1 mt-[5px]">
                  {p.kind !== 'assign' && <PriorityBadge priority={p.priority} />}
                  {p.target_keys && p.target_keys.length > 0 && (
                    <span className="text-[11px] px-[7px] py-[2px] rounded-full font-medium bg-[#FAEEDA] text-[#854F0B]">指定あり</span>
                  )}
                  <TimeBadge minutes={p.minutes} />
                  <DateBadge date={p.deadline} prefix="期限" cls={dc} />
                </div>
              </div>
              <div className="flex gap-[5px] items-center flex-shrink-0">
                <button type="button" onClick={() => onClaim(p.id, loggedInUserKey)} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-xs">{p.kind === 'assign' ? 'この担当になる' : 'このTO DOをもらう'}</button>
                <button type="button" onClick={() => onDelete(p.id)} className="text-stone-400 hover:bg-[#FCEBEB] hover:text-[#A32D2D] px-1 py-0.5 rounded text-xs">✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
