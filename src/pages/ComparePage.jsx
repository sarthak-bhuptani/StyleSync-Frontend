import React, { useState, useEffect } from 'react';
import {
  Swords,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Scale,
  RefreshCw,
  Loader2,
  Zap,
  Plus
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { productApi } from '../api/productApi';
import { useAuth } from '../context/AuthContext';

export const ComparePage = () => {
  const { analyzedProducts } = useWardrobe();
  const { user } = useAuth();

  // Selected candidate A and B
  const [candidateA, setCandidateA] = useState(analyzedProducts[0] || {
    name: 'Black Wayfarer Sunglasses',
    category: 'Eyewear',
    price: 2999,
    color: 'Matte Black',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    description: 'Polarized rectangular frame sunglasses.'
  });

  const [candidateB, setCandidateB] = useState(analyzedProducts[1] || {
    name: 'Gold Aviator Shades',
    category: 'Eyewear',
    price: 4499,
    color: 'Gold / Green',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80',
    description: 'Classic teardrop aviator frame with tinted lenses.'
  });

  const [dueling, setDueling] = useState(false);
  const [duelResult, setDuelResult] = useState(null);

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

  useEffect(() => {
    runComparison();
  }, []);

  const handleSelectA = (prod) => {
    setCandidateA(prod);
    runComparison(prod, candidateB);
  };

  const handleSelectB = (prod) => {
    setCandidateB(prod);
    runComparison(candidateA, prod);
  };

  const isWinnerA = duelResult?.winner === 'itemA';
  const isWinnerB = duelResult?.winner === 'itemB';

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
          <Swords className="w-3.5 h-3.5 text-emerald-600" />
          <span>Which One Should I Buy?</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Head-to-Head Shopping Duel
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Torn between two items? Put them head-to-head. StyleSync AI analyzes both against your face shape, skin undertone, wardrobe items, and budget to pick the clear winner.
        </p>
      </div>

      {/* DUEL ARENA: TWO CANDIDATE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative items-stretch">
        {/* VS Floating Badge */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold text-xs items-center justify-center shadow-floating border-4 border-slate-50">
          VS
        </div>

        {/* CANDIDATE A */}
        <div className={`p-6 rounded-3xl bg-white border transition-all relative flex flex-col justify-between ${
          isWinnerA ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-card' : 'border-slate-200/80 shadow-subtle'
        }`}>
          {isWinnerA && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-sm">
              <Trophy className="w-3.5 h-3.5" />
              <span>StyleSync Top Pick</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate A</span>
              {analyzedProducts.length > 0 && (
                <select
                  onChange={(e) => {
                    const found = analyzedProducts.find(p => p.id === e.target.value);
                    if (found) handleSelectA(found);
                  }}
                  value={candidateA.id || ''}
                  className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 max-w-[150px] truncate"
                >
                  <option value="">Switch Item...</option>
                  {analyzedProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Image Preview */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 flex items-center justify-center">
              {candidateA.image ? (
                <img
                  src={candidateA.image}
                  alt={candidateA.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-slate-400">No Image</span>
              )}
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 leading-snug mb-1">
              {candidateA.name}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
              <span className="text-emerald-700 font-extrabold text-sm">
                ₹{candidateA.price || '0'}
              </span>
              <span>·</span>
              <span>{candidateA.category}</span>
              {candidateA.color && (
                <>
                  <span>·</span>
                  <span>{candidateA.color}</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Overall Duel Score</span>
            <span className="text-lg font-extrabold text-slate-900">
              {duelResult?.itemAScore || 85}/100
            </span>
          </div>
        </div>

        {/* CANDIDATE B */}
        <div className={`p-6 rounded-3xl bg-white border transition-all relative flex flex-col justify-between ${
          isWinnerB ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-card' : 'border-slate-200/80 shadow-subtle'
        }`}>
          {isWinnerB && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-sm">
              <Trophy className="w-3.5 h-3.5" />
              <span>StyleSync Top Pick</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate B</span>
              {analyzedProducts.length > 0 && (
                <select
                  onChange={(e) => {
                    const found = analyzedProducts.find(p => p.id === e.target.value);
                    if (found) handleSelectB(found);
                  }}
                  value={candidateB.id || ''}
                  className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 max-w-[150px] truncate"
                >
                  <option value="">Switch Item...</option>
                  {analyzedProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Image Preview */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 flex items-center justify-center">
              {candidateB.image ? (
                <img
                  src={candidateB.image}
                  alt={candidateB.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-slate-400">No Image</span>
              )}
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 leading-snug mb-1">
              {candidateB.name}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
              <span className="text-emerald-700 font-extrabold text-sm">
                ₹{candidateB.price || '0'}
              </span>
              <span>·</span>
              <span>{candidateB.category}</span>
              {candidateB.color && (
                <>
                  <span>·</span>
                  <span>{candidateB.color}</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Overall Duel Score</span>
            <span className="text-lg font-extrabold text-slate-900">
              {duelResult?.itemBScore || 82}/100
            </span>
          </div>
        </div>
      </div>

      {/* DUEL VERDICT BANNER */}
      {dueling ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
          <p className="text-xs font-bold text-slate-600">Simulating head-to-head fashion duel with Gemini AI...</p>
        </div>
      ) : duelResult ? (
        <div className="space-y-6">
          {/* AI Decision Box */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-floating relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Official AI Verdict · {duelResult.confidence || '94%'} Confidence
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight">
              Recommendation: Buy {duelResult.winnerName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {duelResult.verdictSummary}
            </p>
          </div>

          {/* 4 Head-to-Head Comparison Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pillar 1: Face & Silhouette Harmony */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Face & Cut Harmony</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                  Winner: {duelResult.categories?.faceMatch?.winnerItem || 'Candidate A'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {duelResult.categories?.faceMatch?.reason}
              </p>
            </div>

            {/* Pillar 2: Color Synergy */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Color Synergy with Skin</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                  Winner: {duelResult.categories?.colorMatch?.winnerItem || 'Candidate B'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {duelResult.categories?.colorMatch?.reason}
              </p>
            </div>

            {/* Pillar 3: Wardrobe Versatility */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Wardrobe Synergy</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                  Winner: {duelResult.categories?.wardrobeMatch?.winnerItem || 'Candidate A'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {duelResult.categories?.wardrobeMatch?.reason}
              </p>
            </div>

            {/* Pillar 4: Cost-Per-Wear */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Cost-Per-Wear & Value</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/60">
                  Winner: {duelResult.categories?.costPerWear?.winnerItem || 'Candidate A'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {duelResult.categories?.costPerWear?.reason}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
