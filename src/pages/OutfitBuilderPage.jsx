import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Layers,
  Share2,
  Edit2,
  Check,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { outfitApi } from '../api/outfitApi';

export const OutfitBuilderPage = () => {
  const { user } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/profile');
    }
  };

  const [activeCategory, setActiveCategory] = useState('All');
  const [savedLooks, setSavedLooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  const categories = ['All', 'Casual', 'Work', 'Travel'];

  // Load real saved looks from API & localStorage
  useEffect(() => {
    const loadSavedLooks = async () => {
      try {
        const list = await outfitApi.getOutfits();
        if (Array.isArray(list) && list.length > 0) {
          setSavedLooks(list);
        } else {
          setSavedLooks([]);
        }
      } catch (err) {
        console.warn('Error loading saved looks:', err);
        setSavedLooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLooks();
  }, [wardrobe]);

  // Filter looks based on selected category pill
  const filteredLooks = useMemo(() => {
    if (activeCategory === 'All') return savedLooks;
    return savedLooks.filter((look) => {
      const cat = (look.category || look.occasion || '').toLowerCase();
      const target = activeCategory.toLowerCase();
      if (target === 'work') return cat.includes('work') || cat.includes('office') || cat.includes('smart');
      if (target === 'casual') return cat.includes('casual') || cat.includes('weekend') || cat.includes('daily');
      if (target === 'travel') return cat.includes('travel') || cat.includes('trip');
      return cat.includes(target);
    });
  }, [savedLooks, activeCategory]);

  const handleShareLook = (e, look) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `StyleSync Look: ${look.title}`,
        text: `Check out my outfit: ${look.title} (${look.occasion})`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${look.title} - ${look.occasion} (${look.piecesCount || 3} pieces)`);
      if (showToast) {
        showToast('Look details copied to clipboard!', 'info');
      }
    }
  };

  const handleEditLook = (e, look) => {
    e.stopPropagation();
    navigate('/daily-stylist');
  };

  return (
    <div className="max-w-md mx-auto px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* Top Grab Bar matching Figma 18 */}
      <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

      {/* 1. Header: < My Looks [S] matching Figma 18 */}
      <div className="flex items-start justify-between pb-2">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full active:scale-95 cursor-pointer mt-0.5"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight">
              My Looks
            </h1>
            <p className="text-xs text-[#717670] font-normal mt-0.5">
              Your saved combinations.
            </p>
          </div>
        </div>

        {/* Circular Initial Badge */}
        <div
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-[#D6C7B2] text-[#1A1D1A] font-serif font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs hover:opacity-90 active:scale-95 transition-all select-none"
          title="My Profile"
        >
          {initial}
        </div>
      </div>

      {/* 2. Category Filter Pills matching Figma 18 */}
      <div className="flex items-center gap-2 my-3 select-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`h-8 px-4 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#111827] text-white font-semibold shadow-2xs'
                  : 'bg-white text-[#1A1D1A] border border-[#ECE8DF] hover:border-[#1A1D1A]/30 shadow-2xs'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. Saved Look Cards List matching Figma 18 */}
      <div className="space-y-3.5 my-3">
        {filteredLooks.map((look) => (
          <div
            key={look.id}
            onClick={() => navigate('/daily-stylist')}
            className="bg-white rounded-3xl border border-[#ECE8DF] p-4 sm:p-5 shadow-2xs flex items-center gap-4 hover:border-[#1A1D1A]/30 transition-all cursor-pointer group"
          >
            {/* Garment Visual Container in Soft Cream matching Figma */}
            <div className="w-16 h-24 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DF]/60 flex items-center justify-center shrink-0 p-2 overflow-hidden">
              {look.image ? (
                <img
                  src={look.image}
                  alt={look.title}
                  className="max-h-full max-w-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                />
              ) : (
                <Layers className="w-8 h-8 text-[#8E968C]" />
              )}
            </div>

            {/* Look Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1D1A] truncate leading-tight">
                  {look.title}
                </h3>
                <p className="text-xs text-[#717670] mt-0.5">
                  {look.occasion || 'Smart casual'}
                </p>
                <p className="text-[11px] text-[#8E968C] mt-0.5">
                  {look.piecesCount || 3} pieces · {look.temp || '24°C'}
                </p>
              </div>

              {/* Action Links: Edit · Share */}
              <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-[#1A1D1A]">
                <button
                  type="button"
                  onClick={(e) => handleEditLook(e, look)}
                  className="hover:underline cursor-pointer active:scale-95"
                >
                  Edit
                </button>
                <span className="text-[#8E968C] select-none">·</span>
                <button
                  type="button"
                  onClick={(e) => handleShareLook(e, look)}
                  className="hover:underline cursor-pointer active:scale-95"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredLooks.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#ECE8DF] p-8 text-center my-4 space-y-2">
            <Layers className="w-8 h-8 text-[#8E968C] mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#1A1D1A]">
              No saved looks in this category
            </h3>
            <p className="text-xs text-[#8E968C]">
              Create and save looks in Outfit Lab to view them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitBuilderPage;
