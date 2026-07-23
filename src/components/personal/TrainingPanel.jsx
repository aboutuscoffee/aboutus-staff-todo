import { useState } from 'react';
import ProgressBar from '../common/ProgressBar';
import { TRAINING_DATA, ONLINE_STORE_MODULE, ADVANCED_TRAINING_GROUP, trainingItemId, advancedFinalCheckId } from '../../lib/trainingData';

const GROUP_ICON = { service: '🔔', coffee: '☕', espresso: '🥤', management: '🗂️', advanced: '🚀' };

function itemState(trainingProgress, itemId) {
  const row = trainingProgress.find((p) => p.item_id === itemId);
  return { taught: !!row?.taught, can: !!row?.can };
}

function effectiveSubcategories(grp, hasOnlineStore) {
  if (grp.icon === 'management' && hasOnlineStore) return [...grp.subcategories, ONLINE_STORE_MODULE];
  return grp.subcategories;
}

// 追加スキルアップ研修は「本人のできるチェック」と「カテゴリ単位のSM・GM最終チェック」の
// 2つの指標を持つため、他グループのできる/確認集計とは別に計算する。
function advancedStats(grp, gi, trainingProgress) {
  const items = grp.subcategories.flatMap((sc, si) => sc.items.map((_, ii) => trainingItemId(gi, si, ii)));
  const selfN = items.filter((id) => itemState(trainingProgress, id).can).length;
  const finalN = grp.subcategories.filter((_, si) => itemState(trainingProgress, advancedFinalCheckId(si)).can).length;
  return { selfN, totalItems: items.length, finalN, totalCategories: grp.subcategories.length };
}

function GroupCard({ grp, gi, hasOnlineStore, hasAdvancedTraining, trainingProgress, onOpen }) {
  if (grp.icon === 'advanced') {
    const { selfN, totalItems, finalN, totalCategories } = advancedStats(grp, gi, trainingProgress);
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
          {!hasAdvancedTraining && (
            <span className="text-[10px] text-[#B4700B] bg-[#FDF6E9] rounded-full px-2 py-0.5 flex-shrink-0">プレビュー</span>
          )}
          <span className="text-[11px] text-stone-400 flex-shrink-0">{totalItems}項目</span>
          <span className="text-stone-300 flex-shrink-0">›</span>
        </div>
        <div className="flex gap-4 mt-2.5 pt-2.5 border-t border-stone-100 text-[11px] text-stone-500">
          <span>自己チェック {selfN}/{totalItems}</span>
          <span>最終チェック {finalN}/{totalCategories}カテゴリ</span>
        </div>
      </button>
    );
  }

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
        <span>できる {taughtN}/{items.length}</span>
        <span>確認 {canN}/{items.length}</span>
      </div>
    </button>
  );
}

function ItemRow({ text, note, itemId, taught, can, canConfirm, onToggleItem }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 border-b border-stone-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] leading-snug">{text}</div>
        {note && <div className="text-[11px] text-stone-400 mt-0.5">{note}</div>}
      </div>
      <div className="flex flex-shrink-0">
        <div className="w-9 flex justify-center">
          <input
            type="checkbox"
            checked={taught}
            onChange={() => onToggleItem(itemId, 'taught')}
            className="w-[15px] h-[15px] cursor-pointer accent-[#1D9E75]"
          />
        </div>
        <div className="w-9 flex justify-center">
          <input
            type="checkbox"
            checked={can}
            disabled={!canConfirm}
            onChange={() => onToggleItem(itemId, 'can')}
            className="w-[15px] h-[15px] accent-[#1D9E75] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

function SelfCheckItemRow({ text, note, itemId, can, enabled, onToggleItem }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 px-3 border-b border-stone-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] leading-snug">{text}</div>
        {note && <div className="text-[11px] text-stone-400 mt-0.5">{note}</div>}
      </div>
      <label className={`flex flex-col items-center gap-0.5 text-[9px] flex-shrink-0 pl-2 ${enabled ? 'text-stone-400 cursor-pointer' : 'text-stone-300'}`}>
        <input
          type="checkbox"
          checked={can}
          disabled={!enabled}
          onChange={() => onToggleItem(itemId, 'can')}
          className="w-[15px] h-[15px] accent-[#1D9E75] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        />
        できる
      </label>
    </div>
  );
}

function FinalCheckRow({ itemId, checked, canConfirm, onToggleItem }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2.5 px-3 bg-stone-50">
      <span className={`text-[12px] font-medium ${checked ? 'text-[#0F5C42]' : 'text-stone-500'}`}>SM・GM 最終チェック</span>
      <label className={canConfirm ? 'cursor-pointer' : ''}>
        <input
          type="checkbox"
          checked={checked}
          disabled={!canConfirm}
          onChange={() => onToggleItem(itemId, 'can')}
          className="w-[16px] h-[16px] accent-[#1D9E75] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        />
      </label>
    </div>
  );
}

