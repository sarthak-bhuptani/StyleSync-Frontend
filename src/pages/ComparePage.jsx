import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Plus,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Check,
  Info,
  Quote,
  Award,
  User,
  Sun,
  Ruler,
  Tag,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { productApi } from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

// Clean long and repetitive e-commerce titles
export const cleanProductTitle = (rawTitle) => {
  if (!rawTitle) return 'Fashion Item';
  
  let cleaned = rawTitle
    .replace(/\s*-\s*Buy.*$/i, '')
    .replace(/\s*\|\s*(Flipkart|Myntra|Amazon|Ajio|Zara|Nykaa).*$/i, '')
    .replace(/Online at Best Prices in India.*$/i, '')
    .trim();

  const parts = cleaned.split(/,\s*/);
  const uniqueParts = [...new Set(parts)];
  cleaned = uniqueParts.join(', ');

  if (cleaned.length > 45) {
    cleaned = cleaned.substring(0, 42) + '...';
  }
  return cleaned || rawTitle;
};

// Intelligently determine a clean, human-friendly brand or item label
export const getCandidateLabel = (candidate, fallback = 'Option', otherCandidate = null) => {
  if (!candidate) return fallback;
  const brand = candidate.brand?.trim();
  const isGeneric = !brand || /^(flipkart|amazon|myntra|ajio|zara|nykaa|unknown|generic|apparel)$/i.test(brand);
  
  if (!isGeneric) {
    if (!otherCandidate || candidate.brand?.toLowerCase() !== otherCandidate.brand?.toLowerCase()) {
      return brand;
    }
  }
  
  // Extract first 2 distinct words from cleaned product name for clear differentiation
  const cleanTitle = cleanProductTitle(candidate.name);
  const words = cleanTitle.split(/\s+/).slice(0, 2).join(' ');
  if (words && words.length > 2 && words.length < 25) {
    return words;
  }
  return fallback;
};

// Humanize raw AI response text into natural, stylist-authored commentary
export const humanizeVerdict = (text, candidateA, candidateB, duelResult) => {
  if (!text) return '';
  
  const isWinnerA = duelResult?.winner === 'itemA';
  const winner = isWinnerA ? candidateA : candidateB;
  const runnerUp = isWinnerA ? candidateB : candidateA;

  const winnerLabel = getCandidateLabel(winner, isWinnerA ? 'Option 1' : 'Option 2', runnerUp);
  const runnerUpLabel = getCandidateLabel(runnerUp, isWinnerA ? 'Option 2' : 'Option 1', winner);

  let cleaned = text
    .replace(/\$(\d+)/g, '₹$1')
    .replace(/\(#[0-9A-Fa-f]{3,6}\)/g, '')
    .replace(/#[0-9A-Fa-f]{6}/g, '')
    .replace(/Option\s*[12]\s*\([^)]*\)\s*is the clear winner because/gi, `The ${winnerLabel} is our top recommendation because`)
    .replace(/Option\s*[12]\s*is the clear winner because/gi, `The ${winnerLabel} is our top recommendation because`)
    .replace(/\bCandidate\s*A\b/gi, isWinnerA ? winnerLabel : runnerUpLabel)
    .replace(/\bCandidate\s*B\b/gi, isWinnerA ? runnerUpLabel : winnerLabel)
    .replace(/\bItem\s*A\b/gi, isWinnerA ? winnerLabel : runnerUpLabel)
    .replace(/\bItem\s*B\b/gi, isWinnerA ? runnerUpLabel : winnerLabel)
    .replace(/Option\s*1\s*\([^)]*\)/gi, candidateA?.brand || 'Option 1')
    .replace(/Option\s*2\s*\([^)]*\)/gi, candidateB?.brand || 'Option 2')
    .replace(/\bforbidden\s+/gi, 'clashing ')
    .replace(/unbeatable value of\s*/gi, 'great value at ')
    .replace(/\s*INR\b/gi, '')
    .replace(/\s+/g, ' ');

  // Fix generic platform repetition
  const genericPlatforms = ['Flipkart', 'Amazon', 'Myntra', 'Ajio', 'Zara'];
  genericPlatforms.forEach(p => {
    const doublePattern = new RegExp(`(${p})\\s+is the clear winner(.*?)whereas\\s+${p}`, 'gi');
    cleaned = cleaned.replace(doublePattern, `${winnerLabel} is the clear winner$2whereas ${runnerUpLabel}`);
  });

  return cleaned.trim();
};

