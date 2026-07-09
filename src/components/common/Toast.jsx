import { useEffect, useState } from 'react';

const listeners = new Set();

export function showToast(message = '保存しました', type = 'success') {
  listeners.forEach((fn) => fn(message, type));
}

export function showErrorToast(message) {
  showToast(message, 'error');
}

export default function Toast() {
  const [state, setState] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const handler = (message, type) => {
      setState({ show: true, message, type });
      const t = setTimeout(() => setState((s) => ({ ...s, show: false })), 1600);
      return () => clearTimeout(t);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return (
    <div
      className={`fixed bottom-4 right-4 text-white text-xs px-3.5 py-1.5 rounded-md pointer-events-none transition-opacity z-[60] ${
        state.type === 'error' ? 'bg-[#A32D2D]' : 'bg-stone-900'
      } ${state.show ? 'opacity-100' : 'opacity-0'}`}
    >
      {state.message}
    </div>
  );
}
