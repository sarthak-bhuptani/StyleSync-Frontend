import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../api/authApi';
import { profileApi } from '../api/profileApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stylesync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('stylesync_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid credentials' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to register' };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    const updated = await profileApi.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const completeOnboarding = async (onboardingData) => {
    const updated = await profileApi.completeOnboarding(onboardingData);
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    await authApi.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('stylesync_token');
    localStorage.removeItem('stylesync_user');
    localStorage.removeItem('stylesync_wardrobe');
    localStorage.removeItem('stylesync_analyzed_products');
    localStorage.removeItem('stylesync_purchases');
    localStorage.removeItem('stylesync_outfits');
    localStorage.removeItem('stylesync_budget');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const savedUser = JSON.parse(localStorage.getItem('stylesync_user')) || null;
    const savedToken = localStorage.getItem('stylesync_token') || null;
    return {
      user: savedUser,
      token: savedToken,
      isAuthenticated: !!savedToken,
      loading: false,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      logout: async () => {},
      updateProfile: async (u) => u,
      completeOnboarding: async (o) => o,
    };
  }
  return context;
};
