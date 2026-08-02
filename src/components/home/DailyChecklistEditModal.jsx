import { useState } from 'react';

export default function DailyChecklistEditModal({ items, onAdd, onDelete, onClose }) {
  const [text, setText] = useState('');
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-[320px] max-h-[80vh] overflow-y-auto bg-white rounded-2xl px-5 py-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-semibold">デイリーチェック編集</span>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-900 text-lg leading-none">✕</button>
        </div>
        {sorted.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 mb-1">
            <span className="flex-1 text-[13px] bg-stone-50 rounded px-2 py-1">{item.text}</span>
            <button type="button" onClick={() => onDelete(item.id)} className="text-stone-400 hover:text-[#A32D2D] px-1 text-xs flex-shrink-0">✕</button>
          </div>
        ))}
        <div className="flex gap-1.5 mt-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submit()}
            placeholder="項目を追加..."
            className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-[13px]"
            autoFocus
          />
          <button type="button" onClick={submit} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">＋</button>
        </div>
      </div>
    </div>
  );
}
