import React from 'react';

export const StyleTag = ({ label, selected = false, onClick, variant = 'neutral', size = 'md', className = '' }) => {
  const isClickable = !!onClick;

  const baseClasses = 'inline-flex items-center font-medium rounded-lg transition-all duration-150 select-none';
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs tracking-wide',
    lg: 'px-4 py-2 text-sm',
  }[size] || 'px-3 py-1.5 text-xs';

  let variantClasses = '';
  if (selected) {
    variantClasses = 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-1';
  } else if (variant === 'accent') {
    variantClasses = 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
  } else if (variant === 'avoid') {
    variantClasses = 'bg-rose-50 text-rose-700 border border-rose-200/70';
  } else {
    variantClasses = 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50';
  }

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'} ${className}`}
    >
      {label}
    </button>
  );
};
