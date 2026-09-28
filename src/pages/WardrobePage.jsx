import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Eye,
  ShoppingBag,
  SlidersHorizontal,
  X,
  Calendar,
  Zap,
  Camera,
  Shirt,
  Sun,
  Sparkles,
  LayoutGrid,
  ListFilter,
  RefreshCw,
  Loader2,
  Check
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { WardrobeCard } from '../components/wardrobe/WardrobeCard';
import { AddWardrobeItemModal } from '../components/wardrobe/AddWardrobeItemModal';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { CATEGORY_DEFINITIONS, getCanonicalCategory } from '../utils/categoryUtils';
import { analyzeWardrobeItem } from '../api/wardrobeApi';

export const WardrobePage = () => {
  const { wardrobe, isLoading, refreshWardrobe, addWardrobeItem, updateWardrobeItem, deleteWardrobeItem, showToast } =
    useWardrobe();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('sections'); // 'sections' | 'grid'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: wardrobe.length, Tops: 0, Bottoms: 0, Shoes: 0, Outerwear: 0, Accessories: 0 };
    wardrobe.forEach((item) => {
      const cat = getCanonicalCategory(item);
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      } else {
        counts.Tops += 1;
      }
    });
    return counts;
  }, [wardrobe]);

  // Filter items matching active category and search query
  const filteredItems = useMemo(() => {
    return wardrobe.filter((item) => {
      const itemCanonical = getCanonicalCategory(item);
      const matchesCategory = activeCategory === 'All' || itemCanonical === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fabric?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [wardrobe, activeCategory, searchQuery]);

  // Group items by category for section division
  const groupedItems = useMemo(() => {
    const groups = {
      Tops: [],
      Bottoms: [],
      Shoes: [],
      Outerwear: [],
      Accessories: []
    };
    filteredItems.forEach((item) => {
      const cat = getCanonicalCategory(item);
      if (groups[cat]) {
        groups[cat].push(item);
      } else {
        groups.Tops.push(item);
      }
    });
    return groups;
  }, [filteredItems]);

  const handleQuickCategoryChange = async (itemId, newCategory) => {
    await updateWardrobeItem(itemId, { category: newCategory });
    if (selectedItemForView && selectedItemForView.id === itemId) {
      setSelectedItemForView((prev) => ({ ...prev, category: newCategory }));
    }
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    updateWardrobeItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleRequestDelete = (item) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeletingItem(true);
    try {
      await deleteWardrobeItem(itemToDelete.id);
      if (selectedItemForView?.id === itemToDelete.id) setSelectedItemForView(null);
      if (editingItem?.id === itemToDelete.id) setEditingItem(null);
      setItemToDelete(null);
    } catch (err) {
      console.warn('Failed to delete item:', err);
      setItemToDelete(null);
    } finally {
      setIsDeletingItem(false);
    }
  };

  // Client-side image analyzer fallback
  const analyzeItemVisuals = (imageSrc) => {
    return new Promise((resolve) => {
      if (!imageSrc) return resolve({ category: 'Bottoms', name: 'Clothing Piece', color: 'Custom' });
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => resolve({ category: 'Bottoms', name: 'Clothing Piece', color: 'Custom' });
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve({ category: 'Bottoms', name: 'Clothing Piece', color: 'Custom' });

          ctx.drawImage(img, 0, 0, 300, 300);
          const imgData = ctx.getImageData(0, 0, 300, 300).data;

          // Detect shirt collar / label / placket (top center contrast)
          let topCenterDiff = 0;
          let bottomCreaseDiff = 0;

          for (let y = 20; y < 100; y += 4) {
            for (let x = 110; x < 190; x += 4) {
              const idx = (y * 300 + x) * 4;
              topCenterDiff += Math.abs(imgData[idx] - imgData[idx + 8]);
            }
          }

          for (let y = 120; y < 270; y += 4) {
            for (let x = 30; x < 270; x += 4) {
              const idx = (y * 300 + x) * 4;
              bottomCreaseDiff += Math.abs(imgData[idx] - imgData[idx + 300 * 4]);
            }
          }

          // High top center contrast (collar/label/buttons) = Shirt/Top
          // Low top collar contrast & heavy fabric fold = Pants/Bottoms
          const isShirt = topCenterDiff > 13500;
          const category = isShirt ? 'Tops' : 'Bottoms';
          resolve({ category, isShirt });
        } catch {
          resolve({ category: 'Bottoms', isShirt: false });
        }
      };
      img.src = imageSrc;
    });
  };

  // 1-Click AI Re-Categorization for all existing clothes
  const handleAutoCategorizeAll = async () => {
    if (wardrobe.length === 0) return;
    setIsAutoCategorizing(true);
    let updatedCount = 0;

    try {
      for (const item of wardrobe) {
        if (item.image) {
          let detectedCat = 'Bottoms';
          let detectedName = item.name;

          try {
            // 1. Try Backend AI Vision
            const aiRes = await analyzeWardrobeItem({ image: item.image });
            if (aiRes?.success && aiRes?.data) {
              detectedCat = getCanonicalCategory({
                category: aiRes.data.category,
                subcategory: aiRes.data.subcategory,
                name: aiRes.data.name
              });
              if (aiRes.data.name) detectedName = aiRes.data.name;
            } else {
              // 2. Client-Side Visual Classifier Fallback
              const visual = await analyzeItemVisuals(item.image);
              detectedCat = visual.category;
              const isNumeric = /^\d+$/.test((item.name || '').trim());
              if (isNumeric || !item.name) {
                detectedName = `${item.color || 'Essential'} ${visual.isShirt ? 'Shirt' : 'Trousers/Pants'}`;
              }
            }
          } catch (e) {
            const visual = await analyzeItemVisuals(item.image);
            detectedCat = visual.category;
            const isNumeric = /^\d+$/.test((item.name || '').trim());
            if (isNumeric || !item.name) {
              detectedName = `${item.color || 'Essential'} ${visual.isShirt ? 'Shirt' : 'Trousers/Pants'}`;
            }
          }

          await updateWardrobeItem(item.id, {
            category: detectedCat,
            name: detectedName || item.name
          });
          updatedCount++;
        }
      }
      if (showToast) {
        showToast(`Categorized ${updatedCount} items into Tops and Bottoms!`, 'success');
      }
      setActiveCategory('All');
      await refreshWardrobe(true);
    } catch (err) {
      console.error('Auto categorize error:', err);
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Desktop Header Bar */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Wardrobe
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {wardrobe.length} {wardrobe.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized by categories: Tops, Bottoms, Shoes, Outerwear, and Accessories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {wardrobe.length > 0 && (
            <button
              type="button"
              disabled={isAutoCategorizing}
              onClick={handleAutoCategorizeAll}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Auto-detect categories & names for all pieces"
            >
              {isAutoCategorizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>AI Categorizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Auto-Categorize Closet</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Mobile Top Bar with Quick Action */}
      <div className="flex lg:hidden items-center justify-between gap-2 px-0.5">
        <span className="text-xs font-bold text-slate-600">
          {wardrobe.length} {wardrobe.length === 1 ? 'piece' : 'pieces'} in closet
        </span>
        <div className="flex items-center gap-1.5">
          {wardrobe.length > 0 && (
            <button
              type="button"
              disabled={isAutoCategorizing}
              onClick={handleAutoCategorizeAll}
              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{isAutoCategorizing ? 'Categorizing...' : 'AI Auto-Sort'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Category Navigation Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Search Input & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clothes by name, color, brand, fabric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle (Sections vs Flat Grid) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('sections')}
              title="Category Sections View"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'sections'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>By Category</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Compact Grid View"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Flat Grid</span>
            </button>
          </div>
        </div>

        {/* Category Navigation Chips with Real Counts */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory('All')}
            className={`py-1.5 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border flex items-center justify-center gap-1.5 ${
              activeCategory === 'All'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeCategory === 'All' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {categoryCounts.All}
            </span>
          </button>

          {CATEGORY_DEFINITIONS.map((def) => {
            const count = categoryCounts[def.id] || 0;
            const isSelected = activeCategory === def.id;
            const Icon = def.icon;
            return (
              <button
                key={def.id}
                onClick={() => setActiveCategory(def.id)}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{def.shortLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wardrobe Content */}
      {isLoading && wardrobe.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-3 space-y-3 animate-pulse shadow-xs"
            >
              <div className="aspect-3/4 rounded-xl bg-slate-100 w-full" />
              <div className="space-y-1.5">
                <div className="h-3.5 bg-slate-100 rounded-md w-4/5" />
                <div className="h-2.5 bg-slate-100 rounded-md w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 py-10 px-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {searchQuery ? 'No matching items' : `No ${activeCategory === 'All' ? 'clothes' : activeCategory.toLowerCase()} in wardrobe`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search keywords or switching to another category.'
                : 'Upload photos of your clothes to get daily weather-matched outfit recommendations.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Clothing Item</span>
            </button>
          </div>
        </div>
      ) : activeCategory === 'All' && viewMode === 'sections' ? (
        /* CATEGORY-WISE DIVIDED SECTIONS */
        <div className="space-y-6">
          {CATEGORY_DEFINITIONS.map((def) => {
            const items = groupedItems[def.id] || [];
            if (items.length === 0 && searchQuery) return null; // Hide empty matches when searching
            const Icon = def.icon;

            return (
              <div
                key={def.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${def.badgeClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {def.label}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {items.length} {items.length === 1 ? 'piece' : 'pieces'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 hidden sm:block">
                        {def.desc}
                      </p>
                    </div>
                  </div>

                  {items.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setActiveCategory(def.id)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Filter {def.shortLabel} →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>

                {/* Section Item Grid or Empty State */}
                {items.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-1">
                    {items.map((item) => (
                      <WardrobeCard
                        key={item.id}
                        item={item}
                        onCategoryChange={handleQuickCategoryChange}
                        onViewDetails={(it) => setSelectedItemForView(it)}
                        onEdit={(it) => setEditingItem(it)}
                        onDelete={(it) => handleRequestDelete(it)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-medium">
                      No {def.shortLabel.toLowerCase()} in your wardrobe yet.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tip: You can click on the category tag on any item above to switch it to {def.shortLabel}!
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* SINGLE CATEGORY OR FLAT GRID VIEW */
        <div className="space-y-3">
          {activeCategory !== 'All' && (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Viewing {activeCategory}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {filteredItems.length} {filteredItems.length === 1 ? 'piece' : 'pieces'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                ← Back to All Categories
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <WardrobeCard
                key={item.id}
                item={item}
                onCategoryChange={handleQuickCategoryChange}
                onViewDetails={(it) => setSelectedItemForView(it)}
                onEdit={(it) => setEditingItem(it)}
                onDelete={(it) => handleRequestDelete(it)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Wardrobe Item Modal */}
      <AddWardrobeItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addWardrobeItem}
      />

      {/* View Item Details Modal with 1-Tap Category Switcher */}
      {selectedItemForView && (
        <Modal
          isOpen={!!selectedItemForView}
          onClose={() => setSelectedItemForView(null)}
          title={selectedItemForView.name}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 max-w-xs mx-auto">
              <img
                src={selectedItemForView.image}
                alt={selectedItemForView.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick 1-Tap Category Switcher inside Details */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 block">Garment Category:</span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_DEFINITIONS.map((def) => {
                  const currentCat = getCanonicalCategory(selectedItemForView);
                  const isSelected = currentCat === def.id;
                  return (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => handleQuickCategoryChange(selectedItemForView.id, def.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {def.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Brand:</span>
                <strong className="text-slate-900 font-bold">{selectedItemForView.brand || 'Unspecified'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Color:</span>
                <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-slate-300"
                    style={{ backgroundColor: selectedItemForView.colorHex || '#ddd' }}
                  />
                  {selectedItemForView.color}
                </strong>
              </div>
              {selectedItemForView.fabric && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Fabric:</span>
                  <strong className="text-slate-900 font-bold">{selectedItemForView.fabric}</strong>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Total Wear Count:</span>
                <strong className="text-emerald-700 font-bold">{selectedItemForView.usageCount || 0} times worn</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleRequestDelete(selectedItemForView)}
                className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Item</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedItemForView(null)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={`Edit ${editingItem.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Category Selector Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_DEFINITIONS.map((def) => {
                  const currentCat = getCanonicalCategory(editingItem);
                  const isSelected = currentCat === def.id;
                  return (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, category: def.id })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {def.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={editingItem.brand || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                <input
                  type="text"
                  value={editingItem.color || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Wear Count</label>
              <input
                type="number"
                inputMode="numeric"
                value={editingItem.usageCount || 0}
                onChange={(e) => setEditingItem({ ...editingItem, usageCount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleRequestDelete(editingItem)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => !isDeletingItem && setItemToDelete(null)}
        title="Remove Wardrobe Piece"
        maxWidth="max-w-md"
      >
        {itemToDelete && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-950">Remove from Closet?</h4>
                <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                  This piece will be permanently removed from your wardrobe and will no longer appear in outfit combinations.
                </p>
              </div>
            </div>

            {/* Product Preview Tile */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                <img src={itemToDelete.image} alt={itemToDelete.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {getCanonicalCategory(itemToDelete)} · {itemToDelete.color}
                </span>
                <p className="text-xs font-extrabold text-slate-900 truncate">{itemToDelete.name}</p>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{itemToDelete.brand || 'Essential'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingItem}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingItem ? 'Deleting...' : 'Delete Piece'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WardrobePage;
