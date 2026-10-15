import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Shirt,
  Layers,
  Sparkles,
  ShoppingBag,
  MoreHorizontal
} from 'lucide-react';

export const FloatingStylistOrb = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Modules list not displayed in tabs (matching the screenshot)
  const menuItems = [
    {
      id: 'wear-today',
      label: 'Wear Today',
      path: '/daily-stylist',
      icon: Shirt,
      bg: 'bg-[#CBE3CB]',
      text: 'text-[#1E2E22]',
      offset: '-translate-x-3.5'
    },
    {
      id: 'my-wardrobe',
      label: 'My Wardrobe',
      path: '/wardrobe',
      icon: Layers,
      bg: 'bg-[#E5D7C7]',
      text: 'text-[#4A3828]',
      offset: '-translate-x-2'
    },
    {
      id: 'outfit-lab',
      label: 'Outfit Lab',
      path: '/my-looks',
      icon: Sparkles,
      bg: 'bg-[#CFE2F5]',
      text: 'text-[#1D4A70]',
      offset: 'translate-x-0'
    },
    {
      id: 'what-to-buy',
      label: 'What to Buy Next',
      path: '/wardrobe-gaps',
      icon: ShoppingBag,
      bg: 'bg-[#F2D2DE]',
      text: 'text-[#6E1C38]',
      offset: 'translate-x-1'
    },
    {
      id: 'more',
      label: 'More',
      path: '/more',
      icon: MoreHorizontal,
      bg: 'bg-white',
      text: 'text-[#1A1D1A]',
      offset: 'translate-x-1.5'
    }
  ];

  return (
    <>
      {/* Dim Backdrop Overlay when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Speed Dial Container on Right Side */}
      <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-8 inset-x-0 lg:inset-x-auto lg:right-8 max-w-md lg:max-w-none mx-auto lg:mx-0 z-50 pointer-events-none select-none flex justify-end px-3.5 sm:px-4 lg:px-0">
        <div className="pointer-events-auto relative flex flex-col items-end">
          {/* Curved Animated Speed-Dial Items */}
          {isOpen && (
            <div className="mb-3 flex flex-col items-end space-y-2.5 relative">
              {/* Subtle connecting curved arc line */}
              <svg
                className="absolute right-5 bottom-0 pointer-events-none w-16 h-72 overflow-visible"
                fill="none"
              >
                <path
                  d="M 12 280 Q 28 150 -4 10"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              </svg>

              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isCurrent = location.pathname === item.path;

                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 35}ms` }}
                    className={`flex items-center gap-2.5 animate-slide-up-mobile transition-all duration-200 ${item.offset}`}
                  >
                    {/* White Pill Tag Label */}
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.path)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                        isCurrent
                          ? 'bg-[#1E2E22] text-[#F8F6F0] border-[#1E2E22]'
                          : 'bg-white text-[#1A1D1A] hover:bg-[#FAF8F5] border-[#ECE8DF]'
                      }`}
                    >
                      {item.label}
                    </button>

                    {/* Circular Icon Orb */}
                    <button
                      type="button"
                      onClick={() => handleNavigate(item.path)}
                      aria-label={item.label}
                      className={`w-11 h-11 rounded-full ${item.bg} ${item.text} border-2 border-white shadow-md flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 transition-all`}
                    >
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating + Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close module list' : 'Open module list'}
            title="All Features & Modules"
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 border-white transition-all duration-300 cursor-pointer active:scale-90 ${
              isOpen
                ? 'bg-[#141F17] text-white rotate-45 ring-4 ring-[#1E2E22]/20 scale-105'
                : 'bg-[#1E2E22] hover:bg-[#162319] text-[#F8F6F0] ring-2 ring-black/10 hover:scale-105'
            }`}
          >
            <Plus className="w-6 h-6 stroke-[2.2] transition-transform duration-300" />
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingStylistOrb;
