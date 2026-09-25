import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Official StyleSync Emblem
 * Minimalist Slate Hanger interwoven with a 3D Emerald Gradient "S" Ribbon
 */
export const StyleSyncEmblem = ({ className = "w-full h-full" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* 3D Ribbon Gradients */}
      <linearGradient id="ssRibbonTop" x1="15" y1="35" x2="60" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2DD4BF" />
        <stop offset="40%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="ssRibbonBottom" x1="15" y1="55" x2="65" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="60%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="ssRibbonHighlight" x1="20" y1="40" x2="35" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* 1. Black Coat Hanger Silhouette */}
    <g stroke="#0F172A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* Hook */}
      <path d="M43 27C43 21.5 47 17 52.5 17C58 17 62 21 62 26C62 31 57 34 50 37" />
      {/* Hanger Body / Shoulders & Base */}
      <path d="M50 37L76 56C78 57.5 77.5 60.5 75 60.5H35" />
      <path d="M50 37L36 47" />
    </g>

    {/* 2. Emerald 3D Silk Ribbon 'S' Flow */}
    {/* Bottom Loop of 'S' */}
    <path
      d="M26 56C26 56 36 63 46 66C56 69 62 76 58 84C54 92 40 94 30 89C23 85.5 20 78 24 67C25 64 26 59 26 56Z"
      fill="url(#ssRibbonBottom)"
    />
    
    {/* Top-to-Middle Sweeping Arc of 'S' */}
    <path
      d="M48 45C32 40 20 47 22 59C23.5 68 33 74 46 76C59 78 61 86 52 90C45 93 32 91 27 84C25 81 24 74 24 74C18 63 20 50 28 43C37 35 52 38 58 45C54 48 51 46 48 45Z"
      fill="url(#ssRibbonTop)"
    />

    {/* Ribbon 3D Sheen Highlight */}
    <path
      d="M24 46C20 54 22 66 32 72C42 77 47 75 42 71C34 65 28 58 28 48C28 44 26 44 24 46Z"
      fill="url(#ssRibbonHighlight)"
    />
  </svg>
);

export const BrandLogo = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  showIcon = false,
  to = '/dashboard',
  className = ''
}) => {
  const sizeMap = {
    xs: { title: 'text-base', sub: 'text-[9px]' },
    sm: { title: 'text-lg', sub: 'text-[10px]' },
    md: { title: 'text-xl', sub: 'text-[10px]' },
    lg: { title: 'text-2xl', sub: 'text-xs' },
    xl: { title: 'text-3xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-2 select-none group ${className}`}>
      {showIcon && (
        <div className="relative w-8 h-8 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
          <StyleSyncEmblem />
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span className={`font-black tracking-tight text-slate-900 ${currentSize.title}`}>
              Style<span className="text-emerald-500 font-black">Sync</span>
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-bold tracking-widest uppercase text-slate-400 mt-1 ${currentSize.sub}`}>
              Personal Stylist & Wardrobe
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <NavLink to={to} className="inline-flex items-center">
        {content}
      </NavLink>
    );
  }

  return content;
};

export default BrandLogo;

