import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Brand Color Palette from StyleSync Brand Identity:
 * - Charcoal: #1A1A1A
 * - Olive:    #6B7A5A
 * - Beige:    #F5F1E9
 * - Taupe:    #D9D1C6
 * - Blush:    #E8D7D3
 */

/**
 * 4-Point Sparkle Star Vector (✦)
 */
export const SparkleStar = ({
  className = "w-3 h-3",
  color = "currentColor"
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
  </svg>
);

/**
 * Official StyleSync Interlocking "SS" Symbol Mark
 * Interlocking serif double-S monogram with 4-point sparkle star
 */
export const StyleSyncMonogram = ({
  className = "w-10 h-10",
  dark = false,
  oliveColor,
  charcoalColor,
  starColor
}) => {
  const olive = oliveColor || (dark ? "#9BB286" : "#6B7A5A");
  const charcoal = charcoalColor || (dark ? "#F5F1E9" : "#1A1A1A");
  const star = starColor || charcoal;

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4-point Sparkle Star positioned at top-right shoulder */}
      <path
        d="M78 13 C78 17.2 81.8 21 86 21 C81.8 21 78 24.8 78 29 C78 24.8 74.2 21 70 21 C74.2 21 78 17.2 78 13 Z"
        fill={star}
      />

      {/* Left S: Olive Green */}
      <text
        x="13"
        y="68"
        fontFamily="'Playfair Display', Didot, 'Newsreader', Georgia, serif"
        fontSize="68"
        fontWeight="600"
        fill={olive}
        letterSpacing="-1"
      >
        S
      </text>

      {/* Right S: Charcoal (interlocking slightly forward) */}
      <text
        x="36"
        y="72"
        fontFamily="'Playfair Display', Didot, 'Newsreader', Georgia, serif"
        fontSize="68"
        fontWeight="600"
        fill={charcoal}
        letterSpacing="-1"
      >
        S
      </text>
    </svg>
  );
};

/**
 * StyleSync App Icon Badge (Squircle)
 * Options: 'primary' (beige #F5F1E9), 'dark' (#1A1A1A), 'olive' (#6B7A5A)
 */
export const StyleSyncAppIcon = ({
  size = 56,
  variant = 'primary', // 'primary' | 'dark' | 'olive'
  showText = true,
  className = ''
}) => {
  const isDark = variant === 'dark';
  const isOlive = variant === 'olive';

  const bgClass = isOlive
    ? 'bg-[#6B7A5A] text-white border-[#5B6A4B]'
    : isDark
    ? 'bg-[#1A1A1A] text-white border-white/10'
    : 'bg-[#F5F1E9] text-[#1A1A1A] border-[#E8E1D5]';

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: `${Math.round(size * 0.26)}px` }}
      className={`relative inline-flex flex-col items-center justify-center border shadow-sm select-none transition-transform duration-200 hover:scale-105 ${bgClass} ${className}`}
    >
      <div style={{ width: `${Math.round(size * 0.65)}px`, height: `${Math.round(size * 0.65)}px` }} className="flex items-center justify-center">
        <StyleSyncMonogram
          className="w-full h-full"
          dark={isDark}
          oliveColor={isOlive ? '#FFFFFF' : undefined}
          charcoalColor={isOlive ? '#E8D7D3' : undefined}
          starColor={isOlive ? '#FFFFFF' : undefined}
        />
      </div>
      {showText && size >= 48 && (
        <span
          style={{ fontSize: `${Math.max(9, Math.round(size * 0.12))}px`, marginTop: `-${Math.round(size * 0.08)}px` }}
          className="font-serif font-medium tracking-tight"
        >
          StyleSync
        </span>
      )}
    </div>
  );
};

/**
 * Main StyleSync BrandLogo Component
 * Implements the official Horizontal Logo from the brand identity guide:
 * [Interlocking SS Mark] | [StyleSync✦] [YOUR STYLE. SMARTER.]
 */
