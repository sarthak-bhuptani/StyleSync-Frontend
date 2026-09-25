import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Layers,
  Sun,
  User,
  Plus,
  Camera,
  MessageSquare,
  ArrowLeftRight,
  X,
  PlusCircle,
  Sparkles,
  Settings,
  LogOut,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { AddWardrobeItemModal } from '../wardrobe/AddWardrobeItemModal';

export const MobileNavigation = () => {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addWardrobeItem } = useWardrobe();

  // Lock body scroll only while modals are open
  useEffect(() => {
    if (actionSheetOpen || accountSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [actionSheetOpen, accountSheetOpen]);

  const handleNavigate = (path) => {
    setActionSheetOpen(false);
    setAccountSheetOpen(false);
    navigate(path);
  };

  const handleOpenSnap = () => {
    setActionSheetOpen(false);
    setCameraModalOpen(true);
  };

  const handleLogout = async () => {
    setAccountSheetOpen(false);
    await logout();
    navigate('/login');
  };

  const isAccountActive = ['/profile', '/settings', '/purchases'].includes(location.pathname) || accountSheetOpen;

  return (
    <>
      {/* 5-Tab Bottom Bar with Center Action Button */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around shadow-floating pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)]">
        {/* Tab 1: Home */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-0.5 text-[10px] font-bold transition-all relative ${
              isActive ? 'text-slate-900 font-black' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-slate-100 text-slate-900 scale-105' : 'text-slate-400'}`}>
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className="mt-0.5 tracking-tight">Home</span>
              {isActive && <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-slate-900" />}
            </>
          )}
        </NavLink>

        {/* Tab 2: Wear Today */}
        <NavLink
          to="/daily-stylist"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-0.5 text-[10px] font-bold transition-all relative ${
              isActive ? 'text-slate-900 font-black' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-slate-100 text-slate-900 scale-105' : 'text-slate-400'}`}>
                <Sun className="w-4 h-4" />
              </div>
              <span className="mt-0.5 tracking-tight">Wear Today</span>
              {isActive && <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-slate-900" />}
            </>
          )}
        </NavLink>

        {/* Tab 3: CENTER ACTION BUTTON (Elevated Action Trigger) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5 relative z-10">
          <button
            type="button"
            onClick={() => setActionSheetOpen(true)}
            aria-label="Create / Add / Scan"
            className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg border-2 border-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          >
            <Plus className="w-6 h-6 text-emerald-400 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-extrabold text-slate-800 mt-1 tracking-tight">
            Add / Scan
          </span>
        </div>

        {/* Tab 4: Wardrobe */}
        <NavLink
          to="/wardrobe"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-0.5 text-[10px] font-bold transition-all relative ${
              isActive ? 'text-slate-900 font-black' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-slate-100 text-slate-900 scale-105' : 'text-slate-400'}`}>
                <Layers className="w-4 h-4" />
              </div>
              <span className="mt-0.5 tracking-tight">Wardrobe</span>
              {isActive && <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-slate-900" />}
            </>
          )}
        </NavLink>

        {/* Tab 5: Account & Logout Sheet Trigger */}
        <button
          type="button"
          onClick={() => setAccountSheetOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-0.5 text-[10px] font-bold transition-all relative cursor-pointer ${
            isAccountActive ? 'text-slate-900 font-black' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${isAccountActive ? 'bg-slate-100 text-slate-900 scale-105' : 'text-slate-400'}`}>
            <User className="w-4 h-4" />
          </div>
          <span className="mt-0.5 tracking-tight">Account</span>
          {isAccountActive && <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-slate-900" />}
        </button>
      </nav>

      {/* ACCOUNT & LOGOUT BOTTOM SHEET MODAL */}
      {accountSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setAccountSheetOpen(false)}
          />

          {/* Account Drawer Content */}
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] animate-slide-up-mobile border-t border-slate-100 max-h-[85vh] overflow-y-auto">
            {/* Grab Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" />

            {/* User Profile Header Banner */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || user?.email || 'User')}&background=0f172a&color=fff&size=100`}
                  alt={user?.name || 'User'}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 shadow-xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {user?.name || user?.username || 'StyleSync Member'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'Logged In'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200/60">
                    {user?.stylePreferences?.[0] || 'Smart Casual'} · {user?.sizes?.shirt || 'Size L'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAccountSheetOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Options List */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Account & Preferences
              </span>

              {/* 1. Profile & Sizes */}
              <button
                type="button"
                onClick={() => handleNavigate('/profile')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all flex items-center justify-between text-left active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">My Profile & Sizes</p>
                    <p className="text-[10px] text-slate-500">Color season, face scan, sizes & style rules</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 2. Settings */}
              <button
                type="button"
                onClick={() => handleNavigate('/settings')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all flex items-center justify-between text-left active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                    <Settings className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Settings & Security</p>
                    <p className="text-[10px] text-slate-500">Theme, notifications, currency & passwords</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* 3. Purchase History */}
              <button
                type="button"
                onClick={() => handleNavigate('/purchases')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all flex items-center justify-between text-left active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200/60">
                    <ShoppingBag className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Purchase History & Ratings</p>
                    <p className="text-[10px] text-slate-500">Good vs Bad Buy feedback tracking</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* DEDICATED LOG OUT BUTTON */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 transition-all flex items-center justify-center gap-2 font-bold text-xs active:scale-[0.98] cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Log Out of StyleSync</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Center Action Sheet Modal (Super Tools Hub) */}
      {actionSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setActionSheetOpen(false)}
          />

          {/* Action Sheet Content */}
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] animate-slide-up-mobile border-t border-slate-100 max-h-[85vh] overflow-y-auto">
            {/* Grab Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Stylist Actions & Tools</h3>
                <p className="text-xs text-slate-500">Quick access to all features</p>
              </div>
              <button
                type="button"
                onClick={() => setActionSheetOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION 1: CREATE & CHECK (2x2 Grid) */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Snap Clothes */}
                <button
                  type="button"
                  onClick={handleOpenSnap}
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 transition-all flex flex-col items-start gap-2 text-left active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-emerald-950">Snap Clothes</p>
                      <span className="px-1 py-0.2 rounded bg-emerald-200/70 text-emerald-800 text-[8px] font-extrabold">+ Add</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 leading-tight mt-0.5">Take photo to add to closet</p>
                  </div>
                </button>

                {/* Check Store Item */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/advisor')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex flex-col items-start gap-2 text-left active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Check Product</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Evaluate Zara/Amazon link</p>
                  </div>
                </button>

                {/* Ask AI Stylist */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/assistant')}
                  className="p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/60 border border-indigo-200/70 transition-all flex flex-col items-start gap-2 text-left active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-950">Ask AI Stylist</p>
                    <p className="text-[10px] text-indigo-700 leading-tight mt-0.5">Styling tips & outfit advice</p>
                  </div>
                </button>

                {/* Compare Products */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/compare')}
                  className="p-3 rounded-2xl bg-rose-50/60 hover:bg-rose-100/60 border border-rose-200/70 transition-all flex flex-col items-start gap-2 text-left active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-950">Compare Items</p>
                    <p className="text-[10px] text-rose-700 leading-tight mt-0.5">Head-to-head style duel</p>
                  </div>
                </button>
              </div>
            </div>

            {/* SECTION 2: ALL APP MODULES */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                All Modules & Features
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Wear Today */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/daily-stylist')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all flex items-center gap-2.5 text-left active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Wear Today</p>
                    <p className="text-[9px] text-slate-400 truncate">Weather styling</p>
                  </div>
                </button>

                {/* What to Buy */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/wardrobe-gaps')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all flex items-center gap-2.5 text-left active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <PlusCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">What to Buy</p>
                    <p className="text-[9px] text-slate-400 truncate">Capsule gap AI</p>
                  </div>
                </button>

                {/* Budget & Purchases */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/budget')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all flex items-center gap-2.5 text-left active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Budget & ROI</p>
                    <p className="text-[9px] text-slate-400 truncate">Spending limits</p>
                  </div>
                </button>

                {/* Color Draping / Profile */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/profile')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all flex items-center gap-2.5 text-left active:scale-[0.98] cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Color Palette</p>
                    <p className="text-[9px] text-slate-400 truncate">Draping & sizes</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Wardrobe Item Modal */}
      {cameraModalOpen && (
        <AddWardrobeItemModal
          isOpen={cameraModalOpen}
          onClose={() => setCameraModalOpen(false)}
          onAdd={addWardrobeItem}
        />
      )}
    </>
  );
};

export default MobileNavigation;
