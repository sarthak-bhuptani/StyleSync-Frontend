import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const RecommendationBadge = ({ decision = 'BUY', size = 'md', showIcon = true, className = '' }) => {
  const norm = decision?.toUpperCase() || 'BUY';

  const config = {
    BUY: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: CheckCircle2,
      label: 'BUY',
    },
    MAYBE: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: AlertCircle,
      label: 'MAYBE',
    },
    SKIP: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: XCircle,
      label: 'SKIP',
    },
  }[norm] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: CheckCircle2,
    label: norm,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-bold gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold gap-2',
    xl: 'px-4.5 py-2 text-base font-extrabold tracking-wide gap-2 shadow-xs',
  }[size] || 'px-2.5 py-1 text-xs font-bold gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all duration-150 ${config.bg} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={size === 'xl' ? 'w-4.5 h-4.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5 flex-shrink-0'} />}
      <span>{config.label}</span>
    </span>
  );
};

