import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
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
  Briefcase,
  Gem,
  User,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { RecommendationBadge } from '../components/common/RecommendationBadge';
import { BrandLogo } from '../components/common/BrandLogo';

export const LandingPage = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Apparel & Suits', count: 'Tailored blazers, overshirts & raw denim', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80' },
    { name: 'Footwear & Boots', count: 'Italian Chelsea boots, derbies & low-tops', img: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Eyewear & Optical', count: 'Classic wayfarers, aviators & acetate frames', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Timepieces', count: 'Automatic chronographs & steel dials', img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Leather Goods', count: 'Executive briefcases, weekenders & wallets', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80' },
    { name: 'Accessories', count: 'Full-grain leather belts, cuffs & rings', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80' }
  ];

  const understandingItems = [
    { title: 'Face Geometry & Necklines', desc: 'Analyzes jawline and face proportions to recommend the exact sunglasses, collars, and hats.', icon: User },
    { title: 'Skin Undertone & Contrast', desc: 'Detects natural undertone and contrast levels to curate colors that elevate your natural complexion.', icon: Palette },
    { title: 'Digital Wardrobe Sync', desc: 'Cross-checks every prospective buy against your closet to ensure instant pairing versatility.', icon: Layers },
    { title: 'Personal Style Archetype', desc: 'Minimalist, Smart Casual, Streetwear, or Modern Tailoring — custom to your silhouette.', icon: Shirt },
    { title: 'Cost-Per-Wear & Budget', desc: 'Evaluates material durability and long-term value against your monthly clothing allocation.', icon: Wallet },
    { title: 'Occasions & Lifestyle', desc: 'Tailors advice whether dressing for client meetings, travel, gym, or weekend dates.', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile: Compact single-line logo */}
            <div className="sm:hidden">
              <BrandLogo size="sm" showSubtitle={false} to="/" />
            </div>
            {/* Tablet/Desktop: Full logo */}
            <div className="hidden sm:block">
              <BrandLogo size="md" to="/" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NavLink
              to="/login"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 px-2.5 sm:px-3 py-2 transition-colors"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              className="px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Get Started
            </NavLink>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Menswear &amp; Personal Wardrobe Advisor</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              Before You Buy It, <br />
              <span className="text-emerald-600">Ask StyleSync.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
              Get personalized advice on whether a jacket, watch, boot, or suit actually fits your build, wardrobe, budget, and lifestyle. Stop buying clothes you only wear once.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group active:scale-[0.98] cursor-pointer"
              >
                <span>Try StyleSync</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/advisor')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm sm:text-base rounded-2xl shadow-2xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <span>See How It Works</span>
              </button>
            </div>

            {/* Value Highlights */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant Screenshot Analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Brand Bias</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Live Advisor Interface Card */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            <div className="relative bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/90 max-w-md mx-auto">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Evaluation</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Match Confidence: 96%</span>
              </div>

              {/* Product Showcase */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80"
                    alt="Handcrafted Leather Chelsea Boots"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menswear / Footwear</span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    Classic Italian Leather Chelsea Boots
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-2">₹8,999 · Full-Grain Espresso Leather</p>
                  
                  {/* Recommendation Tag & Score */}
                  <div className="flex items-center gap-2">
                    <RecommendationBadge decision="BUY" size="sm" />
                    <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      92 / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Insights Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100/80 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">Matches Smart Casual archetype</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100/80 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">Pairs with raw denim &amp; chinos</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100/80 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">Within seasonal footwear budget</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100/80 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">High Versatility (Office &amp; Dinner)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Recommendation Engine</span>
                <NavLink to="/advisor" className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <span>Try screenshot</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-8 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-emerald-200/60">
              Simple 3-Step Flow
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-2 sm:mt-3 tracking-tight">
              How StyleSync Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              No sponsored brand links. No impulse buying. Just tailored wardrobe clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-[#FAFAF9] border border-slate-200/80 hover:shadow-card transition-all">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs sm:text-sm mb-2.5 sm:mb-4 shadow-xs">
                1
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Upload a Product</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Take a quick screenshot from Zara, ASOS, Nike, Uniqlo, or MR PORTER and drop it in. StyleSync extracts silhouette, color, and price.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-[#FAFAF9] border border-slate-200/80 hover:shadow-card transition-all">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs sm:text-sm mb-2.5 sm:mb-4 shadow-xs">
                2
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Multi-Dimension Analysis</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Our model tests the item against your personal dimensions: fit proportions, color palette, existing wardrobe synergy, budget, and occasions.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-[#FAFAF9] border border-slate-200/80 hover:shadow-card transition-all">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-extrabold text-xs sm:text-sm mb-2.5 sm:mb-4 shadow-xs">
                3
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Get Your Decision</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Receive an unequivocal 🟢 BUY, 🟡 MAYBE, or 🔴 SKIP verdict with exact score breakdown, outfit combinations, and better alternatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. What StyleSync Understands Grid */}
      <section className="py-8 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            What StyleSync Understands
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Generic shopping sites want to sell you anything. StyleSync protects your closet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {understandingItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-subtle hover:border-slate-300 transition-all flex flex-col"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-2.5">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Product Categories */}
      <section className="py-8 sm:py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-10">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-emerald-200/60">
                Multi-Category Intelligence
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-2 sm:mt-3 tracking-tight">
                Evaluates Everything You Wear
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mt-1 sm:mt-0">
              From head to toe, get expert verification across all wardrobe categories.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="group relative bg-[#FAFAF9] rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 hover:shadow-card transition-all flex flex-col"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 truncate">{cat.name}</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="py-8 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-12 shadow-card border border-slate-800/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto space-y-3 sm:space-y-4">
            <span className="inline-block text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              Start Shopping Smarter
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Stop guessing. <br />
              Start buying smarter.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-md mx-auto leading-relaxed">
              Join conscious shoppers building curated, high-ROI capsule wardrobes without buyer remorse.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Set Up Your Free Profile</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Streamlined Clean Modern Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 sm:py-10 px-4 sm:px-8 text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Brand Info */}
          <div className="space-y-2 max-w-sm">
            <BrandLogo size="md" to="/" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Personal menswear styling and capsule wardrobe decision engine. Test items before you buy.
            </p>
          </div>

          {/* Quick Clickable Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs font-semibold">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Styling Tools
              </span>
              <ul className="space-y-1.5 text-slate-600">
                <li><NavLink to="/advisor" className="hover:text-emerald-600 transition-colors">Product Advisor</NavLink></li>
                <li><NavLink to="/daily-stylist" className="hover:text-emerald-600 transition-colors">Wear Today</NavLink></li>
                <li><NavLink to="/wardrobe" className="hover:text-emerald-600 transition-colors">My Wardrobe</NavLink></li>
                <li><NavLink to="/assistant" className="hover:text-emerald-600 transition-colors">AI Stylist Chat</NavLink></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Account
              </span>
              <ul className="space-y-1.5 text-slate-600">
                <li><NavLink to="/login" className="hover:text-emerald-600 transition-colors">Sign In</NavLink></li>
                <li><NavLink to="/register" className="hover:text-emerald-600 transition-colors">Create Account</NavLink></li>
                <li><NavLink to="/onboarding" className="hover:text-emerald-600 transition-colors">Setup Profile</NavLink></li>
                <li><NavLink to="/settings" className="hover:text-emerald-600 transition-colors">Settings</NavLink></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="max-w-7xl mx-auto pt-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-400 text-center sm:text-left">
          <p>© 2026 StyleSync. Built for mindful wardrobe curation.</p>
          <div className="flex items-center gap-3 text-emerald-700 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Private Styling Data
            </span>
            <span>•</span>
            <span>Zero Brand Sponsorships</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
