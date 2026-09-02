import { useState } from 'react';
import { STORE_INFO, STORE_KEYS } from '../../constants';

export default function StaffTable({ staff, roles, canAssignOwner, onReorder, onUpdateField, onArchive, onReactivate, onAdd }) {
  const [dragSrc, setDragSrc] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [names, setNames] = useState({});
  const [newName, setNewName] = useState('');
  const [newStores, setNewStores] = useState([]);
  const [newRole, setNewRole] = useState(roles[0]?.key ?? '');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addMessage, setAddMessage] = useState(null);
  const [messages, setMessages] = useState({});
  const [confirmTarget, setConfirmTarget] = useState(null); // { key, name } | null

  const activeStaff = staff.filter((s) => s.is_active);
  const inactiveStaff = staff.filter((s) => !s.is_active);

  const nameValue = (s) => names[s.key] ?? s.name;
  const roleOptionsFor = (currentRoleKey) => (canAssignOwner ? roles : roles.filter((r) => !r.is_owner || r.key === currentRoleKey));
  const addableRoles = canAssignOwner ? roles : roles.filter((r) => !r.is_owner);

  // 並び替えは現役スタッフの間だけで行う。onReorderはstaff全体を置き換える前提の関数なので、
  // 退職済みスタッフを巻き込んで消してしまわないよう、並び替え後に必ず結合してから渡す
  const drop = (idx) => {
    setDragOverIdx(null);
    if (dragSrc === null || dragSrc === idx) return;
    const next = activeStaff.slice();
    const [moved] = next.splice(dragSrc, 1);
    next.splice(idx, 0, moved);
    setDragSrc(null);
    onReorder([...next, ...inactiveStaff]);
  };

  const submitAdd = async () => {
    const trimmed = newName.trim();
    const trimmedEmail = newEmail.trim();
    if (!trimmed) return;
    if (!trimmedEmail) { setAddMessage({ type: 'error', text: 'メールアドレスを入力してください' }); return; }
    if (!newPassword) { setAddMessage({ type: 'error', text: '初期パスワードを入力してください' }); return; }
    setAddMessage(null);
    const result = await onAdd({ name: trimmed, stores: newStores, role: newRole, email: trimmedEmail, initialPassword: newPassword });
    if (result?.ok) {
      setNewName('');
      setNewStores([]);
      setNewEmail('');
      setNewPassword('');
      setAddMessage({ type: 'success', text: 'スタッフを追加しました' });
    } else {
      setAddMessage({ type: 'error', text: result?.message || '追加に失敗しました' });
    }
  };

  const confirmArchive = async () => {
    if (!confirmTarget) return;
    const { key } = confirmTarget;
    setConfirmTarget(null);
    setMessages((m) => ({ ...m, [key]: null }));
    const result = await onArchive(key);
    if (!result?.ok) {
      setMessages((m) => ({ ...m, [key]: result?.message || '退職処理に失敗しました' }));
    }
  };

  const reactivate = async (key) => {
    setMessages((m) => ({ ...m, [key]: null }));
    const result = await onReactivate(key);
    if (!result?.ok) {
      setMessages((m) => ({ ...m, [key]: result?.message || '再有効化に失敗しました' }));
    }
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
          {activeStaff.map((s, idx) => (
            <div key={s.key}>
              <div
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
                    onClick={() => setConfirmTarget({ key: s.key, name: s.name })}
                    className="text-stone-400 hover:bg-[#FCEBEB] hover:text-[#A32D2D] px-1.5 py-0.5 rounded text-xs"
                    title="退職処理"
                  >✕</button>
                </div>
              </div>
              {messages[s.key] && (
                <p className="text-[10px] text-[#A32D2D] px-1 pb-1.5 -mt-0.5">{messages[s.key]}</p>
              )}
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
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="メールアドレス" type="email" className="px-2 py-1 rounded-md border border-stone-300 text-xs w-48" />
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="初期パスワード" type="text" className="px-2 py-1 rounded-md border border-stone-300 text-xs w-32" />
          <button type="button" onClick={submitAdd} className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-xs">＋ 追加</button>
        </div>
        {addMessage && (
          <p className={`text-[11px] ${addMessage.type === 'error' ? 'text-[#A32D2D]' : 'text-[#3B6D11]'}`}>{addMessage.text}</p>
        )}
      </div>

      {inactiveStaff.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-stone-500 mb-1.5">退職・無効化スタッフ</div>
          <div className="flex flex-col gap-1.5">
            {inactiveStaff.map((s) => (
              <div key={s.key} className="flex flex-col gap-0.5 px-2.5 py-2 rounded-md bg-stone-100">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-500">{s.name}（{roles.find((r) => r.key === s.role)?.label}）</span>
                  <button
                    type="button"
                    onClick={() => reactivate(s.key)}
                    className="px-2.5 py-0.5 rounded-md border border-stone-300 bg-white text-[11px] flex-shrink-0"
                  >再有効化</button>
                </div>
                {messages[s.key] && (
                  <p className="text-[10px] text-[#A32D2D]">{messages[s.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50" onClick={() => setConfirmTarget(null)}>
          <div className="w-[300px] bg-white rounded-2xl px-[22px] py-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold text-center mb-2">退職処理</div>
            <p className="text-[12px] text-stone-500 text-center leading-relaxed mb-4">
              「{confirmTarget.name}」を退職処理しますか？<br />ログインできなくなりますが、過去のタスク・評価・実績データは保持されます。
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmTarget(null)} className="flex-1 py-2 rounded-md border border-stone-300 bg-white text-sm">キャンセル</button>
              <button type="button" onClick={confirmArchive} className="flex-1 py-2 rounded-md bg-[#A32D2D] text-white text-sm font-medium">退職処理する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
