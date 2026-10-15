import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  X,
  Calendar,
  Layers,
  ChevronLeft,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { analyzeWardrobeItem } from '../api/wardrobeApi';
import { compressImageFile } from '../components/wardrobe/AddWardrobeItemModal';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';

const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];

export const WardrobePage = () => {
  const { user } = useAuth();
  const { wardrobe, addWardrobeItem, updateWardrobeItem, showToast } = useWardrobe();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // View state: 'browse' | 'add'
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPiece, setSelectedPiece] = useState(null);

  // Add Clothing Form Data matching Figma Image 15
  const [formData, setFormData] = useState({
    name: '',
    category: 'Outerwear',
    color: 'Olive',
    brand: '',
    price: '',
    image: null
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  // Statistics derived from live wardrobe items
  const totalPieces = (wardrobe || []).length;
  const activePieces = (wardrobe || []).filter(
    (w) => (w.wearCount || w.wears || 0) > 0
  ).length;
  const activeRate =
    totalPieces > 0 ? Math.round((activePieces / totalPieces) * 100) : 0;

  const subtitleText = totalPieces === 0
    ? '0 pieces in your closet'
    : activeRate > 0
    ? `${totalPieces} pieces · ${activeRate}% actively worn`
    : `${totalPieces} ${totalPieces === 1 ? 'piece' : 'pieces'} in your closet`;

  // Filter ONLY user's real wardrobe items
  const filteredItems = useMemo(() => {
    return (wardrobe || []).filter((item) => {
      const itemCat = (item.category || '').toLowerCase();
      const targetCat = activeCategory.toLowerCase();

      const matchesCategory =
        activeCategory === 'All' ||
        itemCat === targetCat ||
        (targetCat === 'tops' && ['top', 'shirt', 't-shirt', 'tshirt', 'polo', 'hoodie', 'sweater'].some(c => itemCat.includes(c))) ||
        (targetCat === 'bottoms' && ['bottom', 'pant', 'pants', 'jeans', 'trouser', 'shorts'].some(c => itemCat.includes(c))) ||
        (targetCat === 'outerwear' && ['jacket', 'coat', 'blazer', 'overshirt', 'cardigan', 'outerwear'].some(c => itemCat.includes(c))) ||
        (targetCat === 'shoes' && ['shoe', 'shoes', 'sneaker', 'sneakers', 'boots', 'footwear'].some(c => itemCat.includes(c)));

      const matchesSearch =
        !searchQuery.trim() ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.color || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [wardrobe, activeCategory, searchQuery]);

  const categories = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes'];

  const handleLogWear = (piece) => {
    const newWears = (piece.wearCount || piece.wears || 0) + 1;
    if (updateWardrobeItem && piece.id) {
      updateWardrobeItem(piece.id, { wearCount: newWears, wears: newWears });
    }
    if (showToast) {
      showToast(`Logged wear for ${piece.name}!`, 'success');
    }
    setSelectedPiece((prev) => (prev ? { ...prev, wears: newWears, wearCount: newWears } : null));
  };

  // Image Selection Handler for Add Clothing
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setIsAnalyzing(true);

    try {
      const { dataUrl: compressedBase64, detectedColor, detectedCat } = await compressImageFile(file);

      setFormData((prev) => ({
        ...prev,
        image: compressedBase64,
        category: detectedCat || prev.category || 'Outerwear',
        color: detectedColor || prev.color || 'Olive'
      }));

      const aiResult = await analyzeWardrobeItem(file);
      if (aiResult?.success && aiResult?.data) {
        const aiData = aiResult.data;
        setFormData((prev) => ({
          ...prev,
          image: aiData.imageUrl || compressedBase64,
          name: aiData.name || prev.name || `${aiData.color || 'Olive'} ${aiData.category || 'Garment'}`,
          category: aiData.category || detectedCat || prev.category,
          color: aiData.color || detectedColor || prev.color,
          brand: aiData.brand || prev.brand || ''
        }));
      }
    } catch (err) {
      console.warn('Photo processing warning:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Handler for Add Clothing
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalName = formData.name.trim() || `${formData.color} ${formData.category}`;
      await addWardrobeItem({
        name: finalName,
        category: formData.category,
        color: formData.color,
        brand: formData.brand.trim() || 'Custom',
        price: formData.price ? Number(formData.price) : 0,
        image: formData.image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
        wearCount: 0,
        wears: 0
      });

      if (showToast) {
        showToast(`Added ${finalName} to your wardrobe!`, 'success');
      }

      // Reset form and return to wardrobe list
      setFormData({
        name: '',
        category: 'Outerwear',
        color: 'Olive',
        brand: '',
        price: '',
        image: null
      });
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add piece:', err);
      if (showToast) {
        showToast('Failed to add piece. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- VIEW 1: ADD CLOTHING (Matching Figma Image 15) ----------------
  if (isAdding) {
    return (
      <div className="max-w-md mx-auto px-2 animate-fade-in pb-1 text-[#1A1D1A]">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Top Grab Bar matching Figma Image 15 */}
        <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

        {/* Header: < Add to Wardrobe [S] */}
        <div className="flex items-start justify-between pb-1">
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full active:scale-95 cursor-pointer mt-0.5"
              aria-label="Back to wardrobe"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight">
                Add to Wardrobe
              </h1>
              <p className="text-xs text-[#717670] font-normal mt-0.5">
                Add a piece in a few seconds.
              </p>
            </div>
          </div>

          {/* Unified Profile Avatar Button */}
          <ProfileAvatarButton />
        </div>

        <form onSubmit={handleAddSubmit} className="space-y-5 my-4">
          {/* Photo Upload Box matching Image 15 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-white rounded-3xl border border-[#ECE8DF] p-8 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xs aspect-[4/3] sm:aspect-[16/10] cursor-pointer hover:border-[#1A1D1A]/30 transition-all relative overflow-hidden group"
          >
            {formData.image ? (
              <>
                <img
                  src={formData.image}
                  alt="Selected garment"
                  className="w-full h-full object-contain rounded-2xl"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="p-2 rounded-full bg-[#111827]/80 hover:bg-[#111827] text-white shadow-md transition-all cursor-pointer"
                    title="Change photo"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    className="p-2 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white shadow-md transition-all cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-[#1A1D1A] group-hover:scale-110 transition-transform">
                  {isAnalyzing ? (
                    <Loader2 className="w-8 h-8 animate-spin text-[#1A1D1A]" />
                  ) : (
                    <Plus className="w-8 h-8 text-[#1A1D1A] stroke-[1.8]" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-base text-[#1A1D1A]">
                    {isAnalyzing ? 'Analyzing photo...' : 'Upload a photo'}
                  </p>
                  <p className="text-xs text-[#8E968C] mt-0.5">
                    or take one with your camera
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ITEM DETAILS Section matching Image 15 */}
          <div className="space-y-3 pt-1">
            <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block">
              ITEM DETAILS
            </span>

            <div className="space-y-2.5">
              {/* Row 1: Category */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#717670] font-medium w-20 shrink-0">
                  Category
                </span>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex-1 bg-white border border-[#ECE8DF] rounded-2xl px-4 py-3 text-xs font-semibold text-[#1A1D1A] focus:outline-none shadow-2xs appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Color */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#717670] font-medium w-20 shrink-0">
                  Color
                </span>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g. Olive, Navy, Beige"
                  className="flex-1 bg-white border border-[#ECE8DF] rounded-2xl px-4 py-3 text-xs font-semibold text-[#1A1D1A] focus:outline-none shadow-2xs"
                />
              </div>

              {/* Row 3: Brand */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#717670] font-medium w-20 shrink-0">
                  Brand
                </span>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Optional"
                  className="flex-1 bg-white border border-[#ECE8DF] rounded-2xl px-4 py-3 text-xs font-semibold text-[#1A1D1A] placeholder:text-[#A0A69F] focus:outline-none shadow-2xs"
                />
              </div>

              {/* Row 4: Price */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#717670] font-medium w-20 shrink-0">
                  Price
                </span>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="₹0"
                  className="flex-1 bg-white border border-[#ECE8DF] rounded-2xl px-4 py-3 text-xs font-semibold text-[#1A1D1A] placeholder:text-[#A0A69F] focus:outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Action Button: Add to wardrobe */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#111827] hover:bg-[#030712] text-white rounded-2xl font-bold text-xs shadow-xs cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Adding to closet...' : 'Add to wardrobe'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------------- VIEW 2: WARDROBE BROWSER ----------------
  return (
    <div className="max-w-md mx-auto px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* 1. Header: Proportional Editorial Font & Clean Subtitle */}
      <div className="flex items-start justify-between pt-1 pb-1">
        <div>
          <h1 className="font-serif font-semibold text-2xl text-[#1A1D1A] tracking-tight">
            My Wardrobe
          </h1>
          <p className="text-xs text-[#717670] font-normal mt-0.5">
            {subtitleText}
          </p>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {/* 2. Search Input + Integrated Add Button */}
      <div className="mt-3 mb-3 flex items-center gap-2">
        <div className="flex-1 bg-white rounded-2xl border border-[#ECE8DF] px-3.5 py-2.5 flex items-center gap-2 shadow-2xs">
          <Search className="w-4 h-4 text-[#A0A69F] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-transparent text-xs text-[#1A1D1A] placeholder:text-[#A0A69F] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#A0A69F] hover:text-[#1A1D1A] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="h-10 w-10 bg-white hover:bg-[#FAF8F5] border border-[#ECE8DF] text-[#1A1D1A] rounded-2xl flex items-center justify-center shadow-2xs cursor-pointer active:scale-95 transition-all shrink-0"
          title="Add clothing piece"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Category Filter Buttons: All 5 Pills Fit Cleanly Across Screen */}
      <div className="flex items-center justify-between gap-1 sm:gap-1.5 py-1 mb-3.5 select-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`h-7 px-2.5 sm:px-3.5 rounded-full text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center justify-center shrink-0 ${
                isActive
                  ? 'bg-[#1A1D1A] text-white font-semibold shadow-2xs'
                  : 'bg-white text-[#1A1D1A] border border-[#ECE8DF] hover:border-[#1A1D1A]/30'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. Real Wardrobe Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 my-2">
          {filteredItems.map((piece) => {
            const wears = piece.wearCount || piece.wears || 0;
            const price = Number(piece.price) || 0;
            const costPerWear =
              price > 0 && wears > 0
                ? Math.round(price / wears)
                : price > 0
                ? price
                : 150;

            const wearsLabel =
              wears > 0
                ? `${wears} ${wears === 1 ? 'wear' : 'wears'} · ₹${costPerWear}/wear`
                : `Unworn · ₹${price > 0 ? price : 150}`;

            return (
              <div
                key={piece.id}
                onClick={() => setSelectedPiece(piece)}
                className="bg-white rounded-3xl border border-[#ECE8DF] p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs aspect-[3.7/5] hover:border-[#1E2E22]/30 active:scale-[0.98] transition-all cursor-pointer group"
              >
                {/* Real Uploaded Photo */}
                <div className="flex-1 flex items-center justify-center py-2 px-1 overflow-hidden min-h-[115px]">
                  {piece.image ? (
                    <img
                      src={piece.image}
                      alt={piece.name}
                      className="max-h-28 sm:max-h-32 w-full object-cover rounded-2xl group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded-2xl bg-[#FAF8F5] border border-[#ECE8DF] flex items-center justify-center text-[#8E968C]">
                      <Layers className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Name & Wears / Cost per wear */}
                <div className="pt-2 text-left">
                  <h3 className="font-bold text-xs sm:text-sm text-[#1A1D1A] tracking-tight truncate">
                    {piece.name || 'Untitled Piece'}
                  </h3>
                  <p className="text-[11px] text-[#8E968C] font-medium mt-0.5 truncate">
                    {wearsLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clean Empty State when no items match */
        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-8 text-center my-4 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#ECE8DF] mx-auto flex items-center justify-center text-[#1E2E22]">
            <Layers className="w-5 h-5 text-[#8E968C]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#1A1D1A]">
              {searchQuery || activeCategory !== 'All'
                ? 'No matching pieces found'
                : 'Your wardrobe is empty'}
            </h3>
            <p className="text-xs text-[#8E968C] mt-1 max-w-xs mx-auto">
              {searchQuery || activeCategory !== 'All'
                ? 'Try a different filter or search query.'
                : 'Add clothing pieces to start cataloging outfits and tracking wears.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-[#1E2E22] hover:bg-[#162319] text-[#F8F6F0] rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs"
          >
            Add Clothing Piece
          </button>
        </div>
      )}

      {/* Item Detail Sheet */}
      {selectedPiece && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedPiece(null)}
          />
          <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-[#ECE8DF] animate-slide-up-mobile text-[#1A1D1A]">
            {/* Grab Bar on Mobile */}
            <div className="w-10 h-1 rounded-full bg-[#D5CFC2] mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <h3 className="font-serif font-bold text-lg text-[#1A1D1A]">
                {selectedPiece.name || 'Wardrobe Piece'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPiece(null)}
                className="p-1.5 text-[#8E968C] hover:text-[#1A1D1A] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo in Detail Sheet */}
            <div className="py-6 flex items-center justify-center bg-white rounded-2xl border border-[#ECE8DF] my-3">
              {selectedPiece.image ? (
                <img
                  src={selectedPiece.image}
                  alt={selectedPiece.name}
                  className="max-h-44 object-contain rounded-xl"
                />
              ) : (
                <Layers className="w-16 h-16 text-[#8E968C]" />
              )}
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center my-3">
              <div className="bg-white p-3 rounded-2xl border border-[#ECE8DF]">
                <p className="text-base font-bold text-[#1A1D1A]">
                  {selectedPiece.wearCount || selectedPiece.wears || 0}
                </p>
                <p className="text-[10px] text-[#8E968C] uppercase font-semibold">Total Wears</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#ECE8DF]">
                <p className="text-base font-bold text-[#1E2E22]">
                  ₹
                  {selectedPiece.price && (selectedPiece.wearCount || selectedPiece.wears)
                    ? Math.round(selectedPiece.price / (selectedPiece.wearCount || selectedPiece.wears))
                    : selectedPiece.price || 150}
                </p>
                <p className="text-[10px] text-[#8E968C] uppercase font-semibold">Cost / Wear</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#ECE8DF]">
                <p className="text-base font-bold text-[#1A1D1A]">
                  ₹{selectedPiece.price || 0}
                </p>
                <p className="text-[10px] text-[#8E968C] uppercase font-semibold">Value</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleLogWear(selectedPiece)}
                className="flex-1 py-3 px-4 bg-[#1E2E22] hover:bg-[#162319] text-[#F8F6F0] rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Log Worn Today (+1)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPiece(null);
                  navigate('/daily-stylist');
                }}
                className="py-3 px-4 bg-white border border-[#ECE8DF] hover:border-[#1E2E22] text-[#1A1D1A] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Pair Look</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardrobePage;
