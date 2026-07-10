import { useEffect, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { canAccessEval, canEditEval } from '../../lib/permissions';
import { evalRecordsForStaff, monthlyEvalRecordsForStaff } from '../../lib/selectors';
import EvalProfileView from './EvalProfileView';
import EvalProfileForm from './EvalProfileForm';
import EvalRecordView from './EvalRecordView';
import EvalRecordForm from './EvalRecordForm';
import MonthlyEvalView from './MonthlyEvalView';

export default function EvalPanel({ targetStaff, staff, roles, evalRecords, monthlyEvalRecords, onSaveProfile, onCreateRecord, onSaveRecord, onPrint, onSaveMonthlyEvalComment }) {
  const { loggedInUserKey, openLoginModal } = useSession();
  const isSelf = loggedInUserKey === targetStaff.key;
  const canAccess = loggedInUserKey && canAccessEval(staff, roles, loggedInUserKey, targetStaff.key);
  const canEdit = loggedInUserKey && canEditEval(staff, roles, loggedInUserKey, targetStaff.key);
  const canViewMonthly = canAccess || isSelf;

  const [subTab, setSubTab] = useState(canAccess ? 'profile' : 'monthly');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null); // null | 'new' | id
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const records = evalRecordsForStaff(evalRecords, targetStaff.key);
  const monthlyRecords = monthlyEvalRecordsForStaff(monthlyEvalRecords, targetStaff.key);

  useEffect(() => {
    if (selectedRecordId === null && records.length) setSelectedRecordId(records[records.length - 1].id);
  }, [records, selectedRecordId]);

  if (!loggedInUserKey || (!canAccess && !canViewMonthly)) {
    return (
      <div className="text-center text-stone-400 py-8 px-2.5">
        <div className="text-[13px] mb-2.5">評価ページの閲覧にはログインが必要です</div>
        <button
          type="button"
          onClick={() => openLoginModal({ subText: `${targetStaff.name}さんの評価ページを開くには認証が必要です` })}
          className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-[13px]"
        >ログインして閲覧</button>
      </div>
    );
  }

  const interviewerOptions = staff
    .filter((s) => roles.find((r) => r.key === s.role)?.can_edit)
    .map((s) => `${s.name}（${roles.find((r) => r.key === s.role)?.label}）`);

  return (
    <div>
      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        {canAccess && (
          <div
            className={`px-2.5 py-1.5 rounded-md border border-stone-300 text-[11px] cursor-pointer ${subTab === 'profile' ? 'bg-stone-100 font-medium' : 'bg-white'}`}
            onClick={() => { setSubTab('profile'); setEditingProfile(false); }}
          >プロファイル・総評</div>
        )}
        {canAccess && (
          <div
            className={`px-2.5 py-1.5 rounded-md border border-stone-300 text-[11px] cursor-pointer ${subTab === 'record' ? 'bg-stone-100 font-medium' : 'bg-white'}`}
            onClick={() => { setSubTab('record'); setEditingRecordId(null); }}
          >面談記録</div>
        )}
        {canViewMonthly && (
          <div
            className={`px-2.5 py-1.5 rounded-md border border-stone-300 text-[11px] cursor-pointer ${subTab === 'monthly' ? 'bg-stone-100 font-medium' : 'bg-white'}`}
            onClick={() => setSubTab('monthly')}
          >月間達成率</div>
        )}
        {canEdit && (
          <div
            className="px-2.5 py-1.5 rounded-md border border-stone-300 text-[11px] cursor-pointer bg-white"
            onClick={() => { setSubTab('record'); setEditingRecordId('new'); }}
          >＋ 新規面談記録</div>
        )}
      </div>

      {subTab === 'profile' && canAccess && (
        editingProfile
          ? <EvalProfileForm staffMember={targetStaff} onSave={(fields) => { onSaveProfile(fields); setEditingProfile(false); }} onCancel={() => setEditingProfile(false)} />
          : <EvalProfileView staffMember={targetStaff} canEdit={canEdit} onEdit={() => setEditingProfile(true)} />
      )}

      {subTab === 'record' && canAccess && (
        editingRecordId !== null
          ? (
            <EvalRecordForm
              record={editingRecordId === 'new' ? null : records.find((r) => r.id === editingRecordId)}
              interviewerOptions={interviewerOptions}
              onSave={(fields) => {
                if (editingRecordId === 'new') {
                  onCreateRecord(fields).then((created) => { if (created) setSelectedRecordId(created.id); });
                } else {
                  onSaveRecord(editingRecordId, fields);
                  setSelectedRecordId(editingRecordId);
                }
                setEditingRecordId(null);
              }}
              onCancel={() => setEditingRecordId(null)}
            />
          )
          : (
            <EvalRecordView
              records={records}
              selectedId={selectedRecordId}
              onSelectId={setSelectedRecordId}
              canEdit={canEdit}
              onEdit={(id) => setEditingRecordId(id)}
              onPrint={(id) => onPrint(targetStaff.name, records.find((r) => r.id === id))}
            />
          )
      )}

      {subTab === 'monthly' && canViewMonthly && (
        <MonthlyEvalView records={monthlyRecords} canEdit={canEdit} onSaveComment={onSaveMonthlyEvalComment} />
      )}
    </div>
  );
}
