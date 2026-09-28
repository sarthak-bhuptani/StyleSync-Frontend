import React, { useState } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StyleSyncEmblem } from '../components/common/BrandLogo';

export const RegisterPage = () => {
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const res = await register({ name, email, password });
    if (res.success) {
      navigate('/onboarding');
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  const handleGoogleSignUp = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId) {
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&response_type=token&scope=email%20profile`;
    } else {
      setError('Google Sign-Up is configured for connected accounts. Please register using your details below.');
    }
  };

  const handleAppleSignUp = () => {
    setError('Apple ID Sign-Up is enabled for connected accounts.');
  };

  return (
    <div className="min-h-screen bg-[#060F1E] text-slate-900 flex justify-center items-center py-0 sm:py-10 px-0 sm:px-4 selection:bg-emerald-500/20 selection:text-emerald-950 font-sans">
      {/* Universal Luxury Card Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-auto bg-[#091224] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between border-0 sm:border sm:border-slate-800/80 relative">
        
        {/* =========================================================================
            TOP HERO SECTION (Dark Navy with Emerald Ambient Glow & Bold Typography)
           ========================================================================= */}
        <div className="relative pt-8 sm:pt-9 pb-10 sm:pb-11 px-6 sm:px-7 bg-gradient-to-b from-[#060F1E] via-[#09172E] to-[#0D213D] overflow-hidden">
          
          {/* Subtle geometric dot pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Ambient Emerald & Cyan Lighting Accents */}
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-20 w-44 h-44 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header & Fixed Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3.5 group active:scale-95 transition-transform">
              {/* StyleSync Emblem Box */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-2 border border-emerald-400/40 shadow-lg shadow-emerald-950/60 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-300 transition-all">
                <StyleSyncEmblem dark={true} className="w-full h-full" />
              </div>

              {/* Brand Title & Tagline */}
              <div className="flex flex-col">
                <div className="flex items-center text-white text-[22px] font-black tracking-tight leading-none">
                  <span>Style</span>
                  <span className="text-emerald-400 font-black">Sync</span>
                </div>
                <span className="text-[9.5px] uppercase font-bold tracking-widest text-slate-300 mt-1">
                  Personal Stylist &amp; Wardrobe
                </span>
              </div>
            </NavLink>
          </div>

          {/* Emerald Accent Divider Line */}
          <div className="relative z-10 w-8 h-[3.5px] bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-4 mb-4 shadow-sm shadow-emerald-400/50" />

          {/* Hero Main Copy & Cursive Script Row */}
          <div className="relative z-10 flex items-end justify-between mt-1">
            {/* 3-Tier Bold Headline */}
            <div>
              <h1 className="text-2xl sm:text-[28px] font-black text-white leading-[1.18] tracking-tight">
                Style<br />
                Wardrobe<br />
                Confidence
              </h1>
              <p className="text-slate-300 text-xs sm:text-[13px] font-normal mt-2 tracking-wide text-slate-300/90">
                A smarter wardrobe, together.
              </p>
            </div>

            {/* Cursive "Join Today" Artistic Accent */}
            <div className="relative flex flex-col items-center pb-1 text-slate-200/90 select-none">
              <span className="font-handwriting text-2xl sm:text-3xl leading-none text-emerald-200/95 -rotate-6">
                Join<br />Today
              </span>
              {/* Hand-drawn underline swoop */}
              <svg className="w-20 h-3 text-emerald-400/80 -mt-0.5 -rotate-6" viewBox="0 0 100 15" fill="none">
                <path d="M5 10 Q 50 -2, 95 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM CARD / FORM SECTION (Clean White Sheet with Large Rounded Top)
           ========================================================================= */}
        <div className="relative z-20 flex-1 bg-white rounded-t-[34px] px-6 sm:px-7 pt-6 pb-7 sm:pb-8 flex flex-col justify-between shadow-2xl -mt-4">
          
          <div>
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl sm:text-[22px] font-black text-slate-900 tracking-tight">
                Create Your Account
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-400 font-medium mt-0.5">
                Enter your details to get started
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* 1. Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-0.5">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
                    <User className="w-4.5 h-4.5" strokeWidth={1.75} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* 2. Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-0.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Mail className="w-4.5 h-4.5" strokeWidth={1.75} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-0.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Lock className="w-4.5 h-4.5" strokeWidth={1.75} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-11 pr-11 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              {/* 4. Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 ml-0.5">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
                    <Lock className="w-4.5 h-4.5" strokeWidth={1.75} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Primary Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-[#0A1224] hover:bg-[#121F3A] active:scale-[0.99] text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
            </form>

            {/* Divider "OR" */}
            <div className="relative my-3.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Social / SSO Row */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">Continue with Google</span>
              </button>

              {/* Apple Sign-Up Button */}
              <button
                type="button"
                onClick={handleAppleSignUp}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0 fill-current text-slate-900" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.58-7.79-11.67-14.24-6.84-10.76-11.83-22.75-14.98-35.97-3.15-13.22-4.73-25.07-4.73-35.56 0-14.56 3.63-26.68 10.88-36.36 7.25-9.68 16.48-14.65 27.69-14.91 4.79 0 10.22 1.25 16.29 3.75 6.07 2.5 10.17 3.81 12.3 3.93 1.74-.24 6.05-1.63 12.92-4.18 6.87-2.55 12.43-3.64 16.69-3.26 12.82.88 23.01 5.68 30.57 14.41-11.08 6.74-16.5 15.89-16.27 27.44.23 9.46 3.9 17.3 11.01 23.51 7.11 6.21 15.35 9.8 24.72 10.77-2.28 7.07-5.11 14.03-8.49 20.89zM119.22 33.74c0-7.39 2.66-14.37 7.98-20.93 5.32-6.56 12.01-11.06 20.08-13.5 1.09 7.61-.87 14.73-5.88 21.36-5.01 6.63-11.8 11.09-20.37 13.37-.43-.1-.97-.18-1.61-.25-.13-.02-.2-.05-.2-.05z"/>
                </svg>
                <span className="truncate">Continue with Apple</span>
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-4 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <NavLink to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors hover:underline">
              Sign in
            </NavLink>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
