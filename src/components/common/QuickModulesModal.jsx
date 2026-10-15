import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Compass,
  ArrowLeftRight,
  PlusCircle,
  Sun,
  Layers,
  ArrowRight,
  Bookmark
} from 'lucide-react';

export const QuickModulesModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const modules = [
    {
      id: 'advisor',
      path: '/advisor',
      number: '01',
      title: 'Should I buy this?',
      subtitle: 'Evaluate product links & wardrobe fit score',
      icon: Compass,
      tag: 'Product Check'
    },
    {
      id: 'compare',
      path: '/compare',
      number: '02',
      title: 'Compare Products',
      subtitle: 'Side-by-side style duel & Better Value verdict',
      icon: ArrowLeftRight,
      tag: 'Duel & Value'
    },
    {
      id: 'gaps',
      path: '/wardrobe-gaps',
      number: '03',
      title: 'What to Buy Next',
      subtitle: 'Capsule foundation balance & top missing pieces',
      icon: PlusCircle,
      tag: 'Capsule Gaps'
    },
    {
      id: 'stylist',
      path: '/daily-stylist',
      number: '04',
      title: 'Wear Today · Outfit Lab',
      subtitle: 'Daily curated look & outfit mixer',
      icon: Sun,
      tag: 'Daily Look'
    },
    {
      id: 'wardrobe',
      path: '/wardrobe',
      number: '05',
      title: 'My Wardrobe',
      subtitle: 'Browse & organize all your clothes',
      icon: Layers,
      tag: 'Closet'
    },
    {
      id: 'collections',
      path: '/collections',
      number: '06',
      title: 'My Collections',
      subtitle: 'Organize custom wardrobe & outfit capsules',
      icon: Bookmark,
      tag: 'Capsules'
    }
  ];

  const handleSelect = (path) => {
    onClose();
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal / Sheet Content */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 p-5 sm:p-6 border border-[#ECE8DF] animate-slide-up-mobile text-[#1A1D1A] max-h-[85vh] overflow-y-auto">
        {/* Grab bar for mobile */}
        <div className="w-12 h-1.5 rounded-full bg-[#D6C7B2]/60 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#ECE8DF]">
          <div>
            <h3 className="font-serif font-bold text-xl text-[#1A1D1A]">
              Explore Modules &amp; Pages
            </h3>
            <p className="text-xs text-[#717670] mt-0.5">
              Quickly switch between style &amp; shopping tools
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8E968C] hover:text-[#1A1D1A] rounded-full hover:bg-[#EFECE5] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modules List */}
        <div className="py-4 space-y-2.5">
          {modules.map((mod) => {
            const isCurrent = location.pathname === mod.path;
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => handleSelect(mod.path)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isCurrent
                    ? 'bg-[#1E2E22] text-white border-[#1E2E22] shadow-sm'
                    : 'bg-white border-[#ECE8DF] text-[#1A1D1A] hover:border-[#1A1D1A]/30 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-white/10 text-white'
                        : 'bg-[#FAF8F5] border border-[#ECE8DF] text-[#1E2E22] group-hover:bg-[#1E2E22] group-hover:text-white transition-colors'
                    }`}
                  >
                    <span className="font-serif font-bold text-xs">{mod.number}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-serif font-bold text-sm truncate ${
                          isCurrent ? 'text-white' : 'text-[#1A1D1A]'
                        }`}
                      >
                        {mod.title}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold tracking-wider uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isCurrent ? 'text-white/80' : 'text-[#717670]'
                      }`}
                    >
                      {mod.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  className={`w-4 h-4 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5 ${
                    isCurrent ? 'text-white/80' : 'text-[#8E968C] group-hover:text-[#1A1D1A]'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickModulesModal;
