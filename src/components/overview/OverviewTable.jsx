import { useMemo, useState } from 'react';
import { STORE_INFO, STORE_KEYS, STATUS_LABELS } from '../../constants';
import DutyBadge from '../common/DutyBadge';
import { dlClass, dlLabel, fmtMin } from '../../utils';

export default function OverviewTable({ staff, roles, tasks, onToggleDone, onOpenPersonal }) {
  const [roleFilter, setRoleFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const overviewRoles = roles.filter((r) => r.show_in_overview);

  const rows = useMemo(() => {
    const out = [];
    staff.forEach((s) => {
      const role = roles.find((r) => r.key === s.role);
      if (!role?.show_in_overview) return;
      if (roleFilter !== 'all' && s.role !== roleFilter) return;
      if (storeFilter !== 'all' && !s.stores.includes(storeFilter)) return;
      tasks.filter((t) => t.staff_key === s.key).forEach((t) => {
        let pass = true;
        if (statusFilter === 'open' && t.done) pass = false;
        else if (statusFilter === 'done' && !t.done) pass = false;
        else if (statusFilter === 'inprogress' && (t.status !== 'inprogress' || t.done)) pass = false;
        else if (statusFilter === 'review' && (t.status !== 'review' || t.done)) pass = false;
        else if (statusFilter === 'none_status' && (t.status !== '' || t.done)) pass = false;
        if (pass) out.push({ s, t });
      });
    });
    out.sort((a, b) => {
      if (a.t.done !== b.t.done) return a.t.done ? 1 : -1;
      const da = a.t.deadline || '', db = b.t.deadline || '';
      if (da !== db) return da < db ? -1 : 1;
      return (a.t.duty || '').localeCompare(b.t.duty || '');
    });
    return out;
  }, [staff, roles, tasks, roleFilter, storeFilter, statusFilter]);

  return (
    <div>
      <div className="flex flex-col gap-2.5 mb-[18px]">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-stone-300 text-[15px] appearance-none bg-white">
          <option value="all">全役職</option>
          {overviewRoles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-stone-300 text-[15px] appearance-none bg-white">
          <option value="all">全店舗</option>
          {STORE_KEYS.map((sk) => <option key={sk} value={sk}>{STORE_INFO[sk].label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-stone-300 text-[15px] appearance-none bg-white">
          <option value="all">全ステータス・全状態</option>
          <option value="open">未完了のみ</option>
          <option value="done">完了のみ</option>
          <option value="inprogress">取組中</option>
          <option value="review">確認待ち</option>
          <option value="none_status">ステータスなし（未完了）</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px] table-fixed">
          <thead>
            <tr>
              <th className="w-[22px]" />
              <th className="w-[70px] text-left font-medium text-stone-500 text-xs px-3 py-2.5 border-b border-stone-300 whitespace-nowrap">スタッフ</th>
              <th className="text-left font-medium text-stone-500 text-xs px-3 py-2.5 border-b border-stone-300 whitespace-nowrap">タスク</th>
              <th className="w-[80px] text-left font-medium text-stone-500 text-xs px-3 py-2.5 border-b border-stone-300 whitespace-nowrap">担当業務</th>
              <th className="w-[80px] text-left font-medium text-stone-500 text-xs px-3 py-2.5 border-b border-stone-300 whitespace-nowrap">ステータス</th>
              <th className="w-[64px] text-left font-medium text-stone-500 text-xs px-3 py-2.5 border-b border-stone-300 whitespace-nowrap">目標時間</th>
              <th className="w-[68px] text-left font-medium text-stone-500 text-xs px-3 py-2.5 border-b border-stone-300 whitespace-nowrap">作業日</th>
              <th className="w-[68px] text-left font-medium text-stone-500 text-xs px-3 py-2.5 border-b border-stone-300 whitespace-nowrap">期限</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-3.5 py-3.5 text-xs text-stone-500">該当なし</td></tr>
            )}
            {rows.map(({ s, t }) => {
              const dc = dlClass(t.deadline, t.done);
              return (
                <tr key={t.id} className={t.done ? 'opacity-40' : ''}>
                  <td className="px-3 py-3.5 border-b border-stone-100">
                    <input type="checkbox" checked={t.done} onChange={() => onToggleDone(s.key, t.id)} className="w-[13px] h-[13px] cursor-pointer accent-[#1D9E75]" />
                  </td>
                  <td className="px-3 py-3.5 border-b border-stone-100">
                    <button type="button" onClick={() => onOpenPersonal(s.key)} className="bg-white border border-stone-300 rounded-md text-stone-900 text-xs font-medium px-2.5 py-1 hover:border-[#1D9E75] hover:text-[#1D9E75]">{s.name}</button>
                  </td>
                  <td className="px-3 py-3.5 border-b border-stone-100 whitespace-normal break-words">
                    <span className={t.done ? 'line-through text-stone-500' : ''}>{t.text}</span>
                  </td>
                  <td className="px-3 py-3.5 border-b border-stone-100"><DutyBadge duty={t.duty} /></td>
                  <td className={`px-3 py-3.5 border-b border-stone-100 text-xs ${t.status === 'inprogress' ? 'text-[#185FA5]' : t.status === 'review' ? 'text-[#3C3489]' : 'text-stone-400'}`}>
                    {t.status ? STATUS_LABELS[t.status] : '-'}
                  </td>
                  <td className="px-3 py-3.5 border-b border-stone-100 text-xs text-[#085041]">{fmtMin(t.minutes) || '-'}</td>
                  <td className="px-3 py-3.5 border-b border-stone-100 text-xs text-stone-500">{t.workdate ? dlLabel(t.workdate) : '-'}</td>
                  <td className="px-3 py-3.5 border-b border-stone-100">
                    <span className={`text-xs ${dc ? `px-1.5 py-0.5 rounded-full ${dc === 'overdue' ? 'bg-[#FAECE7] text-[#993C1D]' : 'bg-[#FAEEDA] text-[#854F0B]'}` : ''}`}>
                      {t.deadline ? dlLabel(t.deadline) : '-'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
