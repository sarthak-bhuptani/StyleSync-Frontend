import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  ArrowUpRight,
  Sun,
  Zap,
  Check,
  PlusCircle,
  Camera,
  Plus
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
    navigate('/advisor', { state: { initialProduct: productData } });
  };

  // Featured items from user's actual wardrobe
  const featuredTop = wardrobe.find(w => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(w.category));
  const featuredBottom = wardrobe.find(w => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(w.category));
  const featuredShoe = wardrobe.find(w => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(w.category));

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-floating">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3 border border-white/10">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Personal Stylist Online</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'User'} 👋
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-normal max-w-lg">
            {wardrobe.length > 0
              ? `Your wardrobe has ${wardrobe.length} verified pieces in rotation. Ready to style your look for today?`
              : 'Welcome to StyleSync! Snap and upload your clothes to start generating daily outfits.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/daily-stylist')}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Sun className="w-4 h-4 text-slate-950" />
            <span>Today's Outfit</span>
          </button>
          <button
            onClick={() => navigate('/wardrobe-gaps')}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/15 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>What to Buy</span>
          </button>
        </div>
      </div>

      {/* 2-Column Focus: Today's Look & Gap Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Look Highlight (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Today's Weather & Recommended Look</h3>
                  <p className="text-xs text-slate-400">27°C Warm & Sunny · Mumbai, India</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/daily-stylist')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Full Lookbook →
              </button>
            </div>

            {wardrobe.length > 0 && (featuredTop || featuredBottom || featuredShoe) ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {featuredTop && (
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <img
                        src={featuredTop.image}
                        alt={featuredTop.name}
                        className="w-full aspect-square rounded-xl object-cover bg-white mb-2"
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top</span>
                      <p className="text-xs font-bold text-slate-800 truncate">{featuredTop.name}</p>
                    </div>
                  )}

                  {featuredBottom && (
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <img
                        src={featuredBottom.image}
                        alt={featuredBottom.name}
                        className="w-full aspect-square rounded-xl object-cover bg-white mb-2"
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bottom</span>
                      <p className="text-xs font-bold text-slate-800 truncate">{featuredBottom.name}</p>
                    </div>
                  )}

                  {featuredShoe && (
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <img
                        src={featuredShoe.image}
                        alt={featuredShoe.name}
                        className="w-full aspect-square rounded-xl object-cover bg-white mb-2"
                      />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Footwear</span>
                      <p className="text-xs font-bold text-slate-800 truncate">{featuredShoe.name}</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
                  <span>✨ <strong>98% Occasion Harmony:</strong> Perfect for Office & Smart Casual</span>
                  <span className="font-extrabold text-emerald-700">Clean & Breathable</span>
                </div>
              </>
            ) : (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <Shirt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No clothes uploaded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Snap photos of your clothes to see daily combinations here.</p>
                <button
                  onClick={() => navigate('/wardrobe')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Snap & Add Clothes
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Auto-calibrated for today's weather & schedule</span>
            <button
              onClick={() => navigate('/daily-stylist')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Daily Lookbook</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* AI "What You Need to Buy" Gap Spotlight (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">What to Buy Next</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                AI Gap Scanner
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-emerald-600 text-lg flex-shrink-0">
                  ⚡
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Closet Multiplier</span>
                  <p className="text-xs font-bold text-slate-900">Personalized Wardrobe Gap Analysis</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Discovers missing staples to multiply outfits</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "Find out which 2 or 3 missing items will unlock the most new outfit combinations with the clothes you already own."
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/wardrobe-gaps')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Wardrobe Gaps & Shopping List</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Action: Product Advisor Scanner */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Immediate Purchase Decision Check</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              AI Advisor
            </span>
          </div>
          <span className="text-xs text-slate-400">Evaluate any item from Myntra, Amazon, or Zara</span>
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
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
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
                <span className="text-slate-500 font-medium">Wardrobe Pieces</span>
                <span className="font-bold text-emerald-700">{wardrobe.length} Uploaded Items</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
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
                <h3 className="text-base font-bold text-slate-900">Recent AI Evaluations</h3>
                <p className="text-xs text-slate-400">Products evaluated against your wardrobe</p>
              </div>
              <button
                onClick={() => navigate('/advisor')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
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
                          {prod.brand} · {prod.currency}{prod.price?.toLocaleString()}
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
                <Compass className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No evaluations yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Upload your first clothes, shoes, or goggles to get personal styling advice.</p>
                <button
                  type="button"
                  onClick={() => navigate('/advisor')}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
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

      {/* Face & Body Analysis Scan Modal */}
      <SelfAnalysisScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