export const ComparePage = () => {
  const { analyzedProducts } = useWardrobe();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [candidateA, setCandidateA] = useState(analyzedProducts[0] || null);
  const [candidateB, setCandidateB] = useState(analyzedProducts[1] || null);
  const [dueling, setDueling] = useState(false);
  const [duelResult, setDuelResult] = useState(null);
  const [selectorModal, setSelectorModal] = useState({ open: false, target: null }); // 'A' or 'B'
  const [mobileActiveTab, setMobileActiveTab] = useState('both'); // 'A', 'B', or 'both'

  useEffect(() => {
    if (analyzedProducts.length >= 2) {
      const first = candidateA || analyzedProducts[0];
      const second = candidateB || (analyzedProducts[1]?.id !== first?.id ? analyzedProducts[1] : analyzedProducts[0]);
      if (!candidateA) setCandidateA(first);
      if (!candidateB) setCandidateB(second);
      runComparison(first, second);
    }
  }, [analyzedProducts]);

  const runComparison = async (itemA = candidateA, itemB = candidateB) => {
    if (!itemA || !itemB) return;
    setDueling(true);
    try {
      const res = await productApi.compareProducts(itemA, itemB);
      setDuelResult(res);
    } catch (err) {
      console.error('Duel failed:', err);
    } finally {
      setDueling(false);
    }
  };

  const handleSelectCandidate = (product) => {
    if (selectorModal.target === 'A') {
      setCandidateA(product);
      runComparison(product, candidateB);
    } else if (selectorModal.target === 'B') {
      setCandidateB(product);
      runComparison(candidateA, product);
    }
    setSelectorModal({ open: false, target: null });
  };

  const isWinnerA = duelResult?.winner === 'itemA';
  const isWinnerB = duelResult?.winner === 'itemB';
  const scoreA = duelResult?.itemAScore || candidateA?.score || 85;
  const scoreB = duelResult?.itemBScore || candidateB?.score || 82;

  const getScoreBadge = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Strong Buy' };
    if (score >= 60) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Consider / Maybe' };
    return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Skip / Caution' };
  };

  const badgeA = getScoreBadge(scoreA);
  const badgeB = getScoreBadge(scoreB);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-slate-800 text-xs font-semibold mb-1 border border-stone-200">
          <Compass className="w-3.5 h-3.5 text-emerald-700" />
          <span>Head-to-Head Comparison</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Side-by-Side Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed px-2">
          Compare two pieces across color harmony, physical silhouette, and wardrobe versatility.
        </p>
      </div>

      {analyzedProducts.length < 2 ? (
        <EmptyState
          icon={Scale}
          title="Add at least 2 items to compare"
          description="Check two items in the Product Advisor first, then compare them here to pick the best match."
          actionLabel="Check an Item First"
          onAction={() => navigate('/advisor')}
        />
      ) : (
        <>
          {/* 2-COLUMN MATCHUP GRID */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 relative items-stretch">
            {/* ITEM 1 (Candidate A) */}
            {candidateA && (
              <div className={`p-3.5 sm:p-6 rounded-3xl bg-white border transition-all relative flex flex-col justify-between ${
                isWinnerA
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-card'
                  : 'border-slate-200/80 shadow-xs'
              }`}>
                {/* Winner Pill */}
                {isWinnerA && (
                  <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-600 text-white text-[9px] sm:text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-xs z-10">
                    <Trophy className="w-3 h-3" />
                    <span>Top Pick</span>
                  </div>
                )}

                <div>
                  {/* Header & Switcher */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Option 1
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectorModal({ open: true, target: 'A' })}
                      className="text-[10px] sm:text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Switch</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-2.5 sm:mb-4 flex items-center justify-center relative group">
                    {candidateA.image ? (
                      <img
                        src={candidateA.image}
                        alt={candidateA.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">No Image</span>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold rounded-md">
                      {candidateA.category || 'Tops'}
                    </span>
                  </div>

                  {/* Cleaned Product Title */}
                  <h3
                    title={candidateA.name}
                    className="text-xs sm:text-base font-extrabold text-slate-900 leading-snug line-clamp-2 mb-1"
                  >
                    {cleanProductTitle(candidateA.name)}
                  </h3>

                  {/* Meta Specs */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 mb-3">
                    <span className="text-emerald-700 font-extrabold">
                      ₹{(candidateA.price || 0).toLocaleString()}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[80px] sm:max-w-none">{candidateA.brand || 'Apparel'}</span>
                  </div>
                </div>

                {/* Score Footer */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Suitability
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border inline-block mt-0.5 ${badgeA.bg}`}>
                      {badgeA.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                      {scoreA}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* ITEM 2 (Candidate B) */}
            {candidateB && (
              <div className={`p-3.5 sm:p-6 rounded-3xl bg-white border transition-all relative flex flex-col justify-between ${
                isWinnerB
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-card'
                  : 'border-slate-200/80 shadow-xs'
              }`}>
                {/* Winner Pill */}
                {isWinnerB && (
                  <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-600 text-white text-[9px] sm:text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-xs z-10">
                    <Trophy className="w-3 h-3" />
                    <span>Top Pick</span>
                  </div>
                )}

                <div>
                  {/* Header & Switcher */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Option 2
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectorModal({ open: true, target: 'B' })}
                      className="text-[10px] sm:text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Switch</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-2.5 sm:mb-4 flex items-center justify-center relative group">
                    {candidateB.image ? (
                      <img
                        src={candidateB.image}
                        alt={candidateB.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">No Image</span>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold rounded-md">
                      {candidateB.category || 'Tops'}
                    </span>
                  </div>

                  {/* Cleaned Product Title */}
                  <h3
                    title={candidateB.name}
                    className="text-xs sm:text-base font-extrabold text-slate-900 leading-snug line-clamp-2 mb-1"
                  >
                    {cleanProductTitle(candidateB.name)}
                  </h3>

                  {/* Meta Specs */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 mb-3">
                    <span className="text-emerald-700 font-extrabold">
                      ₹{(candidateB.price || 0).toLocaleString()}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[80px] sm:max-w-none">{candidateB.brand || 'Apparel'}</span>
                  </div>
                </div>

                {/* Score Footer */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Suitability
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border inline-block mt-0.5 ${badgeB.bg}`}>
                      {badgeB.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                      {scoreB}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">/100</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STYLIST VERDICT BANNER */}
          {dueling ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 text-center flex flex-col items-center justify-center space-y-2 shadow-xs">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-bold text-slate-900">Evaluating pieces against your wardrobe & profile...</p>
              <p className="text-xs text-slate-400">Assessing silhouette geometry, color harmony, and cost-per-wear</p>
            </div>
          ) : duelResult ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Short & Simple Stylist Take */}
              {(() => {
                const winnerItem = isWinnerA ? candidateA : candidateB;
                const runnerUpItem = isWinnerA ? candidateB : candidateA;
                const winnerLabel = getCandidateLabel(winnerItem, isWinnerA ? 'Option 1' : 'Option 2', runnerUpItem);
                const runnerUpLabel = getCandidateLabel(runnerUpItem, isWinnerA ? 'Option 2' : 'Option 1', winnerItem);
                const humanizedNote = humanizeVerdict(duelResult.verdictSummary, candidateA, candidateB, duelResult);

                // Extract concise first sentence
                const shortSummary = humanizedNote.split(/(?<=[.!?])\s+/)[0] || humanizedNote;

                const colorReason = humanizeVerdict(duelResult.categories?.colorMatch?.reason, candidateA, candidateB, duelResult);
                const cutReason = humanizeVerdict(duelResult.categories?.faceMatch?.reason, candidateA, candidateB, duelResult);
                const valueReason = humanizeVerdict(duelResult.categories?.costPerWear?.reason, candidateA, candidateB, duelResult);

                const shortColor = colorReason.split(/(?<=[.!?])\s+/)[0] || 'Dark green harmonizes naturally with your warm skin undertone.';
                const shortCut = cutReason.split(/(?<=[.!?])\s+/)[0] || 'Structured neckline provides a clean, flattering frame.';
                const shortValue = valueReason.split(/(?<=[.!?])\s+/)[0] || `Great everyday rotation piece at ₹${(winnerItem?.price || 0).toLocaleString()}.`;

                return (
                  <div className="rounded-3xl bg-white border border-stone-200/90 shadow-subtle p-4 sm:p-6 space-y-3.5">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-stone-700" />
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                          Stylist Take
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Best Match: {winnerLabel}</span>
                      </span>
                    </div>

                    {/* Short 1-Sentence Verdict */}
                    <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                      &ldquo;{shortSummary}&rdquo;
                    </p>

                    {/* 3 Quick Micro-Pillars (1 Line Each) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                          <Sun className="w-3 h-3 text-amber-600" />
                          <span>Color Harmony</span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                          {shortColor}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                          <Ruler className="w-3 h-3 text-stone-700" />
                          <span>Silhouette & Fit</span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                          {shortCut}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                          <Tag className="w-3 h-3 text-emerald-700" />
                          <span>Wear Value</span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                          {shortValue}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Side-by-Side Criteria Matrix */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/90 shadow-subtle overflow-hidden">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-700" />
                  <span>Feature Comparison</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Criteria</th>
                        <th className="py-2.5 px-3">
                          <span className="text-slate-900 font-extrabold block text-xs">Option 1</span>
                          <span className="text-[10px] text-slate-400 font-normal truncate max-w-[130px] block">{candidateA?.brand || 'Item 1'}</span>
                        </th>
                        <th className="py-2.5 px-3">
                          <span className="text-slate-900 font-extrabold block text-xs">Option 2</span>
                          <span className="text-[10px] text-slate-400 font-normal truncate max-w-[130px] block">{candidateB?.brand || 'Item 2'}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-700">Price</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">₹{(candidateA?.price || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">₹{(candidateB?.price || 0).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-700">Style Match</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${scoreA >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-rose-50 text-rose-800 border border-rose-200/60'}`}>
                            {scoreA}/100
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${scoreB >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-rose-50 text-rose-800 border border-rose-200/60'}`}>
                            {scoreB}/100
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-700">Silhouette & Cut</td>
                        <td className="py-2.5 px-3">
                          {duelResult.categories?.faceMatch?.winner === 'itemA' ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/60">Flattering</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">Neutral</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {duelResult.categories?.faceMatch?.winner === 'itemB' ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/60">Flattering</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">Neutral</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-700">Palette Match</td>
                        <td className="py-2.5 px-3">
                          {duelResult.categories?.colorMatch?.winner === 'itemA' ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/60">Harmonious</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px]">Sub-optimal</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {duelResult.categories?.colorMatch?.winner === 'itemB' ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/60">Harmonious</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px]">Sub-optimal</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-700">Recommendation</td>
                        <td className="py-2.5 px-3">
                          {isWinnerA ? (
                            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-extrabold text-[10px] shadow-2xs inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Best Match
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium text-[11px]">Alternative</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {isWinnerB ? (
                            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-extrabold text-[10px] shadow-2xs inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Best Match
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium text-[11px]">Alternative</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Item Switcher Modal / Bottom Sheet */}
      {selectorModal.open && (
        <Modal
          isOpen={selectorModal.open}
          onClose={() => setSelectorModal({ open: false, target: null })}
          title={`Select Item for Option ${selectorModal.target === 'A' ? '1' : '2'}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Pick any previously analyzed piece from your history to compare against the other candidate.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {analyzedProducts.map((prod) => {
                const isCurrent = (selectorModal.target === 'A' && candidateA?.id === prod.id) ||
                  (selectorModal.target === 'B' && candidateB?.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectCandidate(prod)}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                        {cleanProductTitle(prod.name)}
                      </p>
                      <p className={`text-[11px] ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                        ₹{(prod.price || 0).toLocaleString()} · {prod.category}
                      </p>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectorModal({ open: false, target: null })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ComparePage;
