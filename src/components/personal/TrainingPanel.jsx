import { useState } from 'react';
import ProgressBar from '../common/ProgressBar';
import { TRAINING_DATA, ONLINE_STORE_MODULE, ADVANCED_TRAINING_GROUP, trainingItemId } from '../../lib/trainingData';

const GROUP_ICON = { service: '🔔', coffee: '☕', espresso: '🥤', management: '🗂️', advanced: '🚀' };

function itemState(trainingProgress, itemId) {
  const row = trainingProgress.find((p) => p.item_id === itemId);
  return { taught: !!row?.taught, can: !!row?.can };
}

function effectiveSubcategories(grp, hasOnlineStore) {
  if (grp.icon === 'management' && hasOnlineStore) return [...grp.subcategories, ONLINE_STORE_MODULE];
  return grp.subcategories;
}

function GroupCard({ grp, gi, hasOnlineStore, trainingProgress, onOpen }) {
  const subcategories = effectiveSubcategories(grp, hasOnlineStore);
  const items = subcategories.flatMap((sc, si) => sc.items.map((_, ii) => trainingItemId(gi, si, ii)));
  const taughtN = items.filter((id) => itemState(trainingProgress, id).taught).length;
  const canN = items.filter((id) => itemState(trainingProgress, id).can).length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-2xl border border-stone-100 bg-white p-4 mb-2 hover:border-stone-300 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg flex-shrink-0">{GROUP_ICON[grp.icon]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-wide text-stone-400">{grp.eyebrow}</div>
          <div className="text-sm font-semibold">{grp.title}</div>
        </div>
        <span className="text-[11px] text-stone-400 flex-shrink-0">{items.length}項目</span>
        <span className="text-stone-300 flex-shrink-0">›</span>
      </div>
      <div className="flex gap-4 mt-2.5 pt-2.5 border-t border-stone-100 text-[11px] text-stone-500">
        <span>教えてもらった {taughtN}/{items.length}</span>
        <span>できる {canN}/{items.length}</span>
      </div>
    </button>
  );
}

function ItemRow({ text, note, itemId, taught, can, canConfirm, onToggleItem }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 px-3 border-b border-stone-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] leading-snug">{text}</div>
        {note && <div className="text-[11px] text-stone-400 mt-0.5">{note}</div>}
      </div>
      <div className="flex gap-3 flex-shrink-0 pl-2">
        <label className="flex flex-col items-center gap-0.5 text-[9px] text-stone-400 cursor-pointer">
          <input
            type="checkbox"
            checked={taught}
            onChange={() => onToggleItem(itemId, 'taught')}
            className="w-[15px] h-[15px] cursor-pointer accent-[#B4700B]"
          />
          教わった
        </label>
        <label className={`flex flex-col items-center gap-0.5 text-[9px] ${canConfirm ? 'text-stone-400 cursor-pointer' : 'text-stone-300'}`}>
          <input
            type="checkbox"
            checked={can}
            disabled={!canConfirm}
            onChange={() => onToggleItem(itemId, 'can')}
            className="w-[15px] h-[15px] accent-[#1D9E75] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          />
          できる
        </label>
      </div>
    </div>
  );
}

