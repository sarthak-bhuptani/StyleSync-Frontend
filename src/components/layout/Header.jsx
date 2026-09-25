import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Bell,
  ChevronLeft,
  Menu,
  CheckCheck,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { BrandLogo } from '../common/BrandLogo';
import { notificationApi } from '../../api/notificationApi';

export const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const { wardrobe } = useWardrobe();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Close notifications dropdown on click/touch outside
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      try {
        const list = await notificationApi.getNotifications();
        if (Array.isArray(list)) {
          setNotificationsList(list);
          setUnreadCount(list.filter(n => !n.read).length);
        }
      } catch (err) {
        console.warn('Could not load notifications:', err);
      }
    };
    fetchNotifs();
  }, [location.pathname, isAuthenticated]);

  const handleMarkAllRead = async () => {
    const updated = await notificationApi.markAllAsRead();
    setNotificationsList(updated);
    setUnreadCount(0);
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    const updated = await notificationApi.deleteNotification(id);
    setNotificationsList(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
  };

  const isProfilePage = location.pathname === '/profile';
  const isSettingsPage = location.pathname === '/settings';
  const rawUsername = user?.username || user?.name?.toLowerCase().replace(/\s+/g, '_') || (user?.email ? user.email.split('@')[0] : 'user');
  const cleanUsername = rawUsername.replace('@', '');

  // Sub-screen section metadata
  const searchParams = new URLSearchParams(location.search);
  const currentSection = searchParams.get('section');

  const settingsSectionMeta = {
    account: { title: 'Edit profile', subtitle: 'Public style info & personal details' },
    socials: { title: 'Connected accounts', subtitle: 'Instagram & Lookbook handles' },
    sizes: { title: 'Body measurements', subtitle: 'Sizes and fit specifications' },
    styling: { title: 'Brand & color rules', subtitle: 'Favorite labels & avoided colors' },
    ai: { title: 'Notifications & alerts', subtitle: 'Daily inspirations & gap alerts' },
    security: { title: 'Security & privacy', subtitle: 'Password, encryption & backups' }
  };

  // Dynamic Page Title & Subtitle based on Route
  const routeMeta = {
    '/dashboard': { title: 'Dashboard', subtitle: "Your personal style & wardrobe hub" },
    '/daily-stylist': { title: 'Today’s Outfit', subtitle: 'Weather-matched styling for today' },
    '/wardrobe-gaps': { title: 'What to Buy', subtitle: 'Missing pieces that unlock more outfits' },
    '/advisor': { title: 'Product Advisor', subtitle: 'AI check before you buy' },
    '/wardrobe': { title: 'My Wardrobe', subtitle: `${wardrobe.length} pieces in your closet` },
    '/compare': { title: 'Compare Products', subtitle: 'Side-by-side versatility check' },
    '/outfits': { title: 'Outfit Builder', subtitle: 'Mix & match combinations' },
    '/purchases': { title: 'Purchase History', subtitle: 'Track fashion investments & feedback' },
    '/budget': { title: 'Shopping Budget', subtitle: 'Monthly spending & limits' },
    '/assistant': { title: 'Style Assistant', subtitle: 'Ask anything about outfits & style' },
    '/profile': { title: `@${cleanUsername}`, subtitle: 'Personal Stylist & Capsule Wardrobe' },
    '/settings': isSettingsPage && currentSection && settingsSectionMeta[currentSection]
      ? settingsSectionMeta[currentSection]
      : { title: 'Settings and activity', subtitle: 'Preferences, Profile & Privacy' }
  };

  const isDashboard = location.pathname === '/dashboard';
  const currentMeta = routeMeta[location.pathname] || {
    title: 'StyleSync',
    subtitle: 'Personal Stylist & Wardrobe'
  };

  const handleBack = () => {
    if (isSettingsPage) {
      if (currentSection) {
        navigate('/settings');
      } else {
        navigate('/profile');
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3 flex items-center justify-between transition-all">
      {/* Left: Brand Logo on Mobile, Instagram Username on Profile, or Dynamic Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 min-w-0">
          {isDashboard ? (
            <BrandLogo size="sm" showSubtitle={false} to="/dashboard" />
          ) : isProfilePage ? (
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg active:scale-95 cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base font-extrabold text-slate-900 tracking-tight truncate">
                  @{cleanUsername}
                </span>
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black shrink-0" title="Verified Stylist">
                  ✓
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg active:scale-95 cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-base font-extrabold text-slate-900 truncate tracking-tight">
                {currentMeta.title}
              </h1>
            </div>
          )}
        </div>

        {/* Desktop Header Title */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {currentMeta.title}
            </h1>
            {isProfilePage && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black" title="Verified Stylist">
                ✓
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Desktop Quick Advisor Button (hidden on profile and settings) */}
        {location.pathname !== '/advisor' && !isProfilePage && !isSettingsPage && (
          <button
            onClick={() => navigate('/advisor')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Check a Product</span>
          </button>
        )}

        {/* Notification Bell */}
        {!isSettingsPage && (
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 bg-emerald-500 text-white text-[9px] font-black rounded-full ring-2 ring-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-4 z-50 animate-fade-in text-slate-800">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-200/60">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="mt-2.5 space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {notificationsList.length > 0 ? (
                    notificationsList.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-2xl border text-xs transition-all flex items-start gap-2 relative group ${
                          !n.read
                            ? 'bg-amber-50/40 border-amber-200/60 text-slate-900 font-medium'
                            : 'bg-slate-50/60 border-slate-100 text-slate-600'
                        }`}
                      >
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs">{n.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotif(e, n.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                          title="Dismiss"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs font-medium">
                      <p>No notifications right now</p>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <NavLink
                    to="/settings?section=ai"
                    onClick={() => setShowNotifications(false)}
                    className="font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>Manage alerts</span>
                    <ExternalLink className="w-3 h-3" />
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="font-bold text-slate-700 hover:text-slate-950 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Page: Replace Avatar Image with 3 Lines Hamburger Menu Icon for Settings */}
        {isProfilePage ? (
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all cursor-pointer active:scale-90"
            title="Settings & Activity"
            aria-label="Settings"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>
        ) : isSettingsPage ? null : (
          /* User Profile Avatar Link (on other pages) */
          <NavLink
            to="/profile"
            className="flex items-center pl-1 group"
            title="My Profile"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.username || user?.email || 'User')}&background=0f172a&color=fff&size=100`}
              alt="Profile"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-slate-900 transition-all"
            />
          </NavLink>
        )}
      </div>
    </header>
  );
};

export default Header;
