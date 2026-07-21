import { useRef, useState } from 'react';
import { STORE_INFO } from '../../constants';

export default function StoreCard({
  storeKey, items, monthText, readonly, historical, hideHeader,
  comment = '', canComment, onSaveComment,
  pdfUrl = '', pdfName = '', onUploadPdf,
  onAdd, onToggle, onDelete,
}) {
  const [text, setText] = useState('');
  const [editingComment, setEditingComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState(comment);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const itemsInteractive = !readonly && !historical;

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  const saveComment = () => {
    onSaveComment(commentDraft.trim());
    setEditingComment(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    Promise.resolve(onUploadPdf(file)).finally(() => setUploading(false));
  };

  return (
    <div className={`rounded-2xl p-[14px_16px] ${readonly ? 'border border-stone-100 bg-white' : 'bg-[#F5F3EE]'}`}>
      {!hideHeader && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-[13px] font-semibold">{STORE_INFO[storeKey].label}</span>
          {monthText && <span className="text-[11px] text-stone-400">{monthText}</span>}
        </div>
      )}
      {items.length === 0 && <span className="text-[11px] text-stone-400">取組項目がありません</span>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-[7px] text-xs text-stone-500 mb-1">
          <input
            type="checkbox"
            checked={item.done}
            disabled={!itemsInteractive}
            onChange={() => onToggle && onToggle(item.id)}
            className="w-[13px] h-[13px] accent-[#1D9E75] flex-shrink-0"
          />
          <span className={item.done ? 'line-through text-stone-400' : ''}>{item.text}</span>
          {itemsInteractive && (
            <button type="button" onClick={() => onDelete(item.id)} className="ml-auto text-stone-400 hover:text-stone-700 text-[11px] px-0.5">✕</button>
          )}
        </div>
      ))}
      {itemsInteractive && (
        <div className="flex gap-1.5 mt-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submit()}
            placeholder="取組を追加..."
            className="flex-1 px-[7px] py-1 rounded-md border border-stone-300 text-xs"
          />
          <button type="button" onClick={submit} className="px-[9px] py-1 rounded-md border border-stone-300 bg-white text-xs">追加</button>
        </div>
      )}

      {onSaveComment && (comment || canComment) && (
        <div className="mt-2.5 pt-2 border-t border-stone-200/70">
          <div className="text-[10px] text-stone-500 mb-1">SMコメント</div>
          {editingComment ? (
            <div className="flex flex-col gap-1.5">
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                rows={2}
                className="w-full px-[7px] py-1 rounded-md border border-stone-300 text-xs resize-none"
              />
              <div className="flex gap-1.5">
                <button type="button" onClick={() => { setCommentDraft(comment); setEditingComment(false); }} className="px-2 py-0.5 rounded-md border border-stone-300 bg-white text-[11px]">キャンセル</button>
                <button type="button" onClick={saveComment} className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[11px]">保存</button>
              </div>
            </div>
          ) : comment ? (
            <div className="flex items-start gap-1.5">
              <p className="text-xs text-stone-600 flex-1 whitespace-pre-wrap">{comment}</p>
              {canComment && (
                <button type="button" onClick={() => { setCommentDraft(comment); setEditingComment(true); }} className="text-stone-400 hover:text-stone-900 text-xs flex-shrink-0">✎</button>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => { setCommentDraft(''); setEditingComment(true); }} className="text-[11px] px-2 py-0.5 rounded-md border border-stone-300 bg-white text-stone-600">＋ コメントを追加</button>
          )}
        </div>
      )}

      {onUploadPdf && (pdfName || canComment) && (
        <div className="mt-2.5 pt-2 border-t border-stone-200/70">
          <div className="text-[10px] text-stone-500 mb-1">ミーティング記録（PDF）</div>
          <div className="flex items-center gap-1.5">
            {pdfName && <span className="text-xs text-stone-600 flex-1 truncate">📄 {pdfName}</span>}
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-[11px] px-2 py-0.5 rounded-md border border-stone-300 bg-white text-stone-600 flex-shrink-0">閲覧する</a>
            )}
            {canComment && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-[11px] px-2 py-0.5 rounded-md border border-stone-300 bg-white text-stone-600 flex-shrink-0 disabled:opacity-50"
                >{uploading ? 'アップロード中…' : pdfName ? '再アップロード' : '＋ PDFアップロード'}</button>
                <input type="file" ref={fileInputRef} accept="application/pdf" className="hidden" onChange={handleFileChange} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
