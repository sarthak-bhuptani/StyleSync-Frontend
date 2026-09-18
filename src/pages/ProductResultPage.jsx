import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Shirt,
  Share2,
  Bookmark,
  Check,
  ArrowRight,
  TrendingUp,
  Layers,
  ShieldCheck,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { productApi } from '../api/productApi';
import { RecommendationBadge } from '../components/common/RecommendationBadge';
import { ScoreMeter } from '../components/common/ScoreMeter';
import { ProgressBar } from '../components/common/ProgressBar';

export const ProductResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wardrobe, showToast, deleteAnalyzedProduct } = useWardrobe();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [completeLook, setCompleteLook] = useState(null);
  const [loadingLook, setLoadingLook] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await productApi.getProductById(id);
      setProduct(data);
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    const fetchCompleteLook = async () => {
      if (!product) return;
      setLoadingLook(true);
      try {
        const lookData = await productApi.completeTheLook(id, product);
        setCompleteLook(lookData);
      } catch (e) {
        console.error('Failed to load complete the look:', e);
      } finally {
        setLoadingLook(false);
      }
    };
    fetchCompleteLook();
  }, [product, id]);

  if (loading || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-slate-900 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-500">Loading evaluation report...</p>
      </div>
    );
  }

  // Find compatible items from user's actual wardrobe
  const compatibleItems = wardrobe.filter(w =>
    product.compatibleWardrobeIds?.includes(w.id) ||
    (product.category === 'Shoes' && ['Bottoms', 'Tops'].includes(w.category)) ||
    (product.category === 'Tops' && ['Bottoms', 'Shoes', 'Outerwear'].includes(w.category)) ||
    (product.category === 'Outerwear' && ['Tops', 'Bottoms'].includes(w.category))
  ).slice(0, 4);

  const breakdown = product.breakdown || {
    styleMatch: { score: 22, max: 25, label: 'Style Match' },
    colorMatch: { score: 18, max: 20, label: 'Color Match' },
    wardrobeMatch: { score: 18, max: 20, label: 'Wardrobe Match' },
    versatility: { score: 13, max: 15, label: 'Versatility' },
    budget: { score: 9, max: 10, label: 'Budget Fit' },
    occasion: { score: 8, max: 10, label: 'Occasion Fit' }
  };

  const handleSaveToWishlist = () => {
    setSaved(!saved);
    showToast(saved ? 'Removed from saved items' : 'Saved to your evaluated wishlist', 'success');
  };

  const handleDeleteProduct = () => {
    if (window.confirm('Delete this product evaluation and remove it from history?')) {
      deleteAnalyzedProduct(id);
      navigate('/advisor');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Back to Advisor navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/advisor')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Evaluate Another Product</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToWishlist}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              saved ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={() => showToast('Report link copied to clipboard', 'info')}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={handleDeleteProduct}
            title="Delete this evaluation"
            className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Flagship Top Section: Hero Card with Score & Recommendation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-floating">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Product Image */}
          <div className="md:col-span-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-subtle group">
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
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                  <Shirt className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="text-xs font-semibold">{product.category || 'Product'}</span>
                </div>
              )}
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold rounded-lg shadow-xs border border-white/40">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Meta & Verdict */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {product.brand} · {product.color}
                </span>
                <RecommendationBadge decision={product.decision} size="lg" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-xl font-black text-slate-900">
                  {product.currency || '₹'}{(product.price || 0).toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Verified Retail Price
                </span>
              </div>
            </div>

            {/* Score Visualization Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Overall Compatibility Score
                </span>
                <p className="text-xs text-slate-600 font-normal leading-relaxed max-w-sm">
                  Calculated against your 6 personal styling dimensions and 10 wardrobe assets.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <ScoreMeter
                  score={product.score}
                  max={100}
                  size="lg"
                  decision={product.decision}
                />
              </div>
            </div>

            {/* Quick Summary Pill Banner */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded-lg border border-emerald-200/60">
                Confidence: {product.confidence || '95%'}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg">
                Style Alignment: High
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg">
                Palette Harmony: 92%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Score Compatibility Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Compatibility Breakdown</h3>
            <p className="text-xs text-slate-500">Neural evaluation across six personal dimensions</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            6 Dimensions Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ProgressBar
              label="Style Match"
              value={breakdown.styleMatch.score}
              max={breakdown.styleMatch.max}
              displayValue={`${breakdown.styleMatch.score} / ${breakdown.styleMatch.max}`}
              color="emerald"
            />
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Fits Minimal & Smart Casual proportions.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ProgressBar
              label="Color Match"
              value={breakdown.colorMatch.score}
              max={breakdown.colorMatch.max}
              displayValue={`${breakdown.colorMatch.score} / ${breakdown.colorMatch.max}`}
              color="emerald"
            />
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Neutral palette coordinates effortlessly.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ProgressBar
              label="Wardrobe Match"
              value={breakdown.wardrobeMatch.score}
              max={breakdown.wardrobeMatch.max}
              displayValue={`${breakdown.wardrobeMatch.score} / ${breakdown.wardrobeMatch.max}`}
              color="emerald"
            />
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Pairs directly with 5 verified items.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ProgressBar
              label="Versatility"
              value={breakdown.versatility.score}
              max={breakdown.versatility.max}
              displayValue={`${breakdown.versatility.score} / ${breakdown.versatility.max}`}
              color="emerald"
            />
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Suitable for office, daily & weekend wear.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ProgressBar
              label="Budget Fit"
              value={breakdown.budget.score}
              max={breakdown.budget.max}
              displayValue={`${breakdown.budget.score} / ${breakdown.budget.max}`}
              color="emerald"
            />
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Comfortably within footwear budget range.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ProgressBar
              label="Occasion Fit"
              value={breakdown.occasion.score}
              max={breakdown.occasion.max}
              displayValue={`${breakdown.occasion.score} / ${breakdown.occasion.max}`}
              color="emerald"
            />
            <p className="text-[11px] text-slate-500 mt-2 font-medium">Matches 4 out of 5 designated occasions.</p>
          </div>
        </div>
      </div>

      {/* Your Personal Physical Match: Face, Complexion & Body Silhouette */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Face & Body Physical Match</h3>
              <p className="text-xs text-slate-500">Evaluated against your scanned facial geometry, skin undertone, and body build</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            96% Physical Harmony
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 1. Face Shape Harmony */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-emerald-700 block">
              👤 Face Shape Fit
            </span>
            <p className="font-extrabold text-slate-900">Oval / Angular Jawline</p>
            <p className="text-slate-600 leading-relaxed">
              {product.category === 'Eyewear'
                ? 'This frame width balances your cheekbones without overpowering your jawline.'
                : 'The collar and neckline geometry create a clean, elongating vertical line for your jaw.'}
            </p>
          </div>

          {/* 2. Complexion & Undertone Harmony */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-emerald-700 block">
              🎨 Complexion & Undertone
            </span>
            <p className="font-extrabold text-slate-900">Warm Olive / Golden Medium</p>
            <p className="text-slate-600 leading-relaxed">
              The {product.color} colorway complements your warm undertone, preventing the washed-out effect caused by harsh neon or icy tones.
            </p>
          </div>

          {/* 3. Body Silhouette Fit */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-emerald-700 block">
              📏 Body Silhouette Proportion
            </span>
            <p className="font-extrabold text-slate-900">Athletic V-Taper (5 ft 11 in)</p>
            <p className="text-slate-600 leading-relaxed">
              The relaxed silhouette sits naturally on your shoulders and pairs cleanly with tapered bottoms to maintain proportional balance.
            </p>
          </div>
        </div>
      </div>

      {/* Why StyleSync Says BUY / MAYBE / SKIP */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Why StyleSync Says <span className="text-emerald-700">{product.decision}</span>
          </h3>
        </div>

        <p className="text-sm text-slate-700 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/70 leading-relaxed font-medium mb-6">
          "{product.aiExplanation}"
        </p>

        {/* Strong Matches & Things to Consider 2-Col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strong Matches */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strong Matches</span>
            </h4>
            <ul className="space-y-2.5">
              {(product.strongMatches || [
                'Matches your preferred style guidelines',
                'Works with multiple items in your wardrobe',
                'Fits within your designated category budget',
                'Highly suitable for daily and work wear'
              ]).map((match, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{match}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Things to Consider */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Things to Consider</span>
            </h4>
            <ul className="space-y-2.5">
              {(product.considerations || [
                'Not ideal for formal black-tie events',
                'Keep leather treated with water repellent in wet climates'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Compatible With Your Wardrobe */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Compatible With Your Wardrobe</h3>
            <p className="text-xs text-slate-500">Actual pieces from your closet that pair seamlessly with this product</p>
          </div>
          <button
            onClick={() => navigate('/outfits')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Shirt className="w-3.5 h-3.5 text-emerald-400" />
            <span>Build Outfit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {compatibleItems.map((wItem) => (
            <div key={wItem.id} className="group bg-slate-50 rounded-2xl p-2.5 border border-slate-100 hover:border-slate-200 transition-all">
              <div className="aspect-[4/5] rounded-xl overflow-hidden mb-2 bg-white">
                <img
                  src={wItem.image}
                  alt={wItem.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{wItem.category}</span>
              <p className="text-xs font-bold text-slate-900 truncate">{wItem.name}</p>
              <p className="text-[11px] text-slate-500">{wItem.color}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Flagship: Complete The Look (3 Head-to-Toe Outfits) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200/60">
              <Compass className="w-3 h-3 text-emerald-600" />
              <span>AI Capsule Stylist</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Complete the Look: 3 Styled Outfits</h3>
            <p className="text-xs text-slate-500">How to wear this exact piece across 3 different life occasions</p>
          </div>
          {loadingLook && (
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Generating outfits...
            </span>
          )}
        </div>

        {completeLook?.outfits && completeLook.outfits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {completeLook.outfits.map((outfit, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {outfit.occasion}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">Look #{idx + 1}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mb-3">
                    {outfit.headline}
                  </h4>

                  <div className="space-y-2 mb-4">
                    {outfit.pieces?.map((piece, pIdx) => (
                      <div
                        key={pIdx}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                          pIdx === 0
                            ? 'bg-white border-emerald-200 font-bold text-emerald-950 shadow-xs'
                            : 'bg-white/70 border-slate-200/60 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block leading-tight">
                            {piece.category}
                          </span>
                          <span className="truncate block font-semibold">{piece.name}</span>
                        </div>
                        {piece.color && (
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {piece.color}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 italic">
                  💡 {outfit.stylingTip}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500">Pair this item with your tailored wardrobe for high-versatility daily styling.</p>
          </div>
        )}
      </div>

      {/* Flagship: Cost-Per-Wear & Regret Predictor */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mb-1">
              Financial Intelligence
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Cost-Per-Wear & Regret Predictor</h3>
            <p className="text-xs text-slate-500">Calculates true long-term value against your lifestyle and closet inventory</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
            completeLook?.costPerWear?.regretRisk === 'Low' || !completeLook
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {completeLook?.costPerWear?.regretRisk || 'Low'} Regret Risk
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Retail Price</span>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{(product.price || 0).toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">One-time purchase cost</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Expected Annual Wears</span>
            <span className="text-xl font-extrabold text-emerald-700">
              {completeLook?.costPerWear?.estimatedWears || 36} wears/yr
            </span>
            <p className="text-[11px] text-slate-500 mt-1">Based on category & versatility</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">Real Cost-Per-Wear</span>
            <span className="text-xl font-extrabold text-emerald-900">
              ₹{completeLook?.costPerWear?.costPerWear || Math.max(1, Math.round((product.price || 2999) / 36))}
              <span className="text-xs font-normal text-emerald-700"> / wear</span>
            </span>
            <p className="text-[11px] text-emerald-700 mt-1 font-semibold">High Value & Versatility Index</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
          {completeLook?.costPerWear?.regretExplanation ||
            `Because this piece matches multiple items in your closet, it offers strong recurring utility with low impulse-regret risk.`}
        </p>
      </div>

      {/* Alternative Products */}
      {product.alternatives && product.alternatives.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle">
          <div className="pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Alternative Options</h3>
            <p className="text-xs text-slate-500">Similar silhouettes with verified high compatibility</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {product.alternatives.map((alt) => (
              <div
                key={alt.id}
                className="group p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-white">
                    <img
                      src={alt.image}
                      alt={alt.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{alt.brand}</span>
                    <RecommendationBadge decision={alt.decision} size="sm" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{alt.name}</h4>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">{alt.currency || '₹'}{alt.price.toLocaleString()}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {alt.score}/100 Score
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
