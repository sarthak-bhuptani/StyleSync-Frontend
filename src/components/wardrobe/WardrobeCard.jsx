import React from 'react';
import { Trash2, Edit3, Eye, Sparkles } from 'lucide-react';

export const WardrobeCard = ({ item, onEdit, onDelete, onViewDetails }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image Container with Actions overlay */}
      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold rounded-lg shadow-xs border border-white/40">
          {item.category}
        </span>

        {/* Hover Action Bar */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(item)}
              title="View Details"
              className="p-2 bg-white text-slate-800 hover:text-slate-950 rounded-xl shadow hover:scale-110 transition-transform"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              title="Edit Item"
              className="p-2 bg-white text-slate-800 hover:text-slate-950 rounded-xl shadow hover:scale-110 transition-transform"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              title="Delete Item"
              className="p-2 bg-white text-rose-600 hover:text-rose-700 rounded-xl shadow hover:scale-110 transition-transform"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Item Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-0.5">
            <span>{item.brand || 'Essential'}</span>
            <span className="flex items-center gap-1 text-slate-600">
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-300"
                style={{ backgroundColor: item.colorHex || '#ddd' }}
              />
              {item.color}
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-800 transition-colors">
            {item.name}
          </h4>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">
            Worn <strong className="text-slate-800 font-semibold">{item.usageCount || 0}×</strong>
          </span>
          <span className="font-bold text-slate-900">
            {item.currency || '₹'}{(item.price || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
