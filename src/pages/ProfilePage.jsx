import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Mail,
  MessageSquare,
  X,
  ExternalLink,
  Shield,
  Sliders,
  Check,
  LogOut,
  Settings,
  Ruler,
  Layers,
  Shirt,
  Bookmark,
  Sparkles,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const navigate = useNavigate();

  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // User details with smart fallbacks matching the exact design
  const displayName = user?.name || 'Sarthak Bhuptani';
  const initial = (displayName.trim()?.[0] || 'S').toUpperCase();

  // Style attributes shown below the name
  const styleVibes = user?.preferences?.favoriteStyles?.length > 0
    ? user.preferences.favoriteStyles.slice(0, 3).join(' · ')
    : 'Minimal · Smart Casual · Neutral';

  // Sizing & style preference for the health card
  const styleType = user?.preferences?.favoriteStyles?.[0] || 'Minimal';
  const userSize = user?.sizes?.shirt || user?.sizes?.preferredFit || 'L';

  // Real Stats values derived from wardrobe
  const itemsCount = Array.isArray(wardrobe) ? wardrobe.length : 0;
  const activePieces = (wardrobe || []).filter((w) => (w.wearCount || w.wears || 0) > 0).length;
  const activeRate = itemsCount > 0
    ? `${Math.round((activePieces / itemsCount) * 100)}%`
    : '0%';
  const totalWears = (wardrobe || []).reduce(
    (sum, w) => sum + (Number(w.wearCount || w.wears) || 0),
    0
  );
  const wearsCount = totalWears;
  const healthScore = Math.min(
    100,
    Math.max(60, Math.round((itemsCount > 0 ? 50 : 20) + (activePieces > 0 ? 25 : 10) + (user?.sizes ? 15 : 0)))
  );

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
    navigate('/login');
  };

  // Sectioned menu items matching Settings page style
  const wardrobeSections = [
    {
      id: 'sizes',
      label: 'Sizes & measurements',
      action: () => navigate('/settings?section=sizes', { state: { from: '/profile' } })
    },
    {
      id: 'wardrobe',
      label: 'My wardrobe',
      action: () => navigate('/wardrobe', { state: { from: '/profile' } })
    },
    {
      id: 'looks',
      label: 'My looks',
      action: () => navigate('/my-looks', { state: { from: '/profile' } })
    },
    {
      id: 'wishlist',
      label: 'Wishlist & gaps',
      action: () => navigate('/wardrobe-gaps', { state: { from: '/profile' } })
    }
  ];

  const systemSections = [
    {
      id: 'preferences',
      label: 'Syncra preferences',
      action: () => navigate('/syncra-preferences', { state: { from: '/profile' } })
    },
    {
      id: 'settings',
      label: 'Settings',
      action: () => navigate('/settings', { state: { from: '/profile' } })
    },
    {
      id: 'help',
      label: 'Help & support',
      action: () => setHelpModalOpen(true)
    }
  ];

  return (
    <div className="w-full px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* Top Grab Bar matching Settings / Figma */}
      <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

      {/* 1. Header: < My Profile [Settings] */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight leading-snug">
            My Profile
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings', { state: { from: '/profile' } })}
          className="p-1.5 text-[#717670] hover:text-[#1A1D1A] hover:bg-black/5 rounded-full transition-all active:scale-95 cursor-pointer"
          aria-label="Settings"
          title="Account Settings"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* Centered Profile Header: Avatar, Name & Aesthetic Subtitle */}
      <div className="flex flex-col items-center text-center pt-2 pb-1">
        {/* Soft Tan Avatar Circle with Uploaded Photo or Initial */}
        <div
          onClick={() => navigate('/settings', { state: { from: '/profile' } })}
          className="w-20 h-20 rounded-full bg-[#D6C7B2] text-[#1A1D1A] flex items-center justify-center font-serif text-2xl font-bold shadow-2xs cursor-pointer hover:opacity-95 active:scale-95 transition-all select-none overflow-hidden border-2 border-white ring-2 ring-[#ECE8DF] group relative"
          title="Change Profile Photo / Settings"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-5 h-5 text-white drop-shadow" />
          </div>
        </div>

        {/* User Full Name in Refined Serif */}
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1A1D1A] mt-3 tracking-tight">
          {displayName}
        </h2>

        {/* Style Tagline */}
        <p className="text-xs text-[#8E968C] font-normal mt-0.5">
          {styleVibes}
        </p>
      </div>

      {/* Three Metric Cards Row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-4">
        {/* Card 1: Items */}
        <div
          onClick={() => navigate('/wardrobe', { state: { from: '/profile' } })}
          className="bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-2 text-center shadow-2xs cursor-pointer hover:border-[#1A1D1A]/30 active:scale-95 transition-all"
        >
          <p className="text-xl sm:text-2xl font-bold font-serif text-[#1A1D1A]">
            {itemsCount}
          </p>
          <p className="text-[11px] text-[#8E968C] font-normal mt-0.5">Items</p>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-2 text-center shadow-2xs">
          <p className="text-xl sm:text-2xl font-bold font-serif text-[#1A1D1A]">
            {activeRate}
          </p>
          <p className="text-[11px] text-[#8E968C] font-normal mt-0.5">Active</p>
        </div>

        {/* Card 3: Wears */}
        <div
          onClick={() => navigate('/daily-stylist', { state: { from: '/profile' } })}
          className="bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-2 text-center shadow-2xs cursor-pointer hover:border-[#1A1D1A]/30 active:scale-95 transition-all"
        >
          <p className="text-xl sm:text-2xl font-bold font-serif text-[#1A1D1A]">
            {wearsCount}
          </p>
          <p className="text-[11px] text-[#8E968C] font-normal mt-0.5">Wears</p>
        </div>
      </div>

      {/* PROFILE HEALTH Card with styled button and clean spacing */}
      <div
        onClick={() => navigate('/style-scanner', { state: { from: '/profile' } })}
        className="bg-white rounded-2xl border border-[#ECE8DF] p-4 sm:p-5 shadow-2xs my-4 space-y-2.5 cursor-pointer hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all"
        title="Calibrate Style & Fit with Photo Scanner"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-[#4A554A] uppercase">
            PROFILE HEALTH
          </span>
          <span className="text-xs font-bold text-[#2D5A40] bg-[#E8F2EC] px-2 py-0.5 rounded-full border border-[#CDE3D5]">
            {healthScore}%
          </span>
        </div>

        {/* Progress Bar with Forest Green Fill */}
        <div className="h-2 w-full bg-[#E5E2DA] rounded-full overflow-hidden my-1">
          <div
            className="h-full bg-gradient-to-r from-[#2D5A40] to-[#3D7A5A] rounded-full transition-all duration-700"
            style={{ width: `${healthScore}%` }}
          />
        </div>

        {/* Style & Size Metadata + Styled Calibrate Pill Button */}
        <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#ECE8DF]/70">
          <p className="text-[#717670] font-normal truncate min-w-0">
            Style: <span className="text-[#1A1D1A] font-semibold">{styleType}</span>
            <span className="mx-1.5 text-[#D6C7B2]">·</span>
            Size: <span className="text-[#1A1D1A] font-semibold">{userSize}</span>
          </p>
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigate('/style-scanner', { state: { from: '/profile' } });
            }}
            className="text-[11px] font-semibold text-[#1E2E22] bg-[#FAF8F5] hover:bg-[#ECE8DF] border border-[#ECE8DF] px-2.5 py-1 rounded-full shrink-0 inline-flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
          >
            <span>Calibrate scan</span>
            <span className="text-xs">&rarr;</span>
          </span>
        </div>
      </div>

      {/* SECTION 1: WARDROBE & SIZES (Matching Settings Page Category & Pill Style) */}
      <div className="pt-2">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2 px-1">
          WARDROBE & SIZES
        </span>

        <div className="space-y-2">
          {wardrobeSections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
            >
              <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2: PREFERENCES & SYSTEM (Matching Settings Page Category & Pill Style) */}
      <div className="pt-3">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2 px-1">
          STYLE & PREFERENCES
        </span>

        <div className="space-y-2">
          {systemSections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
            >
              <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Version 1.0 matching Settings Page */}
      <div className="text-center pt-4 pb-1">
        <p className="text-xs text-[#8E968C]">Version 1.0</p>
      </div>

      {/* Log out button matching Settings Page exactly */}
      <div className="pt-2 pb-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3.5 px-4 bg-red-50/70 rounded-2xl border border-red-200/90 text-center font-bold text-xs sm:text-sm text-red-600 shadow-2xs hover:bg-red-100 hover:border-red-300 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4 text-red-600 stroke-[2.2]" />
          <span>Log out</span>
        </button>
      </div>

      {/* 5. Help & Support Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setHelpModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-[#ECE8DF] animate-slide-up-mobile">
            {/* Grab Bar on Mobile */}
            <div className="w-10 h-1 rounded-full bg-[#D5CFC2] mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#1E2E22]" />
                <h3 className="font-serif font-bold text-lg text-[#1A1D1A]">Help & Support</h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="p-1.5 text-[#8E968C] hover:text-[#1A1D1A] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="p-3 bg-white rounded-2xl border border-[#ECE8DF]">
                <p className="font-bold text-[#1A1D1A] mb-1">How does StyleSync calculate my Profile Health?</p>
                <p className="text-[#717670] leading-relaxed">
                  Your score reflects complete body measurements, seasonal color harmony calibration, and cataloged wardrobe items.
                </p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#ECE8DF]">
                <p className="font-bold text-[#1A1D1A] mb-1">Need styling advice right now?</p>
                <p className="text-[#717670] leading-relaxed mb-2.5">
                  Our AI Style Assistant is ready to help you assemble looks for today's weather and upcoming events.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHelpModalOpen(false);
                    navigate('/assistant');
                  }}
                  className="px-3.5 py-1.5 bg-[#1E2E22] text-[#F8F6F0] rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#162319] transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat with Style Assistant</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#ECE8DF] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#1A1D1A]">Contact Concierge Support</p>
                  <p className="text-[#8E968C] text-[11px]">support@stylesync.app</p>
                </div>
                <a
                  href="mailto:support@stylesync.app"
                  className="px-3 py-1.5 border border-[#ECE8DF] hover:border-[#1E2E22] rounded-xl font-semibold text-[#1A1D1A] flex items-center gap-1 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Us</span>
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px] text-[#8E968C] border-t border-[#ECE8DF]">
              <span>StyleSync v2.4 (Build 2026.10)</span>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="font-bold text-[#1A1D1A] hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Syncra Preferences Quick Drawer / Modal */}
      {preferencesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setPreferencesModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-[#ECE8DF] animate-slide-up-mobile">
            {/* Grab Bar on Mobile */}
            <div className="w-10 h-1 rounded-full bg-[#D5CFC2] mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#1E2E22]" />
                <h3 className="font-serif font-bold text-lg text-[#1A1D1A]">Syncra Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreferencesModalOpen(false)}
                className="p-1.5 text-[#8E968C] hover:text-[#1A1D1A] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3.5 bg-white rounded-2xl border border-[#ECE8DF] space-y-1.5">
                <p className="font-bold text-[#1A1D1A]">Current Style Aesthetic</p>
                <p className="text-[#717670]">{styleVibes}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-[#ECE8DF] space-y-1.5">
                <p className="font-bold text-[#1A1D1A]">Size Specifications</p>
                <p className="text-[#717670]">
                  Shirt: {user?.sizes?.shirt || 'L'} · Pants: {user?.sizes?.pants || '32'} · Shoes: {user?.sizes?.shoes || '10'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreferencesModalOpen(false);
                    navigate('/settings?section=styling');
                  }}
                  className="w-full py-2.5 px-4 bg-[#1E2E22] hover:bg-[#162319] text-[#F8F6F0] rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <span>Edit in Full Settings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modern In-App Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setLogoutModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl z-10 p-6 border border-[#E5E0D6] text-center">
            {/* Red Logout Icon */}
            <div className="w-13 h-13 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
              <LogOut className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="font-serif font-bold text-xl text-[#1A1D1A] tracking-tight">
              Log out of StyleSync?
            </h3>
            <p className="text-xs sm:text-sm text-[#717670] mt-1.5 leading-relaxed">
              Are you sure you want to log out? Your wardrobe items, style scans, and looks remain safely saved.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="py-3 px-4 bg-[#F6F4EE] hover:bg-[#ECE8DF] text-[#1A1D1A] rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-sm shadow-red-600/25 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4 stroke-[2.2]" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
