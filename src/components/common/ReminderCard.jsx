import { dlClass, dlLabel } from '../../utils';

export default function ReminderCard({ tasks }) {
  if (!tasks.length) return null;

  return (
    <div className="rounded-2xl border border-[#EF9F27] bg-[#FAEEDA] p-4 mb-4">
      <div className="text-[13px] font-semibold mb-2 text-[#854F0B]">★ 重要タスク</div>
      <div className="flex flex-col gap-1.5">
        {tasks.map((t) => {
          const dc = dlClass(t.deadline, false);
          return (
            <div key={t.id} className="flex justify-between items-baseline gap-2 text-[13px]">
              <span className="min-w-0 truncate">・{t.text}</span>
              {t.deadline && (
                <span className={`flex-shrink-0 text-[11px] px-[6px] py-[2px] rounded-full whitespace-nowrap ${dc === 'overdue' || dc === 'due-soon' ? 'bg-white text-[#A32D2D]' : 'bg-white text-[#854F0B]'}`}>
                  {dlLabel(t.deadline)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
