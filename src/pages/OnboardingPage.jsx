import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Ruler,
  Palette,
  Wallet,
  Calendar,
  Check,
  ShoppingBag
} from 'lucide-react';
import { StyleTag } from '../components/common/StyleTag';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const OnboardingPage = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Onboarding Form State
  const [formData, setFormData] = useState({
    name: user?.name || 'Sarthak Sharma',
    gender: 'Men / Masc Styling',
    ageRange: '25-34',
    height: '5 ft 11 in (180 cm)',
    location: 'New Delhi / Global',
    sizes: {
      shirt: 'L (40-42)',
      tshirt: 'L / Oversized XL',
      pants: '32 / 32',
      shoes: 'UK 9 / EU 43 / US 10',
      preferredFit: 'Relaxed / Structured'
    },
    stylePreferences: ['Minimal', 'Smart Casual', 'Streetwear'],
    favoriteColors: ['Black', 'White', 'Beige', 'Navy', 'Olive Green'],
    avoidColors: ['Neon Yellow', 'Hot Pink', 'Bright Orange'],
    budgetRanges: {
      clothing: { min: 1500, max: 8000, currency: '₹' },
      shoes: { min: 3000, max: 14000, currency: '₹' },
      accessories: { min: 800, max: 5000, currency: '₹' }
    },
    preferredOccasions: ['Daily', 'Office', 'Date', 'Travel']
  });

  const styleOptions = [
    'Casual', 'Minimal', 'Streetwear', 'Smart Casual',
    'Formal', 'Sporty', 'Classic', 'Trendy'
  ];

  const colorOptions = [
    'Black', 'White', 'Blue', 'Green', 'Brown', 'Beige', 'Grey', 'Navy', 'Olive Green', 'Earthy Tan'
  ];

  const avoidColorOptions = [
    'Neon Yellow', 'Hot Pink', 'Bright Orange', 'Lime Green', 'Metallic Gold', 'Tie-Dye'
  ];

  const occasionOptions = [
    'Daily', 'College', 'Office', 'Interview', 'Wedding', 'Party', 'Date', 'Travel'
  ];

  const toggleArrayItem = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      };
    });
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    await completeOnboarding(formData);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }
    setStep(7); // Show celebration final state
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-slate-200/80">
        {/* Progress Bar & Header */}
        {step <= totalSteps && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Personalize Your Advisor
              </span>
              <span>Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 1 — Basic Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Help StyleSync calibrate sizing, climate, and demographic fit.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Styling Preference / Category</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Men / Masc Styling">Men / Masc Styling</option>
                  <option value="Women / Fem Styling">Women / Fem Styling</option>
                  <option value="Gender Neutral / Unisex">Gender Neutral / Unisex</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age Range</label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="18-24">18–24 (Gen Z / College)</option>
                  <option value="25-34">25–34 (Young Professional)</option>
                  <option value="35-44">35–44</option>
                  <option value="45+">45+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Height (for proportions)</label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="e.g. 5 ft 10 in / 178 cm"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Location / Climate</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. London / New Delhi / San Francisco"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Sizes */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 2 — Sizes & Fit</h2>
              <p className="text-xs text-slate-500 mt-0.5">Let StyleSync evaluate if garments match your preferred proportions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shirt Size</label>
                <input
                  type="text"
                  value={formData.sizes.shirt}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, shirt: e.target.value } })}
                  placeholder="e.g. L (40-42) or 16.5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">T-Shirt Size</label>
                <input
                  type="text"
                  value={formData.sizes.tshirt}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, tshirt: e.target.value } })}
                  placeholder="e.g. L / Oversized XL"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pants / Waist Size</label>
                <input
                  type="text"
                  value={formData.sizes.pants}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, pants: e.target.value } })}
                  placeholder="e.g. 32 / 32"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shoe Size</label>
                <input
                  type="text"
                  value={formData.sizes.shoes}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, shoes: e.target.value } })}
                  placeholder="e.g. UK 9 / EU 43 / US 10"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Silhouette & Fit</label>
                <select
                  value={formData.sizes.preferredFit}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, preferredFit: e.target.value } })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Relaxed / Structured">Relaxed / Structured (Contemporary Boxy)</option>
                  <option value="Slim / Tailored">Slim / Tailored (Classic Sharp)</option>
                  <option value="Oversized Streetwear">Oversized / Baggy (Streetwear)</option>
                  <option value="Regular Classic">Regular / Classic Standard</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Style Preferences */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 3 — Style Direction</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select all aesthetics you feel comfortable and confident wearing.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {styleOptions.map((style) => {
                const isSelected = formData.stylePreferences.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleArrayItem('stylePreferences', style)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{style}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {style === 'Minimal' && 'Clean silhouettes & neutrals'}
                      {style === 'Smart Casual' && 'Blazers, chinos & clean knits'}
                      {style === 'Streetwear' && 'Drop-shoulders & sneakers'}
                      {style === 'Casual' && 'Effortless everyday pieces'}
                      {style === 'Formal' && 'Tailored suits & oxfords'}
                      {style === 'Sporty' && 'Athletic & techwear'}
                      {style === 'Classic' && 'Heritage & timeless items'}
                      {style === 'Trendy' && 'Current seasonal highlights'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Colors & Avoid Colors */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 4 — Colors & Tone Palette</h2>
              <p className="text-xs text-slate-500 mt-0.5">Which colors elevate you, and which should StyleSync warn you against?</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-2.5">
                ✓ Favorite Colors (Wear Frequently)
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const isSelected = formData.favoriteColors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleArrayItem('favoriteColors', color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-800'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md w-fit mb-2.5">
                ✕ Colors to Avoid (Warn Me in Score)
              </label>
              <div className="flex flex-wrap gap-2">
                {avoidColorOptions.map((color) => {
                  const isSelected = formData.avoidColors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleArrayItem('avoidColors', color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-rose-700 text-white shadow-xs ring-2 ring-rose-700'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Budget Ranges */}
        {step === 5 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 5 — Budget & Spending Limits</h2>
              <p className="text-xs text-slate-500 mt-0.5">Set typical price ranges so StyleSync can flag over-priced impulses.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Clothing (Shirts, Pants, Outerwear)</span>
                  <span className="text-xs font-semibold text-slate-600">
                    ₹{formData.budgetRanges.clothing.min.toLocaleString()} – ₹{formData.budgetRanges.clothing.max.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={formData.budgetRanges.clothing.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    budgetRanges: {
                      ...formData.budgetRanges,
                      clothing: { ...formData.budgetRanges.clothing, max: Number(e.target.value) }
                    }
                  })}
                  className="w-full accent-slate-900"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Footwear & Shoes</span>
                  <span className="text-xs font-semibold text-slate-600">
                    ₹{formData.budgetRanges.shoes.min.toLocaleString()} – ₹{formData.budgetRanges.shoes.max.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="1000"
                  value={formData.budgetRanges.shoes.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    budgetRanges: {
                      ...formData.budgetRanges,
                      shoes: { ...formData.budgetRanges.shoes, max: Number(e.target.value) }
                    }
                  })}
                  className="w-full accent-slate-900"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Accessories, Bags & Eyewear</span>
                  <span className="text-xs font-semibold text-slate-600">
                    ₹{formData.budgetRanges.accessories.min.toLocaleString()} – ₹{formData.budgetRanges.accessories.max.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={formData.budgetRanges.accessories.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    budgetRanges: {
                      ...formData.budgetRanges,
                      accessories: { ...formData.budgetRanges.accessories, max: Number(e.target.value) }
                    }
                  })}
                  className="w-full accent-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Preferred Occasions */}
        {step === 6 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 6 — Occasions You Dress For</h2>
              <p className="text-xs text-slate-500 mt-0.5">Where do you spend most of your waking hours?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {occasionOptions.map((occ) => {
                const isSelected = formData.preferredOccasions.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => toggleArrayItem('preferredOccasions', occ)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{occ}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Celebration & Completion State */}
        {step === 7 && (
          <div className="text-center py-8 space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-subtle">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Your StyleSync profile is ready.
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your style rules, size profiles, and wardrobe constraints are active. You're ready to evaluate your first purchase.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto text-xs text-left space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Profile Completeness:</span>
                <strong className="text-emerald-700 font-bold">95% (Ready)</strong>
              </div>
              <div className="flex justify-between">
                <span>Style Focus:</span>
                <strong className="text-slate-900 font-semibold">{formData.stylePreferences.join(', ')}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-floating transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}

        {/* Navigation Buttons for Steps 1-6 */}
        {step <= totalSteps && (
          <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-subtle hover:shadow transition-all flex items-center gap-2 active:scale-95 ml-auto"
            >
              <span>{step === totalSteps ? 'Complete Profile' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
