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
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Closet" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
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
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, image: null }));
                    setAiConfidence(null);
                  }}
                  className="p-2 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white shadow-md transition-all cursor-pointer flex items-center justify-center"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status Pill on preview */}
              <div className="absolute bottom-2 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                    <span>AI analyzing garment &amp; color...</span>
                  </>
                ) : aiConfidence ? (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>AI Analyzed • {aiConfidence} match</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{formData.color ? `Color: ${formData.color}` : 'Ready to save'}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-5 text-center bg-slate-50 transition-colors relative">
              <div className="w-12 h-12 rounded-2xl bg-white text-slate-700 shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-2">
                {isAnalyzing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-700" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-900">
                {isAnalyzing ? '✨ AI is analyzing garment & color...' : 'Snap or Upload Clothing Photo'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-3.5">
                AI will auto-detect name, category, color, and fabric
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
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>
              Item Name <span className="text-rose-500">*</span>
            </span>
            {aiConfidence && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Suggested
              </span>
            )}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Navy Blue Oxford Cotton Shirt"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        {/* 3. Category Selector Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
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

        {/* 4. Color with Live Dynamic Swatch & Brand */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Color & Swatch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Color</span>
              {formData.colorHex && (
                <span className="text-[10px] text-slate-400 font-mono">{formData.colorHex}</span>
              )}
            </label>
            <div className="relative flex items-center">
              <div
                className="absolute left-3 w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 transition-colors"
                style={{ backgroundColor: formData.colorHex || '#1E3A8A' }}
                title={formData.color || 'Color preview'}
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Navy Blue, Olive Green"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brand (Optional)</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. Uniqlo, Zara"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* 5. Fabric & Pattern (2 Columns) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fabric / Material</label>
            <input
              type="text"
              value={formData.fabric}
              onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
              placeholder="e.g. Cotton, Denim, Linen"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pattern</label>
            <input
              type="text"
              value={formData.pattern}
              onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              placeholder="e.g. Solid, Striped, Plaid"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* 6. Price (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Price / Value (₹) <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 1999"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-emerald-500"
          />
        </div>

        {/* 7. Collapsible Advanced AI Attributes */}
        <div className="pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Styling Details (Season, Formality &amp; Tags)</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAdvanced && (
            <div className="space-y-3 pt-2.5 pb-1 animate-fade-in">
              {/* Season Selection Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Season</label>
                <div className="flex flex-wrap gap-1">
                  {SEASONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, season: s })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        formData.season === s
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formality Selection Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Formality</label>
                <div className="flex flex-wrap gap-1">
                  {FORMALITIES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormData({ ...formData, formality: f })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        formData.formality === f
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Pills */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tags &amp; Style Keywords
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[38px]">
                  {formData.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 text-slate-800 text-[10px] font-bold rounded-md shadow-2xs"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={formData.tags.length === 0 ? 'Type tag & press enter...' : 'Add more...'}
                    className="flex-1 min-w-[80px] bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!formData.name.trim() || isAnalyzing}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-floating transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>AI Analyzing Garment...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Save Item to Wardrobe</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddWardrobeItemModal;
