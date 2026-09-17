import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Edit3,
  Check,
  Ruler,
  Palette,
  Wallet,
  ShieldCheck,
  Tag,
  Building2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { SelfAnalysisScanModal } from '../components/profile/SelfAnalysisScanModal';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useWardrobe();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    gender: user?.gender || 'Men / Masc Styling',
    ageRange: user?.ageRange || '25-34',
    height: user?.height || '5 ft 10 in',
    location: user?.location || '',
    sizes: {
      shirt: user?.sizes?.shirt || 'L',
      tshirt: user?.sizes?.tshirt || 'L',
      pants: user?.sizes?.pants || '32',
      shoes: user?.sizes?.shoes || 'UK 9 / US 10',
      preferredFit: user?.sizes?.preferredFit || 'Relaxed / Structured'
    },
    stylePreferences: user?.preferences?.favoriteStyles || user?.stylePreferences || ['Minimal', 'Smart Casual', 'Casual'],
    favoriteColors: user?.preferences?.favoriteColors || user?.favoriteColors || ['Black', 'White', 'Navy', 'Olive Green'],
    avoidColors: user?.preferences?.avoidColors || user?.avoidColors || ['Neon Yellow', 'Hot Pink'],
    favoriteBrands: user?.preferences?.favoriteBrands || user?.favoriteBrands || ['Zara', 'Uniqlo', 'Nike'],
    brandsToAvoid: user?.preferences?.brandsToAvoid || user?.brandsToAvoid || [],
    preferredOccasions: user?.preferredOccasions || ['Daily', 'Office / Work', 'Date Night', 'Travel']
  });

  const [newFavBrand, setNewFavBrand] = useState('');
  const [newFavColor, setNewFavColor] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    showToast('Profile and styling rules updated successfully', 'success');
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (newFavBrand.trim() && !formData.favoriteBrands.includes(newFavBrand.trim())) {
      setFormData(prev => ({
        ...prev,
        favoriteBrands: [...prev.favoriteBrands, newFavBrand.trim()]
      }));
      setNewFavBrand('');
    }
  };

  const removeBrand = (brand) => {
    setFormData(prev => ({
      ...prev,
      favoriteBrands: prev.favoriteBrands.filter(b => b !== brand)
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xl border-2 border-slate-100 shadow-sm">
                {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{formData.name || 'Personal Profile'}</h2>
              <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">PRO</span>
            </div>
            <p className="text-xs text-slate-500">{formData.email}</p>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {formData.location || 'Location Not Set'} · {formData.gender}
            </p>
          </div>
        </div>

        {/* Profile Completeness Gauge */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 min-w-[200px] w-full sm:w-auto">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-bold text-slate-700">Profile Calibration</span>
            <span className="font-extrabold text-emerald-600">{user?.physicalTraits?.faceShape && user.physicalTraits.faceShape !== 'Uncalibrated' ? '100%' : '50%'} Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${user?.physicalTraits?.faceShape && user.physicalTraits.faceShape !== 'Uncalibrated' ? '100%' : '50%'}` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {user?.physicalTraits?.faceShape && user.physicalTraits.faceShape !== 'Uncalibrated'
              ? 'AI Vision calibration active & calibrated.'
              : 'Selfie calibration needed.'}
          </p>
        </div>
      </div>

      {/* AI Physical Face, Complexion & Body Scan Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                AI Face, Complexion & Body Silhouette Analysis
              </h3>
              <p className="text-xs text-slate-500">
                How StyleSync knows which sunglasses, necklines, colors, and cuts suit your physical build
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsScanModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recalibrate / Rescan My Photo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Face Shape</span>
            <p className="font-extrabold text-slate-900">{user?.physicalTraits?.faceShape || user?.physicalAnalysis?.faceShape || 'Uncalibrated'}</p>
            <p className="text-slate-500 text-[11px] leading-snug">{user?.physicalTraits?.calibrationNotes || user?.physicalAnalysis?.eyewearSuitability || 'Scan selfie to detect face geometry'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Skin Undertone & Color Season</span>
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs"
                style={{ backgroundColor: user?.physicalAnalysis?.skinToneHex || '#D2A374' }}
              />
              <p className="font-extrabold text-slate-900">{user?.physicalTraits?.skinUndertone || user?.physicalAnalysis?.skinTone || 'Uncalibrated'}</p>
            </div>
            <p className="text-slate-500 text-[11px] leading-snug">{user?.physicalTraits?.colorSeason || user?.physicalAnalysis?.colorSeason || 'Calibrated from skin undertone'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Body Silhouette / Build</span>
            <p className="font-extrabold text-slate-900">{user?.physicalTraits?.bodySilhouette || user?.physicalAnalysis?.bodyType || 'Uncalibrated'}</p>
            <p className="text-slate-500 text-[11px] leading-snug">{user?.physicalAnalysis?.fitRecommendation || 'Calibrated from shoulder & torso proportions'}</p>
          </div>
        </div>
      </div>

      {/* Editable Sections Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Body & Sizes */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Ruler className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Body, Measurements & Sizes</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Height</label>
              <input
                type="text"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shirt Size</label>
              <input
                type="text"
                value={formData.sizes.shirt}
                onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, shirt: e.target.value } })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">T-Shirt Size</label>
              <input
                type="text"
                value={formData.sizes.tshirt}
                onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, tshirt: e.target.value } })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pants / Waist</label>
              <input
                type="text"
                value={formData.sizes.pants}
                onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, pants: e.target.value } })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shoe Size</label>
              <input
                type="text"
                value={formData.sizes.shoes}
                onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, shoes: e.target.value } })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Fit</label>
              <input
                type="text"
                value={formData.sizes.preferredFit}
                onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, preferredFit: e.target.value } })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 2. Color Palettes */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Palette className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Color Palette & Avoidances</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Favorite Colors (High Compatibility)</label>
            <div className="flex flex-wrap gap-2">
              {formData.favoriteColors.map((col, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-rose-700 mb-2">Designated Colors to Avoid</label>
            <div className="flex flex-wrap gap-2">
              {formData.avoidColors.map((col, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold"
                >
                  ✕ {col}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Brands & Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Favorite Brands & Retailers</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.favoriteBrands.map((brand, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span>{brand}</span>
                <button
                  type="button"
                  onClick={() => removeBrand(brand)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              placeholder="Add another favorite brand..."
              value={newFavBrand}
              onChange={(e) => setNewFavBrand(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="button"
              onClick={handleAddBrand}
              className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-floating transition-all active:scale-95"
          >
            Save All Profile Updates
          </button>
        </div>
      </form>

      {/* Face & Body Analysis Scan Modal */}
      <SelfAnalysisScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};
