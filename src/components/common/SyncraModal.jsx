import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  X,
  Check,
  Shirt,
  Compass,
  ArrowLeftRight,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWardrobe } from '../../context/WardrobeContext';
import { SyncraLogo } from '../common/BrandLogo';

const SyncraAIAvatar = ({ size = "w-8 h-8" }) => (
  <div className={`${size} rounded-2xl bg-gradient-to-tr from-[#1E2E22] via-[#2F4535] to-[#4A5D44] text-[#E6F4EA] flex items-center justify-center shrink-0 shadow-xs ring-1 ring-[#BDD2C1]/60 relative select-none`}>
    <SyncraLogo className="w-5 h-5" />
    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#FAF8F5]" />
  </div>
);

const DEFAULT_DINNER_LOOK = {
  top: {
    name: 'Olive Linen Tunic Shirt',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80'
  },
  bottom: {
    name: 'Tailored Navy Trousers',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=300&q=80'
  },
  shoes: {
    name: 'Minimal White Sneakers',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80'
  }
};

export const SyncraModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wardrobe, showToast } = useWardrobe();
  const [inputText, setInputText] = useState('');
  const [isLookSaved, setIsLookSaved] = useState(false);

  const dinnerLookPieces = useMemo(() => {
    const list = Array.isArray(wardrobe) ? wardrobe : [];
    const top = list.find(w => ['top', 'shirt', 'overshirt', 'jacket', 'tunic'].some(c => (w.category || '').toLowerCase().includes(c))) || DEFAULT_DINNER_LOOK.top;
    const bottom = list.find(w => ['bottom', 'pant', 'trouser', 'jeans'].some(c => (w.category || '').toLowerCase().includes(c))) || DEFAULT_DINNER_LOOK.bottom;
    const shoes = list.find(w => ['shoe', 'sneaker', 'loafer'].some(c => (w.category || '').toLowerCase().includes(c))) || DEFAULT_DINNER_LOOK.shoes;
    return { top, bottom, shoes };
  }, [wardrobe]);

  if (!isOpen) return null;

  const handleAction = (path) => {
    onClose();
    navigate(path);
  };

  const handleSendPrompt = (text) => {
    const query = (text || inputText).trim();
    if (!query) return;
    onClose();
    navigate('/assistant', { state: { initialMessage: query } });
  };

  const handleSaveLook = () => {
    setIsLookSaved(true);
    if (showToast) {
      showToast('Dinner look saved to your collection!', 'success');
    }
  };

  const handleResetChat = () => {
    setIsLookSaved(false);
    setInputText('');
    try {
      localStorage.removeItem('stylesync_syncra_messages');
      window.dispatchEvent(new CustomEvent('stylesync:chat_sync', { detail: [] }));
    } catch {}
    if (showToast) {
      showToast('Chat history cleared', 'info');
    }
  };

  const handleViewItems = () => {
    onClose();
    navigate('/wardrobe');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Syncra AI Bottom Sheet with Bespoke Emblem */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-[#ECE8DF] z-10 animate-slide-up-mobile text-[#1A1D1A] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Grab Bar for Mobile */}
        <div className="w-14 h-1 bg-[#1A1D1A]/80 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="px-5 pt-3 pb-3 flex items-start justify-between border-b border-[#ECE8DF]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E2E22] via-[#2F4535] to-[#4A5D44] text-[#E6F4EA] flex items-center justify-center shadow-xs ring-1 ring-[#C5D8C7]/50 relative">
              <SyncraLogo className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#FAF8F5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif text-2xl font-bold text-[#1A1D1A] tracking-tight leading-tight">
                  Syncra AI
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E2ECE3] text-[#1E2E22] text-[9px] font-bold tracking-wider uppercase">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-[#717670] font-normal">
                Personal wardrobe intelligence &amp; stylist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetChat}
              className="px-2.5 py-1 text-[11px] font-medium text-[#717670] hover:text-rose-600 hover:bg-rose-50 border border-[#ECE8DF] rounded-full transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
              title="Clear chat history"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#EFECE5] text-[#1A1D1A] border border-[#ECE8DF] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Greeting */}
          <div className="flex items-start gap-2.5">
            <SyncraAIAvatar />
            <div className="bg-white rounded-3xl rounded-tl-sm px-5 py-3.5 shadow-2xs border border-[#ECE8DF] text-xs sm:text-sm text-[#1A1D1A] font-medium leading-relaxed max-w-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E2E22] uppercase tracking-wider mb-1">
                <SyncraLogo className="w-3.5 h-3.5" />
                <span>Syncra Stylist</span>
              </div>
              <p>How can I help you style today? Pick an action below or ask me any question about your clothes.</p>
            </div>
          </div>

          {/* 4 Action Pills */}
          <div className="grid grid-cols-2 gap-2 pl-10 pr-1">
            {[
              { label: 'Create outfit', Icon: Shirt, iconColor: 'text-amber-600 bg-amber-50', action: () => handleAction('/daily-stylist') },
              { label: 'Trip capsule', Icon: Compass, iconColor: 'text-sky-600 bg-sky-50', action: () => handleSendPrompt('Suggest clothes for a trip') },
              { label: 'Compare items', Icon: ArrowLeftRight, iconColor: 'text-rose-600 bg-rose-50', action: () => handleAction('/compare') },
              { label: 'Help me shop', Icon: ShoppingBag, iconColor: 'text-emerald-600 bg-emerald-50', action: () => handleAction('/advisor') }
            ].map((pill) => {
              const Icon = pill.Icon;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={pill.action}
                  className="bg-white hover:bg-[#FAF8F5] active:scale-95 text-[#1A1D1A] text-xs font-semibold py-2.5 px-3 rounded-2xl border border-[#ECE8DF] shadow-2xs transition-all text-left flex items-center gap-2 cursor-pointer select-none group"
                >
                  <div className={`w-6 h-6 rounded-lg ${pill.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Message */}
          <div className="flex justify-end pt-1">
            <div className="bg-[#1E2E22] text-[#F8F6F0] rounded-3xl rounded-tr-sm px-5 py-3.5 text-xs sm:text-sm font-medium shadow-2xs max-w-[85%]">
              Can you suggest a dinner look?
            </div>
          </div>

          {/* Outfit Look Card */}
          <div className="flex items-start gap-2.5 pt-1">
            <SyncraAIAvatar />

            <div className="bg-white rounded-3xl rounded-tl-sm p-5 border border-[#ECE8DF] shadow-xs space-y-4 max-w-sm flex-1">
              <div className="flex items-center justify-between pb-1 border-b border-[#ECE8DF]/60">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>98% Harmony Match</span>
                </span>
                <span className="text-[10px] text-[#8E968C]">Smart Casual</span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#1A1D1A] leading-relaxed">
                Here's a refined evening dinner look assembled from your wardrobe.
              </p>

              {/* 3 Garments */}
              <div className="bg-[#FAF8F5] rounded-2xl p-3 border border-[#ECE8DF]/60 flex items-center justify-around gap-2 min-h-[110px]">
                <div className="flex flex-col items-center flex-1 max-w-[85px] group">
                  <div className="w-16 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#ECE8DF] p-1 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src={dinnerLookPieces.top.image}
                      alt="Top"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] font-medium text-[#717670] mt-1 truncate max-w-[75px] text-center">
                    Overshirt
                  </span>
                </div>

                <div className="flex flex-col items-center flex-1 max-w-[85px] group">
                  <div className="w-16 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#ECE8DF] p-1 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src={dinnerLookPieces.bottom.image}
                      alt="Bottom"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] font-medium text-[#717670] mt-1 truncate max-w-[75px] text-center">
                    Trousers
                  </span>
                </div>

                <div className="flex flex-col items-center flex-1 max-w-[85px] group">
                  <div className="w-16 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#ECE8DF] p-1 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src={dinnerLookPieces.shoes.image}
                      alt="Shoes"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] font-medium text-[#717670] mt-1 truncate max-w-[75px] text-center">
                    Sneakers
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#8E968C] font-normal">
                3 pieces · Linen &amp; cotton balance · Ideal for 22°–26°C
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleSaveLook}
                  className="flex-1 py-3 px-4 bg-[#1E2E22] hover:bg-[#162319] text-white rounded-2xl font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isLookSaved && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isLookSaved ? 'Saved to Looks' : 'Save Look'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleViewItems}
                  className="flex-1 py-3 px-4 bg-white hover:bg-[#FAF8F5] border border-[#ECE8DF] text-[#1A1D1A] rounded-2xl font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer text-center"
                >
                  View Closet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Input */}
        <div className="p-3.5 pt-2 pb-5 sm:pb-4 border-t border-[#ECE8DF]/70 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="bg-[#FAF8F5] rounded-full border border-[#ECE8DF] focus-within:border-[#1E2E22] focus-within:bg-white flex items-center gap-2 px-3.5 py-1.5 transition-all shadow-2xs"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Syncra anything about your style..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#1A1D1A] placeholder:text-[#9CA3AF] focus:outline-none py-1.5"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full bg-[#1E2E22] hover:bg-[#162319] text-white flex items-center justify-center shrink-0 disabled:opacity-25 cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-[#C5D8C7]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SyncraModal;
