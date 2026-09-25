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
import { OutfitBuilderPage } from './pages/OutfitBuilderPage';
import { PurchaseHistoryPage } from './pages/PurchaseHistoryPage';
import { BudgetPage } from './pages/BudgetPage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <WardrobeProvider>
        <WeatherProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

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
              <Route path="/purchases" element={<BudgetPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WeatherProvider>
      </WardrobeProvider>
    </AuthProvider>
  );
};

export default App;
