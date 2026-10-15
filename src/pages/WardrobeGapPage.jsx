import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ArrowRight,
  Layers,
  Shirt,
  Scissors,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';
import { recommendationApi } from '../api/recommendationApi';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';

const DEFAULT_GAP_IMAGES = {
  Tops: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
  Bottoms: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
  Outerwear: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80',
  Shoes: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80',
  Accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
};

const FALLBACK_OPPORTUNITIES = [
  {
    id: 'opp_1',
    title: 'Everyday White Shirt',
    category: 'Tops',
    unlockText: '+12 outfits',
    unlockCount: 12,
    priority: 'HIGH',
    image: DEFAULT_GAP_IMAGES.Tops,
    searchQuery: 'white casual button down shirt'
  },
  {
    id: 'opp_2',
    title: 'Black Trousers',
    category: 'Bottoms',
    unlockText: '+9 outfits',
    unlockCount: 9,
    priority: 'HIGH',
    image: DEFAULT_GAP_IMAGES.Bottoms,
    searchQuery: 'classic black tailored trousers'
  },
  {
    id: 'opp_3',
    title: 'Lightweight Blazer',
    category: 'Outerwear',
    unlockText: '+7 outfits',
    unlockCount: 7,
    priority: 'MEDIUM',
    image: DEFAULT_GAP_IMAGES.Outerwear,
    searchQuery: 'unstructured lightweight blazer'
  }
];

