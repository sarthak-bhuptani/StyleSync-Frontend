import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
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
  ChevronRight,
  ShieldCheck,
  IndianRupee
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/advisor', label: 'Product Advisor', icon: Sparkles, badge: 'AI' },
    { to: '/paisa-vasool', label: 'Paisa Vasool Score', icon: IndianRupee, badge: 'Smart' },
    { to: '/compare', label: 'Shopping Duel', icon: ArrowLeftRight, badge: 'VS' },
    { to: '/wardrobe', label: 'My Wardrobe', icon: Layers },
    { to: '/outfits', label: 'Outfit Builder', icon: Shirt },
    { to: '/purchases', label: 'Purchase History', icon: Clock },
    { to: '/budget', label: 'Budget Tracker', icon: Wallet },
    { to: '/assistant', label: 'AI Assistant', icon: MessageSquare },
  ];

  const secondaryNavItems = [
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-slate-100">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">StyleSync</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart Shopping Advisor</p>
          </div>
        </NavLink>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Advisor & Styling
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-inherit" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Preferences & Account
          </p>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-inherit" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Style Snapshot Widget in Sidebar */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Profile Health</span>
            <span className="font-bold text-emerald-600">{user?.profileCompleteness || 85}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${user?.profileCompleteness || 85}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Style: <span className="font-medium text-slate-700">{user?.stylePreferences?.[0] || 'Minimal'}</span> · {user?.sizes?.shirt || 'L'}
          </p>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <NavLink to="/profile" className="flex items-center gap-3 min-w-0 group">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
              {user?.name || 'Sarthak Sharma'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'sarthak@example.com'}</p>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          title="Log Out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
