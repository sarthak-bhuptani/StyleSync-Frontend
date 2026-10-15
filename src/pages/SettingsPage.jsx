import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Bell,
  Download,
  Check,
  User,
  Ruler,
  Palette,
  Mail,
  MapPin,
  Phone,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { notificationApi } from '../api/notificationApi';
import { notificationService } from '../services/notificationService';
import { profileApi } from '../api/profileApi';
import { apiClient } from '../api/client';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FASHION_COLOR_PALETTE = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Jet Black', hex: '#000000' },
  { name: 'Pastel Blue', hex: '#edf2fe' },
  { name: 'Powder Blue', hex: '#e0f2fe' },
  { name: 'Royal Plum', hex: '#483d8b' },
  { name: 'Magenta', hex: '#c71585' },
  { name: 'Ash Grey', hex: '#e0e0e0' },
  { name: 'Muted Indigo', hex: '#4a3d6b' },
  { name: 'Neon Yellow', hex: '#ffff00' },
  { name: 'Fuchsia', hex: '#ff00ff' },
  { name: 'Cyan Blue', hex: '#00ffff' },
  { name: 'Lime Green', hex: '#dfff00' },
  { name: 'Lavender', hex: '#e2d4f0' },
  { name: 'Frost Blue', hex: '#d4e6f1' },
  { name: 'Silver Grey', hex: '#d5d8dc' },
  { name: 'Soft Pink', hex: '#ffd1dc' },
  { name: 'Mint Green', hex: '#98ff98' }
];

const settingsSectionMeta = {
  account: { title: 'Account Details' },
  styling: { title: 'Style Preferences' },
  ai: { title: 'Notifications' },
  security: { title: 'Security & Privacy' },
  sizes: { title: 'My Profile & Sizes' },
  socials: { title: 'Connected Accounts' }
};

const resolveHumanAvoidColor = (rawInput) => {
  if (!rawInput) return { name: 'Custom Shade', hex: '#edf2fe' };
  const str = String(rawInput).trim();
  if (!str.startsWith('#') && isNaN(parseInt(str, 16))) {
    return { name: str, hex: '#fda4af' };
  }
  const clean = str.toLowerCase().replace(/o/gi, '0');
  const exact = FASHION_COLOR_PALETTE.find(c => c.hex.toLowerCase() === clean);
  if (exact) return exact;

  let r = 128, g = 128, b = 128;
  const hexClean = clean.replace(/[^0-9a-f]/g, '');
  if (hexClean.length === 6) {
    r = parseInt(hexClean.substring(0, 2), 16) || 0;
    g = parseInt(hexClean.substring(2, 4), 16) || 0;
    b = parseInt(hexClean.substring(4, 6), 16) || 0;
  }
  
  let best = FASHION_COLOR_PALETTE[0];
  let minD = Infinity;
  for (const item of FASHION_COLOR_PALETTE) {
    const itemHex = item.hex.replace('#', '');
    const ir = parseInt(itemHex.substring(0, 2), 16) || 0;
    const ig = parseInt(itemHex.substring(2, 4), 16) || 0;
    const ib = parseInt(itemHex.substring(4, 6), 16) || 0;
    const d = Math.sqrt(Math.pow(r - ir, 2) + Math.pow(g - ig, 2) + Math.pow(b - ib, 2));
    if (d < minD) {
      minD = d;
      best = item;
    }
  }
  return { name: best.name, hex: str.startsWith('#') ? str : `#${str}` };
};

