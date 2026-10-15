import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import {
  Camera,
  UploadCloud,
  Check,
  X,
  Loader2,
  RefreshCw,
  Palette,
  Tag,
  ChevronDown
} from 'lucide-react';
import { analyzeWardrobeItem } from '../../api/wardrobeApi';
import { getCanonicalCategory } from '../../utils/categoryUtils';

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];
const SEASONS = ['All-Season', 'Summer', 'Winter', 'Spring/Fall'];
const FORMALITIES = ['Casual', 'Smart Casual', 'Business Formal', 'Party', 'Sportswear'];

export const rgbToHex = (r, g, b) => {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// Accurate color classification from RGB
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

  // 1. Genuine Monochromes
  if (light < 15) return 'Black';
  if (light > 88 && sat < 12) return 'White';

  // 2. True Grayscale (Only when saturation is exceptionally low)
  if (sat < 8) {
    if (light < 35) return 'Charcoal Grey';
    if (light < 65) return 'Grey';
    return 'Light Grey';
  }

  // 3. Earthy Neutrals (Beige, Cream, Khaki, Brown)
  if (hue >= 20 && hue <= 50) {
    if (light > 75 && sat < 35) return 'Cream';
    if (light > 58 && sat < 40) return 'Beige';
    if (light >= 38 && light <= 58 && sat < 45) return 'Khaki';
    if (light < 35 && sat >= 15) return 'Dark Brown';
    if (light < 48) return 'Brown';
    return 'Tan';
  }

  // 4. Red / Burgundy / Maroon / Pink
  if (hue >= 345 || hue < 15) {
    if (light < 28) return 'Burgundy';
    if (light < 48) return 'Maroon';
    if (light > 72) return 'Pink';
    return 'Red';
  }

  // 5. Rust / Orange / Camel
  if (hue >= 15 && hue < 45) {
    if (light < 32) return 'Dark Brown';
    if (light < 55 && sat > 50) return 'Rust';
    if (sat < 35) return 'Camel';
    return 'Orange';
  }

  // 6. Mustard / Yellow / Sand
  if (hue >= 45 && hue < 70) {
    if (light < 45) return 'Mustard';
    if (sat < 30) return 'Sand';
    return 'Yellow';
  }

  // 7. Greens (Olive, Sage, Emerald, Forest)
  if (hue >= 70 && hue < 165) {
    if (light < 28) return 'Forest Green';
    if (hue >= 70 && hue <= 115) return 'Olive Green';
    if (light > 62 && sat < 40) return 'Sage Green';
    if (sat > 45) return 'Emerald Green';
    return 'Green';
  }

  // 8. Teal & Cyan
  if (hue >= 165 && hue < 195) {
    if (light < 40) return 'Dark Teal';
    return 'Teal';
  }

  // 9. Blues (Navy, Royal, Denim, Sky)
  if (hue >= 195 && hue < 255) {
    if (light < 28) return 'Navy Blue';
    if (light >= 28 && light < 52 && sat > 35) return 'Royal Blue';
    if (sat < 30 && light < 55) return 'Denim Blue';
    if (light > 68) return 'Sky Blue';
    return 'Blue';
  }

  // 10. Purple & Violet
  if (hue >= 255 && hue < 315) {
    if (light < 28) return 'Deep Purple';
    if (light > 68) return 'Lavender';
    return 'Purple';
  }

  // 11. Magenta & Plum
  if (hue >= 315 && hue < 345) {
    if (light < 32) return 'Plum';
    if (light > 68) return 'Pink';
    return 'Magenta';
  }

  return 'Navy Blue';
};

