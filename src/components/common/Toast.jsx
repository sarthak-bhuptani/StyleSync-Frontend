import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsClosing(false);
  }, [message]);

  if (!message) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 200);
  };

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.2]" />,
      badge: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
      bar: 'bg-emerald-400'
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-rose-400 stroke-[2.2]" />,
      badge: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
      bar: 'bg-rose-400'
    },
    info: {
      icon: <Info className="w-4 h-4 text-amber-300 stroke-[2.2]" />,
      badge: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
      bar: 'bg-amber-400'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto w-[calc(100vw-2rem)] max-w-sm sm:max-w-md transition-all duration-200 ${
        isClosing
          ? 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
          : 'animate-toast-slide-down'
      }`}
    >
      <div className="relative flex items-start gap-3 bg-[#1A1D1A]/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-[0_20px_45px_-10px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)] border border-white/10 select-none overflow-hidden group">
        {/* Status Icon Badge */}
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${config.badge}`}
        >
          {config.icon}
        </div>

        {/* Notification Message */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs sm:text-[13px] font-medium text-[#FAF8F5] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Dismiss notification"
          className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 active:scale-90 transition-all cursor-pointer shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>

        {/* Hairline Auto-Dismiss Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden rounded-b-2xl">
          <div className={`h-full ${config.bar} animate-toast-progress`} />
        </div>
      </div>
    </div>
  );
};

export default Toast;

