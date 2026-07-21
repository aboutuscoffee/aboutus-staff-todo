import { useRef, useState } from 'react';
import { findRole } from '../../lib/permissions';
import { useSession } from '../../context/SessionContext';

function AddManualForm({ onAddLink, onUploadPdf, onCancel }) {
  const [mode, setMode] = useState('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const submitLink = () => {
    const t = title.trim();
    const u = url.trim();
    if (!t || !u) return;
    onAddLink(t, u);
    onCancel();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const t = title.trim() || file.name;
    setUploading(true);
    Promise.resolve(onUploadPdf(t, file)).finally(() => { setUploading(false); onCancel(); });
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 mt-1.5 flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setMode('link')} className={`px-2.5 py-1 rounded-md border text-[11px] ${mode === 'link' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-600'}`}>🔗 リンク</button>
        <button type="button" onClick={() => setMode('pdf')} className={`px-2.5 py-1 rounded-md border text-[11px] ${mode === 'pdf' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-600'}`}>📄 PDF</button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="マニュアル名"
        className="px-[7px] py-1 rounded-md border border-stone-300 text-xs"
      />
      {mode === 'link' ? (
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="px-[7px] py-1 rounded-md border border-stone-300 text-xs"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs text-stone-600 disabled:opacity-50 self-start"
          >{uploading ? 'アップロード中…' : 'PDFを選択'}</button>
          <input type="file" ref={fileInputRef} accept="application/pdf" className="hidden" onChange={handleFileChange} />
        </>
      )}
      <div className="flex gap-1.5 mt-0.5">
        <button type="button" onClick={onCancel} className="px-2 py-0.5 rounded-md border border-stone-300 bg-white text-[11px]">キャンセル</button>
        {mode === 'link' && (
          <button type="button" onClick={submitLink} className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[11px]">追加</button>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category, items, canEdit, onRename, onDelete, onAddLink, onUploadPdf, onDeleteManual }) {
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [addingManual, setAddingManual] = useState(false);

  const saveRename = () => {
    onRename(nameDraft.trim() || category.name);
    setRenaming(false);
  };

  const deleteCategory = () => {
    if (window.confirm(`「${category.name}」を削除しますか？中のマニュアルもすべて削除されます。`)) onDelete();
  };

  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-4 mb-3">
      <div className="flex justify-between items-center mb-2 gap-1.5">
        {renaming ? (
          <div className="flex gap-1.5 flex-1">
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && saveRename()}
              className="flex-1 px-[7px] py-1 rounded-md border border-stone-300 text-xs"
              autoFocus
            />
            <button type="button" onClick={saveRename} className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[11px]">保存</button>
            <button type="button" onClick={() => { setNameDraft(category.name); setRenaming(false); }} className="px-2 py-0.5 rounded-md border border-stone-300 bg-white text-[11px]">キャンセル</button>
            <button type="button" onClick={deleteCategory} className="px-2 py-0.5 rounded-md border border-[#E24B4A] text-[#E24B4A] text-[11px]">削除</button>
          </div>
        ) : (
          <>
            <span className="text-[13px] font-semibold">{category.name}</span>
            {canEdit && (
              <div className="flex gap-2.5 flex-shrink-0 items-center">
                <button type="button" onClick={() => setAddingManual((v) => !v)} className="text-stone-400 hover:text-stone-900 text-base leading-none" aria-label="マニュアルを追加">＋</button>
                <button type="button" onClick={() => setRenaming(true)} className="text-stone-400 hover:text-stone-900 text-xs">✎</button>
              </div>
            )}
          </>
        )}
      </div>

      {items.length === 0 && !canEdit && <span className="text-[11px] text-stone-400">マニュアルがありません</span>}
      {items.map((m) => (
        <div key={m.id} className="flex items-center gap-[7px] text-xs mb-1">
          <a href={m.url} target="_blank" rel="noreferrer" className="flex items-center gap-[6px] text-stone-700 hover:text-stone-900 flex-1 min-w-0">
            <span className="flex-shrink-0">{m.type === 'pdf' ? '📄' : '🔗'}</span>
            <span className="truncate underline decoration-stone-300">{m.title}</span>
          </a>
          {canEdit && (
            <button type="button" onClick={() => onDeleteManual(m.id)} className="text-stone-400 hover:text-[#E24B4A] text-[11px] px-0.5 flex-shrink-0">✕</button>
          )}
        </div>
      ))}

      {canEdit && addingManual && (
        <AddManualForm onAddLink={onAddLink} onUploadPdf={onUploadPdf} onCancel={() => setAddingManual(false)} />
      )}
    </div>
  );
}

export default function ManualsView({ staff, roles, manualCategories, manuals, onAddCategory, onRenameCategory, onDeleteCategory, onAddLink, onUploadPdf, onDeleteManual }) {
  const { loggedInUserKey } = useSession();
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const viewer = staff.find((s) => s.key === loggedInUserKey);
  const canEdit = !!findRole(roles, viewer?.role)?.can_edit;

  const sortedCategories = manualCategories.slice().sort((a, b) => a.sort_order - b.sort_order);

  const submitCategory = () => {
    const t = categoryName.trim();
    if (!t) return;
    onAddCategory(t);
    setCategoryName('');
    setAddingCategory(false);
  };

  return (
    <div>
      <div className="text-[15px] font-semibold mb-3">📚 マニュアル一覧</div>

      {sortedCategories.length === 0 && !canEdit && (
        <p className="text-xs text-stone-400">マニュアルはまだありません</p>
      )}

      {sortedCategories.map((c) => (
        <CategoryCard
          key={c.id}
          category={c}
          items={manuals.filter((m) => m.category_id === c.id).slice().sort((a, b) => a.sort_order - b.sort_order)}
          canEdit={canEdit}
          onRename={(name) => onRenameCategory(c.id, name)}
          onDelete={() => onDeleteCategory(c.id)}
          onAddLink={(title, url) => onAddLink(c.id, title, url)}
          onUploadPdf={(title, file) => onUploadPdf(c.id, title, file)}
          onDeleteManual={onDeleteManual}
        />
      ))}

      {canEdit && (
        addingCategory ? (
          <div className="rounded-2xl border border-stone-100 bg-white p-4 mb-3 flex gap-1.5">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submitCategory()}
              placeholder="カテゴリ名"
              className="flex-1 px-[7px] py-1 rounded-md border border-stone-300 text-xs"
              autoFocus
            />
            <button type="button" onClick={submitCategory} className="px-2.5 py-1 rounded-md bg-stone-900 text-white text-xs">追加</button>
            <button type="button" onClick={() => { setCategoryName(''); setAddingCategory(false); }} className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs">キャンセル</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCategory(true)}
            className="w-full text-left rounded-2xl border border-dashed border-stone-300 text-stone-500 p-4 text-[13px] hover:border-stone-400 hover:text-stone-700"
          >＋ カテゴリを追加</button>
        )
      )}
    </div>
  );
}