export const BrandLogo = ({
  size = 'md',
  variant = 'horizontal', // 'horizontal' | 'compact' | 'symbol' | 'app-icon' | 'wordmark'
  showTagline = true,
  dark = false,
  to = '/dashboard',
  className = ''
}) => {
  const sizeConfig = {
    xs: {
      iconSize: 'w-7 h-7',
      dividerHeight: 'h-4',
      title: 'text-base',
      sparkle: 'w-2.5 h-2.5 -top-1 -right-2',
      tagline: 'text-[7px]'
    },
    sm: {
      iconSize: 'w-8 h-8',
      dividerHeight: 'h-5',
      title: 'text-lg',
      sparkle: 'w-3 h-3 -top-1.5 -right-2.5',
      tagline: 'text-[8px]'
    },
    md: {
      iconSize: 'w-10 h-10',
      dividerHeight: 'h-6',
      title: 'text-xl sm:text-2xl',
      sparkle: 'w-3.5 h-3.5 -top-1.5 -right-3',
      tagline: 'text-[8.5px]'
    },
    lg: {
      iconSize: 'w-12 h-12',
      dividerHeight: 'h-8',
      title: 'text-2xl sm:text-3xl',
      sparkle: 'w-4 h-4 -top-2 -right-3.5',
      tagline: 'text-[10px]'
    },
    xl: {
      iconSize: 'w-16 h-16',
      dividerHeight: 'h-10',
      title: 'text-3xl sm:text-4xl',
      sparkle: 'w-5 h-5 -top-2.5 -right-4',
      tagline: 'text-[11px]'
    }
  };

  const cfg = sizeConfig[size] || sizeConfig.md;

  // Render App-Icon variant
  if (variant === 'app-icon') {
    const iconDim = size === 'xs' ? 32 : size === 'sm' ? 40 : size === 'md' ? 52 : size === 'lg' ? 68 : 84;
    const badge = <StyleSyncAppIcon size={iconDim} variant={dark ? 'dark' : 'primary'} className={className} />;
    return to ? <NavLink to={to} className="inline-flex items-center">{badge}</NavLink> : badge;
  }

  // Render Standalone Symbol variant
  if (variant === 'symbol') {
    const symbol = (
      <div className={`relative flex-shrink-0 ${cfg.iconSize} ${className}`}>
        <StyleSyncMonogram dark={dark} />
      </div>
    );
    return to ? <NavLink to={to} className="inline-flex items-center">{symbol}</NavLink> : symbol;
  }

  // Wordmark block
  const wordmarkBlock = (
    <div className="flex flex-col justify-center leading-none select-none">
      <div className="relative inline-flex items-baseline">
        <span
          className={`font-serif tracking-tight font-medium ${
            dark ? 'text-white' : 'text-[#1A1A1A]'
          } ${cfg.title}`}
        >
          Style
        </span>
        <span
          className={`font-serif tracking-tight font-medium relative ${
            dark ? 'text-[#9BB286]' : 'text-[#6B7A5A]'
          } ${cfg.title}`}
        >
          Sync
          {/* Sparkle star anchored over the 'c' */}
          <span className={`absolute ${cfg.sparkle} pointer-events-none drop-shadow-xs`}>
            <SparkleStar
              className="w-full h-full"
              color={dark ? '#9BB286' : '#6B7A5A'}
            />
          </span>
        </span>
      </div>

      {showTagline && variant !== 'compact' && (
        <span
          className={`font-sans font-bold tracking-[0.24em] uppercase ${
            dark ? 'text-stone-300/80' : 'text-[#1A1A1A]/70'
          } ${cfg.tagline} mt-1`}
        >
          YOUR STYLE. SMARTER.
        </span>
      )}
    </div>
  );

  // Compact variant (monogram + wordmark, no divider/tagline)
  if (variant === 'compact') {
    const content = (
      <div className={`flex items-center gap-2 select-none group ${className}`}>
        <div className={`relative flex-shrink-0 ${cfg.iconSize} group-hover:scale-105 transition-transform duration-200`}>
          <StyleSyncMonogram dark={dark} />
        </div>
        {wordmarkBlock}
      </div>
    );
    return to ? <NavLink to={to} className="inline-flex items-center">{content}</NavLink> : content;
  }

  // Standalone wordmark variant
  if (variant === 'wordmark') {
    return to ? <NavLink to={to} className="inline-flex items-center">{wordmarkBlock}</NavLink> : wordmarkBlock;
  }

  // Default: Full Horizontal Logo with Monogram + Hairline Divider + Wordmark + Tagline
  const fullHorizontal = (
    <div className={`flex items-center gap-3 sm:gap-3.5 select-none group ${className}`}>
      {/* 1. Interlocking Monogram */}
      <div className={`relative flex-shrink-0 ${cfg.iconSize} group-hover:scale-105 transition-transform duration-200`}>
        <StyleSyncMonogram dark={dark} />
      </div>

      {/* 2. Hairline Divider */}
      <div
        className={`w-[1px] ${cfg.dividerHeight} ${
          dark ? 'bg-white/20' : 'bg-[#D9D1C6]'
        }`}
        aria-hidden="true"
      />

      {/* 3. Wordmark + Tagline */}
      {wordmarkBlock}
    </div>
  );

  if (to) {
    return (
      <NavLink to={to} className="inline-flex items-center">
        {fullHorizontal}
      </NavLink>
    );
  }

  return fullHorizontal;
};

/**
 * Backwards compatibility alias for older references
 */
export const StyleSyncEmblem = StyleSyncMonogram;

/**
 * Official Syncra AI Monogram Emblem
 * Used for the AI Stylist Assistant (AssistantPage & SyncraModal)
 */
export const SyncraLogo = ({
  className = "w-6 h-6",
  color = "currentColor",
  variant = "gradient"
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="syncraElegance" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5EFE6" />
          <stop offset="35%" stopColor="#D6C7B2" />
          <stop offset="70%" stopColor="#9EBA9F" />
          <stop offset="100%" stopColor="#C5D8C7" />
        </linearGradient>
        <linearGradient id="syncraGoldAccent" x1="28" y1="6" x2="6" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EAD8BE" />
          <stop offset="100%" stopColor="#9AB89F" />
        </linearGradient>
      </defs>

      {/* Primary Sweeping Helix Ribbon */}
      <path
        d="M21 7C16.5 7 11 9.8 11 14.5C11 19.5 21 18.5 21 23C21 26.5 17 28 13.5 27"
        stroke={variant === "gradient" ? "url(#syncraElegance)" : color}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Interlocking Harmonic Tailored Weave */}
      <path
        d="M11 9C14 7.5 18 7.5 21 9M11 23C14 24.5 18 24.5 21 23"
        stroke={variant === "gradient" ? "url(#syncraGoldAccent)" : color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* Symmetry Aperture Nodes */}
      <circle
        cx="21"
        cy="7"
        r="1.6"
        fill={variant === "gradient" ? "#F5EFE6" : color}
      />
      <circle
        cx="11"
        cy="25"
        r="1.6"
        fill={variant === "gradient" ? "#C5D8C7" : color}
      />
    </svg>
  );
};

export default BrandLogo;
