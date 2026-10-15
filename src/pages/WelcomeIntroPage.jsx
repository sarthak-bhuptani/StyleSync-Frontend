import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const WelcomeIntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#111612] text-[#1A1D1A] flex flex-col justify-center sm:py-8 sm:px-4">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md mx-auto bg-[#F6F4EE] sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col min-h-screen sm:min-h-[780px] relative px-6 sm:px-7 py-6 justify-between select-none">
        
        {/* Background Clothes Rack Graphic on the Right */}
        <div className="absolute top-0 right-0 w-[62%] h-[78%] pointer-events-none z-0 overflow-hidden">
          <img
            src="/welcome-clothes-rack.jpg"
            alt="Minimalist Clothes Rack"
            className="w-full h-full object-cover object-center opacity-95"
          />
          {/* Subtle gradient to smoothly blend image into the left cream background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6F4EE] via-[#F6F4EE]/60 to-transparent w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F6F4EE]/40 via-transparent to-[#F6F4EE]" />
        </div>

        {/* TOP BAR: Logo & Skip */}
        <div className="relative z-10">
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-semibold text-[#8E968C] tracking-wide invisible sm:hidden">
              9:41
            </span>
            <div className="ml-auto">
              <NavLink
                to="/login"
                className="text-xs font-semibold text-[#5A6359] hover:text-[#1A1D1A] py-1 px-2.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              >
                Skip
              </NavLink>
            </div>
          </div>

          {/* Official StyleSync Brand Logo */}
          <div className="pt-3">
            <BrandLogo size="lg" to={null} />
          </div>
        </div>

        {/* MIDDLE CONTENT: Headline & Feature List Pills */}
        <div className="relative z-10 py-6 my-auto max-w-[280px]">
          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-[34px] leading-[1.18] font-normal text-[#1A1D1A] tracking-tight drop-shadow-2xs">
            Plan, wear<br />
            and shop smarter<br />
            with AI.
          </h1>

          {/* 3 Feature Items with Circular Icons matching Screen 1 */}
          <div className="space-y-4 pt-8">
            {/* 1. Organize your wardrobe */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EAE6DC]/90 backdrop-blur-xs border border-[#DFDAD0] flex items-center justify-center shrink-0 text-[#1A1D1A] shadow-2xs">
                {/* Minimal Coat Hanger Icon */}
                <svg className="w-5 h-5 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2.1L2.4 15.5A2 2 0 0 0 4 19h16a2 2 0 0 0 1.6-3.5L14.2 7.1A3 3 0 0 0 12 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#2D332D] leading-tight">
                Organize<br />your wardrobe
              </span>
            </div>

            {/* 2. Get personalized outfit ideas */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EAE6DC]/90 backdrop-blur-xs border border-[#DFDAD0] flex items-center justify-center shrink-0 text-[#1A1D1A] shadow-2xs">
                {/* Sparkle Star Icon */}
                <svg className="w-4 h-4 fill-current text-[#1A1D1A]" viewBox="0 0 24 24">
                  <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#2D332D] leading-tight">
                Get personalized<br />outfit ideas
              </span>
            </div>

            {/* 3. Shop smarter with AI */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EAE6DC]/90 backdrop-blur-xs border border-[#DFDAD0] flex items-center justify-center shrink-0 text-[#1A1D1A] shadow-2xs">
                {/* Shopping Bag Icon */}
                <svg className="w-4 h-4 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#2D332D] leading-tight">
                Shop smarter<br />with AI
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: CTA Button & 3 Carousel Indicator Dots */}
        <div className="relative z-10 pt-4 pb-2 space-y-5">
          {/* Get started Button */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-4 px-6 bg-[#111827] hover:bg-[#030712] text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* 3 Carousel Indicator Dots (First dot active olive, two muted dots) */}
          <div className="flex items-center justify-center gap-2 pt-1 pb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D44] shadow-2xs transition-all" />
            <span className="w-2 h-2 rounded-full bg-[#D8D2C5] transition-all" />
            <span className="w-2 h-2 rounded-full bg-[#D8D2C5] transition-all" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default WelcomeIntroPage;
