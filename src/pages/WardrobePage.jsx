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
  const { wardrobe, addWardrobeItem, updateWardrobeItem, deleteWardrobeItem } = useWardrobe();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const categories = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Eyewear', 'Accessories', 'Bags', 'Watches'];

  // Filter items
  const filteredItems = wardrobe.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleDeleteItem = (id, itemName = 'this item') => {
    if (window.confirm(`Are you sure you want to delete "${itemName}" from your wardrobe?`)) {
      deleteWardrobeItem(id);
      if (selectedItemForView?.id === id) setSelectedItemForView(null);
      if (editingItem?.id === id) setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200/60">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Digital Capsule Wardrobe</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">My Wardrobe</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {wardrobe.length} verified pieces in your personal styling rotation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/daily-stylist')}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sun className="w-3.5 h-3.5 text-emerald-600" />
            <span>Wear Today</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/wardrobe-gaps')}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>What to Buy</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-subtle hover:shadow transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Snap & Add Clothes</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search brand, color, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Wardrobe Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <WardrobeCard
              key={item.id}
              item={item}
              onViewDetails={(it) => setSelectedItemForView(it)}
              onEdit={(it) => setEditingItem(it)}
              onDelete={(id) => handleDeleteItem(id, item.name)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title={searchQuery ? 'No matching wardrobe items' : 'Your wardrobe is empty'}
          description={
            searchQuery
              ? 'Try changing your search terms or category filter.'
              : 'Upload photos of your clothes to get daily "Wear Today" outfit recommendations & discover what to buy next.'
          }
          actionLabel="Snap / Add First Item"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Wardrobe Item Modal */}
      <AddWardrobeItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addWardrobeItem}
      />

      {/* View Item Details Modal */}
      {selectedItemForView && (
        <Modal
          isOpen={!!selectedItemForView}
          onClose={() => setSelectedItemForView(null)}
          title={selectedItemForView.name}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
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
                onClick={() => handleDeleteItem(selectedItemForView.id, selectedItemForView.name)}
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
                value={editingItem.usageCount || 0}
                onChange={(e) => setEditingItem({ ...editingItem, usageCount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDeleteItem(editingItem.id, editingItem.name)}
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
    </div>
  );
};

export default WardrobePage;
