import React, { useState } from 'react';
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
  Sun
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { WardrobeCard } from '../components/wardrobe/WardrobeCard';
import { AddWardrobeItemModal } from '../components/wardrobe/AddWardrobeItemModal';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const WardrobePage = () => {
  const { wardrobe, isLoading, refreshWardrobe, addWardrobeItem, updateWardrobeItem, deleteWardrobeItem } =
    useWardrobe();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshWardrobe(true);
    setIsRefreshing(false);
  };

  const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Eyewear', 'Accessories', 'Bags', 'Watches'];

  // Filter items
  const filteredItems = wardrobe.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  return (
    <div className="space-y-4 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Desktop Header Bar (hidden on mobile to prevent duplicate titles) */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Wardrobe
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {wardrobe.length} {wardrobe.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your clothes, view wear count, and generate personalized outfits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Mobile Top Bar with Quick Action */}
      <div className="flex lg:hidden items-center justify-between gap-2 px-0.5">
        <span className="text-xs font-bold text-slate-500">
          {wardrobe.length} {wardrobe.length === 1 ? 'piece' : 'pieces'} in closet
        </span>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, brand, or color..."
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

        {/* Category Filter Chips - Balanced 3-column grid on mobile */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
          {['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-1.5 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wardrobe Content: Shimmer Skeleton vs. Items Grid vs. Empty State */}
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
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredItems.map((item) => (
            <WardrobeCard
              key={item.id}
              item={item}
              onViewDetails={(it) => setSelectedItemForView(it)}
              onEdit={(it) => setEditingItem(it)}
              onDelete={(it) => handleRequestDelete(it)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 py-10 px-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {searchQuery ? 'No matching items' : 'Your wardrobe is empty'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search keywords or choosing another category.'
                : 'Upload photos of your clothes to get daily weather-matched outfit recommendations.'}
            </p>
          </div>
          {!searchQuery && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Your First Item</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Wardrobe Item Modal / Bottom Sheet */}
      <AddWardrobeItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addWardrobeItem}
      />

      {/* View Item Details Bottom Sheet */}
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
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Category:</span>
                <strong className="text-slate-900 font-bold">{selectedItemForView.category}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Brand:</span>
                <strong className="text-slate-900 font-bold">{selectedItemForView.brand || 'Unspecified'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Color:</span>
                <strong className="text-slate-900 font-bold">{selectedItemForView.color}</strong>
              </div>
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

      {/* Edit Item Bottom Sheet */}
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

      {/* Delete Wardrobe Item Confirmation Modal */}
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
                  {itemToDelete.category} · {itemToDelete.color}
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
