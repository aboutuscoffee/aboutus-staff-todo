import TaskOfferCard from '../personal/TaskOfferCard';

export default function TaskOfferModal({ offers, staff, canHandOff, onApprove, onHandOff, onClose }) {
  if (offers.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[320px] max-h-[80vh] overflow-y-auto bg-white rounded-2xl px-[20px] py-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">🎯 新しい依頼タスク</div>
        {offers.map((t) => (
          <TaskOfferCard
            key={t.id}
            task={t}
            offererName={staff.find((s) => s.key === t.offered_by)?.name || ''}
            canHandOff={canHandOff}
            otherStaff={staff.filter((s) => s.key !== t.staff_key)}
            onApprove={() => onApprove(t.id)}
            onHandOff={(newKey) => onHandOff(t.id, newKey)}
          />
        ))}
        <button type="button" onClick={onClose} className="w-full py-2 rounded-md border border-stone-300 bg-white text-sm mt-1">後で確認する</button>
      </div>
    </div>
  );
}
