import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Layers,
  Check,
  Tag,
  ArrowRight,
  Plus,
  Compass,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';
import { recommendationApi } from '../api/recommendationApi';

export const WardrobeGapPage = () => {
  const { wardrobe, addWardrobeItem, showToast } = useWardrobe();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [wardrobeGaps, setWardrobeGaps] = useState(() => {
    try {
      const cached = localStorage.getItem('stylesync_ai_gaps_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(null);

  // Category counts computed from user's live closet
  const counts = useMemo(() => {
    return {
      tops: wardrobe.filter(i => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(i.category) || i.name?.toLowerCase().includes('shirt') || i.name?.toLowerCase().includes('tee')).length,
      bottoms: wardrobe.filter(i => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(i.category) || i.name?.toLowerCase().includes('jean') || i.name?.toLowerCase().includes('pant')).length,
      shoes: wardrobe.filter(i => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(i.category) || i.name?.toLowerCase().includes('shoe') || i.name?.toLowerCase().includes('sneaker')).length,
      layers: wardrobe.filter(i => ['Outerwear', 'Jacket', 'Coat', 'Blazer'].includes(i.category) || i.name?.toLowerCase().includes('jacket') || i.name?.toLowerCase().includes('blazer')).length,
    };
  }, [wardrobe]);

  // Load / run AI gap analysis
  const runAIGapAnalysis = async (forceRefresh = false) => {
    if (wardrobe.length === 0) return;
    setIsLoadingAI(true);
    try {
      const results = await recommendationApi.analyzeWardrobeGapsWithAI(wardrobe, user);
      if (Array.isArray(results) && results.length > 0) {
        setWardrobeGaps(results);
        setLastAnalyzedCount(wardrobe.length);
        try {
          localStorage.setItem('stylesync_ai_gaps_cache', JSON.stringify(results));
        } catch {}
        if (forceRefresh) {
          showToast('Syncra AI analyzed your wardrobe and updated your foundation gaps!', 'success');
        }
      }
    } catch (err) {
      console.warn('AI analysis error:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    if (wardrobe.length > 0) {
      runAIGapAnalysis();
    }
  }, [wardrobe.length]);

  const handleSimulateAddToWardrobe = (pick, gap) => {
    addWardrobeItem({
      name: pick.name,
      category: gap.category.includes('Footwear') ? 'Shoes' : gap.category.includes('Bottoms') ? 'Bottoms' : gap.category.includes('Layer') ? 'Outerwear' : 'Tops',
      brand: pick.brand,
      price: pick.price,
      image: pick.image,
      color: 'Neutral',
      style: 'Foundation Essential'
    });
    showToast(`Added ${pick.name} to your wardrobe!`, 'success');
  };

  const handleAnalyzeWithAdvisor = (pick) => {
    navigate('/advisor', {
      state: {
        initialProduct: {
          name: pick.name,
          brand: pick.brand,
          price: pick.price,
          category: 'Clothing',
          image: pick.image
        }
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              What to Buy Next
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>AI-Generated</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Syncra analyzes your {wardrobe.length} registered pieces to find foundation gaps that maximize combinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => runAIGapAnalysis(true)}
            disabled={isLoadingAI}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>{isLoadingAI ? 'Analyzing...' : 'Re-scan with AI'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/wardrobe')}
            className="px-3 py-1.5 bg-[#091224] hover:bg-[#121F3A] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Wardrobe ({wardrobe.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Closet Balance Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
            Closet Foundation Balance
          </h3>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            {wardrobeGaps.length} AI Recommendations
          </span>
        </div>

        {/* 4 Category Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Tops</span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">{counts.tops}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              {counts.tops >= 4 ? 'Stocked' : 'Needs Basics'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Bottoms</span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">{counts.bottoms}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              {counts.bottoms >= 3 ? 'Balanced' : 'Needs Chino'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Shoes</span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">{counts.shoes}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              {counts.shoes >= 2 ? 'Covered' : 'Add Sneaker'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Layers</span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">{counts.layers}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              {counts.layers >= 1 ? 'Ready' : 'Add Overshirt'}
            </span>
          </div>
        </div>
      </div>

      {/* High-Impact Foundation Additions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>Curated Foundation Additions</span>
            {isLoadingAI && <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />}
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Ranked by outfit multiplier</span>
        </div>

        {isLoadingAI && wardrobeGaps.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Syncra AI is scanning your closet...</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Evaluating your {wardrobe.length} registered pieces to identify the highest-ROI clothing items missing from your wardrobe.
            </p>
          </div>
        ) : wardrobeGaps.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No Gap Analysis Available</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap "Scan with AI" to let Syncra evaluate your registered pieces and calculate missing foundation items.
            </p>
            <button
              type="button"
              onClick={() => runAIGapAnalysis(true)}
              className="px-4 py-2 bg-[#091224] hover:bg-[#121F3A] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scan Wardrobe with AI</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {wardrobeGaps.map((gap) => (
              <div
                key={gap.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle p-4 sm:p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Header: Category & Multiplier */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      {gap.category}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {gap.multiplier}
                    </span>
                  </div>

                  {/* Main Hero: Image + Title + Stylist Rationale */}
                  <div className="flex gap-3 items-start">
                    <img
                      src={gap.image}
                      alt={gap.title}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {gap.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {gap.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Curated Products List */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    <span>Recommended Brand Models</span>
                    <span>{gap.priceRange}</span>
                  </div>

                  {(gap.curatedPicks || []).map((pick, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={pick.image || gap.image}
                          alt={pick.name}
                          className="w-9 h-9 rounded-xl object-cover bg-white border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{pick.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{pick.brand} {pick.price ? `· ₹${pick.price.toLocaleString()}` : ''}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAnalyzeWithAdvisor(pick)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                        >
                          Check Fit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateAddToWardrobe(pick, gap)}
                          className="px-2.5 py-1 bg-[#091224] hover:bg-[#121F3A] text-white text-[10px] font-bold rounded-xl transition-all flex items-center gap-0.5 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-emerald-400" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobeGapPage;

