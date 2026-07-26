import { useState } from 'react';
import { STORE_INFO } from '../../constants';
import { todayHomeTasks } from '../../lib/selectors';
import { today } from '../../utils';
import { useSession } from '../../context/SessionContext';

export default function HomeView({ staff, roles, tasks, onSetTodayStore }) {
  const { loggedInUserKey } = useSession();
  const me = staff.find((s) => s.key === loggedInUserKey);
  const myStores = me?.stores || [];
  const confirmedTodayStore = me?.today_store_date === today ? me.today_store : null;
  const [selectedStore, setSelectedStore] = useState(myStores.length === 1 ? myStores[0] : confirmedTodayStore);

  const todayLabel = today.slice(5).replace('-', '/');
  const needsChoice = myStores.length > 1;

  const chooseStore = (sk) => {
    setSelectedStore(sk);
    onSetTodayStore(loggedInUserKey, sk);
  };

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

      {needsChoice && (
        <div className="mb-3">
          <div className="text-[11px] text-stone-400 mb-1.5">本日の出勤店舗を選択してください</div>
          <div className="flex gap-1.5">
            {myStores.map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => chooseStore(sk)}
                className={`px-2.5 py-1 rounded-md border text-[12px] ${selectedStore === sk ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-600'}`}
              >{STORE_INFO[sk].label}</button>
            ))}
          </div>
        </div>
      )}

      {selectedStore && (
        items.length === 0 ? (
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
        )
      )}
    </div>
  );
}
