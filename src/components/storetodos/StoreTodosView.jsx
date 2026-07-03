import { STORE_KEYS } from '../../constants';
import { storeTodosForStore } from '../../lib/selectors';
import { thisMonth } from '../../utils';
import StoreCard from './StoreCard';

export default function StoreTodosView({ storeTodos, onAdd, onToggle, onDelete }) {
  return (
    <div>
      <div className="text-[15px] font-semibold mb-3">🏪 店舗月次目標 — {thisMonth}</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {STORE_KEYS.map((sk) => (
          <StoreCard
            key={sk}
            storeKey={sk}
            items={storeTodosForStore(storeTodos, sk)}
            onAdd={(text) => onAdd(sk, text)}
            onToggle={(id) => onToggle(id)}
            onDelete={(id) => onDelete(id)}
          />
        ))}
      </div>
    </div>
  );
}
