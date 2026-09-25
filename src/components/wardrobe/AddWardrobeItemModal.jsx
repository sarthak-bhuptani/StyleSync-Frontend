import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import {
  Camera,
  UploadCloud,
  Check,
  X,
  Sparkles,
  Loader2,
  Trash2
} from 'lucide-react';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];

export const AddWardrobeItemModal = ({ isOpen, onClose, onAdd }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tops',
    brand: '',
    color: 'Navy Blue',
    price: '',
    image: null
  });

  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  const handleImageFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (ev) => {
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        
        setIsAnalyzingPhoto(true);
        
        // Auto-detect basic category from filename if present
        let detectedCategory = 'Tops';
        let detectedColor = 'Navy Blue';
        const lower = cleanName.toLowerCase();
        
        if (lower.includes('pant') || lower.includes('jean') || lower.includes('trouser') || lower.includes('short') || lower.includes('chino')) {
          detectedCategory = 'Bottoms';
        } else if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot') || lower.includes('loafer')) {
          detectedCategory = 'Shoes';
        } else if (lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer') || lower.includes('hoodie')) {
          detectedCategory = 'Outerwear';
        } else if (lower.includes('watch') || lower.includes('bag') || lower.includes('glass')) {
          detectedCategory = 'Accessories';
        }

        if (lower.includes('black')) detectedColor = 'Black';
        else if (lower.includes('white')) detectedColor = 'White';
        else if (lower.includes('beige') || lower.includes('khaki')) detectedColor = 'Beige';
        else if (lower.includes('olive') || lower.includes('green')) detectedColor = 'Olive Green';

        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            image: ev.target.result,
            name: prev.name || cleanName || 'New Wardrobe Item',
            category: detectedCategory,
            color: detectedColor
          }));
          setIsAnalyzingPhoto(false);
        }, 300);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAdd({
      ...formData,
      image: formData.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      price: Number(formData.price) || 2499,
      usageCount: 0
    });

    // Reset & close
    setFormData({
      name: '',
      category: 'Tops',
      brand: '',
      color: 'Navy Blue',
      price: '',
      image: null
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Closet" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden File & Camera Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageFile}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
        />

        {/* 1. Photo Capture Box */}
        <div>
          {formData.image ? (
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
              <img
                src={formData.image}
                alt="Selected clothing"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 shadow-md transition-all cursor-pointer"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 text-center bg-slate-50 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-white text-slate-600 shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-2.5">
                {isAnalyzingPhoto ? (
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-800">Snap or Upload Clothing Photo</p>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-3.5">
                Take a clean photo against a flat surface
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>Photo Library</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Item Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Item Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Oxford Cotton Button-Down"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        {/* 3. Category Selector Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = formData.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Brand & Color (2 Columns) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brand (Optional)
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. Uniqlo, Zara"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Color
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g. White, Navy"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* 5. Price (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Price / Value (₹)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 2499"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!formData.name.trim()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-floating transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Add Item to Wardrobe</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddWardrobeItemModal;
