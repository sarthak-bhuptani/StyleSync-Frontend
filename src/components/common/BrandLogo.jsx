import React from 'react';
import { NavLink } from 'react-router-dom';

export const BrandLogo = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  to = '/dashboard',
  className = ''
}) => {
  const sizeMap = {
    xs: { img: 'w-6 h-6', title: 'text-sm', sub: 'text-[9px]' },
    sm: { img: 'w-8 h-8', title: 'text-base', sub: 'text-[10px]' },
    md: { img: 'w-10 h-10', title: 'text-lg', sub: 'text-[10px]' },
    lg: { img: 'w-14 h-14', title: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', title: 'text-3xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-2.5 select-none group ${className}`}>
      {/* Official StyleSync Logo Mark */}
      <div className={`relative ${currentSize.img} rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
        <img
          src="/logo.png"
          alt="StyleSync Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-slate-900 ${currentSize.title}`}>
              Style<span className="text-emerald-600">Sync</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.2 rounded-md">
              AI
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-bold tracking-widest uppercase text-slate-400 ${currentSize.sub}`}>
              AI Stylist & Wardrobe
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <NavLink to={to} className="inline-block">
        {content}
      </NavLink>
    );
  }

  return content;
};

export default BrandLogo;
