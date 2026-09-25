import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Layers,
  ArrowLeftRight,
  Shirt,
  Clock,
  Wallet,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Sun,
  PlusCircle,
  Compass,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';

export const MobileAppHub = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { wardrobe } = useWardrobe();
  const navigate = useNavigate();

  const [touchStartY, setTouchStartY] = useState(null);
  const [touchCurrentY, setTouchCurrentY] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartY === null) return;
    const deltaY = e.touches[0].clientY - touchStartY;
    if (deltaY > 0) {
      setTouchCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (touchCurrentY && touchCurrentY > 120) {
      onClose();
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
    setIsDragging(false);
  };

  const dragStyle = touchCurrentY && touchCurrentY > 0
    ? { transform: `translateY(${touchCurrentY}px)`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }
    : {};

  const modules = [
    {
      to: '/daily-stylist',
      title: 'Wear Today',
      subtitle: "Today's Curated Look",
      icon: Sun,
      color: 'bg-amber-500/15 text-amber-600',
      badge: 'Daily'
    },
    {
      to: '/wardrobe-gaps',
      title: 'What to Buy',
      subtitle: 'Missing Closet Pieces',
      icon: PlusCircle,
      color: 'bg-indigo-500/15 text-indigo-600',
      badge: 'Staple Gap'
    },
    {
      to: '/advisor',
      title: 'Product Advisor',
      subtitle: 'Check Before Buying',
      icon: Compass,
      color: 'bg-emerald-500/15 text-emerald-600',
      badge: 'Vision'
    },
    {
      to: '/wardrobe',
      title: 'My Wardrobe',
      subtitle: `${wardrobe.length} Pieces Verified`,
      icon: Layers,
      color: 'bg-sky-500/15 text-sky-600'
    },
    {
      to: '/outfits',
      title: 'Outfit Builder',
      subtitle: 'Custom Lookbook',
      icon: Shirt,
      color: 'bg-violet-500/15 text-violet-600'
    },
    {
      to: '/compare',
      title: 'Shopping Duel',
      subtitle: 'Head-to-Head Compare',
      icon: ArrowLeftRight,
      color: 'bg-rose-500/15 text-rose-600',
      badge: 'VS'
    },
    {
      to: '/assistant',
      title: 'Stylist Assistant',
      subtitle: 'Stylist Chat & Advice',
      icon: MessageSquare,
      color: 'bg-emerald-500/15 text-emerald-600'
    },
    {
      to: '/budget',
      title: 'Budget Tracker',
      subtitle: 'Monthly Fashion Limit',
      icon: Wallet,
      color: 'bg-teal-500/15 text-teal-600'
    },
    {
      to: '/purchases',
      title: 'Purchase History',
      subtitle: 'Track Fashion ROI',
      icon: Clock,
      color: 'bg-slate-500/15 text-slate-700'
    },
    {
      to: '/dashboard',
      title: 'Dashboard',
      subtitle: 'Overview & Analytics',
      icon: LayoutDashboard,
      color: 'bg-blue-500/15 text-blue-600'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* App Hub Sheet */}
      <div
        style={dragStyle}
        className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 max-h-[88dvh] flex flex-col overflow-hidden animate-slide-up-mobile border-t border-slate-100"
      >
        {/* Drag Handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing w-full touch-none select-none"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* User Card Header */}
        <div className="px-5 pt-1 pb-4 flex items-center justify-between border-b border-slate-100">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 group min-w-0"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || user?.email || 'User')}&background=0f172a&color=fff&size=100`}
              alt={user?.name || 'User'}
              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900 truncate">
                  {user?.name || user?.username || 'My Profile'}
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                  MEMBER
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                <span>{user?.stylePreferences?.[0] || 'StyleSync'}</span>
                <span>·</span>
                <span className="text-emerald-700 font-semibold">{user?.profileCompleteness || 90}% Profile</span>
              </p>
            </div>
          </NavLink>

          <div className="flex items-center gap-1">
            <NavLink
              to="/settings"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </NavLink>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modules 2-Column Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 mb-2.5 block">
              StyleSync App Hub
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {modules.map((m) => {
                const Icon = m.icon;
                return (
                  <NavLink
                    key={m.to}
                    to={m.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 text-left active:scale-98 ${
                        isActive
                          ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                          : 'border-slate-100 bg-slate-50/80 hover:bg-slate-100 text-slate-800'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/15 text-white' : m.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {m.badge && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                              isActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-200/80 text-slate-700'
                            }`}>
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-black leading-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                            {m.title}
                          </p>
                          <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                            {m.subtitle}
                          </p>
                        </div>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Profile & Sizes</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAppHub;
