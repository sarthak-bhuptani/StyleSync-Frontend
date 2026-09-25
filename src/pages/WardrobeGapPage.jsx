import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Layers,
  Check,
  Tag,
  ArrowRight,
  Plus,
  Compass,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';

export const WardrobeGapPage = () => {
  const { wardrobe, addWardrobeItem, showToast } = useWardrobe();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Category counts
  const counts = useMemo(() => {
    return {
      tops: wardrobe.filter(i => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(i.category) || i.name?.toLowerCase().includes('shirt') || i.name?.toLowerCase().includes('tee')).length,
      bottoms: wardrobe.filter(i => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(i.category) || i.name?.toLowerCase().includes('jean') || i.name?.toLowerCase().includes('pant')).length,
      shoes: wardrobe.filter(i => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(i.category) || i.name?.toLowerCase().includes('shoe') || i.name?.toLowerCase().includes('sneaker')).length,
      layers: wardrobe.filter(i => ['Outerwear', 'Jacket', 'Coat', 'Blazer'].includes(i.category) || i.name?.toLowerCase().includes('jacket') || i.name?.toLowerCase().includes('blazer')).length,
    };
  }, [wardrobe]);

  // Dynamic Gaps determined by analyzing current closet
  const wardrobeGaps = useMemo(() => {
    return [
      {
        id: 'gap_sneaker',
        title: 'Minimalist Clean Low-Top Sneaker',
        category: 'Footwear Staple',
        multiplier: '+10 Outfits',
        reason: 'Versatile foundation anchor that pairs effortlessly with chinos, raw denim, tailored trousers, and shorts.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
        priceRange: '₹2,499 – ₹4,999',
        curatedPicks: [
          { name: 'Stan Smith Classic Leather', brand: 'Adidas Originals', price: 4999, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80' },
          { name: 'Court Vision Low Clean', brand: 'Nike', price: 3495, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80' }
        ]
      },
      {
        id: 'gap_layer',
        title: 'Structured Twill / Denim Overshirt',
        category: 'Layering Essential',
        multiplier: '+6 Outfits',
        reason: 'Adds depth and structure over basic tees, creating an elevated 2-layer silhouette for evenings and air-conditioned spaces.',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
        priceRange: '₹1,999 – ₹3,999',
        curatedPicks: [
          { name: 'Heavy Twill Worker Overshirt', brand: 'Uniqlo', price: 2990, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80' },
          { name: 'Denim Chore Jacket Raw', brand: 'Levi\'s', price: 3799, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80' }
        ]
      },
      {
        id: 'gap_chino',
        title: 'Tailored Neutral Stretch Chinos',
        category: 'Bottoms Foundation',
        multiplier: '+7 Outfits',
        reason: 'Breaks the monotony of denim with a warm neutral tone that pairs seamlessly with dark shirts, polos, and knitwear.',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
        priceRange: '₹1,799 – ₹3,499',
        curatedPicks: [
          { name: 'Smart 360 Flex Chino', brand: 'Dockers', price: 2799, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80' }
        ]
      },
      {
        id: 'gap_linen_shirt',
        title: 'Breathable Pure Linen Shirt',
        category: 'Warm-Weather Staple',
        multiplier: '+5 Outfits',
        reason: 'Rich texture that brings effortless relaxed elegance while staying light and breathable in warmer weather.',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
        priceRange: '₹1,999 – ₹3,299',
        curatedPicks: [
          { name: '100% Premium Linen Shirt', brand: 'Marks & Spencer', price: 3299, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' }
        ]
      }
    ];
  }, [counts]);

  const handleSimulateAddToWardrobe = (pick, gap) => {
    addWardrobeItem({
      name: pick.name,
      category: gap.category.includes('Footwear') ? 'Shoes' : gap.category.includes('Bottoms') ? 'Bottoms' : gap.category.includes('Layer') ? 'Outerwear' : 'Tops',
      brand: pick.brand,
      price: pick.price,
      image: pick.image,
      color: 'Neutral',
      style: 'Foundation Essential'
    });
    showToast(`Added ${pick.name} to your wardrobe!`, 'success');
  };

  const handleAnalyzeWithAdvisor = (pick) => {
    navigate('/advisor', {
      state: {
        initialProduct: {
          name: pick.name,
          brand: pick.brand,
          price: pick.price,
          category: 'Clothing',
          image: pick.image
        }
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Editorial Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            What to Buy Next
          </h1>
          <p className="text-xs text-slate-500">
            Foundation pieces that multiply outfits with what you already own
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/wardrobe')}
          className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Wardrobe ({wardrobe.length})</span>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>

      {/* Closet Balance Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-subtle space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
            Closet Foundation Balance
          </h3>
          <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
            {wardrobeGaps.length} Recommendations
          </span>
        </div>

        {/* 4 Category Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Tops</span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">{counts.tops}</span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
              {counts.tops >= 4 ? 'Stocked' : 'Needs Basics'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Bottoms</span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">{counts.bottoms}</span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
              {counts.bottoms >= 3 ? 'Balanced' : 'Needs Chino'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Shoes</span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">{counts.shoes}</span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
              {counts.shoes >= 2 ? 'Covered' : 'Add Sneaker'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Layers</span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">{counts.layers}</span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">
              {counts.layers >= 1 ? 'Ready' : 'Add Overshirt'}
            </span>
          </div>
        </div>
      </div>

      {/* High-Impact Foundation Additions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
            Curated Foundation Additions
          </h2>
          <span className="text-[11px] text-stone-400 font-medium">Ranked by outfit versatility</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {wardrobeGaps.map((gap) => (
            <div
              key={gap.id}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-subtle p-4 sm:p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header: Clean category & multiplier */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-100">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    {gap.category}
                  </span>
                  <span className="text-[10px] font-extrabold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                    {gap.multiplier}
                  </span>
                </div>

                {/* Main Hero: Image + Title + Stylist Rationale */}
                <div className="flex gap-3 items-start">
                  <img
                    src={gap.image}
                    alt={gap.title}
                    className="w-16 h-16 rounded-2xl object-cover bg-stone-100 border border-stone-200 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {gap.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {gap.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Curated Products List */}
              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  <span>Recommended Picks</span>
                  <span>{gap.priceRange}</span>
                </div>

                {gap.curatedPicks.map((pick, pIdx) => (
                  <div
                    key={pIdx}
                    className="flex items-center justify-between p-2 rounded-2xl bg-stone-50/80 hover:bg-stone-100/80 border border-stone-200/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={pick.image}
                        alt={pick.name}
                        className="w-9 h-9 rounded-xl object-cover bg-white border border-stone-200 shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{pick.name}</p>
                        <p className="text-[10px] text-stone-500 font-medium">{pick.brand} · ₹{pick.price.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAnalyzeWithAdvisor(pick)}
                        className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-700 text-[10px] font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                      >
                        Check Fit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateAddToWardrobe(pick, gap)}
                        className="px-2 py-1 bg-stone-900 hover:bg-black text-white text-[10px] font-bold rounded-xl transition-all flex items-center gap-0.5 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-white" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WardrobeGapPage;
