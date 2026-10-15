import React, { useState } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111612] text-[#1A1D1A] flex flex-col justify-center sm:py-8 sm:px-4">
      {/* Container simulating the sleek phone frame */}
      <div className="w-full max-w-md mx-auto bg-white sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col min-h-screen sm:min-h-[720px] relative">
        
        {/* TOP HERO BANNER */}
        <div className="relative h-[270px] sm:h-[300px] w-full shrink-0 overflow-hidden bg-[#FAF9F5] select-none">
          <img
            src="/login-fashion-hero.jpg"
            alt="Real Everyday Wardrobe & Clothes Rack"
            className="w-full h-full object-cover object-center scale-100"
          />
          {/* Gentle dark gradient overlay for optimal text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/65" />

          {/* Top Bar with Back Button */}
          <div className="absolute top-4 left-4 z-20">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Centered StyleSync Logo from Brand Identity */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pt-2 pointer-events-none">
            <BrandLogo dark size="lg" to={null} className="drop-shadow-lg" />
          </div>
        </div>

        {/* BOTTOM WHITE / CREAM SHEET */}
        <div className="-mt-8 relative z-20 bg-[#FAF9F5] rounded-t-[32px] sm:rounded-t-[36px] px-6 sm:px-7 pt-6 pb-8 flex-1 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            {/* Heading & Subtitle */}
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-[27px] text-[#1A1D1A] tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-[#7A8077] mt-0.5 font-normal">
                Sign in to continue your style journey
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              {/* Email Address */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E968C]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E4DA] rounded-2xl text-xs sm:text-sm text-[#1A1D1A] placeholder:text-[#A1A79F] focus:outline-none focus:border-[#1A1D1A] transition-colors shadow-2xs"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E968C]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-[#E8E4DA] rounded-2xl text-xs sm:text-sm text-[#1A1D1A] placeholder:text-[#A1A79F] focus:outline-none focus:border-[#1A1D1A] transition-colors shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E968C] hover:text-[#1A1D1A] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot password */}
              <div className="text-right pt-0.5">
                <NavLink
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#1A1D1A] hover:underline"
                >
                  Forgot password?
                </NavLink>
              </div>

              {/* Sign in Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 sm:py-4 px-6 bg-[#111827] hover:bg-[#030712] text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 pt-2 text-[#8E968C]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[11px] text-[#8E968C] font-medium">Secured with 256-bit encryption</span>
            </div>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-6 text-xs text-[#7A8077]">
            Don't have an account?{' '}
            <NavLink to="/register" className="font-bold text-[#1A1D1A] hover:underline">
              Create account
            </NavLink>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
