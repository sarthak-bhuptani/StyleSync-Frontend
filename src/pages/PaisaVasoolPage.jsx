import React, { useState, useMemo } from 'react';
import {
  IndianRupee,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Shirt,
  Layers,
  ShoppingBag,
  Tag,
  Zap,
  BookmarkPlus,
  Coffee,
  Ticket,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';

// Middle-Class Presets for 1-click testing
const PRESETS = [
  {
    id: 'jeans',
    name: 'Everyday Blue Denim Jeans',
    price: 1499,
    category: 'Bottoms',
    frequency: 'weekly_3',
    years: 3,
    fabric: 'cotton_denim',
    description: 'Rugged stretch denim for daily college/work wear.'
  },
  {
    id: 'cotton_tee',
    name: 'Pure Cotton Basic T-Shirt',
    price: 499,
    category: 'Tops',
    frequency: 'weekly_2',
    years: 2,
    fabric: 'cotton_machine',
    description: 'Breathable regular casual t-shirt.'
  },
  {
    id: 'formal_shirt',
    name: 'Office Formal Cotton Blend Shirt',
    price: 1199,
    category: 'Tops',
    frequency: 'weekly_2',
    years: 2,
    fabric: 'poly_blend',
    description: 'Wrinkle-resistant shirt for office and interviews.'
  },
  {
    id: 'wedding_kurta',
    name: 'Embroidered Festive Kurta / Sherwani',
    price: 4999,
    category: 'Ethnic',
    frequency: 'occasional_3',
    years: 2,
    fabric: 'dry_clean_only',
    description: 'Heavy designer piece for cousin’s wedding.'
  },
  {
    id: 'party_dress',
    name: 'Trendy Sequin Club / Party Dress',
    price: 2299,
    category: 'Tops',
    frequency: 'occasional_2',
    years: 1,
    fabric: 'delicate_rayon',
    description: 'Fast-fashion Saturday night party outfit.'
  },
  {
    id: 'daily_sneakers',
    name: 'Versatile White Daily Sneakers',
    price: 2199,
    category: 'Shoes',
    frequency: 'daily',
    years: 2,
    fabric: 'poly_blend',
    description: 'All-rounder shoes matching 90% of casual outfits.'
  }
];

const FREQUENCY_MAP = {
  daily: { label: 'Daily / College / Office (4-5 days/wk)', wearsPerYear: 200 },
  weekly_3: { label: 'Regular Wear (2-3 days/wk)', wearsPerYear: 120 },
  weekly_2: { label: 'Twice a Week (2 days/wk)', wearsPerYear: 100 },
  weekly_1: { label: 'Weekend Casual (1 day/wk)', wearsPerYear: 52 },
  monthly_2: { label: 'Twice a Month (Outings / Dinners)', wearsPerYear: 24 },
  occasional_3: { label: 'Festivals / Weddings (3-4 times/year)', wearsPerYear: 4 },
  occasional_2: { label: 'Special Occasions (2 times/year)', wearsPerYear: 2 },
  occasional_1: { label: 'One-Time Event Only', wearsPerYear: 1 }
};

const FABRIC_MAP = {
  cotton_machine: {
    label: 'Pure Cotton (Machine / Bucket Wash)',
    durability: 'High',
    careCostPerWash: 0,
    bonus: 25,
    tag: 'Durable & Easy Care'
  },
  cotton_denim: {
    label: 'Heavy Denim / Twill (Long Lasting)',
    durability: 'Very High',
    careCostPerWash: 0,
    bonus: 30,
    tag: 'Rough & Tough'
  },
  poly_blend: {
    label: 'Poly-Cotton Blend (Wrinkle Free)',
    durability: 'High',
    careCostPerWash: 0,
    bonus: 20,
    tag: 'Low Maintenance'
  },
  delicate_rayon: {
    label: 'Delicate Rayon / Viscose / Satin (Shrinkage Risk)',
    durability: 'Medium-Low',
    careCostPerWash: 20,
    bonus: 10,
    tag: 'Handle With Care'
  },
  dry_clean_only: {
    label: 'Dry Clean Only (Heavy Silk / Velvet / Sequin)',
    durability: 'High Care Needed',
    careCostPerWash: 180,
    bonus: 0,
    tag: '⚠️ High Laundry Trap'
  }
};

export const PaisaVasoolPage = () => {
  const { wardrobe = [], showToast } = useWardrobe();
  const { user } = useAuth();

  // Form State
  const [name, setName] = useState('Everyday Blue Denim Jeans');
  const [price, setPrice] = useState(1499);
  const [category, setCategory] = useState('Bottoms');
  const [frequency, setFrequency] = useState('weekly_3');
  const [years, setYears] = useState(3);
  const [fabric, setFabric] = useState('cotton_denim');

  // Saved Decisions
  const [savedDecisions, setSavedDecisions] = useState(() => {
    try {
      const stored = localStorage.getItem('stylesync_paisa_vasool_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'saved'

  // Apply Preset
  const handleApplyPreset = (preset) => {
    setName(preset.name);
    setPrice(preset.price);
    setCategory(preset.category);
    setFrequency(preset.frequency);
    setYears(preset.years);
    setFabric(preset.fabric);
  };

  // Cross-match with user's actual closet
  const wardrobeMatches = useMemo(() => {
    if (!wardrobe || wardrobe.length === 0) return [];

    let targetCategories = [];
    if (category === 'Tops' || category === 'Ethnic') {
      targetCategories = ['Bottoms', 'Shoes'];
    } else if (category === 'Bottoms') {
      targetCategories = ['Tops', 'Shoes', 'Outerwear'];
    } else if (category === 'Shoes') {
      targetCategories = ['Bottoms', 'Tops'];
    } else {
      targetCategories = ['Tops', 'Bottoms'];
    }

    return wardrobe.filter(item => targetCategories.includes(item.category)).slice(0, 6);
  }, [wardrobe, category]);

  // Calculations
  const analysis = useMemo(() => {
    const numPrice = Math.max(Number(price) || 0, 1);
    const freqConfig = FREQUENCY_MAP[frequency] || FREQUENCY_MAP.weekly_3;
    const fabricConfig = FABRIC_MAP[fabric] || FABRIC_MAP.cotton_machine;

    const totalWears = Math.max(freqConfig.wearsPerYear * Number(years), 1);
    const baseCPW = numPrice / totalWears;

    // Estimated laundry expense: approximate 1 wash per 2.5 wears
    const washes = Math.ceil(totalWears / 2.5);
    const totalCareExpense = washes * fabricConfig.careCostPerWash;
    const totalTrueExpense = numPrice + totalCareExpense;
    const effectiveCPW = Math.round(totalTrueExpense / totalWears);

    // Matching bonus: if closet has 3+ matching items, zero extra expense needed
    const closetMatchCount = wardrobeMatches.length;
    let matchScore = 15;
    if (closetMatchCount >= 4) matchScore = 30;
    else if (closetMatchCount >= 2) matchScore = 22;
    else if (closetMatchCount === 1) matchScore = 10;
    else matchScore = 5;

    // CPW Score (40 pts max)
    let cpwScore = 0;
    if (effectiveCPW <= 25) cpwScore = 40;
    else if (effectiveCPW <= 45) cpwScore = 35;
    else if (effectiveCPW <= 80) cpwScore = 28;
    else if (effectiveCPW <= 150) cpwScore = 20;
    else if (effectiveCPW <= 300) cpwScore = 12;
    else cpwScore = 4;

    // Fabric durability bonus (30 pts max)
    const fabricScore = fabricConfig.bonus;

    // Total Paisa Vasool Score (0 to 100)
    let finalScore = cpwScore + matchScore + fabricScore;
    finalScore = Math.min(Math.max(finalScore, 10), 100);

    // Relatable Benchmark Index (Chai / Samosa / Movie Ticket)
    let benchmark = {
      icon: Coffee,
      text: 'Cheaper than a cutting chai (₹15) per wear!'
    };
    if (effectiveCPW <= 20) {
      benchmark = {
        icon: Coffee,
        text: `Only ₹${effectiveCPW} per wear — cheaper than a cutting chai & biscuit! Absolute steal.`
      };
    } else if (effectiveCPW <= 50) {
      benchmark = {
        icon: Zap,
        text: `₹${effectiveCPW} per wear — costs as much as a roadside samosa & tea. Highly practical.`
      };
    } else if (effectiveCPW <= 120) {
      benchmark = {
        icon: ShoppingBag,
        text: `₹${effectiveCPW} per wear — decent everyday value. Worth it if you wear it regularly.`
      };
    } else if (effectiveCPW <= 350) {
      benchmark = {
        icon: Ticket,
        text: `₹${effectiveCPW} per wear — you're paying as much as a PVR Cinema Ticket every time you put this on!`
      };
    } else {
      benchmark = {
        icon: ShieldAlert,
        text: `₹${effectiveCPW} per wear! That's equivalent to a fancy restaurant dinner every wear. High regret risk.`
      };
    }

    // Verdict Badge
    let verdict = {
      level: '100% PAISA VASOOL',
      grade: 'A+',
      badgeBg: 'bg-emerald-600',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-300',
      bgColor: 'bg-emerald-50',
      icon: ThumbsUp,
      headline: 'Total Value for Money! Bindaas Khareedo.',
      summary: 'You will easily wear this enough times to justify every single rupee. Zero hidden laundry trap and pairs effortlessly with your existing clothes.'
    };

    if (finalScore >= 80) {
      verdict = {
        level: '100% PAISA VASOOL',
        grade: 'A+',
        badgeBg: 'bg-emerald-600',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-300',
        bgColor: 'bg-emerald-50',
        icon: ThumbsUp,
        headline: 'Superb Paisa Vasool! Bindaas Khareedo.',
        summary: 'Exceptional cost-per-wear. It will serve you for years with zero unnecessary maintenance hassle.'
      };
    } else if (finalScore >= 65) {
      verdict = {
        level: 'GOOD SENSIBLE BUY',
        grade: 'B+',
        badgeBg: 'bg-teal-600',
        textColor: 'text-teal-800',
        borderColor: 'border-teal-300',
        bgColor: 'bg-teal-50',
        icon: CheckCircle2,
        headline: 'Sensible Middle-Class Buy.',
        summary: 'Good practical value. As long as you stick to wearing it regularly, it will easily pay for itself.'
      };
    } else if (finalScore >= 45) {
      verdict = {
        level: 'SOCH SAMAJH KE LO',
        grade: 'C',
        badgeBg: 'bg-amber-500',
        textColor: 'text-amber-800',
        borderColor: 'border-amber-300',
        bgColor: 'bg-amber-50',
        icon: AlertTriangle,
        headline: 'Think Twice: Borderline Value.',
        summary: 'Not terrible, but per-wear cost is high. Check if you can find a cheaper alternative or wait for an End of Season Sale.'
      };
    } else {
      verdict = {
        level: 'PAISA BARBADI ALERT',
        grade: 'D',
        badgeBg: 'bg-rose-600',
        textColor: 'text-rose-800',
        borderColor: 'border-rose-300',
        bgColor: 'bg-rose-50',
        icon: ThumbsDown,
        headline: 'Paisa Barbadi Alert! High Regret Probability.',
        summary: 'You will wear this barely a handful of times, making the cost per wear exorbitant. Likely to sit in the almirah gathering dust.'
      };
    }

    return {
      totalWears,
      baseCPW: Math.round(baseCPW),
      effectiveCPW,
      totalCareExpense,
      totalTrueExpense,
      finalScore,
      benchmark,
      verdict,
      closetMatchCount
    };
  }, [price, frequency, years, fabric, category, wardrobeMatches]);

  // Save calculation
  const handleSaveDecision = () => {
    const decisionItem = {
      id: 'pv_' + Date.now(),
      name,
      price: Number(price),
      category,
      score: analysis.finalScore,
      cpw: analysis.effectiveCPW,
      verdictLevel: analysis.verdict.level,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = [decisionItem, ...savedDecisions];
    setSavedDecisions(updated);
    try {
      localStorage.setItem('stylesync_paisa_vasool_saved', JSON.stringify(updated));
      if (showToast) showToast('Saved to your Buying Decision History!', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDecision = (id) => {
    const filtered = savedDecisions.filter(item => item.id !== id);
    setSavedDecisions(filtered);
    localStorage.setItem('stylesync_paisa_vasool_saved', JSON.stringify(filtered));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Middle-Class Reality Check</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Paisa Vasool Score™
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Don’t let flashy discounts trick you. Calculate the real <strong>Cost-Per-Wear (CPW)</strong>, check if it matches clothes already in your almirah, and detect hidden dry-clean traps before you spend.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Value Calculator
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Saved Decisions</span>
            <span className="bg-slate-900/60 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {savedDecisions.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'calculator' ? (
        <>
          {/* Quick Presets Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Quick Presets (Test Common Middle-Class Purchases)
              </span>
              <span className="text-[11px] text-slate-400">Click any card to auto-fill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected = name === preset.name;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`text-left p-3 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block truncate">{preset.name}</span>
                      <span className="text-[11px] text-emerald-700 font-extrabold mt-0.5 block">
                        ₹{preset.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block capitalize">
                      {preset.category} · {preset.years} yrs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Form on Left, Paisa Vasool Score & Verdict on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Controls (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Item Details</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Live Evaluation</span>
              </div>

              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">What are you thinking of buying?</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cotton Polo Shirt, Levi's Jeans..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Price tag (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    <option value="Tops">Tops / Shirts / T-Shirts</option>
                    <option value="Bottoms">Bottoms / Jeans / Chinos</option>
                    <option value="Shoes">Shoes / Footwear</option>
                    <option value="Ethnic">Ethnic / Kurta / Traditional</option>
                    <option value="Outerwear">Jackets / Outerwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Wear Frequency */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>How often will you honestly wear it?</span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {FREQUENCY_MAP[frequency]?.wearsPerYear} times/year
                  </span>
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  {Object.entries(FREQUENCY_MAP).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Expected Lifespan Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Expected Lifetime of garment:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-extrabold">
                    {years} {years === 1 ? 'Year' : 'Years'} ({analysis.totalWears} total wears)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                  <span>1 Year (Trendy)</span>
                  <span>2 Years (Standard)</span>
                  <span>3 Years (Durable)</span>
                  <span>4 Years (Long term)</span>
                </div>
              </div>

              {/* Fabric & Wash Care */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Fabric & Wash Care</label>
                <select
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  {Object.entries(FABRIC_MAP).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 block">
                  {FABRIC_MAP[fabric]?.tag}
                </span>
              </div>

              {/* Save Decision Button */}
              <button
                type="button"
                onClick={handleSaveDecision}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-[0.99]"
              >
                <BookmarkPlus className="w-4 h-4 text-emerald-400" />
                <span>Save to Buying Decision History</span>
              </button>
            </div>

            {/* Right Column: Score, CPW & Middle-Class Reality Check (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Paisa Vasool Hero Scorecard */}
              <div className={`p-6 sm:p-7 rounded-3xl border ${analysis.verdict.borderColor} ${analysis.verdict.bgColor} shadow-sm relative overflow-hidden transition-all duration-300`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase text-white shadow-sm mb-2.5 ${analysis.verdict.badgeBg}`}>
                      <analysis.verdict.icon className="w-3.5 h-3.5" />
                      <span>{analysis.verdict.level}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {analysis.verdict.headline}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-lg">
                      {analysis.verdict.summary}
                    </p>
                  </div>

                  {/* Score Dial / Badge */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white/90 rounded-2xl border border-slate-200/80 shadow-sm shrink-0 min-w-[130px]">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Paisa Vasool
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl font-black text-slate-900">{analysis.finalScore}</span>
                      <span className="text-sm font-bold text-slate-400">/100</span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 mt-0.5">
                      Grade: {analysis.verdict.grade}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        analysis.finalScore >= 80
                          ? 'bg-emerald-500'
                          : analysis.finalScore >= 60
                          ? 'bg-teal-500'
                          : analysis.finalScore >= 45
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${analysis.finalScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>0 (Money Trap)</span>
                    <span>50 (Borderline)</span>
                    <span>100 (Pure Paisa Vasool)</span>
                  </div>
                </div>
              </div>

              {/* True Cost-Per-Wear & Chai-Samosa Benchmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Metric 1: CPW */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    True Cost-Per-Wear (CPW)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{analysis.effectiveCPW}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">per wear</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Based on <strong>₹{Number(price).toLocaleString('en-IN')}</strong> worn{' '}
                    <strong>{analysis.totalWears} times</strong> over {years} {years === 1 ? 'year' : 'years'}.
                  </p>
                </div>

                {/* Metric 2: Relatable Benchmark */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-2 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Everyday Reality Comparison
                  </span>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                      <analysis.benchmark.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      {analysis.benchmark.text}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Benchmark: 1 Cutting Chai = ₹15–₹20
                  </span>
                </div>
              </div>

              {/* Zero Extra Expense Rule: Almirah Cross-Match */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Almirah Cross-Match (Zero Extra Expense Rule)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Will you need to buy new pants/shoes to wear this, or do you already own pairings?
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    analysis.closetMatchCount >= 3
                      ? 'bg-emerald-100 text-emerald-800'
                      : analysis.closetMatchCount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {analysis.closetMatchCount} Matching Items in Closet
                  </span>
                </div>

                {analysis.closetMatchCount > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
                      🎉 <strong>Zero Extra Expense!</strong> You already have {analysis.closetMatchCount} items in your wardrobe that pair with this {category.toLowerCase()}. You won't be forced to buy extra clothes just to complete an outfit.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {wardrobeMatches.map((item) => (
                        <div
                          key={item.id || item._id}
                          className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-2.5"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                              <Shirt className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">{item.name}</span>
                            <span className="text-[10px] text-slate-400 block">{item.category} · {item.color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>The Matching Trap Warning!</span>
                    </p>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      You don’t currently have matching items recorded in your wardrobe. If you buy this, you might end up spending ₹1,500–₹3,000 more buying new shoes or bottoms just to wear it once.
                    </p>
                  </div>
                )}
              </div>

              {/* Maintenance & Laundry Trap Warning */}
              {fabric === 'dry_clean_only' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-amber-900">Dry-Cleaning Trap Detected</h4>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Dry cleaning costs approximately ₹180 per wash in Indian cities. Washing this item even 5 times will add <strong>₹900 extra</strong> to your total cost ({((900 / Number(price)) * 100).toFixed(0)}% of the original purchase price!).
                    </p>
                  </div>
                </div>
              )}

              {/* Middle-Class Golden Rules Footer Card */}
              <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">💡 StyleSync Golden Rule:</span>
                  <span>If cost-per-wear is under ₹50 and it matches ≥2 things in your almirah, it's Paisa Vasool.</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Saved Buying Decisions Tab */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Saved Buying Decisions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Past items you evaluated before buying. Check your history to avoid repeat impulse purchases.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
              {savedDecisions.length} Items Saved
            </span>
          </div>

          {savedDecisions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <IndianRupee className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No decisions saved yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Use the Value Calculator to test a prospective purchase and click "Save to Buying Decision History".
              </p>
              <button
                onClick={() => setActiveTab('calculator')}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Open Calculator
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-slate-900 text-sm truncate">{decision.name}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                        decision.score >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : decision.score >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {decision.score}/100
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-black text-slate-900">
                        ₹{decision.price?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        (₹{decision.cpw}/wear)
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="capitalize">{decision.category}</span>
                      <span>{decision.date}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {decision.verdictLevel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDecision(decision.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaisaVasoolPage;
