import React, { useState } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';



export const RegisterPage = () => {
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const res = await register(formData.name, formData.email, formData.password);
    if (res.success) {
      navigate('/onboarding');
    } else {
      setError(res.error || 'Failed to create account. Please try again.');
    }
  };



  return (
    <div className="min-h-screen bg-[#111612] text-[#1A1D1A] flex flex-col justify-center sm:py-8 sm:px-4">
      {/* Container simulating the sleek phone frame */}
      <div className="w-full max-w-md mx-auto bg-[#F7F5F0] sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col min-h-screen sm:min-h-[660px] relative px-6 sm:px-8 py-6 sm:py-7 justify-between my-auto">
        
        {/* Organic Olive Shapes in Corners */}
        {/* Top Right Organic Curve */}
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none overflow-hidden z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-[#4A5D44] opacity-80">
            <path d="M100 0 C70 0 50 20 50 60 C50 100 100 100 100 100 Z" />
          </svg>
        </div>
        {/* Bottom Left Organic Curve */}
        <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none overflow-hidden z-0">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-[#3F4F39] opacity-75">
            <path d="M0 100 C0 60 20 30 60 40 C100 50 100 100 0 100 Z" />
          </svg>
        </div>

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col flex-1 justify-between py-2">
          <div>
            {/* Top Bar with Back Button */}
            <div className="flex items-center justify-between pt-1 pb-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-10 h-10 rounded-full bg-white/80 border border-[#E8E4DA] text-[#1A1D1A] flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer shadow-2xs"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* StyleSync Official Brand Logo */}
            <div className="flex justify-center pt-2 pb-6">
              <BrandLogo size="lg" to={null} />
            </div>

            {/* Heading & Subtitle */}
            <div className="text-left pb-5">
              <h1 className="font-serif font-bold text-2xl sm:text-[28px] text-[#1A1D1A] tracking-tight">
                Create an account
              </h1>
              <p className="text-xs sm:text-sm text-[#7A8077] mt-1 font-normal">
                Join StyleSync and start dressing smarter
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E968C]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-[#E8E4DA] rounded-2xl text-xs sm:text-sm text-[#1A1D1A] placeholder:text-[#A1A79F] focus:outline-none focus:border-[#1A1D1A] transition-colors shadow-2xs"
                />
              </div>

              {/* Email Address */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E968C]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-[#E8E4DA] rounded-2xl text-xs sm:text-sm text-[#1A1D1A] placeholder:text-[#A1A79F] focus:outline-none focus:border-[#1A1D1A] transition-colors shadow-2xs"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E968C]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-11 pr-11 py-3 sm:py-3.5 bg-white border border-[#E8E4DA] rounded-2xl text-xs sm:text-sm text-[#1A1D1A] placeholder:text-[#A1A79F] focus:outline-none focus:border-[#1A1D1A] transition-colors shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8E968C] hover:text-[#1A1D1A] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E968C]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full pl-11 pr-11 py-3 sm:py-3.5 bg-white border border-[#E8E4DA] rounded-2xl text-xs sm:text-sm text-[#1A1D1A] placeholder:text-[#A1A79F] focus:outline-none focus:border-[#1A1D1A] transition-colors shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8E968C] hover:text-[#1A1D1A] cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 py-3.5 sm:py-4 px-6 bg-[#111827] hover:bg-[#030712] text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Creating account...' : 'Create account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-8 pb-3 text-xs sm:text-sm text-[#7A8077] relative z-20">
            Already have an account?{' '}
            <NavLink to="/login" className="font-bold text-[#1A1D1A] hover:underline ml-1">
              Sign in
            </NavLink>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
