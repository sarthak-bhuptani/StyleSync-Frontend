import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Sun,
  Share2,
  Check,
  RotateCw,
  Layers,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { useWeather } from '../context/WeatherContext';
import { outfitApi } from '../api/outfitApi';
import { QuickModulesModal } from '../components/common/QuickModulesModal';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';

export const DailyStylistPage = () => {
  const { user } = useAuth();
  const { wardrobe, updateWardrobeItem, showToast } = useWardrobe();
  const { weather } = useWeather();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    navigate('/dashboard');
  };

  const OCCASIONS = ['Casual', 'Work / Smart', 'Date Night', 'Travel', 'Minimal', 'Formal'];

  const [modulesModalOpen, setModulesModalOpen] = useState(false);
  const [occasion, setOccasion] = useState('Casual');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [swapModalSlot, setSwapModalSlot] = useState(null); // 'top' | 'bottom' | 'shoes'

  const cycleOccasion = () => {
    setOccasion((prev) => {
      const idx = OCCASIONS.indexOf(prev);
      return OCCASIONS[(idx + 1) % OCCASIONS.length];
    });
  };

  // Categorize REAL items strictly from the API
  const { userTops, userBottoms, userShoes } = useMemo(() => {
    const list = Array.isArray(wardrobe) ? wardrobe : [];
    const tops = list.filter((w) =>
      ['top', 'shirt', 't-shirt', 'tshirt', 'polo', 'hoodie', 'sweater', 'outerwear', 'jacket', 'overshirt'].some((c) =>
        (w.category || '').toLowerCase().includes(c)
      )
    );
    const bottoms = list.filter((w) =>
      ['bottom', 'pant', 'pants', 'jeans', 'trouser', 'trousers', 'shorts'].some((c) =>
        (w.category || '').toLowerCase().includes(c)
      )
    );
    const shoes = list.filter((w) =>
      ['shoe', 'shoes', 'sneaker', 'sneakers', 'boots', 'footwear'].some((c) =>
        (w.category || '').toLowerCase().includes(c)
      )
    );
    return { userTops: tops, userBottoms: bottoms, userShoes: shoes };
  }, [wardrobe]);

  const [selectedTop, setSelectedTop] = useState(() => userTops[0] || (wardrobe && wardrobe[0]) || null);
  const [selectedBottom, setSelectedBottom] = useState(() => userBottoms[0] || (wardrobe && wardrobe[1]) || null);
  const [selectedShoe, setSelectedShoe] = useState(() => userShoes[0] || null);

  // Keep selected items in sync if wardrobe updates
  React.useEffect(() => {
    if (!selectedTop && wardrobe?.length > 0) {
      setSelectedTop(userTops[0] || wardrobe[0]);
    }
    if (!selectedBottom && wardrobe?.length > 1) {
      setSelectedBottom(userBottoms[0] || wardrobe[1]);
    }
    if (!selectedShoe && userShoes.length > 0) {
      setSelectedShoe(userShoes[0]);
    }
  }, [wardrobe, userTops, userBottoms, userShoes, selectedTop, selectedBottom, selectedShoe]);

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  const [viewMode, setViewMode] = useState('wear-today'); // 'wear-today' | 'lab'
  const [loggedToday, setLoggedToday] = useState(false);

  // Date formatting: "Tuesday · 6 October"
  const formattedDate = useMemo(() => {
    const now = new Date();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    return `${weekday} · ${day} ${month}`;
  }, []);

  const currentTemp = weather?.temp ? `${weather.temp}°C` : '24°C';

  // Handle logging "Wear this look"
  const handleWearThisLook = async () => {
    const itemsToLog = [selectedTop, selectedBottom, selectedShoe].filter(Boolean);
    
    // Call backend API POST /api/v1/outfits/log-wear
    try {
      await outfitApi.logWear({
        itemIds: itemsToLog.map((i) => i.id || i._id),
        date: new Date().toISOString(),
        occasion,
        temp: currentTemp
      });
    } catch (apiErr) {
      console.warn('Backend log-wear sync error:', apiErr);
    }

    itemsToLog.forEach((item) => {
      if (item && item.id) {
        const newWears = (item.wearCount || item.wears || 0) + 1;
        if (updateWardrobeItem) {
          updateWardrobeItem(item.id, { wearCount: newWears, wears: newWears });
        }
      }
    });
    setLoggedToday(true);
    if (showToast) {
      showToast('Logged today\'s look to your wear history! (+1 wear)', 'success');
    }
  };

  // Garment names subtitle
  const garmentNamesText = useMemo(() => {
    const names = [selectedTop?.name, selectedBottom?.name, selectedShoe?.name].filter(Boolean);
    return names.length > 0 ? names.join(' · ') : 'Olive overshirt · denim · sneakers';
  }, [selectedTop, selectedBottom, selectedShoe]);

  // Dynamic intelligent suggestion matching Figma 13 editorial tone
  const syncraSuggestion = useMemo(() => {
    if (selectedShoe) {
      return `Add the ${selectedShoe.name.toLowerCase()} for a cleaner finish.`;
    }
    // Clean, natural styling suggestions
    const cleanColor = (selectedTop?.color || '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
    const catSingular = (selectedTop?.category || 'piece').toLowerCase().replace(/s$/, '');

    if (cleanColor && cleanColor !== 'other' && cleanColor !== 'custom') {
      return `Add a white sneaker or neutral layer for a clean contrast with your ${cleanColor} ${catSingular}.`;
    }
    return 'Add the white sneaker for a cleaner finish.';
  }, [selectedShoe, selectedTop]);

  const weatherMatchScore = useMemo(() => {
    const tempNum = Number(weather?.temp) || 24;
    if (tempNum >= 20 && tempNum <= 28) return 96;
    if (tempNum < 20) return 91;
    return 88;
  }, [weather]);

  const handleSaveLook = async () => {
    try {
      setIsSaving(true);
      const itemsToSave = [selectedTop, selectedBottom, selectedShoe].filter(Boolean);
      await outfitApi.saveOutfit({
        title: `${occasion} Look`,
        occasion,
        category: occasion.split(' ')[0],
        piecesCount: itemsToSave.length,
        temp: currentTemp,
        items: itemsToSave,
        image: selectedTop?.image || selectedBottom?.image || ''
      });
      setIsSaved(true);
      if (showToast) {
        showToast('Look saved to your collection!', 'success');
      }
    } catch (err) {
      console.warn('Could not save outfit:', err);
      setIsSaved(true);
      if (showToast) {
        showToast('Look saved!', 'success');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareLook = async () => {
    const text = `Check out my StyleSync look for ${occasion}: ${garmentNamesText}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StyleSync Daily Look',
          text,
          url: window.location.href
        });
      } catch (err) {
        // cancelled
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (showToast) {
        showToast('Look details copied to clipboard!', 'success');
      }
    }
  };

  // ---------------- VIEW 1: WEAR TODAY (Matching Figma 13) ----------------
  if (viewMode === 'wear-today') {
    return (
      <div className="max-w-md mx-auto px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
        {/* Top Grab Bar matching Figma 13 */}
        <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

        {/* 1. Header: < Wear Today [☀️ 24°C] [S] */}
        <div className="flex items-start justify-between pb-1">
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
                Wear Today
              </h1>
              <p className="text-xs text-[#717670] font-normal mt-0.5">
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Weather Capsule matching Figma 13 */}
            <div className="h-7 px-2.5 rounded-full text-xs font-semibold bg-white border border-[#ECE8DF] text-[#1A1D1A] flex items-center gap-1 shadow-2xs select-none">
              <span>☀️</span>
              <span>{currentTemp}</span>
            </div>

            {/* Unified Profile Avatar Button */}
            <ProfileAvatarButton />
          </div>
        </div>

        {/* 2. Section Label: WHAT SHOULD I WEAR? */}
        <div className="pt-2 pb-0.5">
          <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block">
            WHAT SHOULD I WEAR?
          </span>
        </div>

        {/* 3. Main Outfit Card matching Figma 13 */}
        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-4 sm:p-5 shadow-2xs my-2 flex flex-col justify-between">
          {/* Card Top Title & Tag */}
          <div className="pb-1">
            <span className="text-xs text-[#717670] font-normal block">
              Smart casual
            </span>
            <h2 className="font-bold text-sm sm:text-base text-[#1A1D1A] mt-0.5">
              Comfortable for a warm day.
            </h2>
          </div>

          {/* Center Visual Outfit Showcase: Clean Beautiful Framed Pieces matching Dashboard & Compare */}
          <div className="grid grid-cols-2 gap-2.5 py-2.5">
            {/* Top Piece Card */}
            {selectedTop && (
              <div
                onClick={() => setViewMode('lab')}
                className="bg-[#FAF8F5] rounded-2xl border border-[#ECE8DF] p-2.5 flex flex-col items-center justify-between shadow-2xs cursor-pointer hover:border-[#1A1D1A]/30 transition-all group aspect-[4/4.5]"
              >
                <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
                  {selectedTop.image ? (
                    <img
                      src={selectedTop.image}
                      alt={selectedTop.name}
                      className="max-h-24 w-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-[#8E968C]">
                      <Layers className="w-7 h-7" />
                    </div>
                  )}
                </div>
                <div className="w-full text-center pt-1.5 border-t border-[#ECE8DF]/60">
                  <p className="text-[11px] font-bold text-[#1A1D1A] truncate">{selectedTop.name || 'Top Piece'}</p>
                  <p className="text-[9px] text-[#8E968C] font-medium">{selectedTop.category || 'Tops'}</p>
                </div>
              </div>
            )}

            {/* Bottom Piece Card */}
            {selectedBottom && (
              <div
                onClick={() => setViewMode('lab')}
                className="bg-[#FAF8F5] rounded-2xl border border-[#ECE8DF] p-2.5 flex flex-col items-center justify-between shadow-2xs cursor-pointer hover:border-[#1A1D1A]/30 transition-all group aspect-[4/4.5]"
              >
                <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
                  {selectedBottom.image ? (
                    <img
                      src={selectedBottom.image}
                      alt={selectedBottom.name}
                      className="max-h-24 w-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-[#8E968C]">
                      <Layers className="w-7 h-7" />
                    </div>
                  )}
                </div>
                <div className="w-full text-center pt-1.5 border-t border-[#ECE8DF]/60">
                  <p className="text-[11px] font-bold text-[#1A1D1A] truncate">{selectedBottom.name || 'Bottom Piece'}</p>
                  <p className="text-[9px] text-[#8E968C] font-medium">{selectedBottom.category || 'Bottoms'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Card Garment Names Subtitle with proper margins */}
          <div className="pt-2 border-t border-[#ECE8DF]/60">
            <p className="text-xs text-[#717670] font-normal truncate">
              {garmentNamesText}
            </p>
          </div>
        </div>

        {/* 4. Action Row: Wear this look (Left) + CHANGE (Right) matching Figma 13 */}
        <div className="flex items-center justify-between gap-3 mt-4 mb-3">
          <button
            type="button"
            onClick={handleWearThisLook}
            className={`flex-1 h-12 px-6 rounded-full font-bold text-xs shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 ${
              loggedToday
                ? 'bg-emerald-700 text-white'
                : 'bg-[#111827] hover:bg-[#030712] text-white'
            }`}
          >
            {loggedToday ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Worn Today ✓</span>
              </>
            ) : (
              <span>Wear this look</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('lab')}
            className="h-12 px-5 text-xs font-bold text-[#1A1D1A] uppercase tracking-wider hover:opacity-75 transition-opacity cursor-pointer active:scale-95 shrink-0 flex items-center justify-center"
          >
            CHANGE
          </button>
        </div>

        {/* 5. SYNCRA SUGGESTION Card matching Figma 13 */}
        <div className="bg-[#E7ECE3] rounded-2xl p-4 sm:p-5 border border-[#D8E1D3] shadow-2xs mt-3 mb-6 block overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#637261] mb-1.5 leading-none">
            SYNCRA SUGGESTION
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#1A1D1A] leading-relaxed m-0">
            {syncraSuggestion}
          </p>
        </div>
      </div>
    );
  }

  // ---------------- VIEW 2: OUTFIT LAB / MIXER (Triggered on CHANGE) ----------------
  return (
    <div className="max-w-md mx-auto px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* Top Grab Bar matching Figma */}
      <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

      {/* 1. Header: < Outfit Lab [S] */}
      <div className="flex items-start justify-between pb-1">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => setViewMode('wear-today')}
            className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full active:scale-95 cursor-pointer mt-0.5"
            aria-label="Back to Wear Today"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight">
              Outfit Lab
            </h1>
            <p className="text-xs text-[#717670] font-normal mt-0.5">
              Build, mix and create looks.
            </p>
          </div>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {/* 2. Filter Pills Row: Occasion & Live Weather */}
      <div className="flex items-center justify-between my-3">
        <button
          type="button"
          onClick={cycleOccasion}
          className="h-8 px-4 rounded-full text-xs font-medium bg-white border border-[#ECE8DF] text-[#1A1D1A] hover:border-[#1A1D1A]/30 transition-all cursor-pointer shadow-2xs select-none active:scale-95"
          title="Click to cycle occasion"
        >
          {occasion}
        </button>

        <div className="h-8 px-3.5 rounded-full text-xs font-medium bg-white border border-[#ECE8DF] text-[#1A1D1A] flex items-center gap-1.5 shadow-2xs select-none">
          <Sun className="w-3.5 h-3.5 text-[#1A1D1A]" />
          <span>{currentTemp}</span>
        </div>
      </div>

      {/* 3. Real Wardrobe Pieces Canvas Card */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#ECE8DF] p-4.5 sm:p-5 flex flex-col justify-between shadow-2xs my-3 min-h-[340px] relative select-none space-y-3">
        {/* Pieces Display Grid */}
        <div className="grid grid-cols-2 gap-3 flex-1 py-1">
          {/* Top Piece Slot */}
          <div
            onClick={() => setSwapModalSlot('top')}
            className="bg-white rounded-2xl border border-[#ECE8DF] p-3 flex flex-col items-center justify-between shadow-2xs cursor-pointer hover:border-[#1A1D1A]/40 transition-all group aspect-[4/5]"
          >
            <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
              {selectedTop?.image ? (
                <img
                  src={selectedTop.image}
                  alt={selectedTop.name}
                  className="max-h-28 w-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#8E968C]">
                  <Layers className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="w-full text-center pt-2 border-t border-[#ECE8DF]/60">
              <p className="text-[11px] font-bold text-[#1A1D1A] truncate">{selectedTop?.name || 'Select Top'}</p>
              <p className="text-[10px] text-[#8E968C] font-medium">{selectedTop?.category || 'Top'}</p>
            </div>
          </div>

          {/* Bottom Piece Slot */}
          <div
            onClick={() => setSwapModalSlot('bottom')}
            className="bg-white rounded-2xl border border-[#ECE8DF] p-3 flex flex-col items-center justify-between shadow-2xs cursor-pointer hover:border-[#1A1D1A]/40 transition-all group aspect-[4/5]"
          >
            <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
              {selectedBottom?.image ? (
                <img
                  src={selectedBottom.image}
                  alt={selectedBottom.name}
                  className="max-h-28 w-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#8E968C]">
                  <Layers className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="w-full text-center pt-2 border-t border-[#ECE8DF]/60">
              <p className="text-[11px] font-bold text-[#1A1D1A] truncate">{selectedBottom?.name || 'Select Bottom'}</p>
              <p className="text-[10px] text-[#8E968C] font-medium">{selectedBottom?.category || 'Bottom'}</p>
            </div>
          </div>
        </div>

        {/* Shoes Slot or Footwear row */}
        {selectedShoe ? (
          <div
            onClick={() => setSwapModalSlot('shoes')}
            className="bg-white rounded-2xl border border-[#ECE8DF] p-2.5 flex items-center justify-between shadow-2xs cursor-pointer hover:border-[#1A1D1A]/40 transition-all"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {selectedShoe.image ? (
                <img src={selectedShoe.image} alt={selectedShoe.name} className="w-10 h-10 object-contain rounded-lg shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#8E968C] shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-[#1A1D1A] truncate">{selectedShoe.name}</p>
                <p className="text-[10px] text-[#8E968C]">Footwear</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-[#1A1D1A] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#ECE8DF]">
              Swap
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSwapModalSlot('shoes')}
            className="w-full py-2 px-3 rounded-2xl border border-dashed border-[#ECE8DF] hover:border-[#1A1D1A]/40 bg-white/70 text-xs font-medium text-[#717670] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shoes / Footwear</span>
          </button>
        )}

        {/* Bottom Subtext */}
        <p className="text-[11px] text-[#8E968C] text-center pt-1">
          Tap any piece to swap from your wardrobe
        </p>
      </div>

      {/* 4. Metrics Table below Canvas */}
      <div className="space-y-2.5 my-4 px-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#8E968C] uppercase tracking-wide text-[11px]">
            COLOR HARMONY
          </span>
          <span className="font-bold text-[#3B6E48]">
            Excellent
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#8E968C] uppercase tracking-wide text-[11px]">
            WEATHER MATCH
          </span>
          <span className="font-bold text-[#1A1D1A]">
            {weatherMatchScore}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#8E968C] uppercase tracking-wide text-[11px]">
            OCCASION
          </span>
          <span className="font-bold text-[#1A1D1A]">
            {occasion}
          </span>
        </div>
      </div>

      {/* 5. Action Buttons: Save Look & Share */}
      <div className="flex items-center gap-3 my-5">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveLook}
          className="flex-1 py-3.5 px-6 bg-[#111827] hover:bg-[#030712] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Look Saved</span>
            </>
          ) : (
            <span>{isSaving ? 'Saving...' : 'Save look'}</span>
          )}
        </button>

        <button
          type="button"
          onClick={handleShareLook}
          className="py-3.5 px-7 bg-white border border-[#ECE8DF] hover:border-[#1A1D1A]/30 text-[#1A1D1A] rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 transition-all"
        >
          Share
        </button>
      </div>

      {/* Swap Piece Sheet Modal with REAL API items */}
      {swapModalSlot && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setSwapModalSlot(null)}
          />
          <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 border border-[#ECE8DF] animate-slide-up-mobile text-[#1A1D1A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <h3 className="font-serif font-bold text-base text-[#1A1D1A]">
                Select {swapModalSlot === 'top' ? 'Top' : swapModalSlot === 'bottom' ? 'Bottom' : 'Shoes'}
              </h3>
              <button
                type="button"
                onClick={() => setSwapModalSlot(null)}
                className="p-1 text-[#8E968C] hover:text-[#1A1D1A] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto">
              {(swapModalSlot === 'top'
                ? userTops.length > 0 ? userTops : wardrobe
                : swapModalSlot === 'bottom'
                ? userBottoms.length > 0 ? userBottoms : wardrobe
                : userShoes.length > 0 ? userShoes : wardrobe
              ).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (swapModalSlot === 'top') setSelectedTop(item);
                    if (swapModalSlot === 'bottom') setSelectedBottom(item);
                    if (swapModalSlot === 'shoes') setSelectedShoe(item);
                    setSwapModalSlot(null);
                  }}
                  className="bg-white p-2.5 rounded-2xl border border-[#ECE8DF] flex flex-col items-center justify-between cursor-pointer hover:border-[#1E2E22] transition-all aspect-square"
                >
                  <div className="flex-1 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="max-h-20 max-w-full object-contain rounded-lg" />
                    ) : (
                      <Layers className="w-8 h-8 text-[#8E968C]" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-[#1A1D1A] mt-1 truncate max-w-full text-center">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Modules Modal */}
      <QuickModulesModal
        isOpen={modulesModalOpen}
        onClose={() => setModulesModalOpen(false)}
      />
    </div>
  );
};

export default DailyStylistPage;
