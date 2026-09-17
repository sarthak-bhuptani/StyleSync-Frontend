import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { Toast } from '../common/Toast';
import { useWardrobe } from '../../context/WardrobeContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ShoppingBag,
  Sparkles,
  LayoutDashboard,
  Layers,
  ArrowLeftRight,
  Shirt,
  Clock,
  Wallet,
  MessageSquare,
  User,
  Settings,
  LogOut
} from 'lucide-react';

export const AppLayout = () => {
  const { toastMessage } = useWardrobe();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/advisor', label: 'Product Advisor', icon: Sparkles },
    { to: '/wardrobe', label: 'My Wardrobe', icon: Layers },
    { to: '/compare', label: 'Product Comparison', icon: ArrowLeftRight },
    { to: '/outfits', label: 'Outfit Builder', icon: Shirt },
    { to: '/purchases', label: 'Purchase History', icon: Clock },
    { to: '/budget', label: 'Budget Tracker', icon: Wallet },
    { to: '/assistant', label: 'AI Assistant', icon: MessageSquare },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] text-slate-800 font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-bold text-base text-slate-900">StyleSync</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1 flex-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleMobileLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigation />

      {/* Global Toast */}
      {toastMessage && <Toast message={toastMessage.message} type={toastMessage.type} />}
    </div>
  );
};
