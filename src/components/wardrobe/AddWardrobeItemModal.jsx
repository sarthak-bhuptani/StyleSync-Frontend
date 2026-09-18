import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import {
  UploadCloud,
  Check,
  Camera,
  Image as ImageIcon,
  Zap,
  Tag,
  Palette,
  Layers,
  X,
  Trash2
} from 'lucide-react';

export const AddWardrobeItemModal = ({ isOpen, onClose, onAdd }) => {
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState(null);

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
    { label: 'White Oxford Shirt', category: 'Tops', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', color: 'White', colorHex: '#FFFFFF', style: 'Smart Casual' },
    { label: 'Black Slim Denim', category: 'Bottoms', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', color: 'Black', colorHex: '#111827', style: 'Classic Casual' },
    { label: 'Beige Stretch Chinos', category: 'Bottoms', url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80', color: 'Beige', colorHex: '#D2B48C', style: 'Smart Casual' },
    { label: 'Navy Worker Jacket', category: 'Outerwear', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80', color: 'Navy', colorHex: '#1B263B', style: 'Urban Minimal' },
    { label: 'White Court Sneakers', category: 'Shoes', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80', color: 'White', colorHex: '#FAFAFA', style: 'Clean Minimal' },
    { label: 'Khaki Trench Coat', category: 'Outerwear', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80', color: 'Camel Tan', colorHex: '#C19A6B', style: 'Elevated' },
    { label: 'Suede Chelsea Boots', category: 'Shoes', url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80', color: 'Tobacco Brown', colorHex: '#704214', style: 'Smart Casual' },
    { label: 'Steel Minimal Watch', category: 'Watches', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80', color: 'Silver', colorHex: '#C0C0C0', style: 'Accessory' },
  ];

  const handleCustomFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        setIsScanning(true);
        setScanSuccessMessage(null);

        // Simulate AI Vision scanner detecting item attributes
        setTimeout(() => {
          let detectedCategory = 'Tops';
          let detectedColor = 'Navy / Blue';
          const lower = cleanName.toLowerCase();

          if (lower.includes('pant') || lower.includes('jean') || lower.includes('trouser') || lower.includes('short') || lower.includes('chino')) {
            detectedCategory = 'Bottoms';
          } else if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot') || lower.includes('sandal') || lower.includes('loafer')) {
            detectedCategory = 'Shoes';
          } else if (lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer') || lower.includes('hoodie') || lower.includes('sweater')) {
            detectedCategory = 'Outerwear';
          } else if (lower.includes('watch') || lower.includes('glass') || lower.includes('bag')) {
            detectedCategory = 'Accessories';
          }

          if (lower.includes('black')) detectedColor = 'Black';
          else if (lower.includes('white')) detectedColor = 'White';
          else if (lower.includes('beige') || lower.includes('khaki') || lower.includes('tan')) detectedColor = 'Beige';
          else if (lower.includes('green') || lower.includes('olive')) detectedColor = 'Olive Green';
          else if (lower.includes('grey') || lower.includes('gray')) detectedColor = 'Grey';

          setFormData({
            image: ev.target.result,
            name: cleanName || 'Custom Wardrobe Piece',
            category: detectedCategory,
            color: detectedColor,
            colorHex: '#334155',
            brand: 'Personal Wardrobe',
            style: 'Smart Casual',
            price: 2499
          });

          setIsScanning(false);
          setScanSuccessMessage(`AI Vision detected: ${detectedCategory} (${detectedColor})`);
        }, 600);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (p) => {
    setFormData({
      ...formData,
      image: p.url,
      name: p.label,
      category: p.category,
      color: p.color,
      colorHex: p.colorHex,
      style: p.style || 'Smart Casual'
    });
    setScanSuccessMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onAdd({
      ...formData,
      price: Number(formData.price) || 2499,
      usageCount: 0
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
    setScanSuccessMessage(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Item to Your Digital Wardrobe" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload & Presets Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Snap Photo or Upload Clothes</span>
            </label>
            <span className="text-[11px] text-slate-400">Click photo on hanger/bed or choose preset</span>
          </div>

          {/* Upload Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-slate-50 hover:bg-slate-100/80 border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-2xl cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Upload Photo from Computer/Phone</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Auto-categorizes & auto-tags color</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </div>

            {/* Live Preview Card */}
            <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 relative overflow-hidden">
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-bold text-emerald-300 z-10">
                  <Zap className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>AI Scanning item & colors...</span>
                </div>
              )}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={formData.image}
                  alt="Selected"
                  className="w-16 h-16 rounded-xl object-cover bg-white/10 border border-white/20 flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Selected Piece</span>
                  <p className="text-xs font-bold text-white truncate">{formData.name || 'Select or Upload'}</p>
                  <p className="text-[11px] text-slate-300 truncate">{formData.category} · {formData.color}</p>
                </div>
              </div>
              {formData.image && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      name: '',
                      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
                      brand: '',
                      color: 'White',
                      price: ''
                    }));
                    setScanSuccessMessage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  title="Remove / Clear Photo"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-all cursor-pointer flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* AI Scan feedback message */}
          {scanSuccessMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 mb-3 animate-fade-in">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>{scanSuccessMessage}</span>
            </div>
          )}

          {/* Quick Presets Grid */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Or Pick a Quick Capsule Preset:</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {presetImages.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  title={p.label}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    formData.image === p.url
                      ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-1'
                      : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
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
          </div>
        </div>

        {/* Item Details Fields */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Linen Blend Resort Shirt"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="Tops">Tops / Shirts</option>
                <option value="Bottoms">Bottoms / Trousers / Jeans</option>
                <option value="Outerwear">Outerwear / Jackets</option>
                <option value="Shoes">Shoes / Sneakers / Footwear</option>
                <option value="Eyewear">Eyewear / Sunglasses</option>
                <option value="Bags">Bags / Backpacks</option>
                <option value="Watches">Watches</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Color Name
              </label>
              <input
                type="text"
                placeholder="e.g. Olive Green"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brand (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Uniqlo / Zara"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approx. Price (₹)
              </label>
              <input
                type="number"
                placeholder="2499"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            Save to Wardrobe
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddWardrobeItemModal;
