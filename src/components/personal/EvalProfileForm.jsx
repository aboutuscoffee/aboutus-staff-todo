import { useRef, useState } from 'react';
import RichTextField from '../common/RichTextField';

export default function EvalProfileForm({ staffMember, onSave, onCancel }) {
  const [hireDate, setHireDate] = useState(staffMember.hire_date || '');
  const [position, setPosition] = useState(staffMember.position || '');
  const [duties, setDuties] = useState(staffMember.duties || []);
  const [newDuty, setNewDuty] = useState('');
  const strengthsRef = useRef(null);
  const notesRef = useRef(null);
  const evalRef = useRef(null);

  const addDuty = () => {
    const v = newDuty.trim();
    if (!v || duties.includes(v)) return;
    setDuties((d) => [...d, v]);
    setNewDuty('');
  };
  const delDuty = (idx) => setDuties((d) => d.filter((_, i) => i !== idx));

  const save = () => {
    onSave({
      hire_date: hireDate || null,
      position,
      duties,
      strengths_html: strengthsRef.current.getHTML(),
      notes_html: notesRef.current.getHTML(),
      overall_eval_html: evalRef.current.getHTML(),
    });
  };

  return (
    <div className="flex flex-col gap-2.5 max-w-[560px]">
      <div className="flex flex-col gap-1">
        <div className="text-[11px] font-medium text-stone-500">入社日</div>
        <input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className="px-[9px] py-1.5 rounded-md border border-stone-300 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[11px] font-medium text-stone-500">役職</div>
        <input value={position} onChange={(e) => setPosition(e.target.value)} className="px-[9px] py-1.5 rounded-md border border-stone-300 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[11px] font-medium text-stone-500">担当業務</div>
        <div>
          {duties.map((d, i) => (
            <span key={d} className="inline-flex items-center gap-1.5 text-[11px] px-[9px] py-[3px] rounded-full bg-[#EEEDFE] text-[#3C3489] mr-1.5 mb-1.5">
              {d}
              <span className="cursor-pointer opacity-60 hover:opacity-100 text-[10px]" onClick={() => delDuty(i)}>✕</span>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1.5">
          <input
            type="text"
            value={newDuty}
            onChange={(e) => setNewDuty(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDuty(); } }}
            placeholder="担当業務を追加（例：撮影）"
            className="flex-1 px-2 py-1 rounded-md border border-stone-300 text-xs"
          />
          <button type="button" onClick={addDuty} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">＋ 追加</button>
        </div>
      </div>
      <RichTextField ref={strengthsRef} label="強み・得意なこと" defaultValue={staffMember.strengths_html} />
      <RichTextField ref={notesRef} label="特記事項・課題" defaultValue={staffMember.notes_html} />
      <div className="text-[11px] font-semibold text-stone-500 mt-1.5">GM / SM からの総評</div>
      <RichTextField ref={evalRef} defaultValue={staffMember.overall_eval_html} />
      <div className="flex gap-2 mt-1.5">
        <button type="button" onClick={save} className="px-4 py-2 rounded-md bg-stone-900 text-white text-[13px] font-medium">保存する</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border border-stone-300 bg-white text-[13px]">キャンセル</button>
      </div>
    </div>
  );
}
