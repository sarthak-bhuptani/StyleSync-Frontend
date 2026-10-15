import React, { useState } from 'react';
import { Trash2, Edit3, Eye, ChevronDown, Check } from 'lucide-react';
import { getCanonicalCategory } from '../../utils/categoryUtils';

export const WardrobeCard = ({ item, onEdit, onDelete, onViewDetails, onCategoryChange }) => {
  const [showCatMenu, setShowCatMenu] = useState(false);
  const canonicalCategory = getCanonicalCategory(item);

  const categories = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];

  return (
    <div className="group bg-white rounded-2xl border border-[#E5E0D6] shadow-xs hover:shadow-sm hover:border-[#1E2E22]/30 transition-all duration-200 overflow-visible flex flex-col relative">
      {/* Image Container with Actions overlay */}
      <div className="relative aspect-[4/5] bg-[#F6F4EE] rounded-t-2xl overflow-hidden p-2">
        <img
          src={item.image}
          alt={item.name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';
          }}
          className="w-full h-full object-cover rounded-xl group-hover:scale-102 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill with Quick Category Selector on Click */}
        <div className="absolute top-3 left-3 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowCatMenu(!showCatMenu);
            }}
            className="px-2.5 py-1 bg-white/95 hover:bg-white text-[#1A1D1A] text-[10px] font-medium rounded-full shadow-xs border border-[#E5E0D6] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Click to change category (Tops, Bottoms, etc.)"
          >
            <span>{canonicalCategory}</span>
            <ChevronDown className="w-2.5 h-2.5 text-[#8E968C]" />
          </button>

          {showCatMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-lg border border-[#E5E0D6] p-1.5 z-30 min-w-[130px] animate-scale-in"
            >
              <div className="px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#8E968C] border-b border-[#EFECE5] mb-1">
                Category
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
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-full transition-colors cursor-pointer flex items-center justify-between ${
                    canonicalCategory === cat
                      ? 'bg-[#1E2E22] text-[#F8F6F0] font-medium'
                      : 'text-[#5A6359] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{cat}</span>
                  {canonicalCategory === cat && <Check className="w-3 h-3 text-[#C5D8C7]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hover Action Bar & Quick Actions */}
        <div className="absolute inset-0 bg-[#1E2E22]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCatMenu(false);
                onViewDetails(item);
              }}
              title="View Details"
              className="p-2 bg-white text-[#1A1D1A] hover:text-[#1E2E22] rounded-full shadow hover:scale-110 transition-transform cursor-pointer"
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
              className="p-2 bg-white text-[#1A1D1A] hover:text-[#1E2E22] rounded-full shadow hover:scale-110 transition-transform cursor-pointer"
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
              className="p-2 bg-white text-[#C86D51] hover:bg-[#F8ECE7] rounded-full shadow hover:scale-110 transition-transform cursor-pointer"
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
            className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-[#F8ECE7] text-[#8E968C] hover:text-[#C86D51] rounded-full shadow-xs border border-[#E5E0D6] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Item Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white rounded-b-2xl">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#8E968C] mb-0.5">
            <span>{item.brand || 'Essential'}</span>
            <span className="flex items-center gap-1 text-[#687066]">
              <span
                className="w-2.5 h-2.5 rounded-full border border-[#E5E0D6]"
                style={{ backgroundColor: item.colorHex || '#ddd' }}
              />
              {item.color}
            </span>
          </div>
          <h4 className="font-serif text-sm font-normal text-[#1A1D1A] line-clamp-1 group-hover:text-[#1E2E22] transition-colors">
            {item.name}
          </h4>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#EFECE5] flex items-center justify-between text-xs">
          <span className="text-[#8E968C]">
            Worn <strong className="text-[#1A1D1A] font-medium">{item.usageCount || 0}×</strong>
          </span>
          <span className="font-medium text-[#1A1D1A]">
            {item.currency || '₹'}{(item.price || 0).toLocaleString()}
          </span>
        </div>

        {/* 1-Tap Quick Category Switcher */}
        {onCategoryChange && (
          <div className="mt-2.5 pt-2 border-t border-[#EFECE5] flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryChange(item.id, 'Tops');
              }}
              className={`flex-1 py-1 rounded-full font-medium text-center transition-all cursor-pointer border ${
                canonicalCategory === 'Tops'
                  ? 'bg-[#1E2E22] text-[#F8F6F0] border-[#1E2E22]'
                  : 'bg-[#FAF8F5] hover:bg-[#EFECE5] text-[#5A6359] border-[#E5E0D6]'
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
              className={`flex-1 py-1 rounded-full font-medium text-center transition-all cursor-pointer border ${
                canonicalCategory === 'Bottoms'
                  ? 'bg-[#1E2E22] text-[#F8F6F0] border-[#1E2E22]'
                  : 'bg-[#FAF8F5] hover:bg-[#EFECE5] text-[#5A6359] border-[#E5E0D6]'
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
