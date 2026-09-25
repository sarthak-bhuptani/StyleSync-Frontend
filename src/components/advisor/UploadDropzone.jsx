import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Compass,
  Link,
  Check,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Globe,
  ExternalLink,
  ArrowRight,
  Camera
} from 'lucide-react';
import { productApi } from '../../api/productApi';

export const UploadDropzone = ({ onProductReady, initialProduct = null }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState('photo'); // 'photo' | 'url'
  const [imagePreview, setImagePreview] = useState(initialProduct?.image || null);
  const [productData, setProductData] = useState({
    name: initialProduct?.name || '',
    brand: initialProduct?.brand || '',
    category: initialProduct?.category || 'Tops',
    price: initialProduct?.price || '',
    color: initialProduct?.color || '',
    description: initialProduct?.description || ''
  });
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgData = e.target.result;
      const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const isAutoName = /^\d+$/.test(rawName) || rawName.toLowerCase().startsWith('screenshot') || rawName.toLowerCase().startsWith('image');
      setImagePreview(imgData);
      setProductData(prev => ({
        ...prev,
        name: prev.name || (isAutoName ? '' : rawName),
        image: imgData
      }));
    };
    reader.readAsDataURL(file);
  };

  const processFileFromUrl = (url, name, category, color) => {
    setImagePreview(url);
    setProductData(prev => ({
      ...prev,
      name: name || 'Sample Product',
      category: category || 'Tops',
      color: color || '',
      image: url
    }));
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlError('');
    try {
      const data = await productApi.parseProductUrl(urlInput.trim());
      if (data && data.image) {
        setImagePreview(data.image);
        setProductData(prev => ({
          ...prev,
          name: data.name || prev.name,
          brand: data.brand || prev.brand,
          category: data.category || prev.category,
          price: data.price ? String(data.price) : prev.price,
          color: data.color || prev.color,
          description: data.description || prev.description,
          image: data.image
        }));
      } else {
        throw new Error('Could not find product image in URL.');
      }
    } catch (err) {
      setUrlError(err.response?.data?.message || err.message || 'Could not parse URL. Please upload a photo or screenshot instead.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) return;
    onProductReady({
      ...productData,
      image: imagePreview
    });
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Studio Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-subtle">
        {!imagePreview ? (
          <div className="space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setUploadMode('photo')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadMode === 'photo'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo / Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadMode === 'url'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Store Link</span>
              </button>
            </div>

            {/* Mode 1: Photo Upload Dropzone */}
            {uploadMode === 'photo' && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => galleryInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-slate-900 bg-slate-50 scale-[1.01]'
                    : 'border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Camera className="w-6 h-6 text-slate-800" />
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">
                  Upload piece or take photo
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-xs mx-auto">
                  Drag & drop screenshot or tap to choose from your photos
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition-colors">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  <span>Choose Image</span>
                </div>
              </div>
            )}

            {/* Mode 2: Store URL Parser */}
            {uploadMode === 'url' && (
              <form onSubmit={handleUrlSubmit} className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Paste Product URL</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">Supports links from Zara, Myntra, ASOS, Nike, Uniqlo, or direct image links.</p>
                  
                  <div className="relative">
                    <input
                      type="url"
                      required
                      placeholder="https://www.zara.com/... or image link"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 pr-20"
                    />
                    <button
                      type="submit"
                      disabled={urlLoading || !urlInput.trim()}
                      className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {urlLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      <span>{urlLoading ? 'Loading' : 'Fetch'}</span>
                    </button>
                  </div>
                </div>

                {urlError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{urlError}</span>
                  </div>
                )}
              </form>
            )}

            {/* Quick Demo Samples - Single Scrollable Row */}
            <div className="pt-2 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-slate-400 text-[11px] font-medium shrink-0">Sample pieces:</span>
              <button
                type="button"
                onClick={() => processFileFromUrl('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', 'Clean Leather Sneakers', 'Shoes', 'White')}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
              >
                👟 Sneakers
              </button>
              <button
                type="button"
                onClick={() => processFileFromUrl('https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80', 'Classic Sunglasses', 'Eyewear', 'Tortoise')}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
              >
                🕶️ Sunglasses
              </button>
              <button
                type="button"
                onClick={() => processFileFromUrl('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', 'Linen Resort Shirt', 'Tops', 'Terracotta')}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
              >
                👕 Linen Shirt
              </button>
            </div>
          </div>
        ) : (
          /* Preview & Metadata Form */
          <div className="text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Product Details
              </span>
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setProductData({ name: '', brand: '', category: 'Tops', price: '', color: '', description: '' });
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Change Photo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              <div className="md:col-span-5">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs max-w-xs mx-auto md:max-w-none">
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={productData.name}
                      onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                      placeholder="e.g. Classic White Low-Tops"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Brand (Optional)
                    </label>
                    <input
                      type="text"
                      value={productData.brand}
                      onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                      placeholder="e.g. Zara / Nike"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Category
                    </label>
                    <select
                      value={productData.category}
                      onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white cursor-pointer"
                    >
                      <option value="Eyewear">Eyewear</option>
                      <option value="Tops">Tops & Shirts</option>
                      <option value="Bottoms">Bottoms & Pants</option>
                      <option value="Shoes">Footwear & Shoes</option>
                      <option value="Outerwear">Outerwear & Jackets</option>
                      <option value="Bags">Bags</option>
                      <option value="Watches">Watches</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={productData.price}
                      onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                      placeholder="2999"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Colorway
                    </label>
                    <input
                      type="text"
                      value={productData.color}
                      onChange={(e) => setProductData({ ...productData, color: e.target.value })}
                      placeholder="e.g. Olive"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full mt-2 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Get Stylist Assessment</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Pillars Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <p className="font-extrabold text-slate-900 mb-0.5">👤 Face & Cut Fit</p>
          <p className="text-slate-500 text-[11px]">Checks neckline or eyewear frame against facial geometry.</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <p className="font-extrabold text-slate-900 mb-0.5">🎨 Skin Undertone</p>
          <p className="text-slate-500 text-[11px]">Verifies shade harmony with your seasonal color palette.</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <p className="font-extrabold text-slate-900 mb-0.5">🔄 Capsule Synergy</p>
          <p className="text-slate-500 text-[11px]">Tests pairing compatibility with items already in your closet.</p>
        </div>
      </div>
    </div>
  );
};

export default UploadDropzone;
