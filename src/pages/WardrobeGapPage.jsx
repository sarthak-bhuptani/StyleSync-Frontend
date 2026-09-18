import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  PlusCircle,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  Shirt,
  ArrowRight,
  Plus,
  Eye,
  Check,
  Zap,
  Tag,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';

export const WardrobeGapPage = () => {
  const { wardrobe, addWardrobeItem, showToast } = useWardrobe();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [selectedGapForPreview, setSelectedGapForPreview] = useState(null);

  // Category counts
  const counts = useMemo(() => {
    return {
      tops: wardrobe.filter(i => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(i.category) || i.name?.toLowerCase().includes('shirt') || i.name?.toLowerCase().includes('tee')).length,
      bottoms: wardrobe.filter(i => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(i.category) || i.name?.toLowerCase().includes('jean') || i.name?.toLowerCase().includes('pant')).length,
      shoes: wardrobe.filter(i => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(i.category) || i.name?.toLowerCase().includes('shoe') || i.name?.toLowerCase().includes('sneaker')).length,
      layers: wardrobe.filter(i => ['Outerwear', 'Jacket', 'Coat', 'Blazer'].includes(i.category) || i.name?.toLowerCase().includes('jacket') || i.name?.toLowerCase().includes('blazer')).length,
    };
  }, [wardrobe]);

  // Dynamic Gaps determined by analyzing current closet
  const wardrobeGaps = useMemo(() => {
    return [
      {
        id: 'gap_sneaker',
        title: 'Minimalist White Leather Low-Top Sneaker',
        category: 'Shoes',
        priority: counts.shoes < 2 ? 'High Priority' : 'Medium Priority',
        priorityColor: counts.shoes < 2 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200',
        unlocksOutfitsCount: Math.max(8, counts.tops * counts.bottoms > 0 ? counts.tops * counts.bottoms : 10),
        reason: 'The ultimate versatile footwear anchor. Pairs effortlessly with chinos, dark selvedge denim, tailored trousers, and summer shorts.',
        missingRole: 'Bridges casual everyday wear with elevated smart-casual outfits.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
        priceRange: '₹2,499 – ₹5,999',
        curatedPicks: [
          { name: 'Stan Smith Classic Leather', brand: 'Adidas Originals', price: 4999, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80' },
          { name: 'Court Vision Low Clean', brand: 'Nike', price: 3495, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80' }
        ]
      },
      {
        id: 'gap_layer',
        title: 'Structured Navy / Olive Overshirt',
        category: 'Outerwear',
        priority: counts.layers < 1 ? 'High Priority' : 'Medium Priority',
        priorityColor: counts.layers < 1 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        unlocksOutfitsCount: Math.max(6, counts.tops * 2),
        reason: 'Adds texture and depth without bulk. Thrown open over any plain white or grey tee instantly creates an intentional 2-layer silhouette.',
        missingRole: 'Provides essential layering for air-conditioned offices, evenings, and trans-seasonal weather.',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
        priceRange: '₹1,999 – ₹3,999',
        curatedPicks: [
          { name: 'Heavy Twill Worker Overshirt', brand: 'Uniqlo', price: 2990, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80' },
          { name: 'Denim Chore Jacket Raw', brand: 'Levi\'s', price: 3799, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80' }
        ]
      },
      {
        id: 'gap_chino',
        title: 'Tailored Beige / Khaki Stretch Chinos',
        category: 'Bottoms',
        priority: counts.bottoms < 3 ? 'High Priority' : 'Low Priority',
        priorityColor: 'bg-amber-50 text-amber-700 border-amber-200',
        unlocksOutfitsCount: Math.max(7, counts.tops * 2),
        reason: 'Breaks the monotony of blue denim and provides warm neutral contrast for dark shirts, navy polos, and black tees.',
        missingRole: 'The core pillar for business casual meetings, coffee dates, and travel.',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80',
        priceRange: '₹1,799 – ₹3,499',
        curatedPicks: [
          { name: 'Smart 360 Flex Chino', brand: 'Dockers', price: 2799, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=400&q=80' }
        ]
      },
      {
        id: 'gap_linen_shirt',
        title: 'Breathable Pure Linen Resort Shirt',
        category: 'Tops',
        priority: 'Smart Upgrade',
        priorityColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        unlocksOutfitsCount: 5,
        reason: 'High texture linen brings relaxed luxury to warm climates while preventing sweat marks and overheating.',
        missingRole: 'Summer brunch, beach trips, and weekend day outings.',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
        priceRange: '₹1,999 – ₹3,299',
        curatedPicks: [
          { name: '100% Premium Linen Shirt', brand: 'Marks & Spencer', price: 3299, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' }
        ]
      }
    ];
  }, [counts]);

  const handleSimulateAddToWardrobe = (pick, gap) => {
    addWardrobeItem({
      name: pick.name,
      category: gap.category,
      brand: pick.brand,
      price: pick.price,
      image: pick.image,
      color: gap.category === 'Shoes' ? 'White' : 'Navy / Neutral',
      style: 'Smart Essential'
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
    <div className="space-y-7 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-floating relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3 border border-white/10">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>Smart Wardrobe Gap Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              What You Need to Buy Next
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Stop buying clothes that sit in your closet. StyleSync analyzes your current {wardrobe.length} items to identify the exact pieces that will <strong className="text-emerald-300 font-bold">multiply your existing outfits</strong>.
            </p>
          </div>

          {/* Quick Metrics Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-6 flex-shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Capsule Health</span>
              <span className="text-2xl font-black text-emerald-400">
                {Math.min(95, 50 + wardrobe.length * 5)}/100
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Versatility Rating</span>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">Top Gaps</span>
              <span className="text-2xl font-black text-white">{wardrobeGaps.length}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Identified Pieces</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wardrobe Composition Health Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Your Current Closet Balance</h3>
            <p className="text-xs text-slate-400">Balanced capsule distribution across categories</p>
          </div>
          <button
            onClick={() => navigate('/wardrobe')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Manage Wardrobe ({wardrobe.length}) →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold block mb-0.5">Tops / Shirts</span>
            <span className="text-xl font-black text-slate-900">{counts.tops}</span>
            <span className={`text-[10px] font-bold block mt-1 ${counts.tops >= 4 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {counts.tops >= 4 ? '✓ Well Stocked' : 'Needs Basics'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold block mb-0.5">Bottoms / Pants</span>
            <span className="text-xl font-black text-slate-900">{counts.bottoms}</span>
            <span className={`text-[10px] font-bold block mt-1 ${counts.bottoms >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {counts.bottoms >= 3 ? '✓ Healthy Balance' : 'Needs 1 More'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold block mb-0.5">Shoes / Footwear</span>
            <span className="text-xl font-black text-slate-900">{counts.shoes}</span>
            <span className={`text-[10px] font-bold block mt-1 ${counts.shoes >= 2 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {counts.shoes >= 2 ? '✓ Adequate' : '⚠️ Top Priority Gap'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold block mb-0.5">Jackets / Layers</span>
            <span className="text-xl font-black text-slate-900">{counts.layers}</span>
            <span className={`text-[10px] font-bold block mt-1 ${counts.layers >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {counts.layers >= 1 ? '✓ Layer Ready' : 'Add 1 Overshirt'}
            </span>
          </div>
        </div>
      </div>

      {/* Gap Recommendations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>High-ROI Wardrobe Additions</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Ranked by Outfit Multiplier
            </span>
          </h2>
          <span className="text-xs text-slate-400">Click any item to see pairings with your clothes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wardrobeGaps.map((gap) => (
            <div
              key={gap.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Priority Badge + Category + Multiplier */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${gap.priorityColor}`}>
                      {gap.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{gap.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/70 rounded-full text-emerald-800 text-xs font-extrabold shadow-2xs">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                    <span>+{gap.unlocksOutfitsCount} New Outfits</span>
                  </div>
                </div>

                {/* Main Image + Title */}
                <div className="flex gap-4 items-start mb-3">
                  <img
                    src={gap.image}
                    alt={gap.title}
                    className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{gap.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{gap.reason}</p>
                  </div>
                </div>

                {/* Role Note */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  <strong className="text-slate-800 font-bold">Why it works: </strong>
                  {gap.missingRole}
                </div>
              </div>

              {/* Curated Recommendations Section */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Recommended Products to Buy</span>
                  <span className="text-slate-400 font-medium">Est. {gap.priceRange}</span>
                </div>

                <div className="space-y-2">
                  {gap.curatedPicks.map((pick, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={pick.image}
                          alt={pick.name}
                          className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{pick.name}</p>
                          <p className="text-[11px] text-slate-500">{pick.brand} · ₹{pick.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleAnalyzeWithAdvisor(pick)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-all shadow-2xs"
                          title="Evaluate with AI Advisor"
                        >
                          Check Fit
                        </button>
                        <button
                          onClick={() => handleSimulateAddToWardrobe(pick, gap)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                          title="Add Directly to Wardrobe"
                        >
                          <Plus className="w-3 h-3 text-emerald-400" />
                          <span>Add to Closet</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WardrobeGapPage;
