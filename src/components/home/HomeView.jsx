import { useState } from 'react';
import { STORE_INFO } from '../../constants';
import { todayHomeTasks } from '../../lib/selectors';
import { today } from '../../utils';
import { useSession } from '../../context/SessionContext';

export default function HomeView({ staff, roles, tasks }) {
  const { loggedInUserKey } = useSession();
  const me = staff.find((s) => s.key === loggedInUserKey);
  const myStores = me?.stores || [];
  const [selectedStore, setSelectedStore] = useState(myStores[0] || null);

  const todayLabel = today.slice(5).replace('-', '/');

  if (!me || myStores.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-100 bg-white p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[15px] font-semibold">Today</span>
          <span className="text-[12px] text-stone-400">{todayLabel}</span>
        </div>
        <p className="text-xs text-stone-400">所属店舗が設定されていません</p>
      </div>
    );
  }

  const items = selectedStore ? todayHomeTasks(tasks, staff, roles, loggedInUserKey, selectedStore) : [];

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[15px] font-semibold">Today</span>
        <span className="text-[12px] text-stone-400">{todayLabel}</span>
      </div>

      {myStores.length > 1 && (
        <div className="flex gap-1.5 mb-3">
          {myStores.map((sk) => (
            <button
              key={sk}
              type="button"
              onClick={() => setSelectedStore(sk)}
              className={`px-2.5 py-1 rounded-md border text-[12px] ${selectedStore === sk ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-600'}`}
            >{STORE_INFO[sk].label}</button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-stone-400">本日のタスクはありません</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-baseline gap-2 text-[13px]">
              <span className="min-w-0 truncate">・{item.text}</span>
              <span className="text-stone-500 flex-shrink-0">{item.staffName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
