import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shirt,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { useWeather } from '../context/WeatherContext';
import { AddWardrobeItemModal } from '../components/wardrobe/AddWardrobeItemModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { wardrobe, addWardrobeItem, showToast } = useWardrobe();
  const { weather, isLoading: isWeatherLoading, refreshWeather } = useWeather();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [wornToday, setWornToday] = useState(false);

  // Featured pieces from user's closet
  const featuredTop = wardrobe.find(w => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(w.category));
  const featuredBottom = wardrobe.find(w => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(w.category));
  const featuredShoe = wardrobe.find(w => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(w.category));
  const hasOutfit = wardrobe.length > 0 && (featuredTop || featuredBottom || featuredShoe);

  // Category counts for quick glance
  const topsCount = wardrobe.filter(i => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(i.category)).length;
  const bottomsCount = wardrobe.filter(i => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(i.category)).length;
  const shoesCount = wardrobe.filter(i => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(i.category)).length;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  // Helper for dynamic time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️', vibe: 'Ready for the day ahead?' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️', vibe: 'Hope your day is looking great!' };
    return { text: 'Good evening', emoji: '🌙', vibe: 'Unwinding or heading out tonight?' };
  };

  const greeting = getGreeting();
  const userName = user?.name ? user.name.split(' ')[0] : user?.username || 'there';

  const handleMarkWorn = () => {
    setWornToday(true);
    showToast("Logged today's look! Syncra updated your closet wear counts.", 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-16">
      {/* 1. Natural Human Header with Time-of-Day Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {todayFormatted}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500 font-medium">{greeting.vibe}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {greeting.text}, {userName} {greeting.emoji}
          </h2>
        </div>

        {/* Live Weather Pill */}
        <button
          type="button"
          onClick={() => refreshWeather(true)}
          className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs transition-all cursor-pointer active:scale-95"
          title="Click to refresh weather"
        >
          {weather.icon === 'CloudRain' ? (
            <CloudRain className="w-4 h-4 text-blue-500" />
          ) : weather.icon === 'Cloud' ? (
            <Cloud className="w-4 h-4 text-slate-500" />
          ) : weather.icon === 'Snowflake' ? (
            <Snowflake className="w-4 h-4 text-cyan-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <div className="text-left">
            <span className="block font-bold leading-tight text-slate-900">{weather.temp || 22}°C {weather.condition || 'Mild'}</span>
            <span className="text-[10px] text-slate-400 font-medium leading-none block">{weather.city || 'Your Area'}</span>
          </div>
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ml-1 ${isWeatherLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* 2. Today's Outfit Card (Hero Bento Card) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block font-mono">
              Today's Curated Look
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Weather-Matched Styling
            </h3>
          </div>
          <button
            onClick={() => navigate('/daily-stylist')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Full Lookbook</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasOutfit ? (
          <div className="space-y-4">
            {/* Clothes Visual Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {featuredTop && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center shadow-2xs group hover:border-slate-200 transition-all">
                  <img
                    src={featuredTop.image}
                    alt={featuredTop.name}
                    className="w-full aspect-square rounded-xl object-cover bg-white mb-2 shadow-2xs group-hover:scale-102 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Top</span>
                  <p className="text-xs font-bold text-slate-800 truncate">{featuredTop.name}</p>
                </div>
              )}

              {featuredBottom && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center shadow-2xs group hover:border-slate-200 transition-all">
                  <img
                    src={featuredBottom.image}
                    alt={featuredBottom.name}
                    className="w-full aspect-square rounded-xl object-cover bg-white mb-2 shadow-2xs group-hover:scale-102 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Bottom</span>
                  <p className="text-xs font-bold text-slate-800 truncate">{featuredBottom.name}</p>
                </div>
              )}

              {featuredShoe && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center shadow-2xs group hover:border-slate-200 transition-all">
                  <img
                    src={featuredShoe.image}
                    alt={featuredShoe.name}
                    className="w-full aspect-square rounded-xl object-cover bg-white mb-2 shadow-2xs group-hover:scale-102 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Footwear</span>
                  <p className="text-xs font-bold text-slate-800 truncate">{featuredShoe.name}</p>
                </div>
              )}
            </div>

            {/* Styling Note & Action */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                🌱 <strong className="text-slate-800">Why it works:</strong> Breathable, comfortable, and calibrated for {weather.temp || 22}°C weather.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkWorn}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    wornToday
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {wornToday ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Worn Today ✓</span>
                    </>
                  ) : (
                    <span>Wear Today</span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/daily-stylist')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Change Look →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
              <Shirt className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Your wardrobe is ready for its first pieces</h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
              Snap a photo of your favorite shirt and pants so Syncra can craft daily weather looks for you.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Piece</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Closet & Style at a Glance (Bento Pair) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Closet Breakdown */}
        <div
          onClick={() => navigate('/wardrobe')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Closet</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{wardrobe.length}</span>
            <span className="text-xs text-slate-500 font-medium">Pieces in rotation</span>
          </div>
          <p className="text-xs text-slate-500">
            {wardrobe.length > 0
              ? `${topsCount} Tops · ${bottomsCount} Bottoms · ${shoesCount} Footwear`
              : 'Add items to unlock personalized styling'}
          </p>
        </div>

        {/* Card 2: What to Buy Next */}
        <div
          onClick={() => navigate('/wardrobe-gaps')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono">Syncra's Suggestion</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Minimalist White Low-Tops
          </h4>
          <p className="text-xs text-slate-500">
            A key staple that will unlock 5+ new combinations with your existing pants and shirts.
          </p>
        </div>
      </div>

      {/* Add Wardrobe Item Modal */}
      <AddWardrobeItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addWardrobeItem}
      />
    </div>
  );
};

export default DashboardPage;
