import { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { loginableStaff } from '../../lib/permissions';

export default function LoginScreen({ staff, roles }) {
  const { login } = useSession();
  const options = loginableStaff(staff, roles);
  const [selectedKey, setSelectedKey] = useState(options[0]?.key ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // 'wrong' | 'blocked' | null
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const submit = async () => {
    if (!selectedKey) return;
    const res = await login(selectedKey, password);
    if (!res.ok) {
      if (res.blocked) {
        setError('blocked');
      } else {
        setError('wrong');
        setAttemptsLeft(res.attemptsLeft ?? null);
        setPassword('');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4efe9' }}>
      <div className="w-[300px] bg-white rounded-2xl px-[22px] py-6 shadow-2xl">
        <div className="text-base font-semibold text-center mb-1">About Us ☕</div>
        <div className="text-[11px] text-stone-500 text-center mb-4 leading-relaxed">ログインして続ける</div>

        <div className="flex flex-col gap-1 mb-3">
          <div className="text-[11px] font-medium text-stone-500">名前</div>
          <select
            className="px-[9px] py-[7px] rounded-md border border-stone-300 text-sm"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {options.map((s) => (
              <option key={s.key} value={s.key}>{s.name}（{roles.find((r) => r.key === s.role)?.label}）</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 mb-3">
          <div className="text-[11px] font-medium text-stone-500">パスワード</div>
          <input
            type="password"
            className="px-[9px] py-[7px] rounded-md border border-stone-300 text-sm"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </div>

        <button
          type="button"
          className="w-full py-2 rounded-md bg-stone-900 text-white text-sm font-medium mt-1"
          onClick={submit}
        >
          ログイン
        </button>

        {error === 'wrong' && (
          <>
            <p className="text-[11px] text-red-600 mt-1.5 text-center">パスワードが正しくありません</p>
            {attemptsLeft !== null && (
              <p className="text-[10px] text-stone-400 text-center mt-1">残り試行回数：{attemptsLeft}回</p>
            )}
          </>
        )}
        {error === 'blocked' && (
          <div className="text-[11px] text-[#A32D2D] bg-[#FCEBEB] rounded-md px-[10px] py-2 mt-2 text-center">
            試行回数の上限に達しました。GMにパスワード再設定を依頼してください。
          </div>
        )}
      </div>
    </div>
  );
}
