import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WardrobeProvider } from './context/WardrobeContext';
import { WeatherProvider } from './context/WeatherContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { WardrobePage } from './pages/WardrobePage';
import { DailyStylistPage } from './pages/DailyStylistPage';
import { WardrobeGapPage } from './pages/WardrobeGapPage';
import { ProductAdvisorPage } from './pages/ProductAdvisorPage';
import { ProductResultPage } from './pages/ProductResultPage';
import { ComparePage } from './pages/ComparePage';
import { PurchaseHistoryPage } from './pages/PurchaseHistoryPage';
import { BudgetPage } from './pages/BudgetPage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';

// Loading Spinner Screen
const AuthLoadingScreen = () => (
  <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-4">
    <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mb-3" />
    <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Loading StyleSync...</span>
  </div>
);

// Protected Route Guard: Redirects unauthenticated users to /login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <AuthLoadingScreen />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Only Route Guard: Prevents logged-in users from going back to login/register/reset pages
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <AuthLoadingScreen />;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Root / Marketing Route Guard:
// If logged in, automatically go to /dashboard (do not show or redirect back to marketing)
// If logged out / guest, show marketing LandingPage
const LandingRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <AuthLoadingScreen />;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root / Marketing Landing Page */}
      <Route path="/" element={<LandingRoute />} />

      {/* Auth / Guest Only Routes (Blocked if already logged in) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* Onboarding - Authenticated Only */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Application Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/daily-stylist" element={<DailyStylistPage />} />
        <Route path="/wardrobe-gaps" element={<WardrobeGapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
        <Route path="/advisor" element={<ProductAdvisorPage />} />
        <Route path="/advisor/result/:id" element={<ProductResultPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/outfits" element={<DailyStylistPage />} />
        <Route path="/purchases" element={<PurchaseHistoryPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <WardrobeProvider>
        <WeatherProvider>
          <AppRoutes />
        </WeatherProvider>
      </WardrobeProvider>
    </AuthProvider>
  );
};

export default App;

