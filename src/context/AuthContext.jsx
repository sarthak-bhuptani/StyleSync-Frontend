import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { profileApi } from '../api/profileApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('stylesync_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('stylesync_token') || null);
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem('stylesync_refresh_token') || null
  );
  const [loading, setLoading] = useState(true);

  // Initialize and validate session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('stylesync_token');
      const storedRefreshToken = localStorage.getItem('stylesync_refresh_token');

      if (!storedToken && !storedRefreshToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setRefreshToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Validate user with /auth/me (interceptor will auto-refresh if token is expired but refreshToken is valid)
        const res = await authApi.getCurrentUser();
        if (isMounted) {
          if (res?.user) {
            setUser(res.user);
            setToken(localStorage.getItem('stylesync_token'));
            setRefreshToken(localStorage.getItem('stylesync_refresh_token'));
          } else if (!localStorage.getItem('stylesync_token')) {
            setUser(null);
            setToken(null);
            setRefreshToken(null);
          }
        }
      } catch (err) {
        console.warn('Initial session validation skipped:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth expiration events dispatched by Axios interceptor
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setLoading(false);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('auth:logout', handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:expired', handleAuthExpired);
      window.removeEventListener('auth:logout', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.token) {
        setToken(res.token);
        setRefreshToken(res.refreshToken || null);
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
        setRefreshToken(res.refreshToken || null);
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
    try {
      await authApi.logout();
    } finally {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
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
    const savedUser = JSON.parse(localStorage.getItem('stylesync_user') || 'null');
    const savedToken = localStorage.getItem('stylesync_token') || null;
    const savedRefreshToken = localStorage.getItem('stylesync_refresh_token') || null;
    return {
      user: savedUser,
      token: savedToken,
      refreshToken: savedRefreshToken,
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

