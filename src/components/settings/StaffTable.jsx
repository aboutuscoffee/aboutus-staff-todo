import { useState } from 'react';
import { STORE_INFO, STORE_KEYS } from '../../constants';

export default function StaffTable({ staff, roles, canAssignOwner, onReorder, onUpdateField, onDelete, onAdd }) {
  const [dragSrc, setDragSrc] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [names, setNames] = useState({});
  const [newName, setNewName] = useState('');
  const [newStores, setNewStores] = useState([]);
  const [newRole, setNewRole] = useState(roles[0]?.key ?? '');

  const nameValue = (s) => names[s.key] ?? s.name;
  const roleOptionsFor = (currentRoleKey) => (canAssignOwner ? roles : roles.filter((r) => !r.is_owner || r.key === currentRoleKey));
  const addableRoles = canAssignOwner ? roles : roles.filter((r) => !r.is_owner);

  const drop = (idx) => {
    setDragOverIdx(null);
    if (dragSrc === null || dragSrc === idx) return;
    const next = staff.slice();
    const [moved] = next.splice(dragSrc, 1);
    next.splice(idx, 0, moved);
    setDragSrc(null);
    onReorder(next);
  };

  const submitAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, stores: newStores, role: newRole });
    setNewName('');
    setNewStores([]);
  };

  return (
    <div>
      <div className="bg-stone-100 text-[11px] text-stone-500 rounded-md px-[10px] py-2.5 mb-2.5 max-w-[600px] leading-relaxed">
        ⠿ をドラッグして並び順を変更できます（サイドバー・全体一覧に反映）。変更後は ✓ で保存してください。
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[24px_80px_1fr_110px_auto] gap-2 px-1 py-1.5 border-b border-stone-300">
            <span />
            <span className="text-[11px] font-medium text-stone-500">名前</span>
            <span className="text-[11px] font-medium text-stone-500">所属店舗</span>
            <span className="text-[11px] font-medium text-stone-500">役職</span>
            <span />
          </div>
          {staff.map((s, idx) => (
            <div
              key={s.key}
              draggable
              onDragStart={() => setDragSrc(idx)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
              onDragLeave={() => setDragOverIdx((v) => (v === idx ? null : v))}
              onDrop={(e) => { e.preventDefault(); drop(idx); }}
              className={`grid grid-cols-[24px_80px_1fr_110px_auto] gap-2 items-center px-1 py-2 border-b border-stone-100 select-none ${
                dragSrc === idx ? 'opacity-40 bg-stone-100' : ''
              } ${dragOverIdx === idx && dragSrc !== idx ? 'border-t-2 border-t-[#1D9E75]' : ''}`}
            >
              <span className="cursor-grab text-stone-400 text-sm text-center">⠿</span>
              <input
                value={nameValue(s)}
                onChange={(e) => setNames((n) => ({ ...n, [s.key]: e.target.value }))}
                className="px-[7px] py-1 rounded-md border border-stone-300 text-xs w-full"
              />
              <div className="flex gap-2 flex-wrap">
                {STORE_KEYS.map((sk) => (
                  <label key={sk} className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.stores.includes(sk)}
                      onChange={(e) => {
                        const next = e.target.checked ? [...s.stores, sk] : s.stores.filter((x) => x !== sk);
                        onUpdateField(s.key, { stores: next });
                      }}
                      className="w-[13px] h-[13px] accent-[#1D9E75]"
                    />
                    {STORE_INFO[sk].label}
                  </label>
                ))}
              </div>
              <select
                value={s.role}
                disabled={!canAssignOwner && roles.find((r) => r.key === s.role)?.is_owner}
                onChange={(e) => onUpdateField(s.key, { role: e.target.value })}
                className="px-[7px] py-1 rounded-md border border-stone-300 text-xs w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {roleOptionsFor(s.role).map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              <div className="flex gap-0.5 items-center">
                <button
                  type="button"
                  onClick={() => onUpdateField(s.key, { name: nameValue(s).trim() || s.name })}
                  className="text-stone-400 hover:bg-stone-100 hover:text-stone-900 px-1.5 py-0.5 rounded text-xs"
                  title="保存"
                >✓</button>
                <button
                  type="button"
                  onClick={() => { if (confirm(`「${s.name}」を削除しますか？`)) onDelete(s.key); }}
                  className="text-stone-400 hover:bg-[#FCEBEB] hover:text-[#A32D2D] px-1.5 py-0.5 rounded text-xs"
                  title="削除"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2.5 p-3 border border-dashed border-stone-300 rounded-md">
        <div className="text-[11px] font-semibold text-stone-500">新規スタッフを追加</div>
        <div className="flex gap-2 flex-wrap items-center">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="名前" className="px-2 py-1 rounded-md border border-stone-300 text-xs w-40" />
          {STORE_KEYS.map((sk) => (
            <label key={sk} className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer">
              <input
                type="checkbox"
                checked={newStores.includes(sk)}
                onChange={(e) => setNewStores((v) => (e.target.checked ? [...v, sk] : v.filter((x) => x !== sk)))}
                className="w-[13px] h-[13px] accent-[#1D9E75]"
              />
              {STORE_INFO[sk].label}
            </label>
          ))}
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="px-2 py-1 rounded-md border border-stone-300 text-xs">
            {addableRoles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <button type="button" onClick={submitAdd} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-xs">＋ 追加</button>
        </div>
      </div>
    </div>
  );
}
