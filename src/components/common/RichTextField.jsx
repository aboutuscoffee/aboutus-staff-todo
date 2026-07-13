import { forwardRef, useImperativeHandle, useRef } from 'react';

const FONT_SIZES = [
  { v: '', l: 'サイズ' },
  { v: '12px', l: '小' },
  { v: '14px', l: '標準' },
  { v: '18px', l: '大' },
  { v: '22px', l: '特大' },
];

function toggleInlineTag(rootEl, tagName) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  if (!rootEl.contains(range.commonAncestorContainer)) return;

  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  const closest = container.closest ? container.closest(tagName) : null;

  if (closest && rootEl.contains(closest)) {
    const parent = closest.parentNode;
    while (closest.firstChild) parent.insertBefore(closest.firstChild, closest);
    parent.removeChild(closest);
  } else {
    const wrapper = document.createElement(tagName);
    try {
      range.surroundContents(wrapper);
    } catch {
      const frag = range.extractContents();
      wrapper.appendChild(frag);
      range.insertNode(wrapper);
    }
  }
  sel.removeAllRanges();
}

function wrapFontSize(rootEl, size) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  if (!rootEl.contains(range.commonAncestorContainer)) return;
  const wrapper = document.createElement('span');
  wrapper.style.fontSize = size;
  try {
    range.surroundContents(wrapper);
  } catch {
    const frag = range.extractContents();
    wrapper.appendChild(frag);
    range.insertNode(wrapper);
  }
  sel.removeAllRanges();
}

const RichTextField = forwardRef(function RichTextField({ label, defaultValue, placeholder }, ref) {
  const editableRef = useRef(null);
  const savedRangeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getHTML: () => editableRef.current?.innerHTML.trim() ?? '',
  }));

  const focusEditor = () => editableRef.current?.focus();

  const saveSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (editableRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    if (!savedRangeRef.current) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRangeRef.current);
    savedRangeRef.current = null;
  };

  const btn = (label2, tag) => (
    <button
      type="button"
      className="w-6 h-6 rounded text-stone-500 hover:bg-white hover:text-stone-900 text-xs flex items-center justify-center"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => { focusEditor(); toggleInlineTag(editableRef.current, tag); }}
    >
      {label2}
    </button>
  );

  return (
    <div className="flex flex-col gap-1">
      {label && <div className="text-[11px] font-medium text-stone-500">{label}</div>}
      <div className="flex gap-0.5 p-1 bg-stone-100 rounded-t-md border border-stone-300 border-b-0">
        <select
          className="h-6 border-none bg-transparent text-[11px] text-stone-500 cursor-pointer rounded"
          onMouseDown={saveSelection}
          onChange={(e) => { const size = e.target.value; focusEditor(); restoreSelection(); wrapFontSize(editableRef.current, size); e.target.value = ''; }}
        >
          {FONT_SIZES.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
        </select>
        <span className="w-px bg-stone-300 mx-0.5" />
        {btn(<b>B</b>, 'b')}
        {btn(<i>I</i>, 'i')}
        {btn(<u>U</u>, 'u')}
        {btn(<s>S</s>, 's')}
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
