import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  User,
  Camera,
  Settings,
  Edit3,
  MapPin,
  Mail,
  Shirt,
  ShoppingBag,
  Palette,
  Check,
  X,
  Plus,
  Heart,
  Eye,
  Ruler,
  LogOut,
  ChevronRight,
  ArrowRight,
  Grid,
  Bookmark,
  Share2,
  CheckCircle2,
  Layers,
  Sun,
  ShieldCheck,
  Tag,
  Info
} from 'lucide-react';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { profileApi } from '../api/profileApi';
import { SelfAnalysisScanModal } from '../components/profile/SelfAnalysisScanModal';

// Reference palette for converting any arbitrary hex into authentic human fashion names
const FASHION_COLOR_PALETTE = [
  { name: 'Stark Pure White', hex: '#ffffff', reason: 'High glare; prefer soft cream or warm ivory' },
  { name: 'Harsh Jet Black', hex: '#000000', reason: 'Too high contrast; drains facial warmth' },
  { name: 'Icy Pastel Blue', hex: '#edf2fe', reason: 'Casts cool blue reflections near jawline' },
  { name: 'Icy Powder Blue', hex: '#e0f2fe', reason: 'Cool pastel washes out golden warmth' },
  { name: 'Deep Royal Plum', hex: '#483d8b', reason: 'Cold undertone creates sallow appearance' },
  { name: 'Neon Hot Magenta', hex: '#c71585', reason: 'Overpowers natural skin pigmentation' },
  { name: 'Washed Ash Grey', hex: '#e0e0e0', reason: 'Flattens natural facial warmth & depth' },
  { name: 'Cold Muted Indigo', hex: '#4a3d6b', reason: 'Causes tired, dull tone near face' },
  { name: 'Electric Neon Yellow', hex: '#ffff00', reason: 'Harsh synthetic reflection on skin' },
  { name: 'Fluorescent Fuchsia', hex: '#ff00ff', reason: 'Clashes with earthy warm undertones' },
  { name: 'Vivid Cyan Blue', hex: '#00ffff', reason: 'Cool optical glare on skin' },
  { name: 'Electric Neon Lime', hex: '#dfff00', reason: 'Overpowers natural facial contrast' },
  { name: 'Icy Lavender', hex: '#e2d4f0', reason: 'Creates cool shadows under soft light' },
  { name: 'Pale Frost Blue', hex: '#d4e6f1', reason: 'Cool pastels wash out golden pigment' },
  { name: 'Chilly Silver Grey', hex: '#d5d8dc', reason: 'Drains natural complexion vitality' },
  { name: 'Cool Baby Pink', hex: '#ffd1dc', reason: 'Clashes with warm golden undertone' },
  { name: 'Bright Mint Green', hex: '#98ff98', reason: 'Too icy; prefer warm olive or moss' }
];

// Helper: Parse hex to RGB
const hexToRgb = (rawHex) => {
  let clean = rawHex.replace(/[^0-9A-Fa-f]/g, '');
  // Fix typos like letter 'O' instead of '0'
  clean = clean.replace(/o/gi, '0');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return { r: 128, g: 128, b: 128 };
  return {
    r: parseInt(clean.substring(0, 2), 16) || 0,
    g: parseInt(clean.substring(2, 4), 16) || 0,
    b: parseInt(clean.substring(4, 6), 16) || 0
  };
};