export const WardrobeGapPage = () => {
  const { wardrobe } = useWardrobe();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [aiGaps, setAiGaps] = useState([]);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const fetchLiveGaps = async () => {
    setLoadingGaps(true);
    try {
      // 1. Try backend recommendation endpoint
      const res = await recommendationApi.getWardrobeGaps();
      const gapsList = Array.isArray(res) ? res : res?.gaps || res?.data?.gaps || res?.data || [];

      if (Array.isArray(gapsList) && gapsList.length > 0) {
        const formatted = gapsList.map((g, idx) => ({
          id: g.id || `gap_${idx}`,
          title: g.title || g.name || 'Essential Staple',
          category: g.category || 'Tops',
          unlockText: `+${g.unlocksOutfitsCount || g.multiplier?.match(/\d+/)?.[0] || (12 - idx * 2)} outfits`,
          unlockCount: Number(g.unlocksOutfitsCount || g.multiplier?.match(/\d+/)?.[0] || (12 - idx * 2)),
          priority: (g.priority || (idx === 0 ? 'HIGH' : 'MEDIUM')).toUpperCase(),
          image: g.image || (g.curatedPicks?.[0]?.image) || DEFAULT_GAP_IMAGES[g.category] || DEFAULT_GAP_IMAGES.Tops,
          searchQuery: g.title || g.name,
          reason: g.reason
        }));
        setAiGaps(formatted);
        setIsAiGenerated(true);
        return;
      }

      // 2. Fallback to Gemini dynamic gap analysis if backend had empty list
      if (Array.isArray(wardrobe) && wardrobe.length > 0) {
        const aiResults = await recommendationApi.analyzeWardrobeGapsWithAI(wardrobe, user);
        if (Array.isArray(aiResults) && aiResults.length > 0) {
          const formatted = aiResults.map((g, idx) => ({
            id: g.id || `ai_gap_${idx}`,
            title: g.title,
            category: g.category || 'Wardrobe Essential',
            unlockText: g.multiplier || `+${10 - idx * 2} outfits`,
            unlockCount: parseInt(g.multiplier?.match(/\d+/)?.[0] || (10 - idx * 2), 10),
            priority: idx === 0 ? 'HIGH' : 'MEDIUM',
            image: g.image || DEFAULT_GAP_IMAGES[g.category] || DEFAULT_GAP_IMAGES.Tops,
            searchQuery: g.title,
            reason: g.reason
          }));
          setAiGaps(formatted);
          setIsAiGenerated(true);
        }
      }
    } catch (err) {
      console.warn('Could not load AI wardrobe gaps:', err);
    } finally {
      setLoadingGaps(false);
    }
  };

  useEffect(() => {
    fetchLiveGaps();
  }, [wardrobe]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    navigate('/dashboard');
  };

  // Category counts computed strictly from user's live closet
  const counts = useMemo(() => {
    const list = Array.isArray(wardrobe) ? wardrobe : [];
    return {
      tops: list.filter(i => ['tops', 'top', 'shirt', 't-shirt', 'tshirt', 'polo'].some(c => (i.category || '').toLowerCase().includes(c))).length,
      bottoms: list.filter(i => ['bottoms', 'bottom', 'pants', 'pant', 'jeans', 'trouser', 'trousers', 'shorts'].some(c => (i.category || '').toLowerCase().includes(c))).length,
      shoes: list.filter(i => ['shoes', 'shoe', 'footwear', 'sneakers', 'boots'].some(c => (i.category || '').toLowerCase().includes(c))).length,
      layers: list.filter(i => ['outerwear', 'jacket', 'coat', 'blazer', 'overshirt'].some(c => (i.category || '').toLowerCase().includes(c))).length,
    };
  }, [wardrobe]);

  // Derive completeness percentage dynamically from real closet foundation
  const completeness = useMemo(() => {
    if (!wardrobe || wardrobe.length === 0) return 42;
    let score = 40;
    if (counts.tops >= 2) score += 15;
    else if (counts.tops >= 1) score += 8;

    if (counts.bottoms >= 2) score += 15;
    else if (counts.bottoms >= 1) score += 8;

    if (counts.shoes >= 1) score += 12;
    if (counts.layers >= 1) score += 10;

    return Math.min(95, score);
  }, [wardrobe, counts]);

  const [activeCategory, setActiveCategory] = useState('All');

  // Dynamic AI opportunities with fallback to standard capsule foundation
  const opportunities = useMemo(() => {
    return aiGaps.length > 0 ? aiGaps : FALLBACK_OPPORTUNITIES;
  }, [aiGaps]);

  const filteredOpportunities = useMemo(() => {
    if (activeCategory === 'All') return opportunities;
    return opportunities.filter((opp) =>
      (opp.category || '').toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [opportunities, activeCategory]);

  const totalUnlockedOutfits = opportunities.reduce((acc, curr) => acc + curr.unlockCount, 0);

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  const handleSeePicks = (item) => {
    navigate('/advisor', {
      state: {
        from: '/wardrobe-gaps',
        suggestedTitle: item.title,
        suggestedCategory: item.category
      }
    });
  };

  const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear'];

  return (
    <div className="w-full max-w-3xl mx-auto px-1 sm:px-3 animate-fade-in pb-2 text-[#1A1D1A]">
      {/* Top Grab Bar matching Figma Frame 08 */}
      <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

      {/* 1. Header: < What to Buy Next [S] */}
      <div className="flex items-start justify-between pb-1">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full active:scale-95 cursor-pointer mt-0.5"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight">
              What to Buy Next
            </h1>
            <p className="text-xs text-[#717670] font-normal mt-0.5">
              Small additions that unlock more outfits.
            </p>
          </div>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {/* 2. Wardrobe Completeness Score Card */}
      <div className="bg-white rounded-3xl border border-[#ECE8DF] p-4 sm:p-6 shadow-2xs my-3 flex items-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center justify-center bg-[#FAF8F5] border border-[#ECE8DF] rounded-2xl w-20 h-20 sm:w-24 sm:h-24 shrink-0 shadow-2xs">
          <span className="font-serif font-bold text-3xl sm:text-4xl text-[#1E2E22] tracking-tight">
            {completeness}%
          </span>
          <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider -mt-0.5">
            Score
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold text-xs sm:text-sm text-[#1A1D1A] uppercase tracking-wider">
              Wardrobe Completeness
            </h2>
            <span className="bg-[#E7ECE3] text-[#3D7A5A] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#D8E1D3]">
              Optimal
            </span>
          </div>
          <p className="text-xs text-[#717670] leading-relaxed">
            {opportunities.length} versatile pieces could unlock <span className="font-semibold text-[#1A1D1A]">{totalUnlockedOutfits}+ new combinations</span>.
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-[#EFECE5] h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-[#1E2E22] h-full rounded-full transition-all duration-700"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 my-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#1E2E22] text-[#F8F6F0] shadow-xs'
                  : 'bg-white text-[#5F665D] hover:text-[#1A1D1A] border border-[#ECE8DF] shadow-2xs'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. Section Header: BIGGEST OPPORTUNITIES */}
      <div className="pt-2 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider">
            BIGGEST OPPORTUNITIES
          </span>
          {isAiGenerated && (
            <span className="inline-flex items-center gap-1 bg-[#E2ECE3] text-[#1E2E22] px-2 py-0.5 rounded-full text-[9px] font-bold">
              <Sparkles className="w-2.5 h-2.5 text-[#3D7A5A]" />
              AI Tailored
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={fetchLiveGaps}
          disabled={loadingGaps}
          className="text-[11px] font-medium text-[#717670] hover:text-[#1A1D1A] flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
          title="Re-analyze wardrobe gaps"
        >
          <RefreshCw className={`w-3 h-3 ${loadingGaps ? 'animate-spin text-[#3D7A5A]' : ''}`} />
          <span>{loadingGaps ? 'Scanning...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 5. Recommendation Cards */}
      <div className="space-y-3 my-2">
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#ECE8DF] p-8 text-center shadow-2xs space-y-2">
            <p className="text-sm font-semibold text-[#1A1D1A]">No gaps found for {activeCategory}</p>
            <p className="text-xs text-[#8E968C]">Your wardrobe has strong coverage in this category.</p>
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="mt-2 text-xs font-bold text-[#1E2E22] underline cursor-pointer"
            >
              Show all categories
            </button>
          </div>
        ) : (
          filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-[#ECE8DF] p-3.5 sm:p-4 shadow-2xs flex items-center gap-3.5 sm:gap-4 hover:border-[#1A1D1A]/30 transition-all group"
            >
              {/* Garment Silhouette / Image Container */}
              <div className="w-18 h-20 sm:w-20 sm:h-24 rounded-2xl bg-[#F5F2EB] flex items-center justify-center shrink-0 p-2 overflow-hidden border border-[#ECE8DF]/50 shadow-2xs">
                {opp.image ? (
                  <img
                    src={opp.image}
                    alt={opp.title}
                    className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Layers className="w-8 h-8 text-[#8E968C]" />
                )}
              </div>

              {/* Opportunity Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[4.75rem] sm:min-h-[5.5rem] py-0.5">
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#1A1D1A] truncate leading-tight">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#3D7A5A] mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#3D7A5A] shrink-0" />
                    <span>{opp.unlockText}</span>
                  </p>
                </div>

                {/* Action & Priority Row */}
                <div className="flex items-center justify-between gap-2 pt-1 mt-1">
                  {opp.priority === 'HIGH' ? (
                    <span className="bg-[#1E2E22] text-[#F8F6F0] px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-2xs shrink-0">
                      HIGH
                    </span>
                  ) : (
                    <span className="bg-[#FAF8F5] border border-[#ECE8DF] text-[#5F665D] px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-2xs shrink-0">
                      MEDIUM
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSeePicks(opp)}
                    className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#1E2E22] hover:text-[#F8F6F0] border border-[#ECE8DF] text-xs font-bold text-[#1A1D1A] transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <span>See picks</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WardrobeGapPage;
