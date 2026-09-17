import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Shirt,
  User,
  Wallet
} from 'lucide-react';

export const MobileNavigation = () => {
  const navTabs = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/advisor', label: 'Advisor', icon: Sparkles, highlight: true },
    { to: '/wardrobe', label: 'Wardrobe', icon: Layers },
    { to: '/outfits', label: 'Outfits', icon: Shirt },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around shadow-floating">
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
                tab.highlight && !isActive
                  ? 'text-emerald-700 font-bold'
                  : isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    tab.highlight
                      ? isActive
                        ? 'bg-slate-900 text-emerald-400 shadow-sm'
                        : 'bg-emerald-50 text-emerald-700'
                      : isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="mt-0.5">{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
