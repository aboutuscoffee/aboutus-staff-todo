import { useState } from 'react';
import { STORE_KEYS, STORE_INFO } from '../../constants';
import { storeTodosForStore, pastStoreMonths, storeMonthNoteFor } from '../../lib/selectors';
import { findRole } from '../../lib/permissions';
import { monthKey, monthLabel } from '../../utils';
import { useSession } from '../../context/SessionContext';
import StoreCard from './StoreCard';

export default function StoreTodosView({ staff, roles, storeTodos, storeMonthNotes, onAdd, onToggle, onDelete, onSaveComment, onUploadPdf }) {
  const { loggedInUserKey } = useSession();
  const [openKey, setOpenKey] = useState(null);
  const currentYm = monthKey();

  const viewer = staff.find((s) => s.key === loggedInUserKey);
  const canComment = !!findRole(roles, viewer?.role)?.can_edit;

  const pastMonths = pastStoreMonths(storeTodos, currentYm);

  return (
    <div>
      <div className="text-[15px] font-semibold mb-3">🏪 店舗月次目標 — {monthLabel(currentYm)}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {STORE_KEYS.map((sk) => (
          <StoreCard
            key={sk}
            storeKey={sk}
            monthText={monthLabel(currentYm)}
            items={storeTodosForStore(storeTodos, sk, currentYm)}
            onAdd={(text) => onAdd(sk, text)}
            onToggle={(id) => onToggle(id)}
            onDelete={(id) => onDelete(id)}
            comment={storeMonthNoteFor(storeMonthNotes, sk, currentYm)?.comment || ''}
            canComment={canComment}
            onSaveComment={(text) => onSaveComment(sk, currentYm, text)}
            pdfUrl={storeMonthNoteFor(storeMonthNotes, sk, currentYm)?.pdf_url || ''}
            pdfName={storeMonthNoteFor(storeMonthNotes, sk, currentYm)?.pdf_name || ''}
            onUploadPdf={(file) => onUploadPdf(sk, currentYm, file)}
          />
        ))}
      </div>

      {pastMonths.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-stone-500 mb-2 pb-1.5 border-b border-stone-100">過去の目標</div>
          <div className="flex flex-col gap-1.5">
            {pastMonths.map(({ storeKey, yearMonth }) => {
              const comboKey = `${storeKey}|${yearMonth}`;
              const open = openKey === comboKey;
              return (
                <div key={comboKey} className="rounded-md border border-stone-100 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : comboKey)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left"
                  >
                    <span>{STORE_INFO[storeKey].label}・{monthLabel(yearMonth)}</span>
                    <span className="text-stone-400">{open ? '▲' : '▼'}</span>
                  </button>
                  {open && (
                    <div className="px-3 pb-3">
                      <StoreCard
                        storeKey={storeKey}
                        hideHeader
                        historical
                        items={storeTodosForStore(storeTodos, storeKey, yearMonth)}
                        comment={storeMonthNoteFor(storeMonthNotes, storeKey, yearMonth)?.comment || ''}
                        canComment={canComment}
                        onSaveComment={(text) => onSaveComment(storeKey, yearMonth, text)}
                        pdfUrl={storeMonthNoteFor(storeMonthNotes, storeKey, yearMonth)?.pdf_url || ''}
                        pdfName={storeMonthNoteFor(storeMonthNotes, storeKey, yearMonth)?.pdf_name || ''}
                        onUploadPdf={(file) => onUploadPdf(storeKey, yearMonth, file)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
