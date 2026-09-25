import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Zap,
  Sliders,
  Search,
  Navigation,
  Droplets,
  HelpCircle,
  X
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { EmptyState } from '../components/common/EmptyState';
import { outfitApi } from '../api/outfitApi';
import { OutfitCard } from '../components/outfit/OutfitCard';

export const DailyStylistPage = () => {
  const { wardrobe, updateWardrobeItem, showToast } = useWardrobe();
  const { user } = useAuth();
  const { weather, isLoading: isWeatherLoading, refreshWeather, selectCity, searchCities, setManualPreset } = useWeather();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State: 'today' (Daily Weather Look) vs 'builder' (Custom Neural Generator)
  const isBuilderDefault = location.pathname === '/outfits' || location.search.includes('tab=builder');
  const [activeTab, setActiveTab] = useState(isBuilderDefault ? 'builder' : 'today');

  // Occasion & Vibe State
  const [selectedOccasion, setSelectedOccasion] = useState('Office / Work');
  const [selectedVibe, setSelectedVibe] = useState('Smart Casual');
  const [wornTodayOutfitId, setWornTodayOutfitId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSwapSlot, setActiveSwapSlot] = useState(null);

  // City Search Modal State
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  // Custom Builder States
  const [customOccasion, setCustomOccasion] = useState('Daily');
  const [customWeather, setCustomWeather] = useState('Mild');
  const [customStyle, setCustomStyle] = useState('Smart Casual');
  const [builderOutfits, setBuilderOutfits] = useState(() => {
    const saved = localStorage.getItem('stylesync_outfits');
    return saved ? JSON.parse(saved) : [];
  });

  // Wear History
  const [wearHistory, setWearHistory] = useState(() => {
    const saved = localStorage.getItem('stylesync_wear_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const loadOutfitsAndLogs = async () => {
      try {
        const [outfitsList, wearLogs] = await Promise.all([
          outfitApi.getOutfits(),
          outfitApi.getWearLogs()
        ]);
        if (Array.isArray(outfitsList)) {
          setBuilderOutfits(outfitsList);
        }
        if (Array.isArray(wearLogs)) {
          setWearHistory(wearLogs);
        }
      } catch (err) {
        console.warn('Could not load outfits/wear logs:', err);
      }
    };
    loadOutfitsAndLogs();
  }, []);

  const occasions = [
    { name: 'Office / Work', icon: '💼', tag: 'Smart / Structured' },
    { name: 'Casual Day Out', icon: '☕', tag: 'Relaxed / Easy' },
    { name: 'Date Night', icon: '🍷', tag: 'Elevated / Sharp' },
    { name: 'College / Study', icon: '🎒', tag: 'Comfort / Trendy' },
    { name: 'Gym / Athleisure', icon: '⚡', tag: 'Active / Breathable' },
    { name: 'Party / Evening', icon: '✨', tag: 'Bold / Statement' },
  ];

  const customOccasionPills = ['Daily', 'Office', 'Date', 'Interview', 'Wedding', 'Party', 'Travel', 'College'];
  const customWeatherPills = ['Mild', 'Warm', 'Cool', 'Cold'];
  const customStylePills = ['Smart Casual', 'Minimal', 'Streetwear', 'Formal', 'Classic', 'Sporty'];

  const weatherPresets = [
    { condition: 'Sunny', temp: 28, label: 'Warm & Sunny', icon: Sun },
    { condition: 'Mild', temp: 22, label: 'Pleasant & Mild', icon: Cloud },
    { condition: 'Rainy', temp: 24, label: 'Monsoon / Wet', icon: CloudRain },
    { condition: 'Cool', temp: 16, label: 'Chilly / Layered', icon: Snowflake },
  ];

  // Organize user's uploaded wardrobe by categories
  const tops = useMemo(() => wardrobe.filter(i => ['Tops', 'Top', 'Shirt', 'T-shirt'].includes(i.category) || i.name?.toLowerCase().includes('shirt') || i.name?.toLowerCase().includes('tee')), [wardrobe]);
  const bottoms = useMemo(() => wardrobe.filter(i => ['Bottoms', 'Bottom', 'Pants', 'Jeans', 'Trousers', 'Shorts'].includes(i.category) || i.name?.toLowerCase().includes('pant') || i.name?.toLowerCase().includes('jean') || i.name?.toLowerCase().includes('trouser')), [wardrobe]);
  const shoes = useMemo(() => wardrobe.filter(i => ['Shoes', 'Footwear', 'Sneakers', 'Boots'].includes(i.category) || i.name?.toLowerCase().includes('shoe') || i.name?.toLowerCase().includes('sneaker') || i.name?.toLowerCase().includes('boot')), [wardrobe]);
  const layers = useMemo(() => wardrobe.filter(i => ['Outerwear', 'Jacket', 'Coat', 'Blazer', 'Overcoat'].includes(i.category) || i.name?.toLowerCase().includes('jacket') || i.name?.toLowerCase().includes('blazer')), [wardrobe]);
  const accessories = useMemo(() => wardrobe.filter(i => ['Accessories', 'Watches', 'Eyewear', 'Bags'].includes(i.category)), [wardrobe]);

  // Outfit creation engine taking real live weather into account
  function createOutfits(t, b, s, l, a, occ, wth) {
    if (t.length === 0 && b.length === 0 && s.length === 0) {
      return [];
    }

    const isCoolOrRainy = wth.condition === 'Cool' || wth.condition === 'Rainy' || wth.temp < 22;
    const isHot = wth.temp >= 30;

    const outfits = [];
    if (t[0] || b[0] || s[0]) {
      const isComplete = Boolean(t[0] && b[0] && s[0]);
      outfits.push({
        id: 'outfit_primary',
        title: isComplete ? `The Effortless ${occ.split(' ')[0]} Look` : `Daily Outfit (Add Missing Pieces)`,
        vibe: isComplete ? 'Clean & Polished' : 'Partially Assembled',
        compatibilityScore: isComplete ? 98 : (t[0] && b[0] ? 85 : 65),
        reason: isComplete
          ? `Harmonized for ${wth.temp}°C ${wth.label.toLowerCase()} in ${wth.city || 'your area'}, calibrated to your body profile.`
          : `Add matching ${!t[0] ? 'tops' : ''}${!t[0] && !b[0] ? ' & ' : ''}${!b[0] ? 'bottoms' : ''} to complete this weather-ready look.`,
        top: t[0] || null,
        bottom: b[0] || null,
        shoe: s[0] || null,
        layer: isCoolOrRainy ? (l[0] || null) : null,
        accessory: a[0] || null,
        stylingTip: isCoolOrRainy
          ? 'Add a structured light layer to stay warm against breezy or damp conditions.'
          : 'Slightly roll the cuffs and pair with your favorite minimalist watch.'
      });
    }

    if (t.length > 1 || b.length > 1 || s.length > 1) {
      outfits.push({
        id: 'outfit_alt1',
        title: `Modern ${selectedVibe} Alternative`,
        vibe: 'Sleek & Contemporary',
        compatibilityScore: 94,
        reason: `Weather-calibrated breathable contrast for ${wth.label}.`,
        top: t[1] || t[0] || null,
        bottom: b[1] || b[0] || null,
        shoe: s[1] || s[0] || null,
        layer: l[1] || (isCoolOrRainy ? l[0] : null),
        accessory: a[1] || null,
        stylingTip: isHot
          ? 'Unbutton the top collar button for enhanced airflow and casual elegance.'
          : 'Keep accessories understated to let the silhouette stand out.'
      });
    }

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
        stylingTip: 'Pair with clean neutral footwear to anchor the combination.'
      });
    }

    return outfits;
  }

  // Generate outfit combinations strictly from user's uploaded wardrobe
  const [generatedEnsembles, setGeneratedEnsembles] = useState(() => {
    return createOutfits(tops, bottoms, shoes, layers, accessories, selectedOccasion, weather);
  });

  // Re-generate outfits whenever real weather or occasion changes
  useEffect(() => {
    setGeneratedEnsembles(createOutfits(tops, bottoms, shoes, layers, accessories, selectedOccasion, weather));
  }, [weather.temp, weather.condition, weather.location, selectedOccasion, tops, bottoms, shoes, layers, accessories]);

  // Handle city search debounce
  useEffect(() => {
    if (!citySearchQuery || citySearchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCities(true);
      const res = await searchCities(citySearchQuery);
      setSearchResults(res);
      setIsSearchingCities(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [citySearchQuery, searchCities]);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const shuffledTops = [...tops].sort(() => 0.5 - Math.random());
      const shuffledBottoms = [...bottoms].sort(() => 0.5 - Math.random());
      const shuffledShoes = [...shoes].sort(() => 0.5 - Math.random());
      const shuffledLayers = [...layers].sort(() => 0.5 - Math.random());
      const newEnsembles = createOutfits(shuffledTops, shuffledBottoms, shuffledShoes, shuffledLayers, accessories, selectedOccasion, weather);
      setGeneratedEnsembles(newEnsembles);
      setIsGenerating(false);
      showToast('Generated fresh daily outfits tailored to your wardrobe & live weather!', 'success');
    }, 300);
  };

  const handleGenerateCustomOutfit = async () => {
    setIsGenerating(true);
    const newOutfit = await outfitApi.generateOutfit({
      occasion: customOccasion,
      weather: customWeather,
      style: customStyle
    });
    setBuilderOutfits(prev => [newOutfit, ...prev]);
    setIsGenerating(false);
    showToast(`Generated "${newOutfit.title}"!`, 'success');
  };

  const handleWearToday = async (outfit) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const items = [outfit.top, outfit.bottom, outfit.shoe, outfit.layer].filter(Boolean);
    const itemIds = items.map(i => i.id || i._id).filter(Boolean);

    const newLog = {
      id: 'log_' + Date.now(),
      date: today,
      outfitTitle: outfit.title,
      occasion: selectedOccasion,
      temp: `${weather.temp}°C ${weather.condition}`,
      itemIds,
      items
    };

    items.forEach(item => {
      if (item.id) {
        updateWardrobeItem(item.id, { usageCount: (item.usageCount || 0) + 1 });
      }
    });

    // Notify backend
    try {
      await outfitApi.logOutfitWear({
        outfitTitle: outfit.title,
        occasion: selectedOccasion,
        date: new Date().toISOString().split('T')[0],
        temp: `${weather.temp}°C ${weather.condition}`,
        itemIds
      });
    } catch {
      // Handled silently
    }

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

  // Weather Icon Component
  const getWeatherIcon = (iconName, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Sun': return <Sun className={className} />;
      case 'Cloud': return <Cloud className={className} />;
      case 'CloudRain': return <CloudRain className={className} />;
      case 'Snowflake': return <Snowflake className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Wind': return <Wind className={className} />;
      default: return <Sun className={className} />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      {/* Top Header & Tab Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="hidden sm:block">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Today's Outfit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personalized combinations matched to your local weather & wardrobe.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'today'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Today's Look</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Custom Builder</span>
          </button>
        </div>
      </div>

      {activeTab === 'today' ? (
        /* TAB 1: TODAY'S LOOK & WEATHER */
        <>
          {/* Clean Human Weather & Context Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
                  {getWeatherIcon(weather.icon, "w-6 h-6 text-amber-600")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {weather.temp}°C
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      · {weather.condition}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (Feels {weather.feelsLike}°C)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-700">{weather.city || 'Detecting Location...'}</span>
                    <span>·</span>
                    <span>{weather.humidity}% Humidity</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refreshWeather(true)}
                  disabled={isWeatherLoading}
                  title="Refresh Weather"
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Change City</span>
                </button>
              </div>
            </div>

            {/* AI Weather Tip Bar */}
            {weather.stylingAdvice && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-700">
                <Sun className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-slate-900">Today's Fabric Tip: </span>
                  <span className="text-slate-600">{weather.stylingAdvice}</span>
                  {weather.recommendedFabrics && (
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Best fabrics: <strong className="text-slate-700 font-semibold">{weather.recommendedFabrics}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Occasion Selection - Clean Non-Scrollable Responsive Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Select Occasion
              </label>
              <span className="text-xs font-medium text-slate-500">
                Active: <strong className="text-slate-900">{selectedOccasion}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {occasions.map((occ) => {
                const isSelected = selectedOccasion === occ.name;
                return (
                  <button
                    key={occ.name}
                    type="button"
                    onClick={() => setSelectedOccasion(occ.name)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border text-center ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm">{occ.icon}</span>
                    <span className="truncate">{occ.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ensembles List */}
          {wardrobe.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <Shirt className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">Your Wardrobe is Empty</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Add photos of your shirts, pants, and shoes so we can match outfits to today's {weather.temp}°C {weather.condition} weather in {weather.city || 'your city'}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/wardrobe')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                + Add Clothes to Closet
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Suggested Outfits</span>
                    <span className="text-xs font-semibold text-slate-400">({generatedEnsembles.length})</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Shuffle</span>
                </button>
              </div>

              {/* Outfit Cards */}
              <div className="space-y-4">
                {generatedEnsembles.map((outfit, index) => (
                  <div
                    key={outfit.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded-md border border-emerald-100">
                            {outfit.compatibilityScore}% Match
                          </span>
                          <span className="text-xs font-semibold text-slate-400">· {outfit.vibe}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                          {outfit.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleWearToday(outfit)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            wornTodayOutfitId === outfit.id
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                          }`}
                        >
                          {wornTodayOutfitId === outfit.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Worn Today ✓</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Wear Today</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {outfit.reason}
                    </p>

                    {/* Clothing Slots Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Top */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Top</span>
                        {outfit.top ? (
                          <>
                            <img
                              src={outfit.top.image}
                              alt={outfit.top.name}
                              className="w-full aspect-square rounded-lg object-cover bg-white mb-1.5 border border-slate-100"
                            />
                            <p className="text-xs font-bold text-slate-800 truncate">{outfit.top.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{outfit.top.color} · {outfit.top.fabric || 'Cotton'}</p>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/wardrobe?category=Tops')}
                            className="w-full aspect-square rounded-lg bg-slate-100/80 border border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 flex flex-col items-center justify-center text-slate-500 gap-1 p-2 transition-all cursor-pointer group"
                          >
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">+ Add Top</span>
                          </button>
                        )}
                        {tops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setActiveSwapSlot({ outfitIndex: index, slotType: 'top', options: tops })}
                            className="mt-2 w-full py-1 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            Swap Top ⇄
                          </button>
                        )}
                      </div>

                      {/* Bottom */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bottom</span>
                        {outfit.bottom ? (
                          <>
                            <img
                              src={outfit.bottom.image}
                              alt={outfit.bottom.name}
                              className="w-full aspect-square rounded-lg object-cover bg-white mb-1.5 border border-slate-100"
                            />
                            <p className="text-xs font-bold text-slate-800 truncate">{outfit.bottom.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{outfit.bottom.color} · {outfit.bottom.fabric || 'Denim'}</p>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/wardrobe?category=Bottoms')}
                            className="w-full aspect-square rounded-lg bg-slate-100/80 border border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 flex flex-col items-center justify-center text-slate-500 gap-1 p-2 transition-all cursor-pointer group"
                          >
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">+ Add Bottom</span>
                          </button>
                        )}
                        {bottoms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setActiveSwapSlot({ outfitIndex: index, slotType: 'bottom', options: bottoms })}
                            className="mt-2 w-full py-1 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            Swap Bottom ⇄
                          </button>
                        )}
                      </div>

                      {/* Footwear */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Footwear</span>
                        {outfit.shoe ? (
                          <>
                            <img
                              src={outfit.shoe.image}
                              alt={outfit.shoe.name}
                              className="w-full aspect-square rounded-lg object-cover bg-white mb-1.5 border border-slate-100"
                            />
                            <p className="text-xs font-bold text-slate-800 truncate">{outfit.shoe.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{outfit.shoe.color}</p>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/wardrobe?category=Shoes')}
                            className="w-full aspect-square rounded-lg bg-slate-100/80 border border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 flex flex-col items-center justify-center text-slate-500 gap-1 p-2 transition-all cursor-pointer group"
                          >
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">+ Add Shoes</span>
                          </button>
                        )}
                        {shoes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setActiveSwapSlot({ outfitIndex: index, slotType: 'shoe', options: shoes })}
                            className="mt-2 w-full py-1 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            Swap Shoe ⇄
                          </button>
                        )}
                      </div>

                      {/* Layer */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Outerwear</span>
                        {outfit.layer ? (
                          <>
                            <img
                              src={outfit.layer.image}
                              alt={outfit.layer.name}
                              className="w-full aspect-square rounded-lg object-cover bg-white mb-1.5 border border-slate-100"
                            />
                            <p className="text-xs font-bold text-slate-800 truncate">{outfit.layer.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{outfit.layer.color}</p>
                          </>
                        ) : (
                          <div className="w-full aspect-square rounded-lg bg-slate-100/60 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-2">
                            <span className="text-[10px] font-semibold text-slate-500">Not needed</span>
                            <span className="text-[9px] text-slate-400">({weather.temp}°C)</span>
                          </div>
                        )}
                        {layers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveSwapSlot({ outfitIndex: index, slotType: 'layer', options: layers })}
                            className="mt-2 w-full py-1 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            {outfit.layer ? 'Swap Layer ⇄' : '+ Add Layer'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Styling Note */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2 text-xs text-slate-600">
                      <Shirt className="w-3.5 h-3.5 text-stone-700 flex-shrink-0" />
                      <span><strong>Style Tip:</strong> {outfit.stylingTip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        /* TAB 2: AI OUTFIT BUILDER */
        <div className="space-y-4">
          {/* Builder Controls Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Custom Outfit Builder</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate tailored outfit combinations for any upcoming event, trip, or style vibe.
              </p>
            </div>

            {/* Occasion Grid */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Occasion</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {customOccasionPills.map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setCustomOccasion(occ)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                      customOccasion === occ
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather & Style Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Weather</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {customWeatherPills.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setCustomWeather(w)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                        customWeather === w
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Style Tone</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {customStylePills.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCustomStyle(st)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border truncate ${
                        customStyle === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateCustomOutfit}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Styling outfit...</span>
                  </>
                ) : (
                  <>
                    <Shirt className="w-4 h-4 text-emerald-400" />
                    <span>Generate {customOccasion} Outfit ({customStyle})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Builder Outfits List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Generated Combinations ({builderOutfits.length})
              </h3>
            </div>

            {builderOutfits.length > 0 ? (
              <div className="space-y-4">
                {builderOutfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    onTryAnother={handleGenerateCustomOutfit}
                    onSelect={() => showToast(`Selected "${outfit.title}" as your look!`, 'success')}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 py-10 px-6 text-center space-y-2.5 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                  <Shirt className="w-6 h-6" />
                </div>
                <div className="max-w-xs mx-auto">
                  <h4 className="text-sm font-bold text-slate-900">No Custom Looks Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Select your occasion, weather setting, and style tone above, then tap <strong>Generate</strong> to create tailored outfits.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* City Switcher Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-floating space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Change Location / City</h3>
              </div>
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                placeholder="Search any city (e.g. London, Tokyo, Delhi, New York)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-emerald-500 focus:bg-white"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                await refreshWeather(true);
                setIsCityModalOpen(false);
                showToast('Switched to live GPS location!', 'success');
              }}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Use My Live Device GPS</span>
            </button>

            {isSearchingCities ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Searching global cities...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {searchResults.map((cityItem) => (
                  <button
                    key={cityItem.id}
                    type="button"
                    onClick={async () => {
                      await selectCity(cityItem);
                      setIsCityModalOpen(false);
                      showToast(`Switched weather to ${cityItem.name}!`, 'success');
                    }}
                    className="w-full p-2.5 text-left rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <div className="truncate">
                      <span className="text-slate-900">{cityItem.name}</span>
                      <span className="text-slate-400 text-[11px] block">{cityItem.formatted}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : citySearchQuery.length >= 2 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No cities found matching "{citySearchQuery}".
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Swap Drawer */}
      {activeSwapSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-floating space-y-3 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {activeSwapSlot.options.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSwapItem(activeSwapSlot.outfitIndex, activeSwapSlot.slotType, item)}
                  className="p-2 rounded-2xl border border-slate-200 hover:border-slate-900 cursor-pointer transition-all bg-slate-50 text-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full aspect-square rounded-xl object-cover bg-white mb-1.5"
                  />
                  <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyStylistPage;
