import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Ruler,
  Palette,
  Wallet,
  Calendar,
  Check,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const OnboardingPage = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Onboarding Form State with simple, standard defaults
  const [formData, setFormData] = useState({
    name: user?.name || 'Sarthak Sharma',
    gender: "Men's Clothing",
    ageRange: '25-34',
    height: '5 ft 10 in',
    location: 'Mumbai, India',
    sizes: {
      shirt: 'L (40)',
      tshirt: 'L',
      pants: '32',
      shoes: 'UK 9',
      preferredFit: 'Regular Fit'
    },
    stylePreferences: ['Casual', 'Smart Casual', 'Minimal'],
    favoriteColors: ['Black', 'White', 'Navy', 'Olive Green'],
    avoidColors: ['Neon Yellow', 'Hot Pink'],
    budgetRanges: {
      clothing: { min: 500, max: 3500 },
      shoes: { min: 1500, max: 6000 },
      accessories: { min: 500, max: 2500 }
    },
    preferredOccasions: ['Daily Wear', 'Office / Work', 'Dates & Cafes', 'Travel & Trips']
  });

  const styleOptions = [
    { title: 'Casual', desc: 'Simple everyday tees, jeans, and comfortable clothes' },
    { title: 'Smart Casual', desc: 'Collared polo shirts, chinos, and clean shoes' },
    { title: 'Minimal', desc: 'Plain solid colors and neat, simple looks' },
    { title: 'Streetwear', desc: 'Hoodies, loose fit tees, and sneakers' },
    { title: 'Formal / Office', desc: 'Formal shirts, trousers, suits, and dress shoes' },
    { title: 'Sporty / Gym', desc: 'Track pants, active tees, and running shoes' },
    { title: 'Ethnic / Festive', desc: 'Kurtas, jackets, and traditional festive wear' },
    { title: 'Party Wear', desc: 'Stylish evening outfits for dinners and clubs' }
  ];

  const colorOptions = [
    'Black', 'White', 'Navy Blue', 'Olive Green', 'Beige / Cream', 'Grey', 'Brown', 'Sky Blue', 'Maroon', 'Dark Green'
  ];

  const avoidColorOptions = [
    'Neon Yellow', 'Hot Pink', 'Bright Orange', 'Lime Green', 'Shiny Gold', 'Tie-Dye'
  ];

  const occasionOptions = [
    'Daily Wear', 'Office / Work', 'College', 'Parties', 'Weddings & Festivals', 'Dates & Cafes', 'Gym / Sports', 'Travel & Trips'
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
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                Quick Style Setup
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
              <h2 className="text-xl font-bold text-slate-900">Step 1 — Tell us about yourself</h2>
              <p className="text-xs text-slate-500 mt-0.5">Basic details to help StyleSync suggest clothes that fit you well.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarthak Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">I shop for</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Men's Clothing">Men's Clothing</option>
                  <option value="Women's Clothing">Women's Clothing</option>
                  <option value="Unisex / All">Unisex / All Styles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Age Group</label>
                <select
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="18-24">18–24 years (College / Young)</option>
                  <option value="25-34">25–34 years (Working Professional)</option>
                  <option value="35-44">35–44 years</option>
                  <option value="45+">45+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Height</label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="e.g. 5 ft 10 in or 178 cm"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your City / Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mumbai, Delhi, Bengaluru, Pune"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">Helps suggest the right fabrics for your local weather.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Sizes */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 2 — Your Clothing Sizes & Fit</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tell us what sizes you normally wear so we know what fits you.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shirt Size</label>
                <input
                  type="text"
                  value={formData.sizes.shirt}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, shirt: e.target.value } })}
                  placeholder="e.g. M (38) / L (40) / XL (42)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">T-Shirt Size</label>
                <input
                  type="text"
                  value={formData.sizes.tshirt}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, tshirt: e.target.value } })}
                  placeholder="e.g. S / M / L / XL / XXL"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jeans / Pant Waist Size</label>
                <input
                  type="text"
                  value={formData.sizes.pants}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, pants: e.target.value } })}
                  placeholder="e.g. 30, 32, 34, 36"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shoe Size (UK / India)</label>
                <input
                  type="text"
                  value={formData.sizes.shoes}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, shoes: e.target.value } })}
                  placeholder="e.g. UK 7, UK 8, UK 9, UK 10"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">How do you prefer your clothes to fit?</label>
                <select
                  value={formData.sizes.preferredFit}
                  onChange={(e) => setFormData({ ...formData, sizes: { ...formData.sizes, preferredFit: e.target.value } })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Regular Fit">Regular Fit — Standard, comfortable everyday fit</option>
                  <option value="Slim Fit">Slim Fit — Sharp, close-to-body look</option>
                  <option value="Relaxed / Loose Fit">Relaxed Fit — Slightly roomy & modern boxy</option>
                  <option value="Oversized">Oversized / Baggy — Trendy loose streetwear</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Style Preferences */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 3 — What styles do you like?</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select all the clothing styles you like wearing (choose 1 or more).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {styleOptions.map((item) => {
                const isSelected = formData.stylePreferences.includes(item.title);
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => toggleArrayItem('stylePreferences', item.title)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{item.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    </div>
                    <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.desc}
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
              <h2 className="text-xl font-bold text-slate-900">Step 4 — Colors you love & avoid</h2>
              <p className="text-xs text-slate-500 mt-0.5">Help us know which colors look best on you and which ones you don't wear.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-2.5">
                ✓ Colors you like wearing
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const isSelected = formData.favoriteColors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleArrayItem('favoriteColors', color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md w-fit mb-2.5">
                ✕ Colors you avoid (We will warn you before buying)
              </label>
              <div className="flex flex-wrap gap-2">
                {avoidColorOptions.map((color) => {
                  const isSelected = formData.avoidColors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleArrayItem('avoidColors', color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              <h2 className="text-xl font-bold text-slate-900">Step 5 — Your Normal Budget</h2>
              <p className="text-xs text-slate-500 mt-0.5">What is the highest price you usually spend per item?</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Clothes (Shirts, T-Shirts, Jeans, Jackets)</span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Up to ₹{(formData.budgetRanges?.clothing?.max || 3500).toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={formData.budgetRanges?.clothing?.max || 3500}
                  onChange={(e) => setFormData({
                    ...formData,
                    budgetRanges: {
                      ...formData.budgetRanges,
                      clothing: { ...formData.budgetRanges?.clothing, max: Number(e.target.value) }
                    }
                  })}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Shoes & Footwear (Sneakers, Boots, Loafers)</span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Up to ₹{(formData.budgetRanges?.shoes?.max || 6000).toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={formData.budgetRanges?.shoes?.max || 6000}
                  onChange={(e) => setFormData({
                    ...formData,
                    budgetRanges: {
                      ...formData.budgetRanges,
                      shoes: { ...formData.budgetRanges?.shoes, max: Number(e.target.value) }
                    }
                  })}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">Accessories (Sunglasses, Watches, Bags)</span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Up to ₹{(formData.budgetRanges?.accessories?.max || 2500).toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="10000"
                  step="200"
                  value={formData.budgetRanges?.accessories?.max || 2500}
                  onChange={(e) => setFormData({
                    ...formData,
                    budgetRanges: {
                      ...formData.budgetRanges,
                      accessories: { ...formData.budgetRanges?.accessories, max: Number(e.target.value) }
                    }
                  })}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Preferred Occasions */}
        {step === 6 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 6 — Where do you wear clothes most?</h2>
              <p className="text-xs text-slate-500 mt-0.5">Choose the places you dress for in your daily life.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {occasionOptions.map((occ) => {
                const isSelected = formData.preferredOccasions.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => toggleArrayItem('preferredOccasions', occ)}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
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
              You're all set!
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your style profile and size details are saved. You're ready to get daily outfit ideas and check new clothes before buying.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto text-xs text-left space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Profile Status:</span>
                <strong className="text-emerald-700 font-bold">100% Completed</strong>
              </div>
              <div className="flex justify-between">
                <span>Selected Styles:</span>
                <strong className="text-slate-900 font-semibold">{formData.stylePreferences.join(', ')}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-floating transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
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
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-subtle hover:shadow transition-all flex items-center gap-2 active:scale-95 ml-auto cursor-pointer"
            >
              <span>{step === totalSteps ? 'Finish Setup' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
