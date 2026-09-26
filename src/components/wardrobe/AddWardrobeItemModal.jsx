import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import {
  Camera,
  UploadCloud,
  Check,
  X,
  Sparkles,
  Loader2,
  RefreshCw,
  Palette
} from 'lucide-react';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];

// Color classification from RGB/HSV
export const mapRgbToColorName = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2 / 255;
  const s = l > 0.5 ? d / (510 - max - min) : d / (max + min || 1);

  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6;
    } else {
      h = ((r - g) / d + 4) / 6;
    }
  }

  const hue = Math.round(h * 360);
  const sat = Math.round(s * 100);
  const light = Math.round(l * 100);

  // 1. Monochromes (Black, White, Greys)
  if (light < 18) return 'Black';
  if (light > 85 && sat < 18) return 'White';
  if (sat < 14) {
    if (light < 40) return 'Charcoal Grey';
    if (light < 70) return 'Grey';
    return 'Light Grey';
  }

  // 2. Earthy Tones (Beige, Cream, Khaki, Brown)
  if (hue >= 20 && hue <= 50) {
    if (light > 75 && sat < 45) return 'Cream';
    if (light > 60 && sat < 50) return 'Beige';
    if (light >= 40 && light <= 60 && sat < 50) return 'Khaki';
    if (light < 35 && sat >= 20) return 'Brown';
    if (light < 50) return 'Tan';
  }

  // 3. Hue spectra
  if (hue >= 345 || hue < 15) {
    if (light < 30) return 'Burgundy';
    if (light < 50) return 'Maroon';
    if (light > 75) return 'Dusty Pink';
    return 'Red';
  }
  if (hue >= 15 && hue < 45) {
    if (light < 35) return 'Dark Brown';
    if (light < 55 && sat > 55) return 'Rust';
    if (sat < 40) return 'Camel';
    return 'Orange';
  }
  if (hue >= 45 && hue < 70) {
    if (light < 45) return 'Mustard';
    if (sat < 40) return 'Sand';
    return 'Yellow';
  }
  if (hue >= 70 && hue < 165) {
    if (light < 30) return 'Forest Green';
    if (hue >= 70 && hue <= 110) return 'Olive Green';
    if (light > 65) return 'Sage Green';
    return 'Emerald Green';
  }
  if (hue >= 165 && hue < 200) {
    if (light > 60) return 'Teal';
    return 'Cyan';
  }
  if (hue >= 200 && hue < 260) {
    if (light < 28) return 'Navy Blue';
    if (light < 52) return 'Royal Blue';
    if (light > 70) return 'Sky Blue';
    return 'Blue';
  }
  if (hue >= 260 && hue < 310) {
    if (light < 32) return 'Deep Purple';
    if (light > 70) return 'Lavender';
    return 'Purple';
  }
  if (hue >= 310 && hue < 345) {
    if (light > 70) return 'Pink';
    if (light < 35) return 'Plum';
    return 'Magenta';
  }

  return 'Navy Blue';
};

