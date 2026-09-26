import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Search,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { notificationApi } from '../api/notificationApi';
import { notificationService } from '../services/notificationService';
import { profileApi } from '../api/profileApi';
import { apiClient } from '../api/client';

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

export const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // activeSection: null (Main Settings List) | 'account' | 'socials' | 'sizes' | 'styling' | 'ai' | 'security'
  const sectionParam = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionParam || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setActiveSection(sectionParam || null);
  }, [sectionParam]);

  const handleSelectSection = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId) {
      setSearchParams({ section: sectionId });
    } else {
      setSearchParams({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      handleSelectSection(null);
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
      handleSelectSection(null);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Password update saved', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      handleSelectSection(null);
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
          title: 'Body measurements & sizes',
          subtitle: 'Height, shirt, waist, shoes & fit type',
          preview: profileForm.height ? `${profileForm.height}` : 'Not set',
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
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-5 animate-fade-in pb-28 text-slate-900">
      
      {/* ─────────────────────────────────────────────────────────────
          STATE 1: MAIN SETTINGS & ACTIVITY MENU
      ───────────────────────────────────────────────────────────── */}
      {!activeSection && (
        <div className="space-y-4 pt-1">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search settings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Profile Card */}
          <div
            onClick={() => handleSelectSection('account')}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs cursor-pointer hover:bg-slate-50/70 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 overflow-hidden">
                <img
                  src={user?.avatar || defaultAvatarUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border border-white"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {profileForm.name || profileForm.username || user?.email || 'My Profile'}
                  </h3>
                  {user && (
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {profileForm.username ? `@${profileForm.username.replace('@', '')}` : (user?.email || 'Set username')}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Personal profile, security & styling settings</p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </div>

          {/* Grouped Settings Lists */}
          {filteredCategories.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5 pt-1">
              <h4 className="text-xs font-semibold text-slate-500 px-3">
                {group.name}
              </h4>

              <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-2xs overflow-hidden">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSection(item.id)}
                      className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-5 h-5 text-slate-800 stroke-[1.8] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {item.preview && (
                          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
                            {item.preview}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Login / Logout Section */}
          <div className="pt-2 space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-500 px-3">
              Account Action
            </h4>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-rose-50/50 active:bg-rose-100/50 transition-colors cursor-pointer group text-rose-600"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-rose-600 stroke-[1.8] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-rose-600">
                      Log out {profileForm.username ? `@${profileForm.username.replace('@', '')}` : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="text-center pt-3">
            <p className="text-[11px] font-medium text-slate-400">StyleSync</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Version 2.4.0</p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATE 2: SUB-SCREENS
      ───────────────────────────────────────────────────────────── */}
      {activeSection && (
        <div className="space-y-4 pt-1 animate-fade-in">
          {/* Back button header for sub-screens */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => handleSelectSection(null)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Back to Settings</span>
            </button>
          </div>

          {/* SUB-SCREEN 1: Account Profile */}
          {activeSection === 'account' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                
                {/* Photo Row */}
                <div className="flex flex-col items-center justify-center py-2 border-b border-slate-100 gap-2">
                  <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 overflow-hidden">
                    <img
                      src={user?.avatar || defaultAvatarUrl}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => showToast('Photo is synced with your avatar or Face Scanner', 'info')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Change profile photo
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">@</span>
                      <input
                        type="text"
                        placeholder="username"
                        value={profileForm.username.replace('@', '')}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about your style..."
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Styling Mode</label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                      >
                        <option value="">Select style preference</option>
                        <option value="Men / Masc Styling">Men / Masc</option>
                        <option value="Women / Fem Styling">Women / Fem</option>
                        <option value="Gender Neutral / Unisex">Unisex</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Currency</label>
                      <select
                        value={profileForm.currency}
                        onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                      >
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSection(null)}
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
                    <span>{isSaving ? 'Saving...' : 'Done'}</span>
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
                        value={profileForm.instagram.replace('@', '')}
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
                    onClick={() => handleSelectSection(null)}
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

          {/* SUB-SCREEN 3: Measurements & Sizes */}
          {activeSection === 'sizes' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Ruler className="w-5 h-5 text-slate-800" />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Body Measurements</h3>
                    <p className="text-[11px] text-slate-400">Used to verify fit and size recommendations</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Height (cm/in)</label>
                    <input
                      type="text"
                      placeholder="e.g. 178 cm"
                      value={profileForm.height}
                      onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Shirt Size</label>
                    <input
                      type="text"
                      placeholder="e.g. L or 40"
                      value={profileForm.shirt}
                      onChange={(e) => setProfileForm({ ...profileForm, shirt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">T-Shirt Size</label>
                    <input
                      type="text"
                      placeholder="e.g. M / L"
                      value={profileForm.tshirt}
                      onChange={(e) => setProfileForm({ ...profileForm, tshirt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pants / Waist</label>
                    <input
                      type="text"
                      placeholder="e.g. 32"
                      value={profileForm.waist}
                      onChange={(e) => setProfileForm({ ...profileForm, waist: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Shoes (UK/US)</label>
                    <input
                      type="text"
                      placeholder="e.g. UK 9"
                      value={profileForm.shoes}
                      onChange={(e) => setProfileForm({ ...profileForm, shoes: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Preferred Fit</label>
                    <select
                      value={profileForm.preferredFit}
                      onChange={(e) => setProfileForm({ ...profileForm, preferredFit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="">Select preferred fit</option>
                      <option value="Relaxed / Structured">Relaxed</option>
                      <option value="Slim / Tailored">Slim</option>
                      <option value="Oversized / Streetwear">Oversized</option>
                      <option value="Regular / Standard">Regular</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSection(null)}
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
                    <span>Save Sizes</span>
                  </button>
                </div>
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
                    onClick={() => handleSelectSection(null)}
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

