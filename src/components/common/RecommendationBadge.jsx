import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const RecommendationBadge = ({ decision = 'BUY', size = 'md', showIcon = true, className = '' }) => {
  const norm = decision?.toUpperCase() || 'BUY';

  const config = {
    BUY: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'BUY',
    },
    MAYBE: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
      icon: AlertCircle,
      label: 'MAYBE',
    },
    SKIP: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
      icon: XCircle,
      label: 'SKIP',
    },
  }[norm] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    icon: CheckCircle2,
    label: norm,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-3 py-1 text-sm font-semibold gap-1.5',
    lg: 'px-4 py-1.5 text-base font-bold gap-2',
    xl: 'px-5 py-2.5 text-lg font-extrabold tracking-wide gap-2.5 shadow-sm',
  }[size] || 'px-3 py-1 text-sm font-semibold gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all duration-150 ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
      {showIcon && <Icon className={size === 'xl' ? 'w-5 h-5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
    </span>
  );
};
