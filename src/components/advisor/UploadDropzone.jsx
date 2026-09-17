import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Link, Check, AlertCircle, ShieldCheck, CheckCircle2, Loader2, Globe, ExternalLink, ArrowRight } from 'lucide-react';
import { productApi } from '../../api/productApi';

export const UploadDropzone = ({ onProductReady, initialProduct = null }) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialProduct?.image || null);
  const [productData, setProductData] = useState({
    name: initialProduct?.name || '',
    brand: initialProduct?.brand || '',
    category: initialProduct?.category || 'Tops',
    price: initialProduct?.price || '',
    color: initialProduct?.color || '',
    description: initialProduct?.description || ''
  });
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [scrapedPreview, setScrapedPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) return;
    onProductReady({
      ...productData,
      image: imagePreview
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all bg-white shadow-subtle ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/40 scale-[1.01]'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {!imagePreview ? (
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Drop a product screenshot here
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Upload any clothes, shoes, goggles, or accessory photo to check suitability before buying.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
              >
                Upload Photo / Screenshot
              </button>

              <button
                type="button"
                onClick={() => setUrlModalOpen(true)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all flex items-center gap-2"
              >
                <Link className="w-4 h-4 text-slate-400" />
                <span>Paste Product URL</span>
              </button>
            </div>
          </div>
        ) : (
          /* Preview & Metadata Editor */
          <div className="text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                Product Image Loaded
              </span>
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setProductData({ name: '', brand: '', category: 'Clothing', price: '', color: '', description: '' });
                }}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
              >
                Change Image
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 relative group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productData.name}
                      onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                      placeholder="e.g. Classic White Low-Tops"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Brand (Optional)
                    </label>
                    <input
                      type="text"
                      value={productData.brand}
                      onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                      placeholder="e.g. Zara / Nike / Ray-Ban"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Category
                    </label>
                    <select
                      value={productData.category}
                      onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    >
                      <option value="Eyewear">Eyewear / Sunglasses / Goggles</option>
                      <option value="Tops">Tops / T-Shirts / Shirts</option>
                      <option value="Bottoms">Bottoms / Pants / Jeans</option>
                      <option value="Shoes">Shoes / Footwear</option>
                      <option value="Outerwear">Outerwear / Jackets</option>
                      <option value="Bags">Bags / Backpacks</option>
                      <option value="Watches">Watches</option>
                      <option value="Accessories">Other Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={productData.price}
                      onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                      placeholder="2999"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Colorway
                    </label>
                    <input
                      type="text"
                      value={productData.color}
                      onChange={(e) => setProductData({ ...productData, color: e.target.value })}
                      placeholder="e.g. Olive / Navy"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Details / Material (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    placeholder="100% linen, relaxed shoulders, UV polarized lenses, etc."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full mt-2 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
                >
                  <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                  <span>Analyze with StyleSync AI</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guidelines Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>How StyleSync Evaluates Your Items</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span><strong>Physical Harmony:</strong> Checks collar, silhouette, or goggles frame shape against your face & body build.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span><strong>Color Synergy:</strong> Verifies if the shade complements your skin undertone or clashes with avoid-colors.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span><strong>Wardrobe Match:</strong> Cross-references items in your closet to calculate outfit versatility.</span>
          </div>
        </div>
      </div>

      {/* Active 1-Click Shopping URL Modal */}
      {urlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-floating border border-slate-100 p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">1-Click Shopping URL Parser</h4>
                  <p className="text-[11px] text-slate-400">Paste any link from Zara, Myntra, Nike, Amazon, ASOS, H&M or image URL</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setUrlModalOpen(false); setUrlError(''); setScrapedPreview(null); }}
                className="w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!urlInput.trim()) return;
                setUrlLoading(true);
                setUrlError('');
                setScrapedPreview(null);
                try {
                  const data = await productApi.parseProductUrl(urlInput.trim());
                  setScrapedPreview(data);
                } catch (err) {
                  setUrlError(err.response?.data?.message || err.message || 'Could not parse URL. Please check link or paste a direct image URL.');
                } finally {
                  setUrlLoading(false);
                }
              }}
              className="space-y-3 mb-4"
            >
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://www.zara.com/in/en/... or direct image link"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white pr-24"
                />
                <button
                  type="submit"
                  disabled={urlLoading || !urlInput.trim()}
                  className="absolute right-2 top-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {urlLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{urlLoading ? 'Extracting...' : 'Fetch'}</span>
                </button>
              </div>

              {/* Sample Quick Links */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-500">Quick Samples:</span>
                <button
                  type="button"
                  onClick={() => setUrlInput('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Sneakers
                </button>
                <button
                  type="button"
                  onClick={() => setUrlInput('https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Sunglasses
                </button>
                <button
                  type="button"
                  onClick={() => setUrlInput('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  White Tee
                </button>
              </div>
            </form>

            {/* Error state */}
            {urlError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{urlError}</span>
              </div>
            )}

            {/* Scraped Product Preview Card */}
            {scrapedPreview && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl mb-4 animate-scale-in">
                <div className="flex items-center gap-3.5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0 shadow-xs">
                    <img
                      src={scrapedPreview.image}
                      alt={scrapedPreview.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                      {scrapedPreview.category} · {scrapedPreview.brand}
                    </span>
                    <h5 className="text-xs font-extrabold text-slate-900 truncate leading-snug">
                      {scrapedPreview.name}
                    </h5>
                    <p className="text-xs font-bold text-emerald-700 mt-1">
                      {scrapedPreview.price ? `₹${scrapedPreview.price}` : 'Price not listed'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(scrapedPreview.image);
                      setProductData(prev => ({
                        ...prev,
                        name: scrapedPreview.name,
                        brand: scrapedPreview.brand,
                        category: scrapedPreview.category,
                        price: scrapedPreview.price ? String(scrapedPreview.price) : prev.price,
                        color: scrapedPreview.color || prev.color,
                        description: scrapedPreview.description || prev.description,
                        image: scrapedPreview.image
                      }));
                      setUrlModalOpen(false);
                      setScrapedPreview(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Import & Prepare for Evaluation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {!scrapedPreview && !urlError && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mb-2 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>StyleSync extracts high-res images and product metadata securely using OpenGraph & Schema standards.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
