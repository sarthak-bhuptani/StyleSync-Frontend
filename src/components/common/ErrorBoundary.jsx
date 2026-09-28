import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StyleSync Uncaught Render Error:', error, errorInfo);
  }

  handleReload = () => {
    // Force clean cache reload
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleResetStorage = () => {
    try {
      localStorage.removeItem('stylesync_token');
      localStorage.removeItem('stylesync_user');
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
            StyleSync encountered an unexpected glitch while rendering. Don't worry, your closet and profile data are safe.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-floating transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Reload Application</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Go to Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
