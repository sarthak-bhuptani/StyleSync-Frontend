import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle2, AlertCircle, ExternalLink, Loader2, Mail, RefreshCw, Copy, Check } from 'lucide-react';
import { authApi } from '../api/authApi';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email.trim());
      setLoading(false);

      if (res && res.success) {
        setSubmitted(true);
        if (res.resetUrl) {
          setDevResetUrl(res.resetUrl);
        }
      } else {
        setError(res?.message || 'Unable to process password reset request. Please check your email address.');
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.message || err.message;
      if (msg === 'Network Error') {
        setError('Server was momentarily connecting. Please click "Send Reset Link" again.');
      } else {
        setError(msg || 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleCopyLink = () => {
    if (devResetUrl) {
      navigator.clipboard.writeText(devResetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <h2 className="text-xl font-bold text-slate-900">Reset Your Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-900">Request Failed</p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Password Reset Email Sent</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5 px-2">
                We've dispatched a secure recovery link to <strong className="text-slate-800 font-semibold">{email}</strong>. Check your inbox and follow the steps to reset your password.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-subtle transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Open Gmail Inbox</span>
              </a>

              <NavLink
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Return to Login
              </NavLink>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                  setError('');
                  setDevResetUrl('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Didn't receive it? Try another email</span>
              </button>

              {devResetUrl && (
                <div className="pt-2 w-full">
                  <button
                    type="button"
                    onClick={() => setShowDevOptions(!showDevOptions)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                  >
                    {showDevOptions ? 'Hide direct link' : 'Developer: View direct link'}
                  </button>

                  {showDevOptions && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">Direct Link:</span>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <a
                        href={devResetUrl}
                        className="text-[11px] text-emerald-600 hover:underline break-all block font-mono"
                      >
                        {devResetUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="sarthak@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-subtle transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending email...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center pt-2">
              <NavLink
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </NavLink>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