function GroupDetail({ grp, gi, hasOnlineStore, hasAdvancedTraining, trainingProgress, canConfirm, onToggleItem, onAddOnlineStore, onBack }) {
  if (grp.icon === 'advanced') {
    const { selfN, totalItems, finalN, totalCategories } = advancedStats(grp, gi, trainingProgress);
    const started = hasAdvancedTraining;
    return (
      <div>
        <button type="button" onClick={onBack} className="text-[12px] text-stone-500 hover:text-stone-900 mb-3">← 戻る</button>
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b-2 border-stone-900">
          <span className="text-lg flex-shrink-0">{GROUP_ICON[grp.icon]}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-wide text-stone-400">{grp.eyebrow}</div>
            <div className="text-base font-semibold">{grp.title}</div>
          </div>
          <span className="text-[11px] text-stone-400 flex-shrink-0">{totalItems}項目</span>
        </div>

        <div className="rounded-2xl border border-stone-100 bg-white p-4 mb-4">
          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
            <span>自己チェック {selfN}/{totalItems}</span>
            <span>最終チェック {finalN}/{totalCategories}カテゴリ</span>
          </div>
          <ProgressBar pct={totalCategories ? Math.round((finalN / totalCategories) * 100) : 0} />
        </div>
        <div className="text-[11px] text-stone-400 mb-3 px-1">
          {started
            ? '各項目は本人の「できる」チェック、カテゴリごとの最終チェックはSM・GMのみ操作できます。目標の達成率は最終チェックの完了率で決まります。'
            : '内容の確認のみできます。新人研修が完了すると「＋ 追加研修を始める」からチェックを開始できます。'}
        </div>

        {grp.subcategories.map((sc, si) => {
          const finalId = advancedFinalCheckId(si);
          const finalChecked = itemState(trainingProgress, finalId).can;
          return (
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
                    <SelfCheckItemRow
                      key={itemId}
                      text={item.text}
                      note={item.note}
                      itemId={itemId}
                      can={s.can}
                      enabled={started}
                      onToggleItem={onToggleItem}
                    />
                  );
                })}
                <FinalCheckRow itemId={finalId} checked={finalChecked} canConfirm={canConfirm && started} onToggleItem={onToggleItem} />
              </div>
            </div>
          );
        })}

        <button type="button" onClick={onBack} className="text-[12px] text-stone-500 hover:text-stone-900 mt-2">← 戻る</button>
      </div>
    );
  }

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
          <span>できる {taughtN}/{items.length}</span>
          <span>確認 {canN}/{items.length}</span>
        </div>
        <ProgressBar pct={items.length ? Math.round((canN / items.length) * 100) : 0} />
      </div>

      {subcategories.map((sc, si) => (
        <div key={si} className="mb-4">
          <div className="flex items-baseline justify-between px-3 mb-1.5">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[11px] font-bold text-stone-500 tracking-wide truncate">{sc.title}</span>
              <span className="text-[10px] text-stone-400 flex-shrink-0">{sc.items.length}項目</span>
            </div>
            <div className="flex flex-shrink-0">
              <div className="w-9 flex justify-center text-[10px] text-stone-400 font-medium">できる</div>
              <div className="w-9 flex justify-center text-[10px] text-stone-400 font-medium">確認</div>
            </div>
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

  const groups = [...TRAINING_DATA, ADVANCED_TRAINING_GROUP];
  const summaryGroups = hasAdvancedTraining ? groups : TRAINING_DATA;
  const allItems = summaryGroups.flatMap((grp, gi) =>
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
        hasAdvancedTraining={hasAdvancedTraining}
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
          <span>できる {totalTaught}/{allItems.length}</span>
          <span>確認 {totalCan}/{allItems.length}</span>
        </div>
        <ProgressBar pct={allItems.length ? Math.round((totalCan / allItems.length) * 100) : 0} />
      </div>
      {!canConfirm && (
        <div className="text-[11px] text-stone-400 mb-3 px-1">「確認」のチェックはSM・GMのみ操作できます</div>
      )}
      {groups.map((grp, gi) => (
        <GroupCard key={grp.icon} grp={grp} gi={gi} hasOnlineStore={hasOnlineStore} hasAdvancedTraining={hasAdvancedTraining} trainingProgress={trainingProgress} onOpen={() => setActiveGroup(grp.icon)} />
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