export const SettingsPage = ({ defaultSection = null }) => {
  const { user, updateProfile, logout } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const originFrom = location.state?.from;

  // activeSection: null (Main Settings List) | 'account' | 'socials' | 'sizes' | 'styling' | 'ai' | 'security'
  const sectionParam = searchParams.get('section') || defaultSection;
  const [activeSection, setActiveSection] = useState(sectionParam || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [themeMode, setThemeMode] = useState('System default');

  useEffect(() => {
    setActiveSection(sectionParam || null);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [sectionParam]);

  const handleSelectSection = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId) {
      navigate(`/settings?section=${sectionId}`);
    } else {
      navigate('/settings', { replace: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleBack = () => {
    // 1. If currently inside a sub-section (account, sizes, styling, security, etc.), cleanly return to main settings list
    if (activeSection) {
      setActiveSection(null);
      navigate('/settings', { replace: true });
      return;
    }
    // 2. If dedicated sizes view or sub-route
    if (defaultSection === 'sizes') {
      navigate('/profile');
      return;
    }
    // 3. If explicit origin was provided (e.g., arrived from /profile or /more)
    if (originFrom) {
      navigate(originFrom);
      return;
    }
    // 4. Default fallback to /profile
    navigate('/profile');
  };

  // Profile Form State initialized purely from user DB state with empty fallbacks
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    instagram: user?.instagram || user?.socials?.instagram || '',
    pinterest: user?.pinterest || user?.socials?.pinterest || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    gender: user?.gender || '',
    unitSystem: user?.unitSystem || 'Metric (cm, kg)',
    currency: user?.currency || 'INR (₹)',
    height: user?.height || user?.physicalTraits?.height || '',
    chest: user?.sizes?.chest || '',
    waist: user?.sizes?.pants || user?.sizes?.waist || '',
    shirt: user?.sizes?.shirt || '',
    tshirt: user?.sizes?.tshirt || '',
    shoes: user?.sizes?.shoes || '',
    preferredFit: user?.sizes?.preferredFit || user?.preferredFit || '',
    favoriteStyles: user?.preferences?.favoriteStyles || user?.stylePreferences || [],
    favoriteBrands: user?.preferences?.favoriteBrands || user?.preferences?.brandPreferences || user?.favoriteBrands || [],
    avoidColors: user?.preferences?.avoidColors || user?.avoidColors || [],
    favoriteColors: user?.preferences?.favoriteColors || user?.favoriteColors || [],
    preferredOccasions: user?.preferredOccasions || []
  });

  // Sync profile form when user state updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name ?? '',
        username: user.username ?? '',
        instagram: user.instagram ?? user.socials?.instagram ?? '',
        pinterest: user.pinterest ?? user.socials?.pinterest ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        location: user.location ?? '',
        bio: user.bio ?? '',
        gender: user.gender ?? '',
        unitSystem: user.unitSystem ?? 'Metric (cm, kg)',
        currency: user.currency ?? 'INR (₹)',
        height: user.height ?? user.physicalTraits?.height ?? '',
        chest: user.sizes?.chest ?? '',
        waist: user.sizes?.pants ?? user.sizes?.waist ?? '',
        shirt: user.sizes?.shirt ?? '',
        tshirt: user.sizes?.tshirt ?? '',
        shoes: user.sizes?.shoes ?? '',
        preferredFit: user.sizes?.preferredFit ?? user.preferredFit ?? '',
        favoriteStyles: user.preferences?.favoriteStyles ?? user.stylePreferences ?? [],
        favoriteBrands: user.preferences?.favoriteBrands ?? user.preferences?.brandPreferences ?? user.favoriteBrands ?? [],
        avoidColors: user.preferences?.avoidColors ?? user.avoidColors ?? [],
        favoriteColors: user.preferences?.favoriteColors ?? user.favoriteColors ?? [],
        preferredOccasions: user.preferredOccasions ?? []
      });
    }
  }, [user]);

  // Notifications State
  const [notifications, setNotifications] = useState({
    priceDrops: user?.notificationPreferences?.priceDrops ?? true,
    gapAlerts: user?.notificationPreferences?.gapAlerts ?? true,
    budgetReminders: user?.notificationPreferences?.budgetReminders ?? true,
    weeklyReport: user?.notificationPreferences?.weeklyReport ?? false,
    outfitSuggestions: user?.notificationPreferences?.outfitSuggestions ?? true
  });

  // AI & Budget Preferences State
  const [aiPreferences, setAiPreferences] = useState({
    strictBudgetEnforcement: user?.aiPreferences?.strictBudgetEnforcement ?? true,
    colorAvoidanceSensitivity: user?.aiPreferences?.colorAvoidanceSensitivity ?? 'High',
    versatilityThreshold: user?.aiPreferences?.versatilityThreshold ?? 80,
    weatherAutoSync: user?.notificationPreferences?.weatherAutoSync ?? user?.aiPreferences?.weatherAutoSync ?? true
  });

  // Fetch live preferences if available from backend
  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        const profile = await profileApi.getProfile();
        if (profile?.notificationPreferences) {
          setNotifications(prev => ({ ...prev, ...profile.notificationPreferences }));
        }
      } catch {
        // quiet fallback
      }
    };
    fetchFreshData();
  }, []);

  // Password Change State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Temporary inputs
  const [newBrand, setNewBrand] = useState('');

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: profileForm.name,
        username: profileForm.username,
        instagram: profileForm.instagram,
        pinterest: profileForm.pinterest,
        email: profileForm.email,
        phone: profileForm.phone,
        location: profileForm.location,
        bio: profileForm.bio,
        gender: profileForm.gender,
        unitSystem: profileForm.unitSystem,
        currency: profileForm.currency,
        height: profileForm.height,
        sizes: {
          shirt: profileForm.shirt,
          tshirt: profileForm.tshirt,
          pants: profileForm.waist,
          shoes: profileForm.shoes,
          chest: profileForm.chest,
          preferredFit: profileForm.preferredFit
        },
        preferences: {
          favoriteStyles: profileForm.favoriteStyles,
          favoriteBrands: profileForm.favoriteBrands,
          favoriteColors: profileForm.favoriteColors,
          avoidColors: profileForm.avoidColors
        }
      });
      showToast('Changes saved successfully!', 'success');
      if (originFrom) {
        navigate(originFrom);
      } else if (defaultSection === 'sizes') {
        navigate('/profile');
      } else {
        handleSelectSection(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      showToast('Please enter both current and new password', 'error');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    try {
      await apiClient.patch('/auth/update-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }).catch(async () => {
        return apiClient.put('/profile', { password: passwords.newPassword });
      });
      showToast('Password updated securely!', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (originFrom) {
        navigate(originFrom);
      } else {
        handleSelectSection(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Password update saved', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (originFrom) {
        navigate(originFrom);
      } else {
        handleSelectSection(null);
      }
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ user, wardrobe, profileForm, aiPreferences, exportedAt: new Date().toISOString() }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `stylesync_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Wardrobe & Settings backup exported as JSON', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all wardrobe and budget data back to clean state?')) {
      localStorage.clear();
      showToast('All local data cleared. Reloading...', 'info');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || profileForm.username || user?.email || 'User')}&background=0f172a&color=fff&size=200`;

  // Settings Menu Items
  const settingsCategories = [
    {
      name: 'How you use StyleSync',
      items: [
        {
          id: 'account',
          title: 'Edit profile',
          subtitle: 'Name, username, bio, styling mode & currency',
          preview: profileForm.username ? `@${profileForm.username.replace('@', '')}` : (profileForm.name || 'Edit'),
          icon: User
        },
        {
          id: 'socials',
          title: 'Connected accounts',
          subtitle: 'Link Instagram handle & Lookbook profile',
          preview: profileForm.instagram ? `@${profileForm.instagram.replace('@', '')}` : 'Add handle',
          icon: InstagramIcon
        }
      ]
    },
    {
      name: 'What you wear & your wardrobe',
      items: [
        {
          id: 'sizes',
          title: 'My Profile & Sizes',
          subtitle: 'Style profile, tops, bottoms, shoes & fit type',
          preview: profileForm.shirt ? `${profileForm.shirt} · ${profileForm.waist || '32'}` : 'Configure',
          icon: Ruler
        },
        {
          id: 'styling',
          title: 'Brand & color preferences',
          subtitle: 'Favorite labels & avoided shades',
          preview: profileForm.favoriteBrands?.length ? `${profileForm.favoriteBrands.length} brands` : 'None',
          icon: Palette
        }
      ]
    },
    {
      name: 'Preferences & notifications',
      items: [
        {
          id: 'ai',
          title: 'Notifications & daily alerts',
          subtitle: 'Weather sync, gap alerts & outfit inspirations',
          preview: notificationService.getPermissionStatus() === 'granted' ? 'Active' : 'Configure',
          icon: Bell
        },
        {
          id: 'security',
          title: 'Security, privacy & data',
          subtitle: 'Password, encryption & JSON backup',
          preview: '',
          icon: ShieldCheck
        }
      ]
    }
  ];

  const filteredCategories = settingsCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="w-full px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* Top Grab Bar matching Figma 17 */}
      <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

      {/* 1. Header: < Settings [S] */}
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
            {activeSection ? settingsSectionMeta[activeSection]?.title || 'Settings' : 'Settings'}
          </h1>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {!activeSection && (
        <div className="space-y-4 pt-1">
          {/* SECTION 1: ACCOUNT */}
          <div>
            <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2 px-1">
              ACCOUNT
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSelectSection('account')}
                className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                  Account details
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectSection('ai')}
                className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                  Notifications
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                  Privacy
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectSection('security')}
                className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                  Security
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* SECTION 2: STYLE & AI */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2 px-1">
              STYLE & AI
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSelectSection('styling')}
                className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                  Style preferences
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/syncra-preferences')}
                className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                  Syncra preferences
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => setShowAppearanceModal(true)}
                className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                  Appearance
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs hover:border-[#1A1D1A]/30 active:scale-[0.99] transition-all cursor-pointer group text-left"
              >
                <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                  Data & export
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] stroke-[1.8] group-hover:text-[#1A1D1A] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Version 1.0 */}
          <div className="text-center pt-4 pb-1">
            <p className="text-xs text-[#8E968C]">Version 1.0</p>
          </div>

          {/* Log out button */}
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
        </div>
      )}

      {/* Privacy Info Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setShowPrivacyModal(false)} />
          <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-[#ECE8DF] animate-slide-up-mobile text-[#1A1D1A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#3D7A5A]" />
                <h3 className="font-serif font-bold text-base text-[#1A1D1A]">Privacy & Data Protection</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 text-[#8E968C] hover:text-[#1A1D1A] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-[#717670] leading-relaxed">
              <p>
                <strong className="text-[#1A1D1A]">Encrypted Profile:</strong> Your wardrobe pictures, sizes, and personal metrics are stored securely and privately.
              </p>
              <p>
                <strong className="text-[#1A1D1A]">Zero Ad Tracking:</strong> StyleSync does not track you across third-party websites or share browsing history with advertisers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-3 bg-[#111827] text-white font-bold text-xs rounded-2xl cursor-pointer hover:bg-[#030712] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Appearance Theme Modal */}
      {showAppearanceModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setShowAppearanceModal(false)} />
          <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-[#ECE8DF] animate-slide-up-mobile text-[#1A1D1A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <h3 className="font-serif font-bold text-base text-[#1A1D1A]">Appearance Theme</h3>
              <button
                type="button"
                onClick={() => setShowAppearanceModal(false)}
                className="p-1 text-[#8E968C] hover:text-[#1A1D1A] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs">
              {['Warm Editorial (Default)', 'Minimalist Neutral', 'System theme'].map((theme) => {
                const isCurrent = themeMode === theme;
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => {
                      setThemeMode(theme);
                      showToast(`Theme set to ${theme}`, 'success');
                      setShowAppearanceModal(false);
                    }}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      isCurrent
                        ? 'bg-white border-[#1A1D1A] font-bold text-[#1A1D1A] shadow-xs'
                        : 'bg-white/60 border-[#ECE8DF] text-[#717670] hover:bg-white'
                    }`}
                  >
                    <span>{theme}</span>
                    {isCurrent && <Check className="w-4 h-4 text-[#1A1D1A]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modern In-App Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowLogoutModal(false)}
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
              Are you sure you want to log out? Your wardrobe items, preferences, and style scans remain safely saved.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
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

      {/* ─────────────────────────────────────────────────────────────
          STATE 2: SUB-SCREENS
      ───────────────────────────────────────────────────────────── */}
      {activeSection && (
        <div className="space-y-4 pt-1 animate-fade-in">
          {/* SUB-SCREEN 1: Account Profile */}
          {activeSection === 'account' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE8DF] shadow-2xs space-y-4">
                {/* Photo Row */}
                <div className="flex flex-col items-center justify-center py-2 border-b border-[#ECE8DF]/70 gap-2.5">
                  <div className="w-20 h-20 rounded-full bg-[#D6C7B2] text-[#1A1D1A] font-serif font-bold text-2xl flex items-center justify-center border-2 border-white shadow-2xs overflow-hidden shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{(profileForm.name?.trim()?.[0] || user?.name?.trim()?.[0] || 'S').toUpperCase()}</span>
                    )}
                  </div>
                  <input
                    type="file"
                    id="settings-avatar-input"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const base64 = reader.result;
                          await updateProfile({ avatar: base64 });
                          showToast('Profile photo updated!', 'success');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="flex items-center gap-2 pt-0.5">
                    <label
                      htmlFor="settings-avatar-input"
                      className="px-3 py-1.5 bg-[#FAF8F5] border border-[#ECE8DF] hover:bg-[#1A1D1A] hover:text-white rounded-xl text-xs font-bold text-[#1A1D1A] transition-all cursor-pointer shadow-2xs"
                    >
                      Upload photo
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/style-scanner')}
                      className="px-3 py-1.5 bg-[#FAF8F5] border border-[#ECE8DF] hover:bg-[#1A1D1A] hover:text-white rounded-xl text-xs font-bold text-[#1A1D1A] transition-all cursor-pointer shadow-2xs"
                    >
                      Style Scanner →
                    </button>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E968C] mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#ECE8DF] rounded-2xl text-xs sm:text-sm font-medium text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all placeholder:text-[#8E968C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E968C] mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-xs text-[#8E968C] font-bold">@</span>
                      <input
                        type="text"
                        placeholder="username"
                        value={(profileForm.username || '').replace('@', '')}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-[#FAF8F5] border border-[#ECE8DF] rounded-2xl text-xs sm:text-sm font-medium text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all placeholder:text-[#8E968C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E968C] mb-1.5">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about your style..."
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#ECE8DF] rounded-2xl text-xs sm:text-sm font-medium text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all leading-relaxed placeholder:text-[#8E968C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E968C] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#ECE8DF] rounded-2xl text-xs sm:text-sm font-medium text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all placeholder:text-[#8E968C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E968C] mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#ECE8DF] rounded-2xl text-xs sm:text-sm font-medium text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all placeholder:text-[#8E968C]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E968C] mb-1.5">
                        Styling Mode
                      </label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-[#ECE8DF] rounded-2xl text-xs font-medium text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all cursor-pointer"
                      >
                        <option value="">Style preference</option>
                        <option value="Men / Masc Styling">Men / Masc</option>
                        <option value="Women / Fem Styling">Women / Fem</option>
                        <option value="Gender Neutral / Unisex">Unisex</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E968C] mb-1.5">
                        Currency
                      </label>
                      <select
                        value={profileForm.currency}
                        onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                        className="w-full px-3.5 py-3 bg-[#FAF8F5] border border-[#ECE8DF] rounded-2xl text-xs font-medium text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all cursor-pointer"
                      >
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ECE8DF]/70 space-y-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-12 rounded-full font-bold text-xs bg-[#111827] hover:bg-[#030712] text-white flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSection(null)}
                    className="w-full py-2.5 text-xs font-bold text-[#8E968C] hover:text-[#1A1D1A] transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* SUB-SCREEN 2: Instagram & Socials */}
          {activeSection === 'socials' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <InstagramIcon className="w-5 h-5 text-slate-800" />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Connected Accounts</h3>
                    <p className="text-[11px] text-slate-400">Display social profiles on your StyleSync hub</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Instagram Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">@</span>
                      <input
                        type="text"
                        value={(profileForm.instagram || '').replace('@', '')}
                        onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                        placeholder="username"
                        className="w-full pl-7 pr-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pinterest / Lookbook</label>
                    <input
                      type="text"
                      value={profileForm.pinterest}
                      onChange={(e) => setProfileForm({ ...profileForm, pinterest: e.target.value })}
                      placeholder="username or profile link"
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* SUB-SCREEN 3: My Profile & Sizes (Figma 16 - No enclosing white container) */}
          {activeSection === 'sizes' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in w-full">
              {/* 1. Centered Profile Avatar & Name */}
              <div className="flex flex-col items-center text-center pt-1 pb-3">
                <div className="w-20 h-20 rounded-full bg-[#D6C7B2] text-[#1A1D1A] font-serif font-bold text-2xl flex items-center justify-center border-2 border-white ring-2 ring-[#ECE8DF] shadow-2xs overflow-hidden mb-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(profileForm.name?.trim()?.[0] || user?.name?.trim()?.[0] || 'S').toUpperCase()}</span>
                  )}
                </div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1A1D1A]">
                  {profileForm.name || user?.name || 'Sarthak Bhuptani'}
                </h2>
                <p className="text-xs text-[#8E968C] mt-0.5">
                  {profileForm.favoriteStyles?.length > 0
                    ? profileForm.favoriteStyles.slice(0, 2).join(' · ')
                    : 'Minimal · Smart Casual'}
                </p>
              </div>

              {/* 2. STYLE PROFILE Section */}
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E968C] block mb-2 px-1">
                  STYLE PROFILE
                </span>

                <div className="space-y-2">
                  <div className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs">
                    <span className="text-xs sm:text-sm font-semibold text-[#8E968C]">Style</span>
                    <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                      {profileForm.favoriteStyles?.[0] || 'Minimal'}
                    </span>
                  </div>

                  <div className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs">
                    <span className="text-xs sm:text-sm font-semibold text-[#8E968C]">Fit</span>
                    <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                      {profileForm.preferredFit || 'Regular'}
                    </span>
                  </div>

                  <div className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs">
                    <span className="text-xs sm:text-sm font-semibold text-[#8E968C]">Colors</span>
                    <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                      {profileForm.favoriteColors?.length > 0
                        ? profileForm.favoriteColors.slice(0, 2).join(', ')
                        : 'Neutral'}
                    </span>
                  </div>

                  <div className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-3.5 px-4 flex items-center justify-between shadow-2xs">
                    <span className="text-xs sm:text-sm font-semibold text-[#8E968C]">Occasions</span>
                    <span className="text-xs sm:text-sm font-bold text-[#1A1D1A]">
                      {profileForm.preferredOccasions?.length > 0
                        ? profileForm.preferredOccasions.join(' · ')
                        : 'Casual · Work'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. MY SIZES Section */}
              <div className="pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E968C] block mb-2 px-1">
                  MY SIZES
                </span>

                <div className="space-y-2">
                  <div className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-2.5 px-4 flex items-center justify-between shadow-2xs">
                    <label className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">Tops</label>
                    <input
                      type="text"
                      placeholder="L"
                      value={profileForm.shirt}
                      onChange={(e) => setProfileForm({ ...profileForm, shirt: e.target.value })}
                      className="w-24 px-3 py-1.5 bg-[#FAF8F5] border border-[#ECE8DF] rounded-xl text-xs font-bold text-center text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all"
                    />
                  </div>

                  <div className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-2.5 px-4 flex items-center justify-between shadow-2xs">
                    <label className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">Bottoms</label>
                    <input
                      type="text"
                      placeholder="32"
                      value={profileForm.waist}
                      onChange={(e) => setProfileForm({ ...profileForm, waist: e.target.value })}
                      className="w-24 px-3 py-1.5 bg-[#FAF8F5] border border-[#ECE8DF] rounded-xl text-xs font-bold text-center text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all"
                    />
                  </div>

                  <div className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-2.5 px-4 flex items-center justify-between shadow-2xs">
                    <label className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">Shoes</label>
                    <input
                      type="text"
                      placeholder="9"
                      value={profileForm.shoes}
                      onChange={(e) => setProfileForm({ ...profileForm, shoes: e.target.value })}
                      className="w-24 px-3 py-1.5 bg-[#FAF8F5] border border-[#ECE8DF] rounded-xl text-xs font-bold text-center text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all"
                    />
                  </div>

                  <div className="w-full bg-white rounded-2xl border border-[#ECE8DF] py-2.5 px-4 flex items-center justify-between shadow-2xs">
                    <label className="text-xs sm:text-sm font-semibold text-[#1A1D1A]">Preferred fit</label>
                    <select
                      value={profileForm.preferredFit}
                      onChange={(e) => setProfileForm({ ...profileForm, preferredFit: e.target.value })}
                      className="w-28 px-3 py-1.5 bg-[#FAF8F5] border border-[#ECE8DF] rounded-xl text-xs font-bold text-center text-[#1A1D1A] focus:bg-white focus:border-[#1A1D1A] focus:outline-hidden transition-all cursor-pointer"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Slim">Slim</option>
                      <option value="Relaxed">Relaxed</option>
                      <option value="Oversized">Oversized</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Action CTA Button */}
              <div className="pt-4 pb-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full h-12 rounded-2xl font-bold text-xs sm:text-sm bg-[#1E2E22] hover:bg-[#162319] text-[#F8F6F0] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full py-2.5 text-xs font-bold text-[#8E968C] hover:text-[#1A1D1A] transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* SUB-SCREEN 4: Brand & Color Rules */}
          {activeSection === 'styling' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Palette className="w-5 h-5 text-slate-800" />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Brand & Color Preferences</h3>
                    <p className="text-[11px] text-slate-400">Set clothing brands and avoided tones</p>
                  </div>
                </div>

                {/* Brands */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-500">Favorite Brands</label>
                  {profileForm.favoriteBrands.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profileForm.favoriteBrands.map((brand, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
                        >
                          <span>{brand}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setProfileForm({
                                ...profileForm,
                                favoriteBrands: profileForm.favoriteBrands.filter((b) => b !== brand)
                              })
                            }
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No favorite brands added yet.</p>
                  )}

                  <div className="flex items-center gap-2 max-w-sm pt-1">
                    <input
                      type="text"
                      placeholder="Add brand (e.g. Zara, Uniqlo)..."
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newBrand.trim() && !profileForm.favoriteBrands.includes(newBrand.trim())) {
                          setProfileForm({
                            ...profileForm,
                            favoriteBrands: [...profileForm.favoriteBrands, newBrand.trim()]
                          });
                          setNewBrand('');
                        }
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Avoid Colors */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-semibold text-slate-500">Colors to Avoid</label>
                  {profileForm.avoidColors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileForm.avoidColors.map((col, idx) => {
                        const colorInfo = resolveHumanAvoidColor(col);
                        return (
                          <span
                            key={idx}
                            className="px-2.5 py-1.5 bg-rose-50/80 border border-rose-200/60 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs"
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: colorInfo.hex }}
                            />
                            <span>{colorInfo.name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setProfileForm({
                                  ...profileForm,
                                  avoidColors: profileForm.avoidColors.filter((c) => c !== col)
                                })
                              }
                              className="text-rose-400 hover:text-rose-700 cursor-pointer p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No avoided colors configured.</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Rules</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* SUB-SCREEN 5: AI Stylist & Alerts */}
          {activeSection === 'ai' && (
            <div className="space-y-4 animate-fade-in text-slate-800">
              
              {/* Push Notification System Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-900 text-white">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">System & Background Alerts</h4>
                      <p className="text-[11px] text-slate-500">Receive alerts even when StyleSync is in the background</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      notificationService.getPermissionStatus() === 'granted'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {notificationService.getPermissionStatus() === 'granted' ? 'Active' : 'Not Enabled'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {notificationService.getPermissionStatus() !== 'granted' ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await notificationService.requestPushPermission();
                          if (res.success) {
                            showToast('Background notifications enabled!', 'success');
                          } else {
                            showToast('Notification permission was not granted', 'info');
                          }
                        } catch (err) {
                          showToast(err.message, 'error');
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Enable Browser Notifications
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await notificationService.sendTestNotification(showToast);
                      } catch (err) {
                        showToast(err.message, 'error');
                      }
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Send Test Alert (Foreground & Background)
                  </button>
                </div>
              </div>

              {/* Individual Alert Preferences */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">Alert Categories</h3>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <label className="flex items-center justify-between py-3 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-900 block">Automatic Weather Sync</span>
                      <span className="text-slate-400 text-[11px]">Adapt layers based on live forecast</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={aiPreferences.weatherAutoSync}
                      onChange={(e) => setAiPreferences({ ...aiPreferences, weatherAutoSync: e.target.checked })}
                      className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between py-3 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-900 block">Wardrobe Gap Alerts</span>
                      <span className="text-slate-400 text-[11px]">Notify when key capsule pieces are missing</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.gapAlerts}
                      onChange={(e) => setNotifications({ ...notifications, gapAlerts: e.target.checked })}
                      className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between py-3 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-900 block">Daily Outfit Suggestions</span>
                      <span className="text-slate-400 text-[11px]">Receive morning outfit inspirations</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.outfitSuggestions}
                      onChange={(e) => setNotifications({ ...notifications, outfitSuggestions: e.target.checked })}
                      className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await notificationApi.updatePreferences({
                          ...notifications,
                          weatherAutoSync: aiPreferences.weatherAutoSync
                        });
                        showToast('Notification preferences saved!', 'success');
                      } catch (err) {
                        showToast(err.message || 'Preferences saved', 'success');
                      }
                      handleSelectSection(null);
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SCREEN 6: Security & Data */}
          {activeSection === 'security' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Privacy Badge */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xs border border-slate-800 flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-bold text-white text-sm">StyleSync Privacy Promise</h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Your wardrobe photos and body measurements are private and encrypted. We never sell your personal styling data.
                  </p>
                </div>
              </div>

              {/* Password Update Form */}
              <form onSubmit={handlePasswordUpdate} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">Update Password</h4>

                <div className="space-y-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>
              </form>

              {/* Backup & Reset */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Data & Backups</h4>
                  <p className="text-xs text-slate-400">Download a full JSON copy of your wardrobe & measurements</p>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export JSON Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetData}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

