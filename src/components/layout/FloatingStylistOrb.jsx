import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Compass,
  MessageSquare,
  Sun,
  ArrowLeftRight,
  Plus,
  X,
  PlusCircle,
  Layers
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { AddWardrobeItemModal } from '../wardrobe/AddWardrobeItemModal';

export const FloatingStylistOrb = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCameraAddOpen, setIsCameraAddOpen] = useState(false);
  const navigate = useNavigate();
  const { addWardrobeItem } = useWardrobe();

  const handleAction = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleOpenSnap = () => {
    setIsOpen(false);
    setIsCameraAddOpen(true);
  };

  return (
    <>
      {/* Backdrop overlay when speed dial is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Speed Dial Items */}
      {isOpen && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex flex-col items-end gap-2.5 lg:hidden animate-slide-up-mobile">
          {/* Action 1: Snap Photo with Camera */}
          <button
            type="button"
            onClick={handleOpenSnap}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-2xl shadow-floating border border-slate-100 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-slate-800 group-hover:text-emerald-700">Snap Clothes (Camera)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
          </button>

          {/* Action 2: Ask Stylist */}
          <button
            type="button"
            onClick={() => handleAction('/assistant')}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-2xl shadow-floating border border-slate-100 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-slate-800 group-hover:text-emerald-700">Ask Stylist</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
          </button>

          {/* Action 3: Evaluate Item (Advisor) */}
          <button
            type="button"
            onClick={() => handleAction('/advisor')}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-2xl shadow-floating border border-slate-100 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-slate-800 group-hover:text-emerald-700">Check Before Buying</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
          </button>

          {/* Action 4: Wear Today Outfit */}
          <button
            type="button"
            onClick={() => handleAction('/daily-stylist')}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-2xl shadow-floating border border-slate-100 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-slate-800 group-hover:text-emerald-700">Wear Today Outfits</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Sun className="w-4 h-4" />
            </div>
          </button>

          {/* Action 5: Shopping Duel (Compare) */}
          <button
            type="button"
            onClick={() => handleAction('/compare')}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-white text-slate-800 rounded-2xl shadow-floating border border-slate-100 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-slate-800 group-hover:text-emerald-700">Compare 2 Products</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Main Floating Orb Button */}
      <div className="fixed bottom-[calc(4.2rem+env(safe-area-inset-bottom,0px))] right-4 z-50 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Quick Stylist Actions"
          className={`w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
            isOpen
              ? 'bg-slate-900 text-white rotate-90 ring-4 ring-slate-900/20 shadow-emerald-500/20'
              : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-700 text-white ring-2 ring-white shadow-floating hover:scale-105'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse-subtle" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
            </div>
          )}
        </button>
      </div>

      {/* Direct Add Clothes Modal triggered from FAB */}
      {isCameraAddOpen && (
        <AddWardrobeItemModal
          isOpen={isCameraAddOpen}
          onClose={() => setIsCameraAddOpen(false)}
          onAdd={addWardrobeItem}
        />
      )}
    </>
  );
};

export default FloatingStylistOrb;
