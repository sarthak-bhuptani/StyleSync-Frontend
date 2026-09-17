import React, { useState } from 'react';
import { NavLink, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const token = searchParams.get('token') || routeParams.token || routeParams.resetToken || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the URL. Please use the link provided in your email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword(token, password);
      setLoading(false);

      if (res && res.success) {
        setSuccess(true);
      } else {
        setError(res?.message || 'Password reset link is invalid or has expired. Please request a new one.');
      }
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || err.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-slate-200/80">
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">StyleSync</span>
          </NavLink>
          <h2 className="text-xl font-bold text-slate-900">Set New Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter and confirm your new secure password
          </p>
        </div>

        {/* Missing Token Warning */}
        {!token && !success && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-900">Missing Reset Token</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                No reset token was found in the URL. Please click the exact link from your reset email or request a new one.
              </p>
              <NavLink
                to="/forgot-password"
                className="inline-block text-xs font-bold text-amber-800 underline mt-2 hover:text-amber-950"
              >
                Request New Reset Link &rarr;
              </NavLink>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-900">Reset Failed</p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Success View */}
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Password Updated Successfully!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your password has been changed securely. You can now log in to your StyleSync account with your new credentials.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-subtle transition-all"
              >
                Proceed to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-subtle transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating password...</span>
                </>
              ) : (
                'Set New Password'
              )}
            </button>

            <NavLink
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full text-xs font-semibold text-slate-600 hover:text-slate-900 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </NavLink>
          </form>
        )}
      </div>
    </div>
  );
};
