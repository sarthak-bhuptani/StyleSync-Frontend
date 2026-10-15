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
  Palette,
  Settings,
  LogOut,
  ShoppingBag,
  ChevronRight,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { AddWardrobeItemModal } from '../wardrobe/AddWardrobeItemModal';
import { SyncraModal } from '../common/SyncraModal';
import { SyncraLogo } from '../common/BrandLogo';

export const MobileNavigation = () => {
  const [syncraModalOpen, setSyncraModalOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addWardrobeItem } = useWardrobe();

  const longPressTimerRef = React.useRef(null);
  const isLongPressRef = React.useRef(false);

  // Lock body scroll only while modals are open
  useEffect(() => {
    if (actionSheetOpen || logoutModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [actionSheetOpen, logoutModalOpen]);

  const handleNavigate = (path) => {
    setActionSheetOpen(false);
    setLogoutModalOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleOpenSnap = () => {
    setActionSheetOpen(false);
    setCameraModalOpen(true);
  };

  const handleLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
    navigate('/');
  };

  const startPress = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      setLogoutModalOpen(true);
    }, 500);
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleAccountClick = () => {
    cancelPress();
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    navigate('/profile');
  };

  const isAccountActive = ['/profile', '/settings', '/purchases'].includes(location.pathname);

  return (
    <>
      {/* 5-Tab Floating Bottom Bar matching reference image */}
      <nav className="lg:hidden fixed bottom-2.5 left-3.5 right-3.5 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border border-[#ECE8DF] rounded-3xl px-2 py-1.5 flex items-center justify-around shadow-sm">
        {/* Tab 1: Home */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-all ${
              isActive ? 'text-[#1E2E22]' : 'text-[#8E968C] hover:text-[#1A1D1A]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${isActive ? 'bg-[#E5E0D6] text-[#1E2E22]' : 'text-[#8E968C]'}`}>
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#1E2E22]' : 'font-medium'}`}>Home</span>
            </>
          )}
        </NavLink>

        {/* Tab 2: Wardrobe */}
        <NavLink
          to="/wardrobe"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-all ${
              isActive ? 'text-[#1E2E22]' : 'text-[#8E968C] hover:text-[#1A1D1A]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${isActive ? 'bg-[#E5E0D6] text-[#1E2E22]' : 'text-[#8E968C]'}`}>
                <Layers className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#1E2E22]' : 'font-medium'}`}>Wardrobe</span>
            </>
          )}
        </NavLink>

        {/* Tab 3: Raised Circular Syncra AI Stylist Button with Bespoke Monogram */}
        <NavLink
          to="/assistant"
          className="flex-1 flex flex-col items-center justify-center relative -top-3 cursor-pointer group"
          title="Open Syncra AI Assistant"
        >
          {({ isActive }) => (
            <>
              <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-[#1E2E22] via-[#2F4535] to-[#4A5D44] text-white flex items-center justify-center shadow-lg border-2 border-white active:scale-95 hover:scale-105 transition-all ${isActive ? 'ring-2 ring-[#1E2E22]' : ''}`}>
                <SyncraLogo className="w-6 h-6" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#1E2E22]' : 'font-medium text-[#8E968C]'}`}>Syncra</span>
            </>
          )}
        </NavLink>

        {/* Tab 4: Collections matching reference image */}
        <NavLink
          to="/collections"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-all ${
              isActive ? 'text-[#1E2E22]' : 'text-[#8E968C] hover:text-[#1A1D1A]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${isActive ? 'bg-[#E5E0D6] text-[#1E2E22]' : 'text-[#8E968C]'}`}>
                <Bookmark className="w-4 h-4" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#1E2E22]' : 'font-medium'}`}>Collections</span>
            </>
          )}
        </NavLink>

        {/* Tab 5: Shop matching reference image */}
        <NavLink
          to="/advisor"
          className={() => {
            const isShopActive = ['/advisor', '/wardrobe-gaps'].some(p => location.pathname.startsWith(p));
            return `flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-all ${
              isShopActive ? 'text-[#1E2E22]' : 'text-[#8E968C] hover:text-[#1A1D1A]'
            }`;
          }}
        >
          {() => {
            const isShopActive = ['/advisor', '/wardrobe-gaps'].some(p => location.pathname.startsWith(p));
            return (
              <>
                <div className={`px-3 py-1 rounded-full transition-all flex items-center justify-center ${isShopActive ? 'bg-[#E5E0D6] text-[#1E2E22]' : 'text-[#8E968C]'}`}>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isShopActive ? 'font-bold text-[#1E2E22]' : 'font-medium'}`}>Shop</span>
              </>
            );
          }}
        </NavLink>
      </nav>

      {/* QUICK LOGOUT POPUP (Triggered ONLY on continue/long press) */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setLogoutModalOpen(false)}
          />

          {/* Quick Logout Sheet */}
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] animate-slide-up-mobile border-t border-slate-100">
            {/* Grab Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" />

            {/* User Profile Mini Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || user?.email || 'User')}&background=0f172a&color=fff&size=100`}
                  alt={user?.name || 'User'}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {user?.name || user?.username || 'StyleSync Member'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'Logged In'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Logout Confirmation & Action */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100 text-left">
                <p className="text-xs font-bold text-rose-950">Log Out of StyleSync?</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Hold press detected. You can sign out of your account on this device.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(false)}
                  className="py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
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
                    <Palette className="w-3.5 h-3.5" />
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

      {/* Syncra AI Stylist Modal */}
      <SyncraModal
        isOpen={syncraModalOpen}
        onClose={() => setSyncraModalOpen(false)}
      />
    </>
  );
};

export default MobileNavigation;
