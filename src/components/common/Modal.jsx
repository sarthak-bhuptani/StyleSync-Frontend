import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
  showCloseButton = true,
  swipeToDismiss = true
}) => {
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchCurrentY, setTouchCurrentY] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Touch gesture handling for mobile swipe-down to dismiss
  const handleTouchStart = (e) => {
    if (!swipeToDismiss) return;
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!swipeToDismiss || touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    // Only allow downward drag
    if (deltaY > 0) {
      setTouchCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!swipeToDismiss) return;
    if (touchCurrentY && touchCurrentY > 120) {
      onClose();
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
    setIsDragging(false);
  };

  const dragStyle = touchCurrentY && touchCurrentY > 0
    ? { transform: `translateY(${touchCurrentY}px)`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }
    : {};

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet / Dialog Content */}
      <div
        ref={sheetRef}
        style={dragStyle}
        className={`relative w-full ${maxWidth} bg-white rounded-t-3xl md:rounded-2xl shadow-floating border-t md:border border-slate-100 z-10 max-h-[90dvh] md:max-h-[85vh] flex flex-col my-0 md:my-8 animate-slide-up-mobile md:animate-scale-in`}
      >
        {/* Mobile Swipe Handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="md:hidden pt-3 pb-1.5 flex justify-center cursor-grab active:cursor-grabbing w-full touch-none select-none"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 active:bg-slate-400 transition-colors" />
        </div>

        {/* Header */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 border-b border-slate-100 flex-shrink-0"
        >
          <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
            {title}
          </h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              type="button"
              aria-label="Close"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Children Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
};

export const BottomSheet = (props) => <Modal {...props} />;
export default Modal;
