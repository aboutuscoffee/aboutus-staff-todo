export default function StatusSelect({ value, onChange, disabled }) {
  const active = value === 'review';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(active ? '' : 'review')}
      className={`text-[11px] px-[7px] py-[2px] rounded-full border font-medium disabled:cursor-default disabled:opacity-60 ${
        active ? 'bg-[#EEEDFE] text-[#3C3489] border-[#CECBF6]' : 'bg-stone-100 text-stone-400 border-stone-200'
      }`}
    >確認待ち</button>
  );
}
