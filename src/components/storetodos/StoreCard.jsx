import { useState } from 'react';
import { STORE_INFO } from '../../constants';
import { thisMonth } from '../../utils';

export default function StoreCard({ storeKey, items, readonly, onAdd, onToggle, onDelete, onGoToEdit }) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <div className={`rounded-2xl p-[14px_16px] ${readonly ? 'border border-stone-100 bg-white' : 'bg-[#F5F3EE]'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] font-semibold">{STORE_INFO[storeKey].label}</span>
        <span className="text-[11px] text-stone-400">{thisMonth}</span>
      </div>
      {items.length === 0 && <span className="text-[11px] text-stone-400">取組項目がありません</span>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-[7px] text-xs text-stone-500 mb-1">
          <input
            type="checkbox"
            checked={item.done}
            disabled={readonly}
            onChange={() => onToggle && onToggle(item.id)}
            className="w-[13px] h-[13px] accent-[#1D9E75] flex-shrink-0"
          />
          <span className={item.done ? 'line-through text-stone-400' : ''}>{item.text}</span>
          {!readonly && (
            <button type="button" onClick={() => onDelete(item.id)} className="ml-auto text-stone-400 hover:text-stone-700 text-[11px] px-0.5">✕</button>
          )}
        </div>
      ))}
      {readonly ? (
        <div className="text-[10px] text-stone-400 mt-1.5">
          🔒 読み取り専用 — <button type="button" onClick={onGoToEdit} className="text-[10px] bg-white border border-stone-300 rounded-md px-2 py-0.5">編集はこちら</button>
        </div>
      ) : (
        <div className="flex gap-1.5 mt-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="取組を追加..."
            className="flex-1 px-[7px] py-1 rounded-md border border-stone-300 text-xs"
          />
          <button type="button" onClick={submit} className="px-[9px] py-1 rounded-md border border-stone-300 bg-white text-xs">追加</button>
        </div>
      )}
    </div>
  );
}
