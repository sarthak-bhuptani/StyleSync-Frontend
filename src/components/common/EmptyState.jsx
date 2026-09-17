import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'No items found',
  description = 'Add items or adjust your filters to see results.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
