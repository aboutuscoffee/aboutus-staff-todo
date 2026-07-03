import { useState } from 'react';

export default function RoleTable({ roles, staff, onTogglePerm, onToggleViewScope, onAddRole, onDeleteRole }) {
  const [newLabel, setNewLabel] = useState('');
  const [newLogin, setNewLogin] = useState(false);
  const [newEdit, setNewEdit] = useState(false);
  const [newShow, setNewShow] = useState(true);
  const [newScope, setNewScope] = useState([]);

  const deleteRole = (r) => {
    if (r.is_base_role) { alert('基本役職は削除できません'); return; }
    if (staff.some((s) => s.role === r.key)) { alert('使用中のスタッフがいます。先に役職を変更してください。'); return; }
    onDeleteRole(r.key);
  };

  const submitAdd = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) { alert('役職名を入力してください'); return; }
    onAddRole({ label: trimmed, can_login: newLogin, can_edit: newEdit, show_in_overview: newShow, view_scope: newScope });
    setNewLabel(''); setNewLogin(false); setNewEdit(false); setNewShow(true); setNewScope([]);
  };

  return (
    <div>
      <div className="bg-stone-100 text-[11px] text-stone-500 rounded-md px-[10px] py-2.5 mb-2.5 max-w-[600px] leading-relaxed">
        「全体ToDo表示」のチェックがない役職は全体一覧に表示されません。GMは常に非表示です。
      </div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="text-left font-medium text-stone-500 text-[11px] px-2.5 py-1.5 border-b border-stone-300">役職名</th>
            <th className="text-left font-medium text-stone-500 text-[11px] px-2.5 py-1.5 border-b border-stone-300">ログイン</th>
            <th className="text-left font-medium text-stone-500 text-[11px] px-2.5 py-1.5 border-b border-stone-300">編集</th>
            <th className="text-left font-medium text-stone-500 text-[11px] px-2.5 py-1.5 border-b border-stone-300">全体ToDo表示</th>
            <th className="text-left font-medium text-stone-500 text-[11px] px-2.5 py-1.5 border-b border-stone-300">閲覧可能な役職</th>
            <th className="border-b border-stone-300" />
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.key}>
              <td className="px-2.5 py-2 border-b border-stone-100 font-medium">{r.label}</td>
              <td className="px-2.5 py-2 border-b border-stone-100">
                <label className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer">
                  <input type="checkbox" checked={r.can_login} onChange={(e) => onTogglePerm(r.key, 'can_login', e.target.checked)} className="w-[13px] h-[13px] accent-[#1D9E75]" />ログイン可能
                </label>
              </td>
              <td className="px-2.5 py-2 border-b border-stone-100">
                <label className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer">
                  <input type="checkbox" checked={r.can_edit} onChange={(e) => onTogglePerm(r.key, 'can_edit', e.target.checked)} className="w-[13px] h-[13px] accent-[#1D9E75]" />編集可能
                </label>
              </td>
              <td className="px-2.5 py-2 border-b border-stone-100">
                <label className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={r.show_in_overview}
                    disabled={r.key === 'GM'}
                    onChange={(e) => onTogglePerm(r.key, 'show_in_overview', e.target.checked)}
                    className="w-[13px] h-[13px] accent-[#1D9E75]"
                  />全体ToDo表示
                </label>
              </td>
              <td className="px-2.5 py-2 border-b border-stone-100">
                <div className="flex flex-wrap gap-1.5">
                  {roles.map((tr) => (
                    <label key={tr.key} className="flex items-center gap-1 text-[11px] text-stone-500 bg-white border border-stone-300 rounded-full px-2 py-0.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={r.view_scope.includes(tr.key)}
                        onChange={(e) => onToggleViewScope(r.key, tr.key, e.target.checked)}
                        className="w-3 h-3 accent-[#1D9E75]"
                      />{tr.label}
                    </label>
                  ))}
                </div>
              </td>
              <td className="px-2.5 py-2 border-b border-stone-100">
                <button type="button" onClick={() => deleteRole(r)} className="text-stone-400 hover:bg-[#FCEBEB] hover:text-[#A32D2D] px-1.5 py-0.5 rounded text-xs" title="削除">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-2 mt-2.5 p-3 border border-dashed border-stone-300 rounded-md">
        <div className="text-[11px] font-semibold text-stone-500">新しい役職を追加</div>
        <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="役職名" className="px-2 py-1 rounded-md border border-stone-300 text-xs w-40" />
        <div className="flex gap-3.5 flex-wrap">
          <label className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer"><input type="checkbox" checked={newLogin} onChange={(e) => setNewLogin(e.target.checked)} className="w-[13px] h-[13px] accent-[#1D9E75]" />ログイン可能</label>
          <label className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer"><input type="checkbox" checked={newEdit} onChange={(e) => setNewEdit(e.target.checked)} className="w-[13px] h-[13px] accent-[#1D9E75]" />編集可能</label>
          <label className="flex items-center gap-1 text-[11px] text-stone-500 cursor-pointer"><input type="checkbox" checked={newShow} onChange={(e) => setNewShow(e.target.checked)} className="w-[13px] h-[13px] accent-[#1D9E75]" />全体ToDo表示</label>
        </div>
        <div className="text-[11px] text-stone-500">閲覧可能な役職：</div>
        <div className="flex flex-wrap gap-1.5">
          {roles.map((tr) => (
            <label key={tr.key} className="flex items-center gap-1 text-[11px] text-stone-500 bg-white border border-stone-300 rounded-full px-2 py-0.5 cursor-pointer">
              <input
                type="checkbox"
                checked={newScope.includes(tr.key)}
                onChange={(e) => setNewScope((v) => (e.target.checked ? [...v, tr.key] : v.filter((x) => x !== tr.key)))}
                className="w-3 h-3 accent-[#1D9E75]"
              />{tr.label}
            </label>
          ))}
        </div>
        <button type="button" onClick={submitAdd} className="self-start px-3 py-1.5 rounded-md border border-stone-300 bg-white text-xs">＋ 役職を追加</button>
      </div>
    </div>
  );
}
