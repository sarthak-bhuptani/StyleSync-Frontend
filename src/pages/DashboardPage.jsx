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

  const handleMarkWorn = () => {
    setWornToday(true);
    showToast("Logged today's outfit! Wear counts updated.", 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-16">
      {/* 1. Natural Human Header */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-xs font-medium text-slate-400 block">
            {todayFormatted}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Hello, {user?.name ? user.name.split(' ')[0] : 'there'} 👋
          </h2>
        </div>

        {/* Live Weather Pill */}
        <button
          type="button"
          onClick={() => refreshWeather(true)}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
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
            <span className="block font-bold leading-tight">{weather.temp}°C {weather.condition}</span>
            <span className="text-[10px] text-slate-400 font-normal leading-none block">{weather.city || 'Your Area'}</span>
          </div>
          <RefreshCw className={`w-3 h-3 text-slate-400 ml-0.5 ${isWeatherLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* 2. Today's Outfit Card (The Core Hero) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Today's Style
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Recommended Outfit
            </h3>
          </div>
          <button
            onClick={() => navigate('/daily-stylist')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
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
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <img
                    src={featuredTop.image}
                    alt={featuredTop.name}
                    className="w-full aspect-square rounded-xl object-cover bg-white mb-2 shadow-2xs"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top</span>
                  <p className="text-xs font-bold text-slate-800 truncate">{featuredTop.name}</p>
                </div>
              )}

              {featuredBottom && (
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <img
                    src={featuredBottom.image}
                    alt={featuredBottom.name}
                    className="w-full aspect-square rounded-xl object-cover bg-white mb-2 shadow-2xs"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bottom</span>
                  <p className="text-xs font-bold text-slate-800 truncate">{featuredBottom.name}</p>
                </div>
              )}

              {featuredShoe && (
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <img
                    src={featuredShoe.image}
                    alt={featuredShoe.name}
                    className="w-full aspect-square rounded-xl object-cover bg-white mb-2 shadow-2xs"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Footwear</span>
                  <p className="text-xs font-bold text-slate-800 truncate">{featuredShoe.name}</p>
                </div>
              )}
            </div>

            {/* Styling Note & Action */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                ✨ <strong className="text-slate-800">Weather Matched:</strong> Clean & comfortable for {weather.temp}°C {weather.label.toLowerCase()}.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkWorn}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Change Outfit →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
              <Shirt className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Your wardrobe is waiting</h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
              Add your favorite shirt and pants to generate weather-matched outfit combinations.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Your First Piece</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Closet & Style at a Glance (Simple, Clean 2-Card Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Closet Breakdown */}
        <div
          onClick={() => navigate('/wardrobe')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">My Closet</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{wardrobe.length}</span>
            <span className="text-xs text-slate-500 font-medium">Pieces in rotation</span>
          </div>
          <p className="text-xs text-slate-500">
            {wardrobe.length > 0
              ? `${topsCount} Tops · ${bottomsCount} Bottoms · ${shoesCount} Footwear`
              : 'Snap items to build your digital capsule'}
          </p>
        </div>

        {/* Card 2: Capsule Gap Tip */}
        <div
          onClick={() => navigate('/wardrobe-gaps')}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">What to Buy</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Minimalist White Low-Tops
          </h4>
          <p className="text-xs text-slate-500">
            Top staple missing to multiply your daily casual & office outfits.
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
