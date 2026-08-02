import { useState } from 'react';
import DailyChecklistEditModal from './DailyChecklistEditModal';

export default function DailyChecklistCard({ staffKey, items, checks, todayStr, onAddItem, onDeleteItem, onToggleCheck }) {
  const [editOpen, setEditOpen] = useState(false);
  const myItems = items.filter((i) => i.staff_key === staffKey).sort((a, b) => a.sort_order - b.sort_order);
  const isChecked = (itemId) => checks.some((c) => c.item_id === itemId && c.date === todayStr);

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[15px] font-semibold">デイリーチェック</span>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="text-stone-400 hover:bg-stone-100 hover:text-stone-900 px-[4px] py-[2px] rounded text-sm"
        >✎</button>
      </div>
      {myItems.length === 0 ? (
        <p className="text-xs text-stone-400">チェック項目はありません</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {myItems.map((item) => {
            const checked = isChecked(item.id);
            return (
              <label key={item.id} className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCheck(item.id, todayStr)}
                  className="w-[15px] h-[15px] cursor-pointer accent-[#1D9E75] flex-shrink-0"
                />
                <span className={checked ? 'line-through text-stone-400' : ''}>{item.text}</span>
              </label>
            );
          })}
        </div>
      )}
      {editOpen && (
        <DailyChecklistEditModal
          items={myItems}
          onAdd={(text) => onAddItem(staffKey, text)}
          onDelete={onDeleteItem}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
