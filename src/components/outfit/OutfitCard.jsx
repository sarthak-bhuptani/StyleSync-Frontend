import React from 'react';
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

export const OutfitCard = ({ outfit, onTryAnother, onSelect }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 hover:shadow-card transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              {outfit.occasion}
            </span>
            <span className="text-xs text-slate-500 font-medium">· {outfit.style}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{outfit.title}</h3>
        </div>

        {/* Outfit Match Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-sm rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{outfit.matchScore}% Match</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">AI Proportions Fit</span>
        </div>
      </div>

      {/* Outfit 4-Piece Visual Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        {outfit.items.map((item, idx) => (
          <div key={idx} className="group relative bg-slate-50 rounded-2xl p-2 border border-slate-100 flex flex-col">
            <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</p>
            <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</p>
          </div>
        ))}
      </div>

      {/* AI Notes */}
      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mb-4">
        💡 <span className="font-semibold text-slate-800">Stylist Note:</span> {outfit.notes}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        {onTryAnother && (
          <button
            type="button"
            onClick={onTryAnother}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Another Combo</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onSelect && onSelect(outfit)}
          className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          Wear This Outfit
        </button>
      </div>
    </div>
  );
};
