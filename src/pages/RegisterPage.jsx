import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StyleSyncEmblem } from '../components/common/BrandLogo';

export const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
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
      setError('Passwords do not match.');
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
      setError('🔒 Google Sign-Up is currently disabled. Please create your account securely using the form below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-center items-center px-5 py-8 sm:py-12 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[420px] mx-auto flex flex-col">
        {/* 1. Official Centered Logo & Branding */}
        <div className="flex flex-col items-center text-center">
          <NavLink to="/" className="inline-flex flex-col items-center group active:scale-95 transition-transform">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-1">
              <StyleSyncEmblem className="w-full h-full" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center">
              Style<span className="text-emerald-500 font-black">Sync</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mt-1">
              PERSONAL STYLIST &amp; WARDROBE
            </span>
          </NavLink>
        </div>

        {/* 2. Header Section */}
        <div className="text-center mt-7 mb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Create account
          </h1>
          <p className="text-sm sm:text-base font-normal text-slate-500 mt-1.5">
            Your personal digital stylist awaits.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium animate-shake">
            {error}
          </div>
        )}

        {/* 3. Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Full Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
                <User className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
                <Mail className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
                <Lock className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 p-1 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.75} /> : <Eye className="w-5 h-5" strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
                <Lock className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-2xl text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-3"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#FAFAF9] px-3 text-slate-400 font-medium">
              or
            </span>
          </div>
        </div>

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full py-3.5 bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl text-sm font-bold text-slate-800 flex items-center justify-center gap-3 transition-all shadow-2xs active:scale-[0.99] cursor-pointer"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <NavLink to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