// Client-side image compression & automatic dominant color extraction
export const compressImageFile = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read photo'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        resolve({ dataUrl: event.target.result, detectedColor: '' });
      };
      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({ dataUrl: event.target.result, detectedColor: '' });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Extract dominant color from central 60% of the clothing item
          let detectedColor = '';
          try {
            const sampleX = Math.floor(width * 0.2);
            const sampleY = Math.floor(height * 0.2);
            const sampleW = Math.max(1, Math.floor(width * 0.6));
            const sampleH = Math.max(1, Math.floor(height * 0.6));

            const imgData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data;
            let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;

            for (let i = 0; i < imgData.length; i += 16) {
              const a = imgData[i + 3];
              if (a > 128) {
                rTotal += imgData[i];
                gTotal += imgData[i + 1];
                bTotal += imgData[i + 2];
                count++;
              }
            }

            if (count > 0) {
              const avgR = Math.round(rTotal / count);
              const avgG = Math.round(gTotal / count);
              const avgB = Math.round(bTotal / count);
              detectedColor = mapRgbToColorName(avgR, avgG, avgB);
            }
          } catch (colorErr) {
            console.warn('Color extraction warning:', colorErr);
          }

          // Export as compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ dataUrl, detectedColor });
        } catch {
          resolve({ dataUrl: event.target.result, detectedColor: '' });
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const AddWardrobeItemModal = ({ isOpen, onClose, onAdd }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tops',
    brand: '',
    color: '',
    price: '',
    image: null
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset native input value so selecting the same photo triggers change again
    e.target.value = '';

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { dataUrl: compressedBase64, detectedColor: autoExtractedColor } =
        await compressImageFile(file);

      const rawName = file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : '';
      const cleanName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';

      // Auto-detect basic category from filename if present
      let detectedCategory = formData.category || 'Tops';
      let detectedColor = autoExtractedColor || formData.color || '';
      const lower = (cleanName || '').toLowerCase();

      if (
        lower.includes('pant') ||
        lower.includes('jean') ||
        lower.includes('trouser') ||
        lower.includes('short') ||
        lower.includes('chino')
      ) {
        detectedCategory = 'Bottoms';
      } else if (
        lower.includes('shoe') ||
        lower.includes('sneaker') ||
        lower.includes('boot') ||
        lower.includes('loafer')
      ) {
        detectedCategory = 'Shoes';
      } else if (
        lower.includes('jacket') ||
        lower.includes('coat') ||
        lower.includes('blazer') ||
        lower.includes('hoodie') ||
        lower.includes('cardigan')
      ) {
        detectedCategory = 'Outerwear';
      } else if (
        lower.includes('watch') ||
        lower.includes('bag') ||
        lower.includes('glass') ||
        lower.includes('belt') ||
        lower.includes('hat')
      ) {
        detectedCategory = 'Accessories';
      }

      setFormData((prev) => ({
        ...prev,
        image: compressedBase64,
        name: prev.name ? prev.name : (cleanName || ''),
        category: detectedCategory,
        color: autoExtractedColor || prev.color || detectedColor || ''
      }));
    } catch (err) {
      console.error('Error processing wardrobe photo:', err);
      setErrorMessage('Could not load photo. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAdd({
      ...formData,
      name: formData.name.trim(),
      brand: formData.brand.trim() || '',
      color: formData.color.trim() || 'Custom',
      image:
        formData.image ||
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      price: formData.price ? Number(formData.price) : 0,
      usageCount: 0
    });

    // Reset & close
    setFormData({
      name: '',
      category: 'Tops',
      brand: '',
      color: '',
      price: '',
      image: null
    });
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Closet" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden File & Camera Inputs with unique IDs for native HTML label triggering */}
        <input
          id="wardrobe-camera-capture"
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', width: '1px', height: '1px' }}
        />
        <input
          id="wardrobe-photo-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', width: '1px', height: '1px' }}
        />

        {/* 1. Photo Capture Box */}
        <div>
          {formData.image ? (
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group shadow-2xs">
              <img
                src={formData.image}
                alt="Selected clothing"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <label
                  htmlFor="wardrobe-photo-upload"
                  className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-md transition-all cursor-pointer flex items-center justify-center"
                  title="Change photo"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </label>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: null }))}
                  className="p-2 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white shadow-md transition-all cursor-pointer flex items-center justify-center"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>
                  {formData.color ? `Color detected: ${formData.color}` : 'Optimized & Ready'}
                </span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-5 text-center bg-slate-50 transition-colors relative">
              <div className="w-12 h-12 rounded-2xl bg-white text-slate-700 shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-2">
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-700" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-900">
                {isProcessing ? 'Analyzing & extracting clothing color...' : 'Snap or Upload Clothing Photo'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-3.5">
                Take a photo with your camera or choose from gallery
              </p>

              {errorMessage && (
                <p className="text-xs font-semibold text-rose-600 mb-2">{errorMessage}</p>
              )}

              <div className="flex items-center justify-center gap-2.5">
                <label
                  htmlFor="wardrobe-camera-capture"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Take Photo</span>
                </label>

                <label
                  htmlFor="wardrobe-photo-upload"
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                  <span>Photo Library</span>
                </label>
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
            placeholder="e.g. Linen Button-Down Shirt"
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
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Color</span>
              {formData.color && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <Palette className="w-3 h-3" /> Auto-detected
                </span>
              )}
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g. Navy Blue, White"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* 5. Price (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Price / Value (₹) <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 1999 (Leave empty if none)"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!formData.name.trim() || isProcessing}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-floating transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Processing Photo...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Add Item to Wardrobe</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddWardrobeItemModal;
