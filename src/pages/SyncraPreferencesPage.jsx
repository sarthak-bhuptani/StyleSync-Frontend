import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Trash2,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWardrobe } from '../context/WardrobeContext';
import { ProfileAvatarButton } from '../components/common/ProfileAvatarButton';

const DEFAULT_PREFERENCES = {
  responseStyle: 'Concise', // 'Concise' | 'Balanced' | 'Detailed'
  suggestionLevel: 'Balanced', // 'Low' | 'Balanced' | 'High'
  helpFeatures: {
    outfitRecommendations: true,
    shoppingRecommendations: true,
    wardrobeInsights: true,
    purchaseReminders: false
  },
  wardrobeContext: {
    useWardrobe: true,
    useSizes: true,
    useStylePreferences: true,
    usePurchaseHistory: true
  },
  rememberPreferences: true
};

export const SyncraPreferencesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();
  const { showToast } = useWardrobe();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    navigate('/profile');
  };

  // Load preferences from localStorage / user profile
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('syncra_preferences');
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_PREFERENCES;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showManagePreferences, setShowManagePreferences] = useState(false);

  const initial = (user?.name?.trim()?.[0] || user?.username?.trim()?.[0] || 'S').toUpperCase();

  const handleToggleHelp = (key) => {
    setPreferences((prev) => ({
      ...prev,
      helpFeatures: {
        ...prev.helpFeatures,
        [key]: !prev.helpFeatures[key]
      }
    }));
  };

  const handleToggleContext = (key) => {
    setPreferences((prev) => ({
      ...prev,
      wardrobeContext: {
        ...prev.wardrobeContext,
        [key]: !prev.wardrobeContext[key]
      }
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('syncra_preferences', JSON.stringify(preferences));
      if (updateProfile) {
        updateProfile({ syncraPreferences: preferences });
      }
      setIsSaved(true);
      if (showToast) {
        showToast('Syncra preferences updated successfully!', 'success');
      }
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearMemory = () => {
    localStorage.removeItem('syncra_ai_memory');
    setShowClearConfirm(false);
    if (showToast) {
      showToast('Syncra AI memory has been cleared.', 'info');
    }
  };

  return (
    <div className="w-full px-1 sm:px-2 animate-fade-in pb-1 text-[#1A1D1A]">
      {/* Top Grab Bar matching Figma design */}
      <div className="w-14 h-1 rounded-full bg-[#1A1D1A] mx-auto mb-3 mt-1" />

      {/* 1. Header: < Syncra Preferences [S] */}
      <div className="flex items-start justify-between pb-3">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="p-1 -ml-1 text-[#1A1D1A] hover:opacity-75 rounded-full active:scale-95 cursor-pointer mt-0.5"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1D1A] tracking-tight leading-snug">
              Syncra Preferences
            </h1>
            <p className="text-xs text-[#717670] font-normal mt-0.5">
              Control how Syncra helps you.
            </p>
          </div>
        </div>

        {/* Unified Profile Avatar Button */}
        <ProfileAvatarButton />
      </div>

      {/* 2. SECTION: ASSISTANT STYLE */}
      <div className="pt-2 pb-1">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2">
          ASSISTANT STYLE
        </span>

        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-4 sm:p-5 shadow-2xs space-y-3.5">
          {/* Response Style */}
          <div>
            <span className="text-xs font-bold text-[#1A1D1A] block mb-2">Response style</span>

            {/* Segmented Options */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF8F5] rounded-2xl border border-[#ECE8DF]">
              {['Concise', 'Balanced', 'Detailed'].map((style) => {
                const isActive = preferences.responseStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setPreferences((p) => ({ ...p, responseStyle: style }))}
                    className={`py-2 text-xs transition-all cursor-pointer select-none text-center rounded-xl ${
                      isActive
                        ? 'bg-white text-[#1A1D1A] shadow-2xs font-bold border border-[#ECE8DF]'
                        : 'text-[#717670] hover:text-[#1A1D1A] font-medium'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#8E968C] mt-1.5 px-0.5">
              Concise · Balanced · Detailed
            </p>
          </div>

          <div className="border-t border-[#ECE8DF]/60 pt-3">
            {/* Suggestion Level */}
            <span className="text-xs font-bold text-[#1A1D1A] block mb-2.5">
              Suggestion level
            </span>

            <div className="flex items-center justify-between px-1">
              {['Low', 'Balanced', 'High'].map((lvl) => {
                const isSelected = preferences.suggestionLevel === lvl;
                return (
                  <label
                    key={lvl}
                    onClick={() => setPreferences((p) => ({ ...p, suggestionLevel: lvl }))}
                    className="flex items-center gap-2 text-xs font-medium text-[#1A1D1A] cursor-pointer select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#1A1D1A] bg-[#1A1D1A]'
                          : 'border-[#A0A69F] bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>{lvl}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION: WHEN SYNCRA CAN HELP */}
      <div className="pt-3 pb-1">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2">
          WHEN SYNCRA CAN HELP
        </span>

        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-3 sm:p-4 shadow-2xs space-y-1">
          {[
            { key: 'outfitRecommendations', label: 'Outfit recommendations' },
            { key: 'shoppingRecommendations', label: 'Shopping recommendations' },
            { key: 'wardrobeInsights', label: 'Wardrobe insights' },
            { key: 'purchaseReminders', label: 'Purchase reminders' }
          ].map(({ key, label }) => {
            const checked = preferences.helpFeatures[key];
            return (
              <div
                key={key}
                onClick={() => handleToggleHelp(key)}
                className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-[#FAF8F5] cursor-pointer transition-colors select-none"
              >
                <span className="text-xs sm:text-sm font-medium text-[#1A1D1A]">
                  {label}
                </span>

                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    checked
                      ? 'bg-[#111827] border-[#111827] text-white'
                      : 'bg-white border-[#C9C3B6]'
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION: YOUR WARDROBE CONTEXT */}
      <div className="pt-3 pb-1">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2">
          YOUR WARDROBE CONTEXT
        </span>

        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-3 sm:p-4 shadow-2xs space-y-1.5">
          {[
            { key: 'useWardrobe', label: 'Use my wardrobe' },
            { key: 'useSizes', label: 'Use my sizes' },
            { key: 'useStylePreferences', label: 'Use my style preferences' },
            { key: 'usePurchaseHistory', label: 'Use purchase history' }
          ].map(({ key, label }) => {
            const isOn = preferences.wardrobeContext[key];
            return (
              <div
                key={key}
                onClick={() => handleToggleContext(key)}
                className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-[#FAF8F5] cursor-pointer transition-colors select-none"
              >
                <span className="text-xs sm:text-sm font-medium text-[#1A1D1A]">
                  {label}
                </span>

                {/* iOS-style Pill Toggle Switch */}
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center cursor-pointer shrink-0 ${
                    isOn ? 'bg-[#111827]' : 'bg-[#E5E2DA]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      isOn ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SECTION: MEMORY */}
      <div className="pt-4 pb-1">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2">
          MEMORY
        </span>

        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-4 sm:p-5 shadow-2xs space-y-3">
          <div
            onClick={() => setPreferences((p) => ({ ...p, rememberPreferences: !p.rememberPreferences }))}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#1A1D1A] block">
                Remember useful preferences
              </span>
              <span className="text-[10px] text-[#8E968C]">
                Retains styling patterns across interactions.
              </span>
            </div>

            <div
              className={`w-12 h-6 rounded-full p-0.5 transition-colors flex items-center cursor-pointer shrink-0 ${
                preferences.rememberPreferences ? 'bg-[#111827]' : 'bg-[#E5E2DA]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  preferences.rememberPreferences ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div className="border-t border-[#ECE8DF]/60 pt-2.5">
            <button
              type="button"
              onClick={() => setShowManagePreferences(true)}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#1A1D1A] hover:opacity-75 transition-opacity py-1 cursor-pointer"
            >
              <span>Manage saved preferences</span>
              <ChevronRight className="w-4 h-4 text-[#8E968C]" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. SECTION: AI DATA & PRIVACY */}
      <div className="pt-4 pb-2">
        <span className="text-[10px] font-bold text-[#8E968C] uppercase tracking-wider block mb-2">
          AI DATA & PRIVACY
        </span>

        <div className="bg-white rounded-3xl border border-[#ECE8DF] p-4 shadow-2xs divide-y divide-[#ECE8DF]/60">
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#1A1D1A] hover:opacity-75 transition-opacity py-2 cursor-pointer"
          >
            <span>What Syncra uses</span>
            <ChevronRight className="w-4 h-4 text-[#8E968C]" />
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-between text-xs font-semibold text-rose-700 hover:opacity-75 transition-opacity py-2 cursor-pointer"
          >
            <span>Clear Syncra memory</span>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* 7. Action Button: Save preferences */}
      <div className="my-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 rounded-full font-bold text-xs bg-[#111827] hover:bg-[#030712] text-white flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Preferences Saved ✓</span>
            </>
          ) : (
            <span>{isSaving ? 'Saving...' : 'Save preferences'}</span>
          )}
        </button>
      </div>

      {/* Privacy / What Syncra Uses Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setShowPrivacyModal(false)} />
          <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-[#ECE8DF] animate-slide-up-mobile text-[#1A1D1A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#3D7A5A]" />
                <h3 className="font-serif font-bold text-base text-[#1A1D1A]">What Syncra Uses</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 text-[#8E968C] hover:text-[#1A1D1A] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-[#717670] leading-relaxed">
              <p>
                <strong className="text-[#1A1D1A]">Your Wardrobe:</strong> Analyzed strictly to match color harmonies, missing silhouettes, and everyday weather combos.
              </p>
              <p>
                <strong className="text-[#1A1D1A]">Sizes & Fit:</strong> Used to evaluate whether pieces you are considering purchasing will fit seamlessly.
              </p>
              <p>
                <strong className="text-[#1A1D1A]">Data Security:</strong> Your data is stored private to your account and is never shared or sold to third-party ad networks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-3 bg-[#111827] text-white font-bold text-xs rounded-2xl cursor-pointer hover:bg-[#030712] transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Clear Memory Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setShowClearConfirm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-rose-100 animate-slide-up-mobile text-[#1A1D1A]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1A1D1A]">Clear Syncra Memory?</h3>
                <p className="text-xs text-[#8E968C]">This will reset all learned style habits and notes.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECE8DF]">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-[#ECE8DF] text-[#1A1D1A] text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearMemory}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Clear Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Saved Preferences Drawer */}
      {showManagePreferences && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="fixed inset-0" onClick={() => setShowManagePreferences(false)} />
          <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-[#ECE8DF] animate-slide-up-mobile text-[#1A1D1A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <h3 className="font-serif font-bold text-base text-[#1A1D1A]">Saved Style Memory</h3>
              <button
                type="button"
                onClick={() => setShowManagePreferences(false)}
                className="p-1 text-[#8E968C] hover:text-[#1A1D1A] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="p-3 bg-white rounded-2xl border border-[#ECE8DF]">
                <p className="font-semibold text-[#1A1D1A]">Prefers earth tones and olive layers</p>
                <p className="text-[10px] text-[#8E968C] mt-0.5">Learned from Daily Stylist</p>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#ECE8DF]">
                <p className="font-semibold text-[#1A1D1A]">Favors clean white sneakers over high-tops</p>
                <p className="text-[10px] text-[#8E968C] mt-0.5">Learned from Outfit Lab</p>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#ECE8DF]">
                <p className="font-semibold text-[#1A1D1A]">Avoids loud neon patterns</p>
                <p className="text-[10px] text-[#8E968C] mt-0.5">Custom Preference</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowManagePreferences(false)}
              className="w-full py-3 bg-[#111827] text-white font-bold text-xs rounded-2xl cursor-pointer hover:bg-[#030712] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncraPreferencesPage;
