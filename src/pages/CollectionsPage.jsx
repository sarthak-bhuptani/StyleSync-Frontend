import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  ChevronLeft,
  MoreVertical,
  Heart,
  Share2,
  Edit2,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  Camera,
  Check,
  CheckCircle,
  X,
  Link2,
  BarChart2,
  Grid2X2,
  TrendingUp,
  SlidersHorizontal,
  Bookmark,
  Calendar,
  Eye,
  FolderHeart,
  Shirt,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';
import { collectionApi } from '../api/collectionApi';

const STORAGE_KEY = 'stylesync_collections';

const CATEGORY_TAGS = ['Work', 'Casual', 'Travel', 'Date Night', 'Seasonal', 'Minimal', 'Event', 'Custom'];

export const CollectionsPage = () => {
  const { user } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const navigate = useNavigate();
  const location = useLocation();

  // Load user's real collections from API & localStorage fallback
  const [collections, setCollections] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasDummySeed = parsed.some(c => c.id === 'col_work' && c.looks?.[0]?.id === 'l_1');
          if (!hasDummySeed) return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse collections:', e);
    }
    return [];
  });

  // Fetch collections from server on mount
  useEffect(() => {
    let isMounted = true;
    const loadCollections = async () => {
      try {
        const serverList = await collectionApi.getCollections();
        if (isMounted && Array.isArray(serverList)) {
          setCollections(serverList);
        }
      } catch (err) {
        console.warn('Could not fetch collections from server:', err);
      }
    };
    loadCollections();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync real collections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch (e) {
      console.warn('Failed to save collections:', e);
    }
  }, [collections]);

  // Views & State
  // view: 'hub' | 'create' | 'detail' | 'look_detail'
  const [view, setView] = useState('hub');
  const [activeHubTab, setActiveHubTab] = useState('All'); // 'All' | 'My Collections' | 'Auto Collections'
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [selectedLook, setSelectedLook] = useState(null);
  const [detailTab, setDetailTab] = useState('Looks'); // 'Looks' | 'Items' | 'Outfits'

  // Modals
  const [optionsDrawerOpen, setOptionsDrawerOpen] = useState(false);
  const [targetCollectionForOptions, setTargetCollectionForOptions] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [insightsModalOpen, setInsightsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isPublicLink, setIsPublicLink] = useState(true);

  // Form State (Clean, no dummy data)
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'Work',
    description: '',
    coverImage: ''
  });
  const fileInputRef = useRef(null);

  // Multi-select state for Add to Collection (Real selection, starts empty)
  const [addModalType, setAddModalType] = useState('Items'); // 'Items' | 'Outfits' | 'Looks'
  const [addModalCategory, setAddModalCategory] = useState('All');
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  // Active current collection
  const activeCollection = useMemo(() => {
    return collections.find((c) => c.id === selectedCollectionId) || collections[0] || null;
  }, [collections, selectedCollectionId]);

  // Real Auto Collections derived strictly from user's live wardrobe
  const autoCollectionsData = useMemo(() => {
    const list = Array.isArray(wardrobe) ? wardrobe : [];
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const recent = list.filter((item) => {
      if (!item.dateAdded && !item.createdAt) return true;
      const created = new Date(item.dateAdded || item.createdAt).getTime();
      return now - created <= thirtyDaysMs;
    });

    const frequentlyWorn = list.filter((i) => (Number(i.wearCount) || Number(i.wears) || 0) > 0);
    const favorites = list.filter((i) => Boolean(i.isFavorite || i.favorite));
    const rarelyWorn = list.filter((i) => (Number(i.wearCount) || Number(i.wears) || 0) === 0);

    return {
      recentlyAdded: recent,
      frequentlyWorn: frequentlyWorn,
      favorites: favorites,
      rarelyWorn: rarelyWorn
    };
  }, [wardrobe]);

  // Candidate items for "Add to Collection" — ONLY real user wardrobe items!
  const candidateItems = useMemo(() => {
    if (!Array.isArray(wardrobe) || wardrobe.length === 0) return [];
    return wardrobe.map((w, idx) => ({
      id: w.id || w._id || `item_${idx}`,
      name: w.name || 'Untitled Garment',
      category: (w.category || 'Tops').charAt(0).toUpperCase() + (w.category || 'Tops').slice(1).toLowerCase(),
      image: w.image || w.imageUrl || ''
    }));
  }, [wardrobe]);

  // Filter candidate items by selected category
  const filteredCandidates = useMemo(() => {
    if (addModalCategory === 'All') return candidateItems;
    return candidateItems.filter((item) => {
      const cat = (item.category || '').toLowerCase();
      const target = addModalCategory.toLowerCase();
      return cat.includes(target.replace(/s$/, '')) || cat === target;
    });
  }, [candidateItems, addModalCategory]);

  // Toggle selection
  const handleToggleSelectItem = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Confirm adding selected real items to collection
  const handleConfirmAddToCollection = async () => {
    if (!activeCollection) return;
    const colId = activeCollection.id || activeCollection._id;
    const selectedPieces = candidateItems.filter((c) => selectedItemIds.includes(c.id));

    try {
      await collectionApi.addItemsToCollection(colId, {
        itemIds: selectedItemIds,
        outfitIds: []
      });
    } catch (err) {
      console.warn('API error adding items to collection:', err);
    }

    setCollections((prev) =>
      prev.map((col) => {
        if ((col.id || col._id) === colId) {
          const currentItems = Array.isArray(col.items) ? col.items : [];
          const existingIds = new Set(currentItems.map((i) => i.id));
          const newItems = selectedPieces.filter((sp) => !existingIds.has(sp.id));
          return {
            ...col,
            items: [...currentItems, ...newItems],
            itemIds: Array.from(new Set([...(col.itemIds || []), ...selectedItemIds])),
            itemsCount: currentItems.length + newItems.length,
            updatedAt: 'Just now'
          };
        }
        return col;
      })
    );
    setAddModalOpen(false);
    setSelectedItemIds([]);
    if (showToast) {
      showToast(`Added ${selectedPieces.length} items to ${activeCollection.name}!`, 'success');
    }
  };

  // Open Create Form (Clean initial state)
  const handleOpenCreate = () => {
    setIsEditingExisting(false);
    setFormData({
      id: `col_${Date.now()}`,
      name: '',
      category: 'Work',
      description: '',
      coverImage: ''
    });
    setView('create');
  };

  // Open Edit Form
  const handleOpenEdit = (col) => {
    setIsEditingExisting(true);
    setFormData({
      id: col.id || col._id,
      name: col.name || '',
      category: col.category || 'Work',
      description: col.description || '',
      coverImage: col.coverImage || ''
    });
    setOptionsDrawerOpen(false);
    setView('create');
  };

  // Save Collection (Create or Update)
  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEditingExisting) {
      try {
        const updated = await collectionApi.updateCollection(formData.id, formData);
        setCollections((prev) =>
          prev.map((c) => ((c.id || c._id) === formData.id ? { ...c, ...updated, ...formData, updatedAt: 'Just now' } : c))
        );
      } catch (err) {
        console.warn('API update collection error, falling back locally:', err);
        setCollections((prev) =>
          prev.map((c) => ((c.id || c._id) === formData.id ? { ...c, ...formData, updatedAt: 'Just now' } : c))
        );
      }
      if (showToast) showToast('Collection updated!', 'success');
    } else {
      const defaultCover = formData.coverImage || wardrobe?.[0]?.image || '';
      const payload = {
        name: formData.name.trim(),
        category: formData.category || 'Work',
        description: formData.description || '',
        coverImage: defaultCover,
        itemIds: [],
        outfitIds: [],
        looks: []
      };

      try {
        const created = await collectionApi.createCollection(payload);
        const resolvedId = created.id || created._id || `col_${Date.now()}`;
        const newCol = {
          ...payload,
          ...created,
          id: resolvedId,
          looksCount: 0,
          itemsCount: 0,
          updatedAt: 'Just now',
          items: []
        };
        setCollections((prev) => [newCol, ...prev.filter((c) => (c.id || c._id) !== resolvedId)]);
        setSelectedCollectionId(resolvedId);
      } catch (err) {
        console.warn('API create collection error, saving locally:', err);
        const fallbackId = `col_${Date.now()}`;
        const newCol = {
          ...payload,
          id: fallbackId,
          looksCount: 0,
          itemsCount: 0,
          updatedAt: 'Just now',
          items: []
        };
        setCollections((prev) => [newCol, ...prev]);
        setSelectedCollectionId(fallbackId);
      }
      if (showToast) showToast(`Created collection "${formData.name}"!`, 'success');
    }
    setView('hub');
  };

  // Cover Image File Upload
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, coverImage: event.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  // Collection Options Drawer
  const handleOpenOptions = (e, col) => {
    e.stopPropagation();
    setTargetCollectionForOptions(col);
    setOptionsDrawerOpen(true);
  };

  // Duplicate Collection
  const handleDuplicateCollection = async (col) => {
    const clonePayload = {
      name: `${col.name} (Copy)`,
      category: col.category || 'Work',
      description: col.description || '',
      coverImage: col.coverImage || '',
      itemIds: col.itemIds || [],
      outfitIds: col.outfitIds || [],
      looks: col.looks || []
    };

    try {
      const created = await collectionApi.createCollection(clonePayload);
      const newId = created.id || created._id || `col_${Date.now()}`;
      setCollections((prev) => [{ ...clonePayload, ...created, id: newId }, ...prev]);
    } catch {
      const fallbackId = `col_${Date.now()}`;
      setCollections((prev) => [{ ...clonePayload, id: fallbackId }, ...prev]);
    }
    setOptionsDrawerOpen(false);
    if (showToast) showToast(`Duplicated "${col.name}"!`, 'success');
  };

  // Delete Collection
  const handleDeleteCollection = async (col) => {
    const colId = col.id || col._id;
    try {
      await collectionApi.deleteCollection(colId);
    } catch (err) {
      console.warn('API delete collection error:', err);
    }
    setCollections((prev) => prev.filter((c) => (c.id || c._id) !== colId));
    setOptionsDrawerOpen(false);
    if (selectedCollectionId === colId) {
      setView('hub');
      setSelectedCollectionId(null);
    }
    if (showToast) showToast(`Deleted "${col.name}"`, 'success');
  };

  // Set as Default Collection
  const handleSetDefaultCollection = (col) => {
    setCollections((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === col.id
      }))
    );
    setOptionsDrawerOpen(false);
    if (showToast) showToast(`Set "${col.name}" as default collection!`, 'success');
  };

  // Toggle Heart on a Look
  const handleToggleLikeLook = (e, lookId) => {
    e.stopPropagation();
    if (!activeCollection) return;
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === activeCollection.id) {
          const updatedLooks = (col.looks || []).map((lk) =>
            lk.id === lookId ? { ...lk, isLiked: !lk.isLiked } : lk
          );
          return { ...col, looks: updatedLooks };
        }
        return col;
      })
    );
  };

  // Open Look Detail View
  const handleOpenLookDetail = (look) => {
    setSelectedLook(look);
    setView('look_detail');
  };

  // Copy share link
  const handleCopyShareLink = () => {
    if (!activeCollection) return;
    const shareUrl = `${window.location.origin}/collections?id=${activeCollection.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      if (showToast) showToast('Collection link copied to clipboard!', 'success');
    } else {
      if (showToast) showToast('Link ready to share!', 'success');
    }
  };

  // Open an Auto-Collection in Detail View
  const handleOpenAutoCollection = (title, items) => {
    const autoCol = {
      id: `auto_${title.toLowerCase().replace(/\s+/g, '_')}`,
      name: title,
      category: 'Auto',
      isAuto: true,
      description: `Automatically curated from your wardrobe.`,
      coverImage: items[0]?.image || items[0]?.imageUrl || '',
      looks: [],
      items: items.map((w, idx) => ({
        id: w.id || w._id || `auto_item_${idx}`,
        name: w.name || 'Wardrobe Item',
        category: w.category || 'Tops',
        image: w.image || w.imageUrl || ''
      }))
    };
    setSelectedCollectionId(autoCol.id);
    // Add temporarily or open
    setCollections((prev) => {
      const exists = prev.find((c) => c.id === autoCol.id);
      if (exists) return prev;
      return [autoCol, ...prev];
    });
    setDetailTab('Items');
    setView('detail');
  };

  // Compute real dynamic insights for active collection
  const realInsights = useMemo(() => {
    if (!activeCollection) return { looksCount: 0, itemsCount: 0, outfitTypesCount: 0, mostUsed: [] };
    const looks = Array.isArray(activeCollection.looks) ? activeCollection.looks : [];
    const items = Array.isArray(activeCollection.items) ? activeCollection.items : [];
    const categoriesSet = new Set(items.map((i) => i.category || 'Tops'));

    // Count usage of items across looks
    const usageMap = {};
    looks.forEach((lk) => {
      (lk.items || []).forEach((piece) => {
        const pieceName = typeof piece === 'string' ? piece : piece.name;
        if (pieceName) {
          usageMap[pieceName] = (usageMap[pieceName] || 0) + 1;
        }
      });
    });

    const mostUsed = Object.entries(usageMap)
      .map(([name, count]) => {
        const found = items.find((it) => it.name === name);
        const percent = looks.length > 0 ? Math.round((count / looks.length) * 100) : 0;
        return {
          name,
          count,
          percent,
          image: found?.image || ''
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      looksCount: looks.length,
      itemsCount: items.length,
      outfitTypesCount: categoriesSet.size,
      mostUsed
    };
  }, [activeCollection]);

  // =========================================================================
  // VIEW 1: SINGLE LOOK DETAIL VIEW (Screen 8)
  // =========================================================================
  if (view === 'look_detail' && selectedLook) {
    return (
      <div className="max-w-md mx-auto animate-fade-in pb-1 text-[#1A1D1A]">
        {/* Full Model Photo Container */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-md aspect-[4/5] sm:aspect-[3/4]">
          {selectedLook.image ? (
            <img
              src={selectedLook.image}
              alt={selectedLook.title}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
              <Shirt className="w-12 h-12 mb-2" />
              <span className="text-xs">No Photo Uploaded</span>
            </div>
          )}

          {/* Top Overlaid Action Buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              type="button"
              onClick={() => setView('detail')}
              className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-[#1A1D1A] flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              aria-label="Back to collection"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={(e) => handleOpenOptions(e, activeCollection)}
              className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-[#1A1D1A] flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Look Bottom Card */}
        <div className="mt-4 p-5 bg-white rounded-3xl border border-[#ECE8DF] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-2xl text-[#1A1D1A] tracking-tight">
              {selectedLook.title || 'Untitled Look'}
            </h2>

            <button
              type="button"
              onClick={(e) => handleToggleLikeLook(e, selectedLook.id)}
              className="p-2 text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Heart
                className="w-6 h-6"
                fill={selectedLook.isLiked ? '#EF4444' : 'none'}
                stroke={selectedLook.isLiked ? '#EF4444' : '#1A1D1A'}
              />
            </button>
          </div>

          {/* Tags */}
          {Array.isArray(selectedLook.tags) && selectedLook.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedLook.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#F4F0E8] text-[#1A1D1A] text-xs font-semibold rounded-full border border-[#ECE8DF]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs font-medium text-[#717670]">
            {(selectedLook.items || []).length} items
          </p>

          {/* Garments in this look */}
          {(selectedLook.items || []).length > 0 && (
            <div className="pt-2 border-t border-[#ECE8DF]">
              <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2.5">
                Garments in this look
              </span>
              <div className="grid grid-cols-4 gap-2">
                {selectedLook.items.map((piece, idx) => {
                  const pieceName = typeof piece === 'string' ? piece : piece.name;
                  const pieceImg = typeof piece === 'object' ? piece.image : '';
                  return (
                    <div key={idx} className="space-y-1 text-center">
                      <div className="aspect-square rounded-2xl bg-[#F4F0E8] border border-[#ECE8DF] overflow-hidden flex items-center justify-center p-1">
                        {pieceImg ? (
                          <img
                            src={pieceImg}
                            alt={pieceName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Shirt className="w-5 h-5 text-[#8E968C]" />
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-[#1A1D1A] truncate">{pieceName}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: CREATE / EDIT COLLECTION VIEW (Screen 2)
  // =========================================================================
  if (view === 'create') {
    return (
      <div className="max-w-md mx-auto animate-fade-in pb-1 text-[#1A1D1A]">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />

        {/* Top Header: Back Button + Title */}
        <div className="flex items-center gap-3 pt-1 pb-4">
          <button
            type="button"
            onClick={() => setView('hub')}
            className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h1 className="font-serif font-bold text-2xl text-[#1A1D1A] tracking-tight">
            {isEditingExisting ? 'Edit Collection' : 'Create Collection'}
          </h1>
        </div>

        <form onSubmit={handleSaveCollection} className="space-y-5">
          {/* Cover Image Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-3xl bg-[#F5F2EB] border-2 border-dashed border-[#DDD5C8] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#EFECE5] transition-all overflow-hidden relative group"
          >
            {formData.coverImage ? (
              <>
                <img
                  src={formData.coverImage}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold">
                  <Camera className="w-6 h-6 mb-1" />
                  <span>Change Cover</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white text-[#1A1D1A] flex items-center justify-center shadow-sm">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#1A1D1A]">Add Cover Image</span>
                <span className="text-[10px] text-[#8E968C]">Upload a photo from device</span>
              </>
            )}
          </div>

          {/* Collection Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1A1D1A]">Collection Name</label>
              <span className="text-[10px] text-[#8E968C]">
                {formData.name.length}/30
              </span>
            </div>
            <input
              type="text"
              maxLength={30}
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Office Looks, Summer Holiday, Date Night"
              className="w-full bg-white border border-[#ECE8DF] rounded-2xl px-4 py-3 text-xs font-semibold text-[#1A1D1A] focus:outline-none focus:ring-1 focus:ring-[#1E2E22] shadow-2xs placeholder:text-[#A0A69F]"
            />
          </div>

          {/* Category (optional) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1A1D1A]">Category (optional)</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TAGS.map((cat) => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1D1A] text-white shadow-xs'
                        : 'bg-white border border-[#ECE8DF] text-[#717670] hover:text-[#1A1D1A]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description (optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1A1D1A]">Description (optional)</label>
              <span className="text-[10px] text-[#8E968C]">
                {formData.description.length}/100
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={100}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this collection's vibe or aesthetic..."
              className="w-full bg-white border border-[#ECE8DF] rounded-2xl px-4 py-3 text-xs font-medium text-[#1A1D1A] focus:outline-none focus:ring-1 focus:ring-[#1E2E22] shadow-2xs resize-none placeholder:text-[#A0A69F]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-[#1A1D1A] hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-sm active:scale-[0.99] cursor-pointer mt-4"
          >
            {isEditingExisting ? 'Save Changes' : 'Create Collection'}
          </button>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: COLLECTION DETAIL VIEW (Screens 3 & 7)
  // =========================================================================
  if (view === 'detail' && activeCollection) {
    const looksList = activeCollection.looks || [];
    const itemsList = activeCollection.items || [];

    return (
      <div className="max-w-md mx-auto animate-fade-in pb-1 text-[#1A1D1A]">
        {/* Hero Cover Header */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-md aspect-[16/10] sm:aspect-[16/9]">
          {activeCollection.coverImage ? (
            <img
              src={activeCollection.coverImage}
              alt={activeCollection.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#E5E0D6] flex flex-col items-center justify-center text-[#717670]">
              <FolderHeart className="w-12 h-12 mb-1" />
              <span className="text-xs font-medium">Custom Capsule</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          {/* Top Floating Controls */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
            <button
              type="button"
              onClick={() => setView('hub')}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-[#1A1D1A] flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              aria-label="Back to collections"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            {!activeCollection.isAuto && (
              <button
                type="button"
                onClick={(e) => handleOpenOptions(e, activeCollection)}
                className="w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-[#1A1D1A] flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                aria-label="Collection options"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Title & Meta Overlaid on Cover */}
          <div className="absolute bottom-3.5 left-4 right-4 text-white">
            <h1 className="font-serif font-bold text-3xl tracking-tight leading-tight">
              {activeCollection.name}
            </h1>
            <p className="text-xs text-white/85 font-medium mt-0.5">
              {looksList.length} looks · {itemsList.length} items
            </p>
          </div>
        </div>

        {/* Description Pill */}
        {activeCollection.description && (
          <div className="mt-3.5 px-1 flex items-center justify-between text-xs text-[#717670]">
            <p className="font-medium truncate">{activeCollection.description}</p>
            {!activeCollection.isAuto && (
              <button
                type="button"
                onClick={() => handleOpenEdit(activeCollection)}
                className="p-1 text-[#8E968C] hover:text-[#1A1D1A] cursor-pointer shrink-0 ml-2"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        )}

        {/* Navigation Tabs: Looks | Items | Outfits + Insights */}
        <div className="mt-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {['Looks', 'Items', 'Outfits'].map((tab) => {
              const isActive = detailTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDetailTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1A1D1A] text-white shadow-xs'
                      : 'bg-white border border-[#ECE8DF] text-[#717670] hover:text-[#1A1D1A]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setInsightsModalOpen(true)}
            className="text-xs font-bold text-[#1A1D1A] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Insights</span>
            <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {/* TAB 1: LOOKS */}
        {detailTab === 'Looks' && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {looksList.length > 0 ? (
              looksList.map((look) => (
                <div
                  key={look.id}
                  onClick={() => handleOpenLookDetail(look)}
                  className="bg-white rounded-3xl border border-[#ECE8DF] overflow-hidden shadow-2xs hover:shadow-sm transition-all group cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                    {look.image ? (
                      <img
                        src={look.image}
                        alt={look.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8E968C]">
                        <Shirt className="w-8 h-8" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleOpenOptions(e, activeCollection)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {look.isLiked && (
                      <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-500 shadow-xs">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500" />
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-serif font-bold text-sm text-[#1A1D1A] truncate">
                      {look.title}
                    </h3>
                    <p className="text-[11px] text-[#8E968C] font-medium mt-0.5">
                      {(look.items || []).length} items
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-xs text-[#8E968C] bg-white rounded-3xl border border-[#ECE8DF] p-6">
                <FolderHeart className="w-8 h-8 text-[#A0A69F] mx-auto mb-2 opacity-60" />
                <p className="font-semibold text-[#1A1D1A]">No looks in this collection yet</p>
                <p className="mt-1">Add items or outfits from your closet to start curating looks</p>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#1A1D1A] text-white rounded-full text-xs font-bold hover:bg-black cursor-pointer"
                >
                  + Add to Collection
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ITEMS (Screen 7) */}
        {detailTab === 'Items' && (
          <div className="grid grid-cols-3 gap-2.5 animate-fade-in">
            {itemsList.length > 0 ? (
              itemsList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#ECE8DF] overflow-hidden shadow-2xs p-2 text-center space-y-1.5 relative group"
                >
                  <div className="aspect-square rounded-xl bg-[#F5F2EB] overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Shirt className="w-6 h-6 text-[#8E968C]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1D1A] truncate">{item.name}</h4>
                    <span className="text-[10px] text-[#8E968C] font-medium block">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-xs text-[#8E968C] bg-white rounded-3xl border border-[#ECE8DF] p-6">
                <Layers className="w-8 h-8 text-[#A0A69F] mx-auto mb-2 opacity-60" />
                <p className="font-semibold text-[#1A1D1A]">No wardrobe items in this collection</p>
                <p className="mt-1">Select pieces from your wardrobe to include in this capsule</p>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#1A1D1A] text-white rounded-full text-xs font-bold hover:bg-black cursor-pointer"
                >
                  + Add Items
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OUTFITS */}
        {detailTab === 'Outfits' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-4 bg-white rounded-3xl border border-[#ECE8DF] text-center py-10">
              <Sparkles className="w-8 h-8 text-[#1E2E22] mx-auto mb-2" />
              <h3 className="font-serif font-bold text-base text-[#1A1D1A]">
                AI Outfit Combinations
              </h3>
              <p className="text-xs text-[#717670] mt-1 max-w-xs mx-auto">
                Mix and match formulas generated from this collection’s {itemsList.length} wardrobe pieces.
              </p>
              <button
                type="button"
                onClick={() => navigate('/daily-stylist')}
                className="mt-4 px-5 py-2.5 bg-[#1A1D1A] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-black transition-all"
              >
                Open Outfit Lab
              </button>
            </div>
          </div>
        )}

        {/* Floating Add Button */}
        {!activeCollection.isAuto && (
          <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30 flex justify-center">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="px-6 py-3.5 bg-[#1A1D1A] hover:bg-black text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add to Collection</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: MAIN COLLECTIONS HUB (Screen 1 & Screen 6)
  // =========================================================================
  return (
    <div className="max-w-md mx-auto px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* 1. TOP HEADER: PROFILE BUTTON ON LEFT SIDE ABOVE + CREATE BUTTON ON RIGHT */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <ProfileAvatarButton />

        <button
          type="button"
          onClick={handleOpenCreate}
          className="w-9 h-9 rounded-2xl bg-[#1A1D1A] hover:bg-black text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
          title="Create Collection"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* 2. Main Title and Subtitle */}
      <div className="mt-1 mb-3">
        <h1 className="font-serif font-bold text-3xl text-[#1A1D1A] tracking-tight">
          My Collections
        </h1>
        <p className="text-xs text-[#717670] font-normal mt-1 leading-relaxed">
          Organize your wardrobe and outfits into custom collections.
        </p>
      </div>

      {/* 3. Filter Navigation Pills: All | My Collections | Auto Collections */}
      <div className="flex items-center gap-2 mb-4">
        {['All', 'My Collections', 'Auto Collections'].map((tab) => {
          const isActive = activeHubTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveHubTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1A1D1A] text-white shadow-xs'
                  : 'bg-white border border-[#ECE8DF] text-[#717670] hover:text-[#1A1D1A]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 4. CONTENT A: AUTO COLLECTIONS TAB (100% real wardrobe counts) */}
      {activeHubTab === 'Auto Collections' ? (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {/* Recently Added Card */}
          <div
            onClick={() => handleOpenAutoCollection('Recently Added', autoCollectionsData.recentlyAdded)}
            className="p-4 bg-white rounded-3xl border border-[#ECE8DF] shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block">
                Auto Generated
              </span>
              <h3 className="font-serif font-bold text-base text-[#1A1D1A] mt-1">
                Recently Added
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#717670]">
              {autoCollectionsData.recentlyAdded.length} items
            </p>
          </div>

          {/* Frequently Worn Card */}
          <div
            onClick={() => handleOpenAutoCollection('Frequently Worn', autoCollectionsData.frequentlyWorn)}
            className="p-4 bg-white rounded-3xl border border-[#ECE8DF] shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block">
                High Rotation
              </span>
              <h3 className="font-serif font-bold text-base text-[#1A1D1A] mt-1">
                Frequently Worn
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#717670]">
              {autoCollectionsData.frequentlyWorn.length} items
            </p>
          </div>

          {/* Favorites Card */}
          <div
            onClick={() => handleOpenAutoCollection('Favorites', autoCollectionsData.favorites)}
            className="p-4 bg-white rounded-3xl border border-[#ECE8DF] shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center gap-1.5 text-rose-600">
              <Heart className="w-4 h-4 fill-rose-600" />
              <h3 className="font-serif font-bold text-base text-[#1A1D1A]">
                Favorites
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#717670]">
              {autoCollectionsData.favorites.length} items
            </p>
          </div>

          {/* Rarely Worn Card */}
          <div
            onClick={() => handleOpenAutoCollection('Rarely Worn', autoCollectionsData.rarelyWorn)}
            className="p-4 bg-white rounded-3xl border border-[#ECE8DF] shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center gap-1.5 text-amber-700">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-serif font-bold text-base text-[#1A1D1A]">
                Rarely Worn
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#717670]">
              {autoCollectionsData.rarelyWorn.length} items
            </p>
          </div>
        </div>
      ) : collections.length > 0 ? (
        /* 4. CONTENT B: USER'S REAL COLLECTIONS GRID */
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => {
                setSelectedCollectionId(col.id);
                setView('detail');
              }}
              className="bg-white rounded-3xl border border-[#ECE8DF] overflow-hidden shadow-2xs hover:shadow-sm transition-all group cursor-pointer flex flex-col"
            >
              <div className="relative aspect-square sm:aspect-[4/3] bg-slate-100 overflow-hidden">
                {col.coverImage ? (
                  <img
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-[#E5E0D6] flex items-center justify-center text-[#717670]">
                    <FolderHeart className="w-8 h-8 opacity-60" />
                  </div>
                )}
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <h3 className="font-serif font-bold text-sm text-[#1A1D1A] truncate">
                    {col.name}
                  </h3>
                  <p className="text-[11px] text-[#8E968C] font-medium mt-0.5">
                    {(col.looks || []).length > 0
                      ? `${(col.looks || []).length} looks`
                      : `${(col.items || []).length} items`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleOpenOptions(e, col)}
                  className="p-1 text-[#8E968C] hover:text-[#1A1D1A] rounded-lg active:scale-90 transition-transform cursor-pointer shrink-0"
                  title="Collection Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 4. CONTENT C: EMPTY STATE (Clean, no mock data) */
        <div className="p-8 text-center bg-white rounded-3xl border border-[#ECE8DF] shadow-2xs space-y-4 my-2 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-[#F5F2EB] text-[#1A1D1A] flex items-center justify-center mx-auto shadow-xs">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1A1D1A]">
              No Collections Yet
            </h3>
            <p className="text-xs text-[#717670] mt-1 max-w-xs mx-auto leading-relaxed">
              Create your first collection to group outfits and wardrobe pieces by occasion, travel, or seasonal style.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-6 py-3 bg-[#1A1D1A] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>Create First Collection</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          SCREEN 5: COLLECTION OPTIONS BOTTOM SHEET
          ========================================================================= */}
      {optionsDrawerOpen && targetCollectionForOptions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setOptionsDrawerOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl z-10 p-5 pb-8 animate-slide-up-mobile border-t border-slate-100">
            <div className="w-12 h-1 rounded-full bg-slate-300 mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Collection Options
              </h3>
              <button
                type="button"
                onClick={() => setOptionsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 space-y-1 text-sm font-medium text-slate-800">
              <button
                type="button"
                onClick={() => handleOpenEdit(targetCollectionForOptions)}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-slate-600" />
                <span>Edit Collection</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setOptionsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-600" />
                <span>Change Cover Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOptionsDrawerOpen(false);
                  setAddModalType('Items');
                  setAddModalOpen(true);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Add/Remove Items</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetDefaultCollection(targetCollectionForOptions)}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-slate-600" />
                <span>Set as Default</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOptionsDrawerOpen(false);
                  setShareModalOpen(true);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-slate-600" />
                <span>Share Collection</span>
              </button>

              <button
                type="button"
                onClick={() => handleDuplicateCollection(targetCollectionForOptions)}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Duplicate Collection</span>
              </button>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteCollection(targetCollectionForOptions)}
                  className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Collection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: ADD TO COLLECTION MULTI-SELECT (100% Real Wardrobe Items)
          ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setAddModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden animate-slide-up-mobile">
            {/* Header */}
            <div className="p-4 border-b border-[#ECE8DF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
                <h2 className="font-serif font-bold text-lg text-[#1A1D1A]">
                  Add to Collection
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-[#717670] hover:text-[#1A1D1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Pills */}
            <div className="p-4 pb-2 border-b border-[#ECE8DF]/60">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'].map((cat) => {
                  const isActive = addModalCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAddModalCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1A1D1A] text-white shadow-xs'
                          : 'bg-[#F4F0E8] text-[#717670] hover:text-[#1A1D1A]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Real Pieces Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredCandidates.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {filteredCandidates.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelectItem(item.id)}
                        className={`rounded-2xl border p-1.5 transition-all cursor-pointer relative flex flex-col items-center text-center ${
                          isSelected
                            ? 'border-[#1A1D1A] bg-[#F4F0E8]/50 ring-1 ring-[#1A1D1A]'
                            : 'border-[#ECE8DF] bg-white hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#1A1D1A] text-white shadow-xs'
                              : 'bg-white/80 border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>

                        <div className="w-full aspect-square rounded-xl bg-[#F5F2EB] overflow-hidden mb-1.5 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Shirt className="w-6 h-6 text-[#8E968C]" />
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-[#1A1D1A] truncate w-full">
                          {item.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[#8E968C] p-4">
                  <Shirt className="w-8 h-8 text-[#A0A69F] mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-[#1A1D1A]">No pieces found in wardrobe</p>
                  <p className="mt-1">Add items to your wardrobe to select them for your collection.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAddModalOpen(false);
                      navigate('/wardrobe');
                    }}
                    className="mt-4 px-4 py-2 bg-[#1A1D1A] text-white rounded-full text-xs font-bold hover:bg-black cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Open Wardrobe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 border-t border-[#ECE8DF] bg-[#FAF8F5] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1A1D1A]">
                {selectedItemIds.length} items selected
              </span>

              <button
                type="button"
                disabled={selectedItemIds.length === 0}
                onClick={handleConfirmAddToCollection}
                className="px-5 py-2.5 bg-[#1A1D1A] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Add to Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 9: COLLECTION INSIGHTS (Computed from Real Data)
          ========================================================================= */}
      {insightsModalOpen && activeCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setInsightsModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto p-5 animate-slide-up-mobile">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInsightsModalOpen(false)}
                  className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
                <h2 className="font-serif font-bold text-lg text-[#1A1D1A]">
                  Collection Insights
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInsightsModalOpen(false)}
                className="text-[#717670] hover:text-[#1A1D1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ECE8DF] text-center">
                <span className="font-serif font-bold text-2xl text-[#1A1D1A] block">
                  {realInsights.looksCount}
                </span>
                <span className="text-[10px] font-semibold text-[#8E968C] uppercase tracking-wider block mt-0.5">
                  Looks
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ECE8DF] text-center">
                <span className="font-serif font-bold text-2xl text-[#1A1D1A] block">
                  {realInsights.itemsCount}
                </span>
                <span className="text-[10px] font-semibold text-[#8E968C] uppercase tracking-wider block mt-0.5">
                  Items
                </span>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ECE8DF] text-center">
                <span className="font-serif font-bold text-2xl text-[#1A1D1A] block">
                  {realInsights.outfitTypesCount}
                </span>
                <span className="text-[10px] font-semibold text-[#8E968C] uppercase tracking-wider block mt-0.5">
                  Categories
                </span>
              </div>
            </div>

            {/* Most Used Items Section */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif font-bold text-sm text-[#1A1D1A]">
                Most Used Items
              </h3>

              {realInsights.mostUsed.length > 0 ? (
                <div className="space-y-2.5">
                  {realInsights.mostUsed.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#FAF8F5] rounded-2xl border border-[#ECE8DF]">
                      <div className="w-11 h-11 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shirt className="w-5 h-5 text-[#8E968C]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1A1D1A] truncate">{item.name}</p>
                          <span className="text-xs font-bold text-[#1E2E22]">{item.percent}%</span>
                        </div>
                        <p className="text-[10px] text-[#8E968C]">Used in {item.count} looks</p>
                        <div className="w-full bg-[#E5E0D6] rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div className="bg-[#1E2E22] h-full rounded-full" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8E968C] py-4 text-center">
                  Add looks to this collection to view real wear and piece utilization analytics.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setInsightsModalOpen(false)}
              className="mt-6 w-full py-3 bg-[#1A1D1A] text-white text-xs font-bold rounded-2xl cursor-pointer hover:bg-black transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 10: SHARE COLLECTION (Real Data)
          ========================================================================= */}
      {shareModalOpen && activeCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setShareModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto p-5 animate-slide-up-mobile">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
                <h2 className="font-serif font-bold text-lg text-[#1A1D1A]">
                  Share Collection
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-[#717670] hover:text-[#1A1D1A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-2xl border border-[#ECE8DF] my-4">
              {activeCollection.coverImage ? (
                <img
                  src={activeCollection.coverImage}
                  alt={activeCollection.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#E5E0D6] flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-[#717670]" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-base text-[#1A1D1A] leading-tight truncate">
                  {activeCollection.name}
                </h3>
                <p className="text-xs text-[#8E968C] mt-0.5">
                  {(activeCollection.looks || []).length} looks · {(activeCollection.items || []).length} items
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-[#ECE8DF]">
              <div>
                <p className="text-xs font-bold text-[#1A1D1A]">Make public link</p>
                <p className="text-[11px] text-[#8E968C]">Anyone with the link can view this collection</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPublicLink(!isPublicLink)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isPublicLink ? 'bg-[#1A1D1A]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    isPublicLink ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {(activeCollection.looks || []).length > 0 && (
              <div className="my-4">
                <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2">
                  Preview
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(activeCollection.looks || []).slice(0, 4).map((lk, idx) => (
                    <div key={idx} className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100">
                      {lk.image ? (
                        <img src={lk.image} alt={lk.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="w-4 h-4 text-[#8E968C]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="w-full py-3.5 bg-[#1A1D1A] hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Link2 className="w-4 h-4" />
                <span>Copy Link</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="w-full py-3 bg-white border border-[#ECE8DF] hover:bg-[#FAF8F5] text-[#1A1D1A] text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
