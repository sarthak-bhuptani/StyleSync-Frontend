import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  label = '',
  displayValue = '',
  color = 'emerald',
  size = 'md',
  showLabels = true,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorVariants = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    slate: 'bg-slate-700',
    brand: 'bg-emerald-600',
  };

  const barHeight = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size] || 'h-2.5';

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-medium">
          <span className="text-slate-700 font-medium">{label}</span>
          <span className="text-slate-900 font-semibold">{displayValue || `${value}/${max}`}</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${barHeight}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorVariants[color] || colorVariants.emerald}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