function GroupDetail({ grp, gi, hasOnlineStore, trainingProgress, canConfirm, onToggleItem, onAddOnlineStore, onBack }) {
  const subcategories = effectiveSubcategories(grp, hasOnlineStore);
  const items = subcategories.flatMap((sc, si) => sc.items.map((_, ii) => trainingItemId(gi, si, ii)));
  const taughtN = items.filter((id) => itemState(trainingProgress, id).taught).length;
  const canN = items.filter((id) => itemState(trainingProgress, id).can).length;

  return (
    <div>
      <button type="button" onClick={onBack} className="text-[12px] text-stone-500 hover:text-stone-900 mb-3">← 戻る</button>
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b-2 border-stone-900">
        <span className="text-lg flex-shrink-0">{GROUP_ICON[grp.icon]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-wide text-stone-400">{grp.eyebrow}</div>
          <div className="text-base font-semibold">{grp.title}</div>
        </div>
        <span className="text-[11px] text-stone-400 flex-shrink-0">{items.length}項目</span>
      </div>

      <div className="rounded-2xl border border-stone-100 bg-white p-4 mb-4">
        <div className="flex justify-between text-[11px] text-stone-500 mb-1">
          <span>教えてもらった {taughtN}/{items.length}</span>
          <span>できる {canN}/{items.length}</span>
        </div>
        <ProgressBar pct={items.length ? Math.round((canN / items.length) * 100) : 0} />
      </div>

      {subcategories.map((sc, si) => (
        <div key={si} className="mb-4">
          <div className="flex items-baseline justify-between px-1 mb-1.5">
            <span className="text-[11px] font-bold text-stone-500 tracking-wide">{sc.title}</span>
            <span className="text-[10px] text-stone-400">{sc.items.length}項目</span>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
            {sc.items.map((raw, ii) => {
              const item = typeof raw === 'string' ? { text: raw } : raw;
              const itemId = trainingItemId(gi, si, ii);
              const s = itemState(trainingProgress, itemId);
              return (
                <ItemRow
                  key={itemId}
                  text={item.text}
                  note={item.note}
                  itemId={itemId}
                  taught={s.taught}
                  can={s.can}
                  canConfirm={canConfirm}
                  onToggleItem={onToggleItem}
                />
              );
            })}
          </div>
        </div>
      ))}

      {grp.icon === 'management' && !hasOnlineStore && canConfirm && (
        <button
          type="button"
          onClick={onAddOnlineStore}
          className="w-full text-left rounded-2xl border border-dashed border-stone-300 text-stone-500 p-3.5 mb-4 text-[13px] hover:border-stone-400 hover:text-stone-700"
        >＋ オンラインストア業務研修を追加</button>
      )}

      <button type="button" onClick={onBack} className="text-[12px] text-stone-500 hover:text-stone-900 mt-2">← 戻る</button>
    </div>
  );
}

export default function TrainingPanel({ trainingProgress, canConfirm, hasOnlineStore, hasAdvancedTraining, onToggleItem, onAddOnlineStore, onStartAdvancedTraining }) {
  const [activeGroup, setActiveGroup] = useState(null);

  const baseItems = TRAINING_DATA.flatMap((grp, gi) =>
    effectiveSubcategories(grp, hasOnlineStore).flatMap((sc, si) => sc.items.map((_, ii) => trainingItemId(gi, si, ii)))
  );
  const baseComplete = baseItems.length > 0 && baseItems.every((id) => itemState(trainingProgress, id).can);

  const groups = hasAdvancedTraining ? [...TRAINING_DATA, ADVANCED_TRAINING_GROUP] : TRAINING_DATA;
  const allItems = groups.flatMap((grp, gi) =>
    effectiveSubcategories(grp, hasOnlineStore).flatMap((sc, si) => sc.items.map((_, ii) => trainingItemId(gi, si, ii)))
  );
  const totalTaught = allItems.filter((id) => itemState(trainingProgress, id).taught).length;
  const totalCan = allItems.filter((id) => itemState(trainingProgress, id).can).length;

  if (activeGroup !== null) {
    const gi = groups.findIndex((g) => g.icon === activeGroup);
    return (
      <GroupDetail
        grp={groups[gi]}
        gi={gi}
        hasOnlineStore={hasOnlineStore}
        trainingProgress={trainingProgress}
        canConfirm={canConfirm}
        onToggleItem={onToggleItem}
        onAddOnlineStore={onAddOnlineStore}
        onBack={() => setActiveGroup(null)}
      />
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-stone-100 bg-white p-4 mb-4">
        <div className="flex justify-between text-[11px] text-stone-500 mb-1">
          <span>教えてもらった {totalTaught}/{allItems.length}</span>
          <span>できる {totalCan}/{allItems.length}</span>
        </div>
        <ProgressBar pct={allItems.length ? Math.round((totalCan / allItems.length) * 100) : 0} />
      </div>
      {!canConfirm && (
        <div className="text-[11px] text-stone-400 mb-3 px-1">「できる」のチェックはSM・GMのみ操作できます</div>
      )}
      {groups.map((grp, gi) => (
        <GroupCard key={grp.icon} grp={grp} gi={gi} hasOnlineStore={hasOnlineStore} trainingProgress={trainingProgress} onOpen={() => setActiveGroup(grp.icon)} />
      ))}
      {!hasAdvancedTraining && baseComplete && canConfirm && (
        <button
          type="button"
          onClick={onStartAdvancedTraining}
          className="w-full text-left rounded-2xl border border-dashed border-stone-300 text-stone-500 p-4 mt-2 text-[13px] hover:border-stone-400 hover:text-stone-700"
        >＋ 追加研修を始める</button>
      )}
    </div>
  );
}
