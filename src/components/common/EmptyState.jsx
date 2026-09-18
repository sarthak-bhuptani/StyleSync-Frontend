import React from 'react';
import { ShoppingBag, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'No items found',
  description = 'Get started by creating or adding your first item.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle max-w-md mx-auto my-6 animate-scale-up">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-subtle hover:shadow transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
