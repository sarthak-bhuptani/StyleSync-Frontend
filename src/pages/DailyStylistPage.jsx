import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  CheckCircle2,
  Calendar,
  RotateCw,
  Shirt,
  Layers,
  ShoppingBag,
  Flame,
  ArrowRight,
  Clock,
  Compass,
  Check,
  Plus,
  RefreshCw,
  Thermometer,
  MapPin,
  Camera,
  Zap
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';

export const DailyStylistPage = () => {
  const { wardrobe, updateWardrobeItem, showToast } = useWardrobe();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Weather State
  const [selectedWeather, setSelectedWeather] = useState({
    condition: 'Sunny',
    temp: 27,
    location: 'Mumbai, India',
    label: 'Warm & Sunny'
  });

  // Occasion & Vibe State
  const [selectedOccasion, setSelectedOccasion] = useState('Office / Work');
  const [selectedVibe, setSelectedVibe] = useState('Smart Casual');
  const [wornTodayOutfitId, setWornTodayOutfitId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSwapSlot, setActiveSwapSlot] = useState(null);

  // Wear History
  const [wearHistory, setWearHistory] = useState(() => {
    const saved = localStorage.getItem('stylesync_wear_history');
    return saved ? JSON.parse(saved) : [];
  });

  const occasions = [
    { name: 'Office / Work', icon: '💼', tag: 'Smart / Structured' },
    { name: 'Casual Day Out', icon: '☕', tag: 'Relaxed / Easy' },
    { name: 'Date Night', icon: '🍷', tag: 'Elevated / Sharp' },
    { name: 'College / Study', icon: '🎒', tag: 'Comfort / Trendy' },
    { name: 'Gym / Athleisure', icon: '⚡', tag: 'Active / Breathable' },
    { name: 'Party / Evening', icon: '✨', tag: 'Bold / Statement' },
  ];

  const weatherPresets = [
    { condition: 'Sunny', temp: 28, label: 'Warm & Sunny', icon: Sun, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { condition: 'Mild', temp: 22, label: 'Pleasant & Mild', icon: Cloud, color: 'text-sky-500 bg-sky-50 border-sky-200' },
    { condition: 'Rainy', temp: 24, label: 'Monsoon / Wet', icon: CloudRain, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { condition: 'Cool', temp: 16, label: 'Chilly / Layered', icon: Snowflake, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  ];

  // Organize user's uploaded wardrobe by categories
  const tops = useMemo(() => wardrobe.filter(i => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(i.category) || i.name?.toLowerCase().includes('shirt') || i.name?.toLowerCase().includes('tee')), [wardrobe]);
  const bottoms = useMemo(() => wardrobe.filter(i => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(i.category) || i.name?.toLowerCase().includes('pant') || i.name?.toLowerCase().includes('jean') || i.name?.toLowerCase().includes('trouser')), [wardrobe]);
  const shoes = useMemo(() => wardrobe.filter(i => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(i.category) || i.name?.toLowerCase().includes('shoe') || i.name?.toLowerCase().includes('sneaker') || i.name?.toLowerCase().includes('boot')), [wardrobe]);
  const layers = useMemo(() => wardrobe.filter(i => ['Outerwear', 'Jacket', 'Coat', 'Blazer', 'Overcoat'].includes(i.category) || i.name?.toLowerCase().includes('jacket') || i.name?.toLowerCase().includes('blazer')), [wardrobe]);
  const accessories = useMemo(() => wardrobe.filter(i => ['Accessories', 'Watches', 'Eyewear', 'Bags'].includes(i.category)), [wardrobe]);

  // Generate outfit combinations strictly from user's uploaded wardrobe
  const [generatedEnsembles, setGeneratedEnsembles] = useState(() => {
    return createOutfits(tops, bottoms, shoes, layers, accessories, selectedOccasion, selectedWeather);
  });

  function createOutfits(t, b, s, l, a, occ, wth) {
    if (t.length === 0 && b.length === 0 && s.length === 0) {
      return [];
    }

    const availableTop = t[0] || null;
    const availableBottom = b[0] || null;
    const availableShoe = s[0] || null;

    const outfits = [];

    // Look 1: Primary combo
    if (availableTop || availableBottom || availableShoe) {
      outfits.push({
        id: 'outfit_primary',
        title: `The Effortless ${occ.split(' ')[0]} Essential`,
        vibe: 'Clean & Polished',
        compatibilityScore: 98,
        reason: `Harmonized pairing for ${wth.label.toLowerCase()} weather, calibrated to your body profile.`,
        top: t[0] || null,
        bottom: b[0] || null,
        shoe: s[0] || null,
        layer: wth.temp < 20 ? (l[0] || null) : (l[0] || null),
        accessory: a[0] || null,
        stylingTip: 'Slightly roll the cuffs and pair with your favorite minimalist watch.'
      });
    }

    // Look 2: Alt combo
    if (t.length > 1 || b.length > 1 || s.length > 1) {
      outfits.push({
        id: 'outfit_alt1',
        title: `Modern ${selectedVibe} Alternative`,
        vibe: 'Sleek & Contemporary',
        compatibilityScore: 94,
        reason: 'Clean lines and versatile color combination for seamless day-to-night styling.',
        top: t[1] || t[0] || null,
        bottom: b[1] || b[0] || null,
        shoe: s[1] || s[0] || null,
        layer: l[1] || (wth.temp < 22 ? l[0] : null),
        accessory: a[1] || null,
        stylingTip: 'Keep accessories understated to let the texture and silhouette stand out.'
      });
    }

    // Look 3: Contrast combo
    if (t.length > 2 || b.length > 1 || s.length > 1) {
      outfits.push({
        id: 'outfit_alt2',
        title: `Dynamic Contrast Look`,
        vibe: 'Sharp & Expressive',
        compatibilityScore: 91,
        reason: 'High color harmony optimized for comfort and confidence.',
        top: t[2] || t[0] || null,
        bottom: b[0] || null,
        shoe: s[0] || null,
        layer: l[0] || null,
        accessory: a[0] || null,
        stylingTip: 'Unbutton the top collar button for a relaxed, approachable confidence.'
      });
    }

    return outfits;
  }

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const shuffledTops = [...tops].sort(() => 0.5 - Math.random());
      const shuffledBottoms = [...bottoms].sort(() => 0.5 - Math.random());
      const shuffledShoes = [...shoes].sort(() => 0.5 - Math.random());
      const shuffledLayers = [...layers].sort(() => 0.5 - Math.random());
      const newEnsembles = createOutfits(shuffledTops, shuffledBottoms, shuffledShoes, shuffledLayers, accessories, selectedOccasion, selectedWeather);
      setGeneratedEnsembles(newEnsembles);
      setIsGenerating(false);
      showToast('Generated fresh daily outfits tailored to your wardrobe!', 'success');
    }, 300);
  };

  const handleOccasionChange = (occ) => {
    setSelectedOccasion(occ);
    const newEnsembles = createOutfits(tops, bottoms, shoes, layers, accessories, occ, selectedWeather);
    setGeneratedEnsembles(newEnsembles);
  };

  const handleWeatherChange = (w) => {
    setSelectedWeather(w);
    const newEnsembles = createOutfits(tops, bottoms, shoes, layers, accessories, selectedOccasion, w);
    setGeneratedEnsembles(newEnsembles);
  };

  const handleWearToday = (outfit) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const newLog = {
      id: 'log_' + Date.now(),
      date: today,
      outfitTitle: outfit.title,
      occasion: selectedOccasion,
      temp: `${selectedWeather.temp}°C ${selectedWeather.condition}`,
      items: [outfit.top, outfit.bottom, outfit.shoe, outfit.layer].filter(Boolean)
    };

    [outfit.top, outfit.bottom, outfit.shoe, outfit.layer].filter(Boolean).forEach(item => {
      if (item.id) {
        updateWardrobeItem(item.id, { usageCount: (item.usageCount || 0) + 1 });
      }
    });

    const updatedHistory = [newLog, ...wearHistory.filter(h => h.date !== today)];
    setWearHistory(updatedHistory);
    localStorage.setItem('stylesync_wear_history', JSON.stringify(updatedHistory));
    setWornTodayOutfitId(outfit.id);
    showToast(`Logged "${outfit.title}" as today's outfit! Wear count updated.`, 'success');
  };

  const handleSwapItem = (outfitIndex, slotKey, newItem) => {
    setGeneratedEnsembles(prev => {
      const copy = [...prev];
      copy[outfitIndex] = {
        ...copy[outfitIndex],
        [slotKey]: newItem
      };
      return copy;
    });
    setActiveSwapSlot(null);
    showToast(`Swapped ${slotKey} successfully!`, 'info');
  };

  return (
    <div className="space-y-7 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-floating relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold mb-3 border border-white/10 backdrop-blur-sm">
              <Sun className="w-3.5 h-3.5 text-emerald-400" />
              <span>Today's Style Forecast</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              What to Wear Today, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Curated outfits generated exclusively from your <strong className="text-white font-bold">{wardrobe.length} uploaded wardrobe pieces</strong>, harmonized with today's weather & your schedule.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-4 flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
              <Sun className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedWeather.location}</span>
              </div>
              <div className="text-xl font-black text-white flex items-center gap-2">
                <span>{selectedWeather.temp}°C</span>
                <span className="text-xs font-semibold text-emerald-300">· {selectedWeather.condition}</span>
              </div>
              <span className="text-[11px] text-slate-400">{selectedWeather.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>1. Choose Today's Occasion / Vibe</span>
            </label>
            <span className="text-[11px] font-semibold text-emerald-700">Active: {selectedOccasion}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {occasions.map((occ) => {
              const isSelected = selectedOccasion === occ.name;
              return (
                <button
                  key={occ.name}
                  onClick={() => handleOccasionChange(occ.name)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg mb-1">{occ.icon}</div>
                  <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {occ.name}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {occ.tag}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Weather Condition:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {weatherPresets.map((w) => {
              const Icon = w.icon;
              const isSelected = selectedWeather.condition === w.condition;
              return (
                <button
                  key={w.condition}
                  onClick={() => handleWeatherChange(w)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{w.temp}°C {w.condition}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wardrobe Check */}
      {wardrobe.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="No clothes in your digital wardrobe yet"
          description="Upload photos of your tops, bottoms, shoes, and jackets to start receiving daily weather-matched outfit suggestions!"
          actionLabel="Snap & Upload Clothes"
          onAction={() => navigate('/wardrobe')}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Recommended Looks for {selectedOccasion}</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {generatedEnsembles.length} Ensembles Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click "I Wore This Today" to log wear count and improve future recommendations.
              </p>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Shuffle Combinations</span>
            </button>
          </div>

          {/* 3 Outfit Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {generatedEnsembles.map((ensemble, idx) => {
              const isWorn = wornTodayOutfitId === ensemble.id;
              return (
                <div
                  key={ensemble.id}
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden relative ${
                    isWorn
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-subtle hover:shadow-md'
                  }`}
                >
                  <div className="p-5 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-200/70 text-slate-700 px-2.5 py-0.5 rounded-full">
                        Look #{idx + 1} · {ensemble.vibe}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                        <span>{ensemble.compatibilityScore}% Match</span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{ensemble.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ensemble.reason}</p>
                  </div>

                  <div className="p-5 space-y-3 flex-1">
                    {ensemble.top && (
                      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 group">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={ensemble.top.image}
                            alt={ensemble.top.name}
                            className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top</span>
                            <p className="text-xs font-bold text-slate-800 truncate">{ensemble.top.name}</p>
                            <span className="text-[10px] text-slate-500">{ensemble.top.color || 'Neutral'}</span>
                          </div>
                        </div>
                        {tops.length > 1 && (
                          <button
                            onClick={() => setActiveSwapSlot({ outfitIndex: idx, slotType: 'top', options: tops })}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors text-xs font-semibold cursor-pointer"
                            title="Swap Top"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {ensemble.bottom && (
                      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 group">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={ensemble.bottom.image}
                            alt={ensemble.bottom.name}
                            className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bottom</span>
                            <p className="text-xs font-bold text-slate-800 truncate">{ensemble.bottom.name}</p>
                            <span className="text-[10px] text-slate-500">{ensemble.bottom.color || 'Dark'}</span>
                          </div>
                        </div>
                        {bottoms.length > 1 && (
                          <button
                            onClick={() => setActiveSwapSlot({ outfitIndex: idx, slotType: 'bottom', options: bottoms })}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors text-xs font-semibold cursor-pointer"
                            title="Swap Bottom"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {ensemble.shoe && (
                      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 group">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={ensemble.shoe.image}
                            alt={ensemble.shoe.name}
                            className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Footwear</span>
                            <p className="text-xs font-bold text-slate-800 truncate">{ensemble.shoe.name}</p>
                            <span className="text-[10px] text-slate-500">{ensemble.shoe.color || 'Clean'}</span>
                          </div>
                        </div>
                        {shoes.length > 1 && (
                          <button
                            onClick={() => setActiveSwapSlot({ outfitIndex: idx, slotType: 'shoe', options: shoes })}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-lg transition-colors text-xs font-semibold cursor-pointer"
                            title="Swap Footwear"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {ensemble.layer && (
                      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={ensemble.layer.image}
                            alt={ensemble.layer.name}
                            className="w-12 h-12 rounded-xl object-cover bg-white border border-indigo-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Layer</span>
                            <p className="text-xs font-bold text-slate-800 truncate">{ensemble.layer.name}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
                      💡 <strong className="font-semibold">Stylist Tip:</strong> {ensemble.stylingTip}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => handleWearToday(ensemble)}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isWorn
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-subtle hover:shadow active:scale-95'
                      }`}
                    >
                      {isWorn ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Wearing This Today! (Logged)</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>I Wore This Today</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Swap Drawer */}
      {activeSwapSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-floating space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 capitalize">
                Swap {activeSwapSlot.slotType} from Your Wardrobe
              </h3>
              <button
                onClick={() => setActiveSwapSlot(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {activeSwapSlot.options.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSwapItem(activeSwapSlot.outfitIndex, activeSwapSlot.slotType, item)}
                  className="p-2.5 rounded-2xl border border-slate-200 hover:border-slate-900 hover:shadow-xs cursor-pointer transition-all bg-slate-50 hover:bg-white text-center group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full aspect-square rounded-xl object-cover bg-white mb-2"
                  />
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">{item.name}</p>
                  <span className="text-[10px] text-slate-500 font-medium">{item.color || item.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wear History Section */}
      {wearHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Your Recent Wear History</h3>
            </div>
            <span className="text-xs text-slate-400">{wearHistory.length} Days Logged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {wearHistory.slice(0, 3).map((hist) => (
              <div key={hist.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{hist.date}</span>
                  <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                    {hist.occasion}
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-800">{hist.outfitTitle}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  {hist.items.map((it, i) => (
                    <img
                      key={i}
                      src={it.image}
                      alt={it.name}
                      title={it.name}
                      className="w-8 h-8 rounded-lg object-cover bg-white border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyStylistPage;
