import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
      border: 'border-slate-800/80',
      badge: 'bg-emerald-500/20 text-emerald-400'
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
      border: 'border-rose-900/50',
      badge: 'bg-rose-500/20 text-rose-400'
    },
    info: {
      icon: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
      border: 'border-slate-800/80',
      badge: 'bg-amber-500/20 text-amber-400'
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto max-w-sm w-[90vw] sm:w-auto animate-toast-slide-down">
      <div className="flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-800/90 text-xs font-semibold">
        <div className="p-1 rounded-full bg-slate-800/80 shrink-0">
          {config.icon}
        </div>
        <span className="flex-1 tracking-tight text-slate-100 pr-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;

