import { useState, useEffect } from 'react';

const THUMB_SIZE = 13;

export default function ProgressSlider({ value, onCommit, disabled }) {
  const [local, setLocal] = useState(value || 0);

  useEffect(() => setLocal(value || 0), [value]);

  const commit = () => {
    if (local !== value) onCommit(local);
  };

  const thumbOffset = THUMB_SIZE * (0.5 - local / 100);

  return (
    <div className="relative pt-[16px]">
      <div
        className="absolute top-0 -translate-x-1/2 text-[10px] font-semibold text-[#1D9E75] pointer-events-none whitespace-nowrap"
        style={{ left: `calc(${local}% + ${thumbOffset}px)` }}
      >{local}%</div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={local}
        disabled={disabled}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={commit}
        className="task-progress-slider w-full"
        style={{ background: `linear-gradient(to right, #1D9E75 ${local}%, #e7e5e4 ${local}%)` }}
      />
    </div>
  );
}
