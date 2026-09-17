import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shirt,
  Calendar,
  Wallet,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { UploadDropzone } from '../components/advisor/UploadDropzone';
import { RecommendationBadge } from '../components/common/RecommendationBadge';
import { SelfAnalysisScanModal } from '../components/profile/SelfAnalysisScanModal';
import { Scan, Eye } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { wardrobe, analyzedProducts, analyzeNewProduct } = useWardrobe();
  const navigate = useNavigate();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const handleProductUploadReady = async (productData) => {
    // Navigate directly to advisor to run the analysis flow or execute
    navigate('/advisor', { state: { initialProduct: productData } });
  };

  // Category counts
  const categoryCounts = {
    Tops: wardrobe.filter(w => w.category === 'Tops').length,
    Bottoms: wardrobe.filter(w => w.category === 'Bottoms').length,
    Shoes: wardrobe.filter(w => w.category === 'Shoes').length,
    Outerwear: wardrobe.filter(w => w.category === 'Outerwear').length,
    Accessories: wardrobe.filter(w => ['Watches', 'Eyewear', 'Bags', 'Accessories'].includes(w.category)).length,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-floating">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Advisor Online & Calibrated</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Sarthak'} 👋
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-normal">
            "Let's make your next purchase a smarter one."
          </p>
        </div>

        <button
          onClick={() => navigate('/advisor')}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze a Product</span>
        </button>
      </div>

      {/* Primary Action: Prominent Upload Area */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Immediate Decision Check</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Primary Action
            </span>
          </div>
          <span className="text-xs text-slate-400">Drag screenshot or pick a test preset</span>
        </div>
        <UploadDropzone onProductReady={handleProductUploadReady} />
      </div>

      {/* 2-Column Grid: Style Snapshot & Recent Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Style Snapshot (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Your Style Snapshot</h3>
              <button
                onClick={() => navigate('/profile')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Edit Profile
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Preferred Aesthetic</span>
                <span className="font-bold text-slate-900">
                  {user?.stylePreferences?.slice(0, 2).join(' · ') || 'Minimal · Smart Casual'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium block mb-2">Core Color Harmony</span>
                <div className="flex flex-wrap gap-1.5">
                  {(user?.favoriteColors || ['Black', 'White', 'Beige', 'Navy', 'Olive']).map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 shadow-2xs"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Typical Footwear Budget</span>
                <span className="font-bold text-slate-900">
                  ₹{user?.budgetRanges?.shoes?.min || 3000} – ₹{user?.budgetRanges?.shoes?.max || 14000}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Most Worn Category</span>
                <span className="font-bold text-emerald-700">Footwear & Tops (42 wear logs)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-emerald-700 transition-colors"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-600" />
              <span>Calibrate Face & Body Scan</span>
            </button>
            <span className="text-emerald-700 font-bold">Optimal Calibration</span>
          </div>
        </div>

        {/* Recent Decisions (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent AI Decisions</h3>
                <p className="text-xs text-slate-400">Products evaluated against your wardrobe</p>
              </div>
              <button
                onClick={() => navigate('/advisor')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View All
              </button>
            </div>

            {analyzedProducts.length > 0 ? (
              <div className="space-y-3">
                {analyzedProducts.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => navigate(`/advisor/result/${prod.id}`)}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {prod.brand} · {prod.currency}{prod.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <RecommendationBadge decision={prod.decision} size="sm" />
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block leading-tight">{prod.score}</span>
                        <span className="text-[10px] font-semibold text-slate-400">/ 100</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-800 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No evaluations yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Upload your first clothes, shoes, or goggles to get personal styling advice.</p>
                <button
                  type="button"
                  onClick={() => navigate('/advisor')}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-all"
                >
                  Analyze a Product
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall recommendation accuracy</span>
            <span className="font-bold text-slate-900">96.4% satisfaction</span>
          </div>
        </div>
      </div>

      {/* Wardrobe Health & AI Gap Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wardrobe Health */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Wardrobe Health</h3>
              <p className="text-xs text-slate-400">{wardrobe.length} Verified Pieces in Active Rotation</p>
            </div>
            <button
              onClick={() => navigate('/wardrobe')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Open Closet →
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 text-center mb-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{categoryCounts.Tops}</span>
              <span className="text-[11px] font-semibold text-slate-500">Tops</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{categoryCounts.Bottoms}</span>
              <span className="text-[11px] font-semibold text-slate-500">Bottoms</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{categoryCounts.Shoes}</span>
              <span className="text-[11px] font-semibold text-slate-500">Shoes</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{categoryCounts.Outerwear}</span>
              <span className="text-[11px] font-semibold text-slate-500">Jackets</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-lg font-black text-slate-900 block">{categoryCounts.Accessories}</span>
              <span className="text-[11px] font-semibold text-slate-500">Accs</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Capsule Balance Score: 88/100.</strong> High versatility across tops and bottoms. No deadstock clutter detected.
            </p>
          </div>
        </div>

        {/* AI "You Might Need" Gap Suggestions */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">You Might Need</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                1 Capsule Gap Detected
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 mb-4">
              <p className="text-xs font-bold text-amber-900 mb-1">
                Footwear Versatility Gap
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                "You have many neutral tops and tailored bottoms, but very few versatile low-profile sneakers to bridge smart-casual and weekend styling."
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 font-medium">Recommendation: Minimal White Court Shoes</span>
            <button
              onClick={() => navigate('/advisor')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>View Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Face & Body Analysis Scan Modal */}
      <SelfAnalysisScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};
