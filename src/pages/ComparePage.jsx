import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Swords,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Scale,
  RefreshCw,
  Loader2,
  Zap,
  Plus,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { productApi } from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

// Clean long and repetitive e-commerce titles (e.g. Flipkart / Amazon SEO titles)
export const cleanProductTitle = (rawTitle) => {
  if (!rawTitle) return 'Fashion Item';
  
  let cleaned = rawTitle
    .replace(/\s*-\s*Buy.*$/i, '')
    .replace(/\s*\|\s*(Flipkart|Myntra|Amazon|Ajio|Zara|Nykaa).*$/i, '')
    .replace(/Online at Best Prices in India.*$/i, '')
    .trim();

  // Deduplicate repeated sentences if present
  const parts = cleaned.split(/,\s*/);
  const uniqueParts = [...new Set(parts)];
  cleaned = uniqueParts.join(', ');

  if (cleaned.length > 55) {
    cleaned = cleaned.substring(0, 52) + '...';
  }
  return cleaned || rawTitle;
};

// Clean raw AI response text from dollar signs and hex codes
export const sanitizeVerdictText = (text) => {
  if (!text) return '';
  return text
    .replace(/\$(\d+)/g, '₹$1')
    .replace(/\(#[0-9A-Fa-f]{3,6}\)/g, '')
    .replace(/#[0-9A-Fa-f]{6}/g, '')
    .trim();
};

export const ComparePage = () => {
  const { analyzedProducts } = useWardrobe();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Selected candidate A and B from analyzed products
  const [candidateA, setCandidateA] = useState(analyzedProducts[0] || null);
  const [candidateB, setCandidateB] = useState(analyzedProducts[1] || null);
  const [dueling, setDueling] = useState(false);
  const [duelResult, setDuelResult] = useState(null);
  const [selectorModal, setSelectorModal] = useState({ open: false, target: null }); // 'A' or 'B'

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
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
          <Swords className="w-3.5 h-3.5 text-emerald-600" />
          <span>Shopping Decision Duel</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Product Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Torn between two items? Put them head-to-head. StyleSync AI analyzes both against your face shape, skin undertone, wardrobe items, and budget to pick the clear winner.
        </p>
      </div>

      {analyzedProducts.length < 2 ? (
        <EmptyState
          icon={Swords}
          title="Analyze at least 2 items to compare"
          description="Upload or scan two product photos/links from Myntra, Flipkart, Zara, or Amazon to run an AI shopping duel."
          actionLabel="Go to Product Advisor"
          onAction={() => navigate('/advisor')}
        />
      ) : (
        <>
          {/* DUEL ARENA: TWO CANDIDATE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative items-stretch">
            {/* VS Floating Badge */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-slate-900 text-white font-black text-xs items-center justify-center shadow-floating border-4 border-slate-50">
              VS
            </div>

            {/* CANDIDATE A */}
            {candidateA && (
              <div className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all relative flex flex-col justify-between ${
                isWinnerA
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-card bg-emerald-50/10'
                  : 'border-slate-200/80 shadow-subtle'
              }`}>
                {/* Winner Pill */}
                {isWinnerA && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-sm animate-fade-in z-10">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>StyleSync Top Pick</span>
                  </div>
                )}

                <div>
                  {/* Candidate Header & Switcher */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Candidate A
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectorModal({ open: true, target: 'A' })}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Switch Item</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 flex items-center justify-center relative group">
                    {candidateA.image ? (
                      <img
                        src={candidateA.image}
                        alt={candidateA.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">No Image</span>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg">
                      {candidateA.category || 'Tops'}
                    </span>
                  </div>

                  {/* Cleaned Product Title */}
                  <h3
                    title={candidateA.name}
                    className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug line-clamp-2 mb-1.5"
                  >
                    {cleanProductTitle(candidateA.name)}
                  </h3>

                  {/* Meta Specs */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="text-emerald-700 font-extrabold text-sm">
                      ₹{(candidateA.price || 0).toLocaleString()}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700">{candidateA.brand || 'Apparel'}</span>
                    {candidateA.color && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block"
                            style={{ backgroundColor: candidateA.colorHex || '#555' }}
                          />
                          {candidateA.color}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score Footer */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                      Duel Score
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5 ${badgeA.bg}`}>
                      {badgeA.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {scoreA}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* CANDIDATE B */}
            {candidateB && (
              <div className={`p-5 sm:p-6 rounded-3xl bg-white border transition-all relative flex flex-col justify-between ${
                isWinnerB
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-card bg-emerald-50/10'
                  : 'border-slate-200/80 shadow-subtle'
              }`}>
                {/* Winner Pill */}
                {isWinnerB && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-sm animate-fade-in z-10">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>StyleSync Top Pick</span>
                  </div>
                )}

                <div>
                  {/* Candidate Header & Switcher */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Candidate B
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectorModal({ open: true, target: 'B' })}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Switch Item</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 flex items-center justify-center relative group">
                    {candidateB.image ? (
                      <img
                        src={candidateB.image}
                        alt={candidateB.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">No Image</span>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg">
                      {candidateB.category || 'Tops'}
                    </span>
                  </div>

                  {/* Cleaned Product Title */}
                  <h3
                    title={candidateB.name}
                    className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug line-clamp-2 mb-1.5"
                  >
                    {cleanProductTitle(candidateB.name)}
                  </h3>

                  {/* Meta Specs */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="text-emerald-700 font-extrabold text-sm">
                      ₹{(candidateB.price || 0).toLocaleString()}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700">{candidateB.brand || 'Apparel'}</span>
                    {candidateB.color && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block"
                            style={{ backgroundColor: candidateB.colorHex || '#555' }}
                          />
                          {candidateB.color}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score Footer */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                      Duel Score
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5 ${badgeB.bg}`}>
                      {badgeB.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {scoreB}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/100</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DUEL VERDICT BANNER */}
          {dueling ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-bold text-slate-900">Comparing styles against your profile & wardrobe...</p>
              <p className="text-xs text-slate-400">Evaluating color synergy, neckline harmony, and cost-per-wear</p>
            </div>
          ) : duelResult ? (
            <div className="space-y-6">
              {/* Flagship AI Recommendation Banner */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-floating relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Official AI Verdict · {duelResult.confidence || '95%'} Confidence
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold mb-2.5 tracking-tight text-white">
                  Recommendation: Buy {cleanProductTitle(duelResult.winnerName || (isWinnerA ? candidateA?.name : candidateB?.name))}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {sanitizeVerdictText(duelResult.verdictSummary)}
                </p>
              </div>

              {/* Side-by-Side Matrix Comparison */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Feature & Suitability Comparison</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Criteria</th>
                        <th className="py-2.5 px-3">{cleanProductTitle(candidateA?.name)}</th>
                        <th className="py-2.5 px-3">{cleanProductTitle(candidateB?.name)}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-700">Price</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">₹{(candidateA?.price || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">₹{(candidateB?.price || 0).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-700">Compatibility Score</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${scoreA >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {scoreA}/100
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${scoreB >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {scoreB}/100
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-700">Face & Cut Match</td>
                        <td className="py-3 px-3 text-slate-600">
                          {duelResult.categories?.faceMatch?.winner === 'itemA' ? '🟢 Flattering Fit' : '🟡 Neutral Fit'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {duelResult.categories?.faceMatch?.winner === 'itemB' ? '🟢 Flattering Fit' : '🟡 Neutral Fit'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-700">Color Synergy</td>
                        <td className="py-3 px-3 text-slate-600">
                          {duelResult.categories?.colorMatch?.winner === 'itemA' ? '🟢 Harmonious' : '🔴 Clashes / Sub-optimal'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {duelResult.categories?.colorMatch?.winner === 'itemB' ? '🟢 Harmonious' : '🔴 Clashes / Sub-optimal'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-700">Decision Verdict</td>
                        <td className="py-3 px-3">
                          {isWinnerA ? (
                            <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              BUY THIS
                            </span>
                          ) : (
                            <span className="font-extrabold text-slate-400">SKIP</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isWinnerB ? (
                            <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              BUY THIS
                            </span>
                          ) : (
                            <span className="font-extrabold text-slate-400">SKIP</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4 Comparison Pillars Detailed Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pillar 1 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900">Face & Cut Harmony</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200/60 shrink-0">
                      Winner: {duelResult.categories?.faceMatch?.winner === 'itemB' ? 'Candidate B' : 'Candidate A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sanitizeVerdictText(duelResult.categories?.faceMatch?.reason)}
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900">Color Synergy with Skin</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200/60 shrink-0">
                      Winner: {duelResult.categories?.colorMatch?.winner === 'itemB' ? 'Candidate B' : 'Candidate A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sanitizeVerdictText(duelResult.categories?.colorMatch?.reason)}
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900">Wardrobe Synergy</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200/60 shrink-0">
                      Winner: {duelResult.categories?.wardrobeMatch?.winner === 'itemB' ? 'Candidate B' : 'Candidate A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sanitizeVerdictText(duelResult.categories?.wardrobeMatch?.reason)}
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900">Cost-Per-Wear & Value</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200/60 shrink-0">
                      Winner: {duelResult.categories?.costPerWear?.winner === 'itemB' ? 'Candidate B' : 'Candidate A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sanitizeVerdictText(duelResult.categories?.costPerWear?.reason)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Item Switcher Modal */}
      {selectorModal.open && (
        <Modal
          isOpen={selectorModal.open}
          onClose={() => setSelectorModal({ open: false, target: null })}
          title={`Select Item for Candidate ${selectorModal.target}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Pick any previously analyzed piece from your history to compare against the other candidate.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {analyzedProducts.map((prod) => {
                const isCurrent = (selectorModal.target === 'A' && candidateA?.id === prod.id) ||
                  (selectorModal.target === 'B' && candidateB?.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectCandidate(prod)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
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