// Robust color namer: converts ANY hex code into a natural human stylist name
const resolveHumanAvoidColor = (rawInput) => {
  if (!rawInput) {
    return { name: 'Icy Pastel Tone', hex: '#edf2fe', reason: 'Cool tones clash with warm undertones' };
  }

  const str = String(rawInput).trim();
  
  // If it's already a clean English name
  if (!str.startsWith('#') && isNaN(parseInt(str, 16))) {
    return {
      name: str,
      hex: '#fda4af',
      reason: 'May overpower or wash out your natural skin glow'
    };
  }

  // Look for exact match in dictionary first
  const normalized = str.toLowerCase().replace(/o/gi, '0');
  const exact = FASHION_COLOR_PALETTE.find(c => c.hex.toLowerCase() === normalized);
  if (exact) {
    return exact;
  }

  // Otherwise calculate closest color in RGB space
  const targetRgb = hexToRgb(str);
  let bestMatch = FASHION_COLOR_PALETTE[0];
  let minDistance = Infinity;

  for (const item of FASHION_COLOR_PALETTE) {
    const itemRgb = hexToRgb(item.hex);
    const distance = Math.sqrt(
      Math.pow(targetRgb.r - itemRgb.r, 2) +
      Math.pow(targetRgb.g - itemRgb.g, 2) +
      Math.pow(targetRgb.b - itemRgb.b, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = item;
    }
  }

  return {
    name: bestMatch.name,
    hex: str.startsWith('#') ? str : `#${str}`,
    reason: bestMatch.reason
  };
};

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'colors' | 'sizes' | 'brands'
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSwatch, setActiveSwatch] = useState(null);

  // Cached color draping
  const [colorDraping, setColorDraping] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_color_draping');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const drapingFetchedRef = useRef(false);

  useEffect(() => {
    if (drapingFetchedRef.current || colorDraping) return;
    drapingFetchedRef.current = true;

    const loadColors = async () => {
      try {
        const data = await profileApi.getColorDraping();
        if (data) {
          setColorDraping(data);
          localStorage.setItem('stylesync_color_draping', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Could not load color palette:', err);
      }
    };
    loadColors();
  }, [colorDraping]);

  // Lock background scroll when avatar lightbox is open
  useEffect(() => {
    if (isAvatarViewerOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const preventScroll = (e) => {
        e.preventDefault();
      };

      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isAvatarViewerOpen]);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    instagram: user?.instagram || user?.socials?.instagram || '',
    email: user?.email || '',
    location: user?.location || '',
    bio: user?.bio || '',
    gender: user?.gender || '',
    height: user?.height || user?.physicalTraits?.height || '',
    sizes: {
      shirt: user?.sizes?.shirt || '',
      tshirt: user?.sizes?.tshirt || '',
      pants: user?.sizes?.pants || user?.sizes?.waist || '',
      shoes: user?.sizes?.shoes || '',
      chest: user?.sizes?.chest || '',
      preferredFit: user?.sizes?.preferredFit || user?.preferredFit || ''
    },
    stylePreferences: user?.preferences?.favoriteStyles || user?.stylePreferences || [],
    favoriteColors: user?.preferences?.favoriteColors || user?.favoriteColors || [],
    avoidColors: user?.preferences?.avoidColors || user?.avoidColors || [],
    favoriteBrands: user?.preferences?.favoriteBrands || user?.preferences?.brandPreferences || user?.favoriteBrands || []
  });

  // Keep form data synced with user auth updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? '',
        username: user.username ?? '',
        instagram: user.instagram ?? user.socials?.instagram ?? '',
        email: user.email ?? '',
        location: user.location ?? '',
        bio: user.bio ?? '',
        gender: user.gender ?? '',
        height: user.height ?? user.physicalTraits?.height ?? '',
        sizes: {
          shirt: user.sizes?.shirt ?? '',
          tshirt: user.sizes?.tshirt ?? '',
          pants: user.sizes?.pants ?? user.sizes?.waist ?? '',
          shoes: user.sizes?.shoes ?? '',
          chest: user.sizes?.chest ?? '',
          preferredFit: user.sizes?.preferredFit ?? user.preferredFit ?? ''
        },
        stylePreferences: user.preferences?.favoriteStyles ?? user.stylePreferences ?? [],
        favoriteColors: user.preferences?.favoriteColors ?? user.favoriteColors ?? [],
        avoidColors: user.preferences?.avoidColors ?? user.avoidColors ?? [],
        favoriteBrands: user.preferences?.favoriteBrands ?? user.preferences?.brandPreferences ?? user.favoriteBrands ?? []
      });
    }
  }, [user]);

  const [newBrand, setNewBrand] = useState('');

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (newBrand.trim() && !formData.favoriteBrands.includes(newBrand.trim())) {
      setFormData(prev => ({
        ...prev,
        favoriteBrands: [...prev.favoriteBrands, newBrand.trim()]
      }));
      setNewBrand('');
    }
  };

  const removeBrand = (brandToRemove) => {
    setFormData(prev => ({
      ...prev,
      favoriteBrands: prev.favoriteBrands.filter(b => b !== brandToRemove)
    }));
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${formData.name} - Style Profile`,
        text: `Check out ${formData.name}'s capsule wardrobe & style profile on StyleSync!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard!', 'success');
    }
  };

  const faceShape = user?.physicalTraits?.faceShape || user?.physicalAnalysis?.faceShape || 'Oval';
  const undertone = user?.physicalTraits?.skinUndertone || user?.physicalAnalysis?.skinTone || 'Warm Golden';
  const colorSeason = user?.physicalTraits?.colorSeason || colorDraping?.season || 'Warm Autumn';

  // Story Highlight Bubbles
  const storyHighlights = [
    {
      id: 'grid',
      label: 'Closet',
      icon: Shirt,
      iconColor: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200/80',
      action: () => setActiveTab('grid')
    },
    {
      id: 'colors',
      label: 'Colors',
      icon: Palette,
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200/80',
      action: () => setActiveTab('colors')
    },
    {
      id: 'sizes',
      label: 'Sizes',
      icon: Ruler,
      iconColor: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200/80',
      action: () => setActiveTab('sizes')
    },
    {
      id: 'brands',
      label: 'Brands',
      icon: Tag,
      iconColor: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200/80',
      action: () => setActiveTab('brands')
    },
    {
      id: 'scan',
      label: 'Photo Fit',
      icon: Camera,
      iconColor: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200/80',
      action: () => setIsScanModalOpen(true)
    }
  ];

  // Flattering swatches with natural single-word labels and stylist pairing advice
  const flatteringSwatches = [
    { name: 'Terracotta', fullName: 'Warm Terracotta', hex: '#C85A32', tip: 'Pair with cream chinos or oat knitwear for effortless radiance.', category: 'Knitwear & Linen' },
    { name: 'Olive', fullName: 'Forest Olive', hex: '#3E5C46', tip: 'Ideal for overshirts, utility jackets, and heavy knit layers.', category: 'Outerwear & Shirts' },
    { name: 'Ochre', fullName: 'Deep Ochre', hex: '#C2932D', tip: 'Adds vibrant warmth as an inner tee or light cardigan.', category: 'Layering & Tees' },
    { name: 'Espresso', fullName: 'Rich Espresso', hex: '#3A271D', tip: 'Great for leather boots, outerwear, and structured jackets.', category: 'Leather & Wool' },
    { name: 'Rust', fullName: 'Burnt Rust', hex: '#A84825', tip: 'Harmonizes cheekbone warmth in autumn sweaters and polos.', category: 'Autumn Knits' },
    { name: 'Teal', fullName: 'Marine Teal', hex: '#1C4A54', tip: 'High-contrast evening shirt, knit polo, or relaxed blazer.', category: 'Evening & Tailoring' },
    { name: 'Mustard', fullName: 'Spiced Mustard', hex: '#D4A034', tip: 'Brings out natural golden undertones in casual shirts.', category: 'Casual Shirts' },
    { name: 'Burgundy', fullName: 'Warm Burgundy', hex: '#782635', tip: 'Sophisticated evening wear and coats without looking harsh.', category: 'Tailored Layers' }
  ];

  const neutralSwatches = [
    { name: 'Cream', fullName: 'Oatmeal Cream', hex: '#E6D7C3', tip: 'Your primary neutral for linen shirts, base tees, and knitwear.', category: 'Base Layering' },
    { name: 'Navy', fullName: 'French Navy', hex: '#1B263B', tip: 'Softer and warmer than black; great for trousers and suits.', category: 'Pants & Tailoring' },
    { name: 'Sand', fullName: 'Raw Sandstone', hex: '#C4AB8E', tip: 'Classic grounding shade for chinos, shorts, and trench coats.', category: 'Chinos & Shorts' },
    { name: 'Charcoal', fullName: 'Charcoal Slate', hex: '#2C3539', tip: 'Deep modern neutral that anchors dress pants and coats.', category: 'Suiting & Trousers' }
  ];

  return (
    <div className="max-w-xl mx-auto space-y-3.5 sm:space-y-4 animate-fade-in pb-28 text-slate-800">
      
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/70 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Avatar with Instagram Story Ring */}
          <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20">
            <div
              onClick={() => setIsAvatarViewerOpen(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-xs flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              title="View profile photo"
            >
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.username || user?.email || 'User')}&background=0f172a&color=fff&size=200`}
                alt={formData.name || 'Profile'}
                className="w-full h-full rounded-full object-cover border-2 border-white aspect-square shrink-0"
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsScanModalOpen(true);
              }}
              className="absolute -bottom-0.5 -right-0.5 p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-110 active:scale-90 z-10"
              title="Update photo"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          {/* 3 Human Stats */}
          <div className="flex-1 grid grid-cols-3 text-center gap-1">
            <div className="cursor-pointer group" onClick={() => setActiveTab('grid')}>
              <p className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {wardrobe?.length || 0}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Closet</p>
            </div>
            <div className="cursor-pointer group" onClick={() => navigate('/daily-stylist')}>
              <p className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                12
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Outfits</p>
            </div>
            <div className="cursor-pointer group" onClick={() => setActiveTab('colors')}>
              <p className="text-base font-extrabold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                96%
              </p>
              <p className="text-[11px] text-slate-400 font-medium">Match</p>
            </div>
          </div>
        </div>

        {/* Bio Block */}
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5">
            <p className="font-extrabold text-sm text-slate-900">{formData.name}</p>
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
          </div>
          <p className="text-slate-500 font-medium text-[11px]">Capsule Wardrobe & Personal Style</p>
          <p className="text-slate-700 leading-relaxed pt-0.5 whitespace-pre-line text-xs">{formData.bio}</p>

          <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 flex-wrap">
            {formData.location && (
              <span className="flex items-center gap-1 font-medium text-slate-600 text-[11px]">
                <MapPin className="w-3 h-3 text-slate-400" />
                {formData.location}
              </span>
            )}
            {formData.instagram && (
              <span className="flex items-center gap-1 text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                <InstagramIcon className="w-3 h-3 text-pink-600" />
                @{formData.instagram.replace('@', '')}
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>{isEditing ? 'Close' : 'Edit Profile'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareProfile}
            className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Share</span>
          </button>
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="pt-3 border-t border-slate-100 space-y-2.5 animate-fade-in text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Edit Details</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-600 mb-0.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-0.5">Instagram</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@username"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-600 mb-0.5">Bio</label>
                <input
                  type="text"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Story Highlights Bubbles */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-2.5 sm:p-3 shadow-xs">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5 scrollbar-none justify-between sm:justify-start px-1">
          {storyHighlights.map((item) => {
            const Icon = item.icon;
            const isSelected = (activeTab === item.id) || (item.id === 'capsule' && activeTab === 'grid');
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer focus:outline-hidden"
              >
                <div
                  className={`p-[2px] rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-xs'
                      : 'bg-slate-200/80 group-hover:bg-slate-300'
                  }`}
                >
                  <div className="p-[1.5px] bg-white rounded-full">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                        item.bgColor || 'bg-slate-50'
                      } border ${item.borderColor || 'border-slate-200/70'}`}
                    >
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] max-w-[60px] truncate text-center tracking-tight transition-colors ${
                    isSelected ? 'font-black text-slate-900' : 'font-medium text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Section Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-xs">
        <div className="flex items-center justify-around">
          {[
            { id: 'grid', label: 'Closet', icon: Grid },
            { id: 'colors', label: 'Palette', icon: Palette },
            { id: 'sizes', label: 'Sizes', icon: Ruler },
            { id: 'brands', label: 'Brands', icon: Tag }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-700 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span className="text-xs tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Human-First Palette Experience */}
      {activeTab === 'colors' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 animate-fade-in">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Autumn Capsule Tones</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Shades calibrated to enhance your natural golden warmth</p>
            </div>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 shrink-0">
              Warm Golden Undertone
            </span>
          </div>

          {/* Personal Stylist Advice Box */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-slate-900 text-xs">Personal Stylist Note</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Your warm golden undertones glow in rich, earthy pigments. Use soft oatmeal and cream instead of stark white for your base tees, and keep cool icy tones away from your collar.
            </p>
          </div>

          {/* 1. Flattering Power Colors (Capsule Dots) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Best Colors Near Face</span>
              <span className="text-slate-400 text-[10px]">Tap to view outfit pairings</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {flatteringSwatches.map((item, idx) => {
                const isSelected = activeSwatch?.name === item.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSwatch(isSelected ? null : item)}
                    className={`p-2 py-2.5 rounded-2xl border transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200/60 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full shadow-2xs border-2 transition-transform ${
                        isSelected ? 'border-amber-400 scale-105' : 'border-white'
                      }`}
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="text-[11px] font-bold tracking-tight">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Outfit Pairing Inspector Card */}
            {activeSwatch && (
              <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl text-xs space-y-2 animate-fade-in shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                      style={{ backgroundColor: activeSwatch.hex }}
                    />
                    <span className="font-extrabold text-white text-xs">{activeSwatch.fullName}</span>
                    <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/15 px-2 py-0.5 rounded-md">
                      {activeSwatch.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSwatch(null)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Stylist Tip:</strong> {activeSwatch.tip}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Harmonizes with Autumn undertone</span>
                  <NavLink
                    to="/outfits"
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                  >
                    <span>View Outfits</span>
                    <ArrowRight className="w-3 h-3" />
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          {/* 2. Wardrobe Foundation Neutrals */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Everyday Foundation Neutrals</span>
              <span className="text-slate-400 text-[10px]">Trousers & jackets</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {neutralSwatches.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-center flex flex-col items-center gap-1.5"
                >
                  <span
                    className="w-9 h-9 rounded-full border-2 border-white shadow-2xs"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="text-[11px] font-bold text-slate-800 tracking-tight">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Colors to Avoid Near Neckline */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-800">Colors to Avoid Near Neckline</span>
              <span className="text-rose-500 text-[10px]">Washes out golden warmth</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {formData.avoidColors.map((rawInput, idx) => {
                const info = resolveHumanAvoidColor(rawInput);
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-rose-50/50 border border-rose-200/60 flex items-center gap-2.5 text-left"
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shrink-0 relative shadow-2xs"
                      style={{ backgroundColor: info.hex }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-rose-700 bg-white/75 rounded-full">
                        ✕
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{info.name}</p>
                      <p className="text-[10px] text-rose-700 leading-tight line-clamp-1">{info.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Calibration Action */}
          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Update Photo & Recalibrate Palette</span>
          </button>
        </div>
      )}

      {/* TAB 2: Closet Photo Grid */}
      {activeTab === 'grid' && (
        <div className="space-y-4 animate-fade-in">
          {wardrobe && wardrobe.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {wardrobe.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 relative group cursor-pointer shadow-2xs"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                    <p className="text-[10px] font-bold truncate">{item.name}</p>
                    <p className="text-[9px] text-slate-300 truncate">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2.5">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Your Wardrobe is Ready</p>
                <p className="text-[11px] text-slate-500">Add clothes to generate daily outfit looks</p>
              </div>
              <NavLink
                to="/wardrobe"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </NavLink>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Sizes & Measurements */}
      {activeTab === 'sizes' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Measurements</h3>
              <p className="text-[11px] text-slate-500">Accurate specs for seamless fit recommendations</p>
            </div>
            <NavLink to="/settings" className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Height</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">{formData.height}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Shirt Size</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">{formData.sizes.shirt}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">T-Shirt Size</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">{formData.sizes.tshirt}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pants / Waist</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">{formData.sizes.pants}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Shoe Size</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">{formData.sizes.shoes}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Fit</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">{formData.sizes.preferredFit}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Brands & Vibes */}
      {activeTab === 'brands' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5 animate-fade-in">
          <div className="pb-2.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Favorite Brands & Aesthetics</h3>
            <p className="text-[11px] text-slate-500">Retailers you love and your personal aesthetic vibes</p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5">Favorite Brands</span>
            <div className="flex flex-wrap gap-1.5">
              {formData.favoriteBrands.map((brand, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>{brand}</span>
                  <button
                    type="button"
                    onClick={() => removeBrand(brand)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-xs pt-2">
              <input
                type="text"
                placeholder="Add brand..."
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBrand(e);
                  }
                }}
                className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddBrand}
                className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-xs font-bold text-slate-700 block mb-1.5">Style Vibes</span>
            <div className="flex flex-wrap gap-1.5">
              {formData.stylePreferences.map((style, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-xl text-[11px] font-medium">
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo scan modal */}
      <SelfAnalysisScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />

      {/* Instagram-Style Profile Picture Viewer Lightbox */}
      {isAvatarViewerOpen && (
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-[100dvh] z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg animate-fade-in touch-none select-none overflow-hidden"
          style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', margin: 0 }}
          onClick={() => setIsAvatarViewerOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsAvatarViewerOpen(false)}
            className="absolute top-5 right-5 p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer z-50"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Centered Modal Content */}
          <div
            className="relative flex flex-col items-center max-w-sm w-full text-center space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large Instagram Ring Avatar */}
            <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-2xl">
              <div className="p-1 bg-black rounded-full">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || formData.username || user?.email || 'User')}&background=0f172a&color=fff&size=500`}
                  alt={formData.name || 'Profile'}
                  className="w-56 h-56 sm:w-64 sm:h-64 rounded-full object-cover border-2 border-white/20"
                />
              </div>
            </div>

            {/* Profile Meta */}
            <div className="text-white space-y-1">
              <h3 className="text-lg font-bold tracking-tight">{formData.name}</h3>
              <p className="text-xs text-white/60">@{formData.username || 'user'}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAvatarViewerOpen(false);
                  setIsScanModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAvatarViewerOpen(false)}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

