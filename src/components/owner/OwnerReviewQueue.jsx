import TaskItem from '../common/TaskItem';
import { pendingReviewTasks } from '../../lib/selectors';

export default function OwnerReviewQueue({ staff, tasks, ownerKey, ownerName, onGoPersonalEval }) {
  const items = pendingReviewTasks(tasks).filter((t) => t.staff_key !== ownerKey);

  return (
    <div>
      <div className="text-[11px] text-stone-400 mb-1.5">{ownerName}さんの確認待ちタスク</div>
      {items.length === 0 && <p className="text-xs text-stone-500 py-1.5">確認待ちのタスクはありません</p>}
      {items.map((t) => {
        const s = staff.find((x) => x.key === t.staff_key);
        if (!s) return null;
        return (
          <TaskItem
            key={t.id}
            task={t}
            duties={s.duties || []}
            staffName={s.name}
            onOpenStaff={() => onGoPersonalEval(s.key)}
            isOwner={false}
            onToggleDone={() => {}}
            onDelete={() => {}}
            onSave={() => {}}
            onStatusChange={() => {}}
            onReleaseToPool={() => {}}
          />
        );
      })}
    </div>
  );
}
