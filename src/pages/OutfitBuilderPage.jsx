import React, { useState } from 'react';
import {
  Shirt,
  Zap,
  CloudSun,
  Calendar,
  Layers,
  RefreshCw,
  CheckCircle2,
  Bookmark,
  Plus
} from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { outfitApi } from '../api/outfitApi';
import { INITIAL_OUTFITS } from '../data/mockData';
import { OutfitCard } from '../components/outfit/OutfitCard';

export const OutfitBuilderPage = () => {
  const { wardrobe, showToast } = useWardrobe();

  const [selectedOccasion, setSelectedOccasion] = useState('Office');
  const [selectedWeather, setSelectedWeather] = useState('Mild / Indoor');
  const [selectedStyle, setSelectedStyle] = useState('Smart Casual');
  const [isGenerating, setIsGenerating] = useState(false);

  const [outfits, setOutfits] = useState(() => {
    const saved = localStorage.getItem('stylesync_outfits');
    return saved ? JSON.parse(saved) : INITIAL_OUTFITS;
  });

  const occasions = ['Daily', 'Office', 'Date', 'Interview', 'Wedding', 'Party', 'Travel', 'College'];
  const weathers = ['Mild / Indoor', 'Warm / Summer', 'Cool / Autumn', 'Cold / Layered'];
  const styles = ['Smart Casual', 'Minimal', 'Streetwear', 'Formal', 'Classic', 'Sporty'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newOutfit = await outfitApi.generateOutfit({
      occasion: selectedOccasion,
      weather: selectedWeather,
      style: selectedStyle
    });
    setOutfits(prev => [newOutfit, ...prev]);
    setIsGenerating(false);
    showToast(`Generated "${newOutfit.title}"!`, 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200/60">
          <Shirt className="w-3.5 h-3.5 text-emerald-600" />
          <span>Neural Outfit Combinations</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">AI Outfit Builder</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Generate complete, high-compatibility outfits drawn directly from your {wardrobe.length} verified wardrobe pieces.
        </p>
      </div>

      {/* Outfit Generator Control Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-subtle space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Outfit Constraints & Mood
        </h3>

        {/* 1. Occasion Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Select Occasion</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {occasions.map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => setSelectedOccasion(occ)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedOccasion === occ
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Weather & 3. Style in 2-Col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-slate-400" />
              <span>Weather / Temperature</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {weathers.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeather(w)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedWeather === w
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Style Tone</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {styles.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStyle(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedStyle === st
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-subtle hover:shadow transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Pairing wardrobe pieces & computing harmony...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Generate {selectedOccasion} Outfit ({selectedStyle})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Ensembles List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Your Recommended Ensembles</h3>
          <span className="text-xs text-slate-400 font-semibold">{outfits.length} Outfits Ready</span>
        </div>

        <div className="space-y-6">
          {outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onTryAnother={handleGenerate}
              onSelect={() => showToast(`Set "${outfit.title}" as today's worn outfit!`, 'success')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
