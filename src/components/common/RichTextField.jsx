import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const FONT_SIZES = [
  { v: '12px', l: '小' },
  { v: '14px', l: '標準' },
  { v: '18px', l: '大' },
  { v: '22px', l: '特大' },
];

function applyFontSize(rootEl, px) {
  document.execCommand('fontSize', false, '7');
  rootEl.querySelectorAll('font[size="7"]').forEach((f) => {
    const span = document.createElement('span');
    span.style.fontSize = px;
    while (f.firstChild) span.appendChild(f.firstChild);
    f.parentNode.replaceChild(span, f);
  });
}

const RichTextField = forwardRef(function RichTextField({ label, defaultValue, placeholder }, ref) {
  const editableRef = useRef(null);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    getHTML: () => editableRef.current?.innerHTML.trim() ?? '',
  }));

  const focusEditor = () => editableRef.current?.focus();

  const toolbarBtn = (label2, onClick, active) => (
    <button
      type="button"
      className={`w-6 h-6 rounded text-xs flex items-center justify-center ${active ? 'bg-white text-stone-900' : 'text-stone-500 hover:bg-white hover:text-stone-900'}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => { focusEditor(); onClick(); }}
    >
      {label2}
    </button>
  );

  return (
    <div className="flex flex-col gap-1">
      {label && <div className="text-[11px] font-medium text-stone-500">{label}</div>}
      <div className="flex gap-0.5 p-1 bg-stone-100 rounded-t-md border border-stone-300 border-b-0 relative">
        <button
          type="button"
          className="h-6 px-1.5 rounded text-stone-500 hover:bg-white hover:text-stone-900 text-[11px] flex items-center gap-0.5"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setSizeMenuOpen((o) => !o)}
        >サイズ ▾</button>
        {sizeMenuOpen && (
          <div className="absolute left-0 top-full mt-0.5 bg-white border border-stone-300 rounded-md shadow-lg z-10 py-0.5 min-w-[64px]">
            {FONT_SIZES.map((f) => (
              <button
                key={f.v}
                type="button"
                className="block w-full text-left px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-100"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { focusEditor(); applyFontSize(editableRef.current, f.v); setSizeMenuOpen(false); }}
              >{f.l}</button>
            ))}
          </div>
        )}
        <span className="w-px bg-stone-300 mx-0.5" />
        {toolbarBtn(<b>B</b>, () => document.execCommand('bold'))}
        {toolbarBtn(<i>I</i>, () => document.execCommand('italic'))}
        {toolbarBtn(<u>U</u>, () => document.execCommand('underline'))}
        {toolbarBtn(<s>S</s>, () => document.execCommand('strikeThrough'))}
      </div>
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || ''}
        className="empty:before:content-[attr(data-placeholder)] empty:before:text-stone-400 min-h-[64px] px-[9px] py-[7px] rounded-b-md border border-stone-300 text-[12px] leading-relaxed overflow-y-auto focus:outline-none focus:border-stone-500"
        dangerouslySetInnerHTML={{ __html: defaultValue || '' }}
      />
    </div>
  );
});

export default RichTextField;
