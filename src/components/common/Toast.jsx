import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-floating border border-slate-800 text-sm font-medium animate-slide-up max-w-md">
      {icons[type] || icons.success}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-slate-400 hover:text-white p-0.5">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
