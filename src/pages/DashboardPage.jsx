import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Layers,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { useWeather } from '../context/WeatherContext';
import { QuickModulesModal } from '../components/common/QuickModulesModal';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { wardrobe } = useWardrobe();
  const { weather } = useWeather();
  const navigate = useNavigate();

  const [modulesModalOpen, setModulesModalOpen] = useState(false);

  // 1. Real User Information
  const userName = user?.name ? user.name.split(' ')[0] : user?.username || 'Sarthak';
  const initial = (userName.trim()?.[0] || 'S').toUpperCase();

  // 2. Real Date & Weather Formatted matching Image 2: "Tue, 6 Oct · 24°C · Partly cloudy"
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const currentTemp = weather?.temp || 24;
  const currentCondition = weather?.condition || 'Partly cloudy';
  const weatherText = `${todayDateStr} · ${currentTemp}°C · ${currentCondition}`;

  // 3. Real Wardrobe Selection for Today's Look
  const { topItem, bottomItem, shoeItem, outfitNamesText } = useMemo(() => {
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

    const top = tops[0] || list[0] || null;
    const bottom = bottoms[0] || list.find((it) => it.id !== top?.id) || null;
    const shoe = shoes[0] || null;

    const names = [top?.name, bottom?.name, shoe?.name].filter(Boolean);
    const text = names.length > 0
      ? names.join(' · ')
      : 'Olive overshirt · white tee · denim';

    return {
      topItem: top,
      bottomItem: bottom,
      shoeItem: shoe,
      outfitNamesText: text
    };
  }, [wardrobe]);

  // 4. Real Wardrobe Micro Metrics
  const list = Array.isArray(wardrobe) ? wardrobe : [];
  const itemsCount = list.length;

  const activePieces = list.filter((w) => (w.wearCount || w.wears || 0) > 0).length;
  const activeRate = list.length > 0 ? Math.round((activePieces / list.length) * 100) : 0;

  // New items added in last 30 days
  const newCount = list.length > 0
    ? list.filter((w) => {
        if (!w.dateAdded && !w.createdAt) return true;
        const diffDays = (Date.now() - new Date(w.dateAdded || w.createdAt).getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }).length
    : 0;

  // Avg cost per wear across all pieces with a price
  const totalCost = list.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalWears = list.reduce((acc, curr) => acc + (Number(curr.wearCount || curr.wears) || 1), 0);
  const avgCostPerWear = totalCost > 0 && totalWears > 0
    ? Math.round(totalCost / totalWears)
    : 0;

  return (
    <div className="space-y-3.5 animate-fade-in max-w-md mx-auto pb-1 text-[#1A1D1A]">
      {/* 1. Header: Real User Name + Live Weather from API */}
      <div className="flex items-start justify-between pt-1 pb-1">
        <div>
          <h1 className="font-serif font-bold text-3xl text-[#1A1D1A] tracking-tight leading-tight">
            Good morning,
            <br />
            {userName} 
          </h1>
          <p className="text-xs text-[#717670] font-normal mt-1">
            {weatherText}
          </p>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {/* 2. TODAY'S LOOK Section Label */}
      <div className="pt-1 pb-0.5">
        <span className="text-[11px] font-bold text-[#8E968C] uppercase tracking-wider">
          TODAY'S LOOK
        </span>
      </div>

      {/* 3. Warm Oatmeal Curated Look Card with REAL API Items */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#ECE8DF] p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Real API Pieces Presentation in Clean Framed Cards */}
        {list.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Top Piece Card */}
            {topItem && (
              <div
                onClick={() => navigate('/daily-stylist')}
                className="bg-white rounded-2xl border border-[#ECE8DF] p-3 flex flex-col items-center justify-between shadow-2xs cursor-pointer hover:border-[#1A1D1A]/30 transition-all group aspect-[4/5]"
              >
                <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
                  {topItem.image ? (
                    <img
                      src={topItem.image}
                      alt={topItem.name}
                      className="max-h-28 w-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#8E968C]">
                      <Layers className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="w-full text-center pt-2 border-t border-[#ECE8DF]/60">
                  <p className="text-[11px] font-bold text-[#1A1D1A] truncate">{topItem.name || 'Top Piece'}</p>
                  <p className="text-[10px] text-[#8E968C] font-medium">{topItem.category || 'Top'}</p>
                </div>
              </div>
            )}

            {/* Bottom Piece Card */}
            {bottomItem && (
              <div
                onClick={() => navigate('/daily-stylist')}
                className="bg-white rounded-2xl border border-[#ECE8DF] p-3 flex flex-col items-center justify-between shadow-2xs cursor-pointer hover:border-[#1A1D1A]/30 transition-all group aspect-[4/5]"
              >
                <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-1">
                  {bottomItem.image ? (
                    <img
                      src={bottomItem.image}
                      alt={bottomItem.name}
                      className="max-h-28 w-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#8E968C]">
                      <Layers className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="w-full text-center pt-2 border-t border-[#ECE8DF]/60">
                  <p className="text-[11px] font-bold text-[#1A1D1A] truncate">{bottomItem.name || 'Bottom Piece'}</p>
                  <p className="text-[10px] text-[#8E968C] font-medium">{bottomItem.category || 'Bottom'}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-2xl border border-[#ECE8DF] space-y-2">
            <Layers className="w-8 h-8 text-[#8E968C] mx-auto" />
            <p className="text-xs font-semibold text-[#1A1D1A]">No wardrobe items yet</p>
            <p className="text-[11px] text-[#8E968C]">Add pieces in My Wardrobe to generate daily looks.</p>
          </div>
        )}

        {/* Card Metadata */}
        <div className="space-y-0.5 pt-1">
          <p className="text-xs text-[#717670] font-normal">
            Smart casual · comfortable day
          </p>
          <p className="text-xs sm:text-sm font-bold text-[#1A1D1A] tracking-tight truncate">
            {outfitNamesText}
          </p>
        </div>

        {/* Wear this look button */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => navigate('/daily-stylist')}
            className="px-6 py-3 bg-[#111827] hover:bg-[#030712] text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <span>Wear this look</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>
      </div>

      {/* 4. Four-Column Micro Metrics with 100% Real API Data */}
      <div className="bg-white rounded-2xl border border-[#ECE8DF] p-3.5 shadow-2xs grid grid-cols-4 divide-x divide-[#ECE8DF] text-center my-3">
        <div onClick={() => navigate('/wardrobe')} className="px-1 cursor-pointer group">
          <p className="font-serif font-bold text-base sm:text-lg text-[#1A1D1A] group-hover:text-[#1E2E22] transition-colors">
            {itemsCount}
          </p>
          <p className="text-[10px] text-[#8E968C] font-semibold mt-0.5">Items</p>
        </div>

        <div onClick={() => navigate('/daily-stylist')} className="px-1 cursor-pointer group">
          <p className="font-serif font-bold text-base sm:text-lg text-[#1A1D1A] group-hover:text-[#1E2E22] transition-colors">
            {activeRate}%
          </p>
          <p className="text-[10px] text-[#8E968C] font-semibold mt-0.5">Active</p>
        </div>

        <div onClick={() => navigate('/daily-stylist')} className="px-1 cursor-pointer group">
          <p className="font-serif font-bold text-base sm:text-lg text-[#1A1D1A] group-hover:text-[#1E2E22] transition-colors">
            {newCount}
          </p>
          <p className="text-[10px] text-[#8E968C] font-semibold mt-0.5">New</p>
        </div>

        <div onClick={() => navigate('/budget')} className="px-1 cursor-pointer group">
          <p className="font-serif font-bold text-base sm:text-lg text-[#1A1D1A] group-hover:text-[#1E2E22] transition-colors">
            ₹{avgCostPerWear}
          </p>
          <p className="text-[10px] text-[#8E968C] font-semibold mt-0.5">Avg/wear</p>
        </div>
      </div>

      {/* Quick Modules Modal triggered by right + button */}
      <QuickModulesModal
        isOpen={modulesModalOpen}
        onClose={() => setModulesModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
