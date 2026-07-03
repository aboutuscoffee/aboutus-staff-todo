import { useEffect, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { loginableStaff } from '../../lib/permissions';

export default function LoginModal({ staff, roles }) {
  const { modal, closeLoginModal, login } = useSession();
  const options = loginableStaff(staff, roles);
  const [selectedKey, setSelectedKey] = useState(options[0]?.key ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // 'wrong' | 'blocked' | null
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  useEffect(() => {
    if (modal.open) {
      setSelectedKey(options[0]?.key ?? '');
      setPassword('');
      setError(null);
      setAttemptsLeft(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.open]);

  if (!modal.open) return null;

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
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
      <div className="w-[300px] bg-white rounded-2xl px-[22px] py-6 shadow-2xl">
        <div className="text-sm font-semibold text-center mb-1">認証が必要です</div>
        <div className="text-[11px] text-stone-500 text-center mb-4 leading-relaxed">{modal.subText}</div>

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
        {modal.cancelable && (
          <button
            type="button"
            className="w-full py-1.5 rounded-md bg-transparent text-stone-400 text-[11px] mt-1"
            onClick={closeLoginModal}
          >
            キャンセル
          </button>
        )}

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
