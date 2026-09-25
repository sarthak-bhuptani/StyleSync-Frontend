import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  Shirt,
  Share2,
  Bookmark,
  Check,
  Trash2,
  User,
  Smile,
  Palette,
  Ruler,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { productApi } from '../api/productApi';
import { RecommendationBadge } from '../components/common/RecommendationBadge';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { Modal } from '../components/common/Modal';

export const ProductResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wardrobe, showToast, deleteAnalyzedProduct } = useWardrobe();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [completeLook, setCompleteLook] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await productApi.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    const fetchCompleteLook = async () => {
      if (!product) return;
      try {
        const lookData = await productApi.completeTheLook(id, product);
        setCompleteLook(lookData);
      } catch (e) {
        console.error('Failed to load complete the look:', e);
      }
    };
    fetchCompleteLook();
  }, [product, id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-slate-900 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-500">Loading evaluation...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold border border-slate-200 shadow-xs">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          This evaluation is no longer in your history.
        </p>
        <button
          onClick={() => navigate('/advisor')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
        >
          Evaluate New Item
        </button>
      </div>
    );
  }

  // Compatible items from actual wardrobe
  const compatibleItems = wardrobe.filter(w =>
    product.compatibleWardrobeIds?.includes(w.id) ||
    (product.category === 'Shoes' && ['Bottoms', 'Tops'].includes(w.category)) ||
    (product.category === 'Tops' && ['Bottoms', 'Shoes', 'Outerwear'].includes(w.category)) ||
    (product.category === 'Outerwear' && ['Tops', 'Bottoms'].includes(w.category))
  ).slice(0, 4);

  const handleSaveToWishlist = () => {
    setSaved(!saved);
    showToast(saved ? 'Removed from saved items' : 'Saved to wishlist', 'success');
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAnalyzedProduct(id);
      setIsDeleteModalOpen(false);
      navigate('/advisor');
    } catch (err) {
      console.warn('Delete product warning:', err);
      setIsDeleteModalOpen(false);
      navigate('/advisor');
    } finally {
      setIsDeleting(false);
    }
  };

  const estimatedWears = completeLook?.costPerWear?.estimatedWears || 50;
  const price = product.price || 0;
  const costPerWear = Math.max(1, Math.round(price / estimatedWears));

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in pb-16">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2.5">
        <button
          onClick={() => navigate('/advisor')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Evaluator</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToWishlist}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              saved ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={() => showToast('Link copied to clipboard', 'info')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            title="Delete evaluation"
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 1. Main Product & Verdict Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-subtle">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 items-center">
          {/* Product Image */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[220px] md:max-w-none aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs group">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-4 text-center">
                  <Shirt className="w-10 h-10 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">{product.category || 'Product'}</span>
                </div>
              )}
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-bold rounded-lg shadow-xs border border-white/60">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Meta & Match Score */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {product.brand} · {product.color}
                </span>
                <RecommendationBadge decision={product.decision} size="md" />
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xl font-black text-slate-900">
                  {product.currency || '₹'}{price.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                  Retail Price
                </span>
              </div>
            </div>

            {/* Score Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Compatibility Match
                </span>
                <p className="text-xs text-slate-600 font-normal">
                  Calculated against your styling profile and closet assets.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <ScoreMeter
                  score={product.score}
                  max={100}
                  size="md"
                  decision={product.decision}
                />
              </div>
            </div>

            {/* Summary Micro Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200/60 text-[11px]">
                Confidence: {product.confidence || '95%'}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]">
                Style Alignment: High
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]">
                Palette Harmony: 92%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stylist Summary & Why It Works */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Stylist Take: <span className="text-emerald-700">{product.decision}</span>
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 leading-relaxed font-medium">
          "{product.aiExplanation}"
        </p>

        {/* 2 Crisp Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {(product.strongMatches?.slice(0, 2) || [
            'Seamlessly pairs with multiple items in your wardrobe',
            'Flattering color palette matching your natural undertone'
          ]).map((match, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/80">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{match}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Personal Physical Harmony (Compact 1-Strip) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Personal Fit Match</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            96% Harmony
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Smile className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Face Shape</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">Oval / Angular</span>
            <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">✓ Balanced</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Palette className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Undertone</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">Warm Olive</span>
            <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">✓ Harmonious</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Ruler className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Silhouette</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">Athletic (5'11")</span>
            <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">✓ Proportional</span>
          </div>
        </div>
      </div>

      {/* 4. Pairs With Your Closet */}
      {compatibleItems.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Pairs With Your Closet</h3>
              <p className="text-[11px] text-slate-500">Matching items from your wardrobe</p>
            </div>
            <button
              onClick={() => navigate('/outfits')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Shirt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Outfit Builder</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {compatibleItems.map((wItem) => (
              <div key={wItem.id} className="bg-slate-50 rounded-2xl p-2 border border-slate-100 hover:border-slate-200 transition-all">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-1.5 bg-white">
                  <img
                    src={wItem.image}
                    alt={wItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">{wItem.category}</span>
                <p className="text-xs font-bold text-slate-900 truncate">{wItem.name}</p>
                <p className="text-[10px] text-slate-500">{wItem.color}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Value Snapshot (Cost-Per-Wear) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Value & Longevity</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Low Regret Risk
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Retail Price</span>
            <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">₹{price.toLocaleString()}</span>
            <span className="text-[9px] text-slate-500 block">Purchase</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Est. Wears</span>
            <span className="text-sm sm:text-base font-black text-emerald-700 block mt-0.5">{estimatedWears} /yr</span>
            <span className="text-[9px] text-slate-500 block">Rotation</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
            <span className="text-[10px] text-emerald-800 font-semibold block uppercase tracking-wider">Cost / Wear</span>
            <span className="text-sm sm:text-base font-black text-emerald-900 block mt-0.5">₹{costPerWear}</span>
            <span className="text-[9px] text-emerald-700 font-semibold block">High Value</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Evaluation"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-950">Remove from History?</h4>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                This evaluation report will be permanently removed from your analysis list.
              </p>
            </div>
          </div>

          {/* Product Preview Tile */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Shirt className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                {product.brand} · {product.category}
              </span>
              <p className="text-xs font-extrabold text-slate-900 truncate">{product.name}</p>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">₹{price.toLocaleString()}</p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Delete Report'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