// Dominant clothing color cluster extraction from canvas (ignores background and extracts true garment color)
export const extractDominantClothingColor = (ctx, width, height) => {
  try {
    const startX = Math.floor(width * 0.15);
    const startY = Math.floor(height * 0.15);
    const sampleW = Math.max(1, Math.floor(width * 0.7));
    const sampleH = Math.max(1, Math.floor(height * 0.7));

    const imgData = ctx.getImageData(startX, startY, sampleW, sampleH).data;

    // Color histogram quantization
    const colorBuckets = new Map();
    let totalSampled = 0;
    let fallbackR = 0, fallbackG = 0, fallbackB = 0;

    for (let i = 0; i < imgData.length; i += 8) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      if (a < 128) continue; // Skip transparent pixels

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      const l = (max + min) / 2 / 255;
      const s = l > 0.5 ? delta / (510 - max - min) : delta / (max + min || 1);

      // Ignore pure white background (e.g. ecommerce white background or glare)
      if (l > 0.94 && s < 0.1) continue;

      // Ignore pure black borders
      if (l < 0.05) continue;

      // Quantize to 16-level buckets
      const qR = Math.floor(r / 16) * 16 + 8;
      const qG = Math.floor(g / 16) * 16 + 8;
      const qB = Math.floor(b / 16) * 16 + 8;
      const key = `${qR},${qG},${qB}`;

      // Weight saturated garment colors over neutral background reflections
      const weight = 1 + (s * 2.0);
      const current = colorBuckets.get(key) || { r: 0, g: 0, b: 0, count: 0, weight: 0 };
      current.r += r;
      current.g += g;
      current.b += b;
      current.count += 1;
      current.weight += weight;
      colorBuckets.set(key, current);

      fallbackR += r;
      fallbackG += g;
      fallbackB += b;
      totalSampled++;
    }

    if (colorBuckets.size === 0) {
      if (totalSampled === 0) return { name: 'Navy Blue', hex: '#1E3A8A' };
      const avgR = Math.round(fallbackR / totalSampled);
      const avgG = Math.round(fallbackG / totalSampled);
      const avgB = Math.round(fallbackB / totalSampled);
      return {
        name: mapRgbToColorName(avgR, avgG, avgB),
        hex: rgbToHex(avgR, avgG, avgB)
      };
    }

    // Find the winning dominant color bucket
    let bestBucket = null;
    let maxWeight = -1;

    for (const bucket of colorBuckets.values()) {
      if (bucket.weight > maxWeight) {
        maxWeight = bucket.weight;
        bestBucket = bucket;
      }
    }

    const dominantR = Math.round(bestBucket.r / bestBucket.count);
    const dominantG = Math.round(bestBucket.g / bestBucket.count);
    const dominantB = Math.round(bestBucket.b / bestBucket.count);

    return {
      name: mapRgbToColorName(dominantR, dominantG, dominantB),
      hex: rgbToHex(dominantR, dominantG, dominantB)
    };
  } catch (err) {
    console.warn('Dominant color extraction error:', err);
    return { name: 'Navy Blue', hex: '#1E3A8A' };
  }
};

export const detectGarmentTypeFromCanvas = (ctx, width, height) => {
  try {
    const imgData = ctx.getImageData(0, 0, width, height).data;
    let topVariance = 0;
    let bottomVariance = 0;
    const halfH = Math.floor(height / 2);

    for (let y = 10; y < height - 10; y += 8) {
      for (let x = 10; x < width - 10; x += 8) {
        const i = (y * width + x) * 4;
        const diff = Math.abs(imgData[i] - imgData[i + 4]);
        if (y < halfH) {
          topVariance += diff;
        } else {
          bottomVariance += diff;
        }
      }
    }

    // Jeans & folded trousers have high crease contrast across vertical span
    if (height >= width * 0.95 && bottomVariance > topVariance * 0.8) {
      return 'Bottoms';
    }
    return 'Tops';
  } catch {
    return 'Tops';
  }
};

