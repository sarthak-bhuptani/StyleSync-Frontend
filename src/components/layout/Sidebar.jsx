import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  ArrowLeftRight,
  Shirt,
  Clock,
  Wallet,
  MessageSquare,
  User,
  Settings,
  LogOut,
  CalendarDays,
  PlusCircle,
  Sun,
  Compass,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/daily-stylist', label: 'Wear Today', icon: Sun },
    { to: '/wardrobe', label: 'My Wardrobe', icon: Layers },
    { to: '/collections', label: 'Collections', icon: Bookmark },
    { to: '/wardrobe-gaps', label: 'What to Buy Next', icon: PlusCircle },
    { to: '/advisor', label: 'Product Advisor', icon: Compass },
    { to: '/compare', label: 'Compare Products', icon: ArrowLeftRight },
    { to: '/budget', label: 'Budget & Purchases', icon: Wallet },
    { to: '/assistant', label: 'Style Assistant', icon: MessageSquare },
  ];

  const secondaryNavItems = [
    { to: '/profile', label: 'My Profile & Sizes', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E5E0D6] h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center justify-between border-b border-[#E5E0D6]">
        <BrandLogo size="md" to="/dashboard" />
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-[#8E968C] uppercase tracking-wider mb-2">
            MAIN
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-[#1E2E22] text-[#F8F6F0] font-semibold shadow-xs'
                        : 'text-[#5A6359] hover:bg-[#EFECE5] hover:text-[#1A1D1A]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5D8C7]' : 'text-[#8E968C] group-hover:text-[#1A1D1A]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-[#E2ECE3] text-[#1E2E22] px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-[#8E968C] uppercase tracking-wider mb-2">
            Preferences &amp; Account
          </p>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-[#1E2E22] text-[#F8F6F0] font-semibold shadow-xs'
                        : 'text-[#5A6359] hover:bg-[#EFECE5] hover:text-[#1A1D1A]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5D8C7]' : 'text-[#8E968C] group-hover:text-[#1A1D1A]'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Style Snapshot Widget in Sidebar */}
        <div className="p-4 bg-[#EFECE5] rounded-2xl border border-[#E5E0D6] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1A1D1A]">Profile Health</span>
            <span className="font-bold text-[#1E2E22]">{user?.profileCompleteness || 85}%</span>
          </div>
          <div className="w-full bg-[#DDD5C8] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#1E2E22] h-full rounded-full transition-all duration-500"
              style={{ width: `${user?.profileCompleteness || 85}%` }}
            />
          </div>
          <p className="text-[11px] text-[#687066] leading-tight">
            Style: <span className="font-semibold text-[#1A1D1A]">{user?.stylePreferences?.[0] || 'Minimal'}</span> · {user?.sizes?.shirt || 'L'}
          </p>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-[#E5E0D6] flex items-center justify-between bg-[#FAF8F5]">
        <NavLink to="/profile" className="flex items-center gap-3 min-w-0 group">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || user?.email || 'User')}&background=1E2E22&color=F8F6F0&size=100`}
            alt={user?.name || 'User'}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-9 h-9 rounded-full object-cover border border-[#E5E0D6]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1A1D1A] truncate group-hover:text-[#1E2E22] transition-colors">
              {user?.name || user?.username || 'My Profile'}
            </p>
            <p className="text-[11px] text-[#8E968C] truncate">{user?.email || 'StyleSync Member'}</p>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          title="Log Out"
          className="p-2 text-[#8E968C] hover:text-[#C86D51] hover:bg-[#F8ECE7] rounded-full transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
