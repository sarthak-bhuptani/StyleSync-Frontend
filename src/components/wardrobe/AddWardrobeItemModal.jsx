import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UploadCloud, Sparkles, Check } from 'lucide-react';

export const AddWardrobeItemModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tops',
    brand: '',
    color: 'White',
    colorHex: '#FFFFFF',
    style: 'Smart Casual / Minimal',
    price: '',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
  });

  const presetImages = [
    { label: 'White Oxford Shirt', category: 'Tops', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', color: 'White', colorHex: '#FFFFFF' },
    { label: 'Black Selvedge Denim', category: 'Bottoms', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', color: 'Black', colorHex: '#111827' },
    { label: 'Khaki Trench Coat', category: 'Outerwear', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80', color: 'Camel Tan', colorHex: '#C19A6B' },
    { label: 'Suede Chelsea Boots', category: 'Shoes', url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80', color: 'Tobacco Brown', colorHex: '#704214' },
    { label: 'Steel Minimal Watch', category: 'Watches', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80', color: 'Silver', colorHex: '#C0C0C0' },
    { label: 'Canvas Tote Bag', category: 'Bags', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', color: 'Off-White', colorHex: '#F5F5DC' }
  ];

  const handleCustomFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({
          ...prev,
          image: ev.target.result,
          name: prev.name || e.target.files[0].name.replace(/\.[^/.]+$/, '')
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onAdd({
      ...formData,
      price: Number(formData.price) || 2999
    });
    onClose();
    // Reset form
    setFormData({
      name: '',
      category: 'Tops',
      brand: '',
      color: 'White',
      colorHex: '#FFFFFF',
      style: 'Smart Casual / Minimal',
      price: '',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Item to Wardrobe" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Photo or Upload
          </label>
          <div className="grid grid-cols-6 gap-2 mb-3">
            {presetImages.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData({ ...formData, image: p.url, category: p.category, color: p.color, colorHex: p.colorHex })}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  formData.image === p.url ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-1' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                {formData.image === p.url && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-xl cursor-pointer text-xs font-semibold text-slate-600 transition-colors">
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Upload custom photo from computer</span>
            <input type="file" accept="image/*" onChange={handleCustomFileUpload} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Linen Blend Resort Shirt"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Shoes">Shoes</option>
              <option value="Eyewear">Eyewear</option>
              <option value="Bags">Bags</option>
              <option value="Watches">Watches</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              placeholder="e.g. Uniqlo"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Color Name
            </label>
            <input
              type="text"
              placeholder="e.g. Olive Green"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              placeholder="2990"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Save to Wardrobe
          </button>
        </div>
      </form>
    </Modal>
  );
};