// Client-side image compression, dominant color & garment type extraction
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
        resolve({ dataUrl: event.target.result, detectedColor: '', detectedHex: '', detectedCat: 'Tops' });
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
            resolve({ dataUrl: event.target.result, detectedColor: '', detectedHex: '', detectedCat: 'Tops' });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Extract true dominant clothing color & visual heuristic category
          const { name: detectedColor, hex: detectedHex } = extractDominantClothingColor(ctx, width, height);
          const detectedCat = detectGarmentTypeFromCanvas(ctx, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          resolve({ dataUrl, detectedColor, detectedHex, detectedCat });
        } catch {
          resolve({ dataUrl: event.target.result, detectedColor: '', detectedHex: '', detectedCat: 'Tops' });
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
    subcategory: '',
    brand: '',
    color: '',
    colorHex: '#1E3A8A',
    fabric: '',
    pattern: 'Solid',
    season: 'All-Season',
    formality: 'Smart Casual',
    tags: [],
    price: '',
    image: null
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const normalizeCategory = (cat, subcat = '', name = '') => {
    return getCanonicalCategory({ category: cat, subcategory: subcat, name });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset native input value so picking same photo triggers change
    e.target.value = '';

    setIsAnalyzing(true);
    setErrorMessage('');
    setAiConfidence(null);

    try {
      // 1. Fast client-side image compression, dominant color & visual category detection
      const { dataUrl: compressedBase64, detectedColor: fallbackColor, detectedHex: fallbackHex, detectedCat: visualCat } =
        await compressImageFile(file);

      // Set initial preview immediately so UI is responsive
      setFormData((prev) => ({
        ...prev,
        image: compressedBase64,
        category: visualCat || prev.category || 'Tops',
        color: fallbackColor || prev.color || 'Navy Blue',
        colorHex: fallbackHex || prev.colorHex || '#1E3A8A'
      }));

      // 2. Dispatch backend Gemini AI Vision auto-analysis (try File first, fallback to base64)
      let aiResult = await analyzeWardrobeItem(file);
      if (!aiResult?.success && compressedBase64) {
        aiResult = await analyzeWardrobeItem({ image: compressedBase64 });
      }

      const rawName = file.name ? file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : '';
      const isNumericFilename = /^\d+$/.test(rawName.trim());
      const cleanName = isNumericFilename
        ? `${fallbackColor || 'Modern'} ${visualCat === 'Bottoms' ? 'Trousers' : 'Clothing Piece'}`
        : rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';

      if (aiResult?.success && aiResult?.data) {
        const aiData = aiResult.data;
        const normalizedCat = normalizeCategory(aiData.category, aiData.subcategory, aiData.name);

        setFormData((prev) => ({
          ...prev,
          image: aiData.imageUrl || compressedBase64,
          name: aiData.name || cleanName || prev.name,
          category: normalizedCat || visualCat || prev.category || 'Tops',
          subcategory: aiData.subcategory || prev.subcategory || '',
          color: aiData.color || fallbackColor || prev.color,
          colorHex: aiData.colorHex || fallbackHex || prev.colorHex || '#1E3A8A',
          fabric: aiData.fabric || prev.fabric || '',
          pattern: aiData.pattern || prev.pattern || 'Solid',
          season: aiData.season || prev.season || 'All-Season',
          formality: aiData.formality || prev.formality || 'Smart Casual',
          tags: Array.isArray(aiData.tags) && aiData.tags.length > 0 ? aiData.tags : prev.tags
        }));

        setAiConfidence(aiData.confidence || '96%');
        setShowAdvanced(true);
      } else {
        // Fallback: Use visual shape heuristic & local canvas detection
        const fallbackCat = isNumericFilename ? (visualCat || 'Tops') : normalizeCategory('', '', cleanName);

        setFormData((prev) => ({
          ...prev,
          name: prev.name || cleanName || 'Clothing Piece',
          category: fallbackCat || visualCat || prev.category || 'Tops',
          color: fallbackColor || prev.color || 'Navy Blue',
          colorHex: fallbackHex || prev.colorHex || '#1E3A8A'
        }));
      }
    } catch (err) {
      console.error('Error during wardrobe photo analysis:', err);
      setErrorMessage('Could not analyze photo with AI, but image was loaded.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !formData.tags.includes(val)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, val] }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAdd({
      ...formData,
      name: formData.name.trim(),
      subcategory: formData.subcategory.trim() || '',
      brand: formData.brand.trim() || '',
      color: formData.color.trim() || 'Custom',
      colorHex: formData.colorHex || '#1E3A8A',
      fabric: formData.fabric.trim() || '',
      pattern: formData.pattern || 'Solid',
      season: formData.season || 'All-Season',
      formality: formData.formality || 'Smart Casual',
      tags: formData.tags || [],
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
      subcategory: '',
      brand: '',
      color: '',
      colorHex: '#1E3A8A',
      fabric: '',
      pattern: 'Solid',
      season: 'All-Season',
      formality: 'Smart Casual',
      tags: [],
      price: '',
      image: null
    });
    setAiConfidence(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Wardrobe" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-[#1A1D1A]">
        {/* Hidden File & Camera Inputs */}
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

        {/* 1. Photo Capture Box matching Image 15 */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white rounded-3xl border border-[#ECE8DF] p-6 flex flex-col items-center justify-center text-center shadow-2xs aspect-[4/3] cursor-pointer hover:border-[#1A1D1A]/30 transition-all relative overflow-hidden group"
        >
          {formData.image ? (
            <>
              <img
                src={formData.image}
                alt="Selected clothing"
                className="w-full h-full object-contain rounded-2xl"
              />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
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
                <p className="font-bold text-sm sm:text-base text-[#1A1D1A]">
                  {isAnalyzing ? 'Analyzing photo...' : 'Upload a photo'}
                </p>
                <p className="text-xs text-[#8E968C] mt-0.5">
                  or take one with your camera
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. ITEM DETAILS Section matching Image 15 */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block">
            ITEM DETAILS
          </span>

          <div className="space-y-2.5">
            {/* Category */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#717670] font-medium w-20 shrink-0">Category</span>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex-1 bg-white border border-[#ECE8DF] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#1A1D1A] focus:outline-none shadow-2xs cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#717670] font-medium w-20 shrink-0">Color</span>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Olive, Navy, Beige"
                className="flex-1 bg-white border border-[#ECE8DF] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#1A1D1A] focus:outline-none shadow-2xs"
              />
            </div>

            {/* Brand */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#717670] font-medium w-20 shrink-0">Brand</span>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Optional"
                className="flex-1 bg-white border border-[#ECE8DF] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#1A1D1A] placeholder:text-[#A0A69F] focus:outline-none shadow-2xs"
              />
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#717670] font-medium w-20 shrink-0">Price</span>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="₹0"
                className="flex-1 bg-white border border-[#ECE8DF] rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#1A1D1A] placeholder:text-[#A0A69F] focus:outline-none shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 bg-[#111827] hover:bg-[#030712] text-white rounded-2xl font-bold text-xs shadow-xs cursor-pointer active:scale-[0.98] transition-all"
          >
            Add to wardrobe
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddWardrobeItemModal;
