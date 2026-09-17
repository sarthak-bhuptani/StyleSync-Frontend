import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Palette,
  Wallet,
  Calendar,
  Clock,
  Eye,
  Watch,
  Shirt,
  Briefcase
} from 'lucide-react';
import { RecommendationBadge } from '../components/common/RecommendationBadge';
import { ScoreMeter } from '../components/common/ScoreMeter';

export const LandingPage = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Clothing', icon: Shirt, count: 'Shirts, tees, pants & outerwear', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Shoes', icon: ShoppingBag, count: 'Sneakers, boots & loafers', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Eyewear', icon: Eye, count: 'Sunglasses & optical frames', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80' },
    { name: 'Watches', icon: Watch, count: 'Chronographs & minimal dials', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Bags', icon: Briefcase, count: 'Totes, backpacks & crossbodies', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80' },
    { name: 'Accessories', icon: Sparkles, count: 'Belts, jewelry & hats', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80' }
  ];

  const understandingItems = [
    { title: 'Your Style', desc: 'Minimal, Streetwear, Smart Casual or Formal — StyleSync understands your silhouette and proportions.', icon: Shirt },
    { title: 'Your Colors', desc: 'Matches undertones with your favorite palette and warns you of colors you designated to avoid.', icon: Palette },
    { title: 'Your Wardrobe', desc: 'Cross-references your existing pieces to tell you exactly how many outfits you can construct.', icon: Layers },
    { title: 'Your Budget', desc: 'Evaluates price against your monthly category allocation and long-term cost-per-wear value.', icon: Wallet },
    { title: 'Your Occasions', desc: 'Tailors advice whether you dress for corporate meetings, campus daily wear, or black-tie galas.', icon: Calendar },
    { title: 'Your Purchases', desc: 'Learns from post-purchase feedback ratings to continuously sharpen future accuracy.', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black shadow-sm">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">StyleSync</span>
        </NavLink>

        <div className="flex items-center gap-4">
          <NavLink
            to="/login"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/register"
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-subtle hover:shadow transition-all"
          >
            Try StyleSync Free
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI-Powered Personal Shopping Advisor</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Before You Buy It, <br />
              <span className="text-emerald-600 underline decoration-emerald-200 decoration-wavy decoration-2">Ask StyleSync.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
              Get personalized advice on whether a product actually suits your style, wardrobe, budget, and lifestyle. Stop buying clothes you only wear once.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={() => navigate('/onboarding')}
                className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-floating hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <span>Try StyleSync</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/advisor')}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm sm:text-base rounded-2xl shadow-subtle hover:border-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <span>See How It Works</span>
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant Screenshot Analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Sales Bias</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Realistic Live Advisor Interface Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-floating border border-slate-200/80 max-w-lg mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live AI Evaluation</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Match Confidence: 95%</span>
              </div>

              {/* Product Showcase */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
                    alt="White Casual Sneakers"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Footwear / Shoes</span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    Minimal White Leather Low-Tops
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-2">₹7,499 · Italian Calfskin</p>
                  
                  {/* Recommendation Tag & Score */}
                  <div className="flex items-center gap-2">
                    <RecommendationBadge decision="BUY" size="md" />
                    <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      88 / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Small Key Insights */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Matches your style</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Works with 6 wardrobe items</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Within footwear budget</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Highly versatile (Daily & Work)</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">StyleSync Recommendation Engine</span>
                <NavLink to="/advisor" className="font-bold text-emerald-600 hover:text-emerald-700">
                  Try with your screenshot →
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              How StyleSync Works
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 font-normal">
              No sponsored brand links. No impulse buying. Just tailored clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#FAFAF9] border border-slate-200/70 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-lg mb-6 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Upload a Product</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">
                Take a quick screenshot from Zara, ASOS, Nike, or any shop and drop it in. StyleSync extracts silhouette, color, and price.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#FAFAF9] border border-slate-200/70 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg mb-6 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">StyleSync Analyzes It</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">
                Our model tests the item against your 6 personal dimensions: fit, color palette, existing wardrobe items, budget, and occasions.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#FAFAF9] border border-slate-200/70 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-extrabold text-lg mb-6 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Get Your Decision</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">
                Receive an unequivocal 🟢 BUY, 🟡 MAYBE, or 🔴 SKIP verdict with exact score breakdown, outfit combinations, and better alternatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What StyleSync Understands Matrix */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What StyleSync Understands
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2 font-normal">
            Generic shopping sites want to sell you anything. StyleSync protects your closet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {understandingItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-4">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                Multi-Category Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
                Evaluates Everything You Wear
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-xs mt-3 sm:mt-0">
              From head to toe, get expert verification across all wardrobe categories.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-[#FAFAF9] rounded-2xl p-4 border border-slate-200/80 hover:shadow-card transition-all flex flex-col"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-white">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">{cat.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{cat.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <div className="bg-slate-900 text-white rounded-3xl p-10 sm:p-16 shadow-floating relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Start Shopping Smarter
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Stop guessing. <br />
              Start buying smarter.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal">
              Join thousands of conscious shoppers building curated, highly wearable capsules without buyer remorse.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/onboarding')}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition-all active:scale-95"
              >
                Set Up Your Free Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        <p>© 2025 StyleSync AI Inc. Built for personal shopping clarity. Your photos and styling data are strictly private.</p>
      </footer>
    </div>
  );
};
