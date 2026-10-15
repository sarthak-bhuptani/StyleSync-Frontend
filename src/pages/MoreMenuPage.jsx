import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';

export const MoreMenuPage = () => {
  const { user } = useAuth();
  const { wardrobe } = useWardrobe();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate('/profile');
  };

  // Derive style & size attributes from user state
  const styleType = user?.preferences?.favoriteStyles?.[0] || 'Minimal';
  const userSize = user?.sizes?.shirt || user?.sizes?.preferredFit || 'L';

  // Real wardrobe stats and dynamic health score
  const itemsCount = Array.isArray(wardrobe) ? wardrobe.length : 0;
  const activePieces = (wardrobe || []).filter((w) => (w.wearCount || w.wears || 0) > 0).length;
  const healthScore = Math.min(
    100,
    Math.max(60, Math.round((itemsCount > 0 ? 50 : 20) + (activePieces > 0 ? 25 : 10) + (user?.sizes ? 15 : 0)))
  );

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  return (
    <div className="w-full px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* Top Grab Bar matching Figma 19 */}
      <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

      {/* Header: < More [S] */}
      <div className="flex items-start justify-between pb-3">
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
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight leading-snug">
              More
            </h1>
            <p className="text-xs text-[#8E968C] font-normal mt-0.5">
              All StyleSync tools
            </p>
          </div>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {/* SECTION 1: SHOPPING */}
      <div className="pt-1 mb-4">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2 px-1">
          SHOPPING
        </span>
        <div className="space-y-2">
          {/* What to Buy Next */}
          <button
            type="button"
            onClick={() => navigate('/wardrobe-gaps', { state: { from: '/more' } })}
            className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">
              What to Buy Next
            </span>
            <ChevronRight className="w-4 h-4 text-[#A0A69F] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Product Advisor */}
          <button
            type="button"
            onClick={() => navigate('/advisor', { state: { from: '/more' } })}
            className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">
              Product Advisor
            </span>
            <ChevronRight className="w-4 h-4 text-[#A0A69F] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Compare Products */}
          <button
            type="button"
            onClick={() => navigate('/compare', { state: { from: '/more' } })}
            className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">
              Compare Products
            </span>
            <ChevronRight className="w-4 h-4 text-[#A0A69F] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* SECTION 2: MONEY */}
      <div className="mb-4">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2 px-1">
          MONEY
        </span>
        <div className="space-y-2">
          {/* Budget & Purchases */}
          <button
            type="button"
            onClick={() => navigate('/budget', { state: { from: '/more' } })}
            className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">
              Budget & Purchases
            </span>
            <ChevronRight className="w-4 h-4 text-[#A0A69F] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* SECTION 3: STYLE & ACCOUNT */}
      <div className="mb-5">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2 px-1">
          STYLE & ACCOUNT
        </span>
        <div className="space-y-2">
          {/* My Collections */}
          <button
            type="button"
            onClick={() => navigate('/collections', { state: { from: '/more' } })}
            className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">
              My Collections
            </span>
            <ChevronRight className="w-4 h-4 text-[#A0A69F] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Style Assistant */}
          <button
            type="button"
            onClick={() => navigate('/assistant', { state: { from: '/more' } })}
            className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">
              Style Assistant
            </span>
            <ChevronRight className="w-4 h-4 text-[#A0A69F] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* My Profile & Sizes */}
          <button
            type="button"
            onClick={() => navigate('/settings?section=sizes', { state: { from: '/more' } })}
            className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">
              My Profile & Sizes
            </span>
            <ChevronRight className="w-4 h-4 text-[#A0A69F] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => navigate('/settings', { state: { from: '/more' } })}
            className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">
              Settings
            </span>
            <ChevronRight className="w-4 h-4 text-[#A0A69F] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* SECTION 4: PROFILE HEALTH CARD */}
      <div
        onClick={() => navigate('/style-scanner', { state: { from: '/more' } })}
        className="bg-[#E7ECE3] rounded-2xl p-4 sm:p-5 border border-[#D8E1D3] shadow-2xs cursor-pointer hover:border-[#3D7A5A]/50 active:scale-[0.99] transition-all"
        title="Calibrate Style & Fit with Photo Scanner"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-[#4A554A] uppercase">
            PROFILE HEALTH
          </span>
          <span className="text-sm font-bold text-[#3D7A5A]">
            {healthScore}%
          </span>
        </div>

        {/* Progress Bar with Forest Green Fill */}
        <div className="h-2 w-full bg-[#D5DDD0] rounded-full overflow-hidden my-2.5">
          <div
            className="h-full bg-[#3D7A5A] rounded-full transition-all duration-700"
            style={{ width: `${healthScore}%` }}
          />
        </div>

        <div className="text-xs text-[#6B7868] font-normal">
          Style: {styleType} · {userSize}
        </div>
      </div>
    </div>
  );
};

export default MoreMenuPage;
