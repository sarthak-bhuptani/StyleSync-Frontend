import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const RecommendationBadge = ({ decision = 'BUY', size = 'md', showIcon = true, className = '' }) => {
  const norm = decision?.toUpperCase() || 'BUY';

  const config = {
    BUY: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'BUY',
    },
    MAYBE: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
      label: 'CONSIDER',
    },
    SKIP: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'PASS',
    },
  }[norm] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: CheckCircle2,
    label: norm,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px] font-bold gap-1 font-mono',
    md: 'px-3 py-1 text-xs font-bold gap-1.5 font-mono shadow-subtle',
    lg: 'px-4 py-1.5 text-sm font-bold gap-2 font-mono shadow-subtle',
    xl: 'px-5 py-2 text-base font-bold tracking-wide gap-2 font-mono shadow-card',
  }[size] || 'px-3 py-1 text-xs font-bold gap-1.5 font-mono';

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all duration-150 ${config.bg} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={size === 'xl' ? 'w-4.5 h-4.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5 flex-shrink-0'} />}
      <span>{config.label}</span>
    </span>
  );
};

