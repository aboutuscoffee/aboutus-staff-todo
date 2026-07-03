import { useState } from 'react';

export default function PasswordTable({ staff, roles, onReset }) {
  const [pwValues, setPwValues] = useState({});

  const submit = (key) => {
    const val = (pwValues[key] || '').trim();
    if (!val) { alert('新しいパスワードを入力してください'); return; }
    onReset(key, val);
    setPwValues((v) => ({ ...v, [key]: '' }));
  };

  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr>
          <th className="text-left font-medium text-stone-500 text-[11px] px-2.5 py-1.5 border-b border-stone-300">スタッフ</th>
          <th className="text-left font-medium text-stone-500 text-[11px] px-2.5 py-1.5 border-b border-stone-300">状態</th>
          <th className="text-left font-medium text-stone-500 text-[11px] px-2.5 py-1.5 border-b border-stone-300">パスワード再設定</th>
        </tr>
      </thead>
      <tbody>
        {staff.map((s) => {
          const role = roles.find((r) => r.key === s.role);
          return (
            <tr key={s.key}>
              <td className="px-2.5 py-2 border-b border-stone-100">{s.name}（{role?.label}）</td>
              <td className="px-2.5 py-2 border-b border-stone-100">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${s.password_hash ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-stone-100 text-stone-400'}`}>
                  {s.password_hash ? '設定済み' : '未設定'}
                </span>
                {s.blocked && <span className="text-[10px] text-[#A32D2D] ml-1.5">（ブロック中）</span>}
              </td>
              <td className="px-2.5 py-2 border-b border-stone-100">
                <div className="flex gap-1 items-center">
                  <input
                    type="text"
                    value={pwValues[s.key] || ''}
                    onChange={(e) => setPwValues((v) => ({ ...v, [s.key]: e.target.value }))}
                    placeholder="新パスワード"
                    className="px-1.5 py-0.5 rounded-md border border-stone-300 text-[11px] w-24"
                  />
                  <button type="button" onClick={() => submit(s.key)} className="px-2.5 py-0.5 rounded-md border border-stone-300 bg-white text-[11px]">再設定</button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
