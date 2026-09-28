import React, { useState } from 'react';
import { Trash2, Edit3, Eye, ChevronDown, Check } from 'lucide-react';
import { getCanonicalCategory } from '../../utils/categoryUtils';

export const WardrobeCard = ({ item, onEdit, onDelete, onViewDetails, onCategoryChange }) => {
  const [showCatMenu, setShowCatMenu] = useState(false);
  const canonicalCategory = getCanonicalCategory(item);

  const categories = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 overflow-visible flex flex-col relative">
      {/* Image Container with Actions overlay */}
      <div className="relative aspect-[4/5] bg-slate-100 rounded-t-2xl overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill with Quick Category Selector on Click */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowCatMenu(!showCatMenu);
            }}
            className="px-2.5 py-1 bg-white/95 hover:bg-white text-slate-800 text-[10px] font-extrabold rounded-lg shadow-xs border border-white/60 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Click to change category (Tops, Bottoms, etc.)"
          >
            <span>{canonicalCategory}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
          </button>

          {showCatMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-30 min-w-[125px] animate-scale-in"
            >
              <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-0.5">
                Change Category
              </div>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCatMenu(false);
                    if (onCategoryChange) {
                      onCategoryChange(item.id, cat);
                    }
                  }}
                  className={`w-full text-left px-2 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    canonicalCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat}</span>
                  {canonicalCategory === cat && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hover Action Bar & Quick Actions */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCatMenu(false);
                onViewDetails(item);
              }}
              title="View Details"
              className="p-2 bg-white text-slate-800 hover:text-slate-950 rounded-xl shadow hover:scale-110 transition-transform cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCatMenu(false);
                onEdit(item);
              }}
              title="Edit Item"
              className="p-2 bg-white text-slate-800 hover:text-slate-950 rounded-xl shadow hover:scale-110 transition-transform cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCatMenu(false);
                onDelete(item);
              }}
              title="Delete Item"
              className="p-2 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl shadow hover:scale-110 transition-transform cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Top-Right Quick Delete Button for fast 1-click removal */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            title="Delete this item"
            className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg shadow-xs border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Item Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white rounded-b-2xl">
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

        {/* 1-Tap Quick Category Switcher */}
        {onCategoryChange && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryChange(item.id, 'Tops');
              }}
              className={`flex-1 py-1 rounded-lg font-extrabold text-center transition-all cursor-pointer border ${
                canonicalCategory === 'Tops'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              👕 Top
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryChange(item.id, 'Bottoms');
              }}
              className={`flex-1 py-1 rounded-lg font-extrabold text-center transition-all cursor-pointer border ${
                canonicalCategory === 'Bottoms'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              👖 Bottom
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
