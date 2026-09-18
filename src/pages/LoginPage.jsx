import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-slate-200/80">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo size="lg" to="/" className="mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to access your personal AI shopping advisor</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <NavLink to="/forgot-password" className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800">
                Forgot password?
              </NavLink>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-slate-600 font-medium">Keep me signed in</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-subtle hover:shadow transition-all flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <NavLink to="/register" className="font-bold text-slate-900 hover:text-emerald-700">
            Create an Account
          </NavLink>
        </p>
      </div>
    </div>
  );
};
