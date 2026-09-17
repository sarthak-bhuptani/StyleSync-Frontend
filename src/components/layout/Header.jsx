import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Bell,
  Plus,
  ArrowRight,
  Shirt,
  ShoppingBag,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';

export const Header = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { wardrobe } = useWardrobe();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic Page Title & Subtitle based on Route
  const routeMeta = {
    '/dashboard': { title: `Good morning, ${user?.name?.split(' ')[0] || 'Sarthak'} 👋`, subtitle: "Let's make your next purchase a smarter one." },
    '/advisor': { title: 'Product Advisor', subtitle: 'AI compatibility check before buying.' },
    '/wardrobe': { title: 'My Wardrobe', subtitle: `${wardrobe.length} verified pieces in your capsule.` },
    '/compare': { title: 'Product Comparison', subtitle: 'Side-by-side suitability and versatility breakdown.' },
    '/outfits': { title: 'Outfit Builder', subtitle: 'Generate high-compatibility outfits from your wardrobe.' },
    '/purchases': { title: 'Purchase History', subtitle: 'Track your fashion investment outcomes & AI feedback.' },
    '/budget': { title: 'Shopping Budget', subtitle: 'Monthly spending limits and category allocation.' },
    '/assistant': { title: 'Ask StyleSync AI', subtitle: 'Styling advice, compatibility questions & wardrobe gap analysis.' },
    '/profile': { title: 'My Style Profile', subtitle: 'Personal preferences, sizes, color palette & fit.' },
    '/settings': { title: 'Settings', subtitle: 'Privacy, AI preferences and data management.' }
  };

  const currentMeta = routeMeta[location.pathname] || {
    title: 'StyleSync',
    subtitle: 'AI Personal Shopping Advisor'
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {currentMeta.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        {location.pathname !== '/advisor' && (
          <button
            onClick={() => navigate('/advisor')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-subtle hover:shadow transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Analyze Product</span>
          </button>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-floating border border-slate-100 p-4 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</span>
                <span className="text-[11px] font-semibold text-emerald-600">2 New</span>
              </div>
              <div className="mt-3 space-y-3">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                  <p className="font-semibold text-emerald-900">High Match Alert 🟢</p>
                  <p className="text-emerald-700 mt-0.5 leading-relaxed">
                    The White Leather Low-Tops you analyzed scored 88/100.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <p className="font-semibold text-slate-800">Wardrobe Tip 💡</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    You have ₹3,550 left in your March budget.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar Link */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 pl-2 border-l border-slate-200 group"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-slate-900 transition-all"
          />
        </NavLink>
      </div>
    </header>
  );
};
