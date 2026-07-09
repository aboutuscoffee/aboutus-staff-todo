import { useState } from 'react';

export default function SelfPasswordForm({ onChangePassword }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(null);

  const submit = async () => {
    setMessage(null);
    if (!current || !next) { setMessage({ type: 'error', text: '現在のパスワードと新しいパスワードを入力してください' }); return; }
    if (next !== confirm) { setMessage({ type: 'error', text: '新しいパスワードが一致しません' }); return; }
    const result = await onChangePassword(current, next);
    if (result.ok) {
      setMessage({ type: 'success', text: 'パスワードを変更しました' });
      setCurrent('');
      setNext('');
      setConfirm('');
    } else {
      setMessage({ type: 'error', text: result.message || '変更に失敗しました' });
    }
  };

  return (
    <div className="max-w-[320px] flex flex-col gap-2.5">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-stone-500">現在のパスワード</span>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="px-2.5 py-1.5 rounded-md border border-stone-300 text-xs" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-stone-500">新しいパスワード</span>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="px-2.5 py-1.5 rounded-md border border-stone-300 text-xs" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-stone-500">新しいパスワード（確認）</span>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="px-2.5 py-1.5 rounded-md border border-stone-300 text-xs" />
      </label>
      {message && (
        <p className={`text-[11px] ${message.type === 'error' ? 'text-[#A32D2D]' : 'text-[#3B6D11]'}`}>{message.text}</p>
      )}
      <button type="button" onClick={submit} className="px-3 py-1.5 rounded-md bg-stone-900 text-white text-xs font-medium self-start">パスワードを変更</button>
    </div>
  );
}
