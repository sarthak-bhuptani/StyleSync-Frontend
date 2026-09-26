import { apiClient } from './client';

// Helper to extract access token, refresh token, and user from various backend payload shapes
export const extractAuthPayload = (resData) => {
  if (!resData) return { token: null, refreshToken: null, user: null };

  const token =
    resData.token ||
    resData.accessToken ||
    resData.access_token ||
    resData.data?.token ||
    resData.data?.accessToken ||
    resData.data?.access_token ||
    resData.data?.tokens?.access?.token;

  const refreshToken =
    resData.refreshToken ||
    resData.refresh_token ||
    resData.data?.refreshToken ||
    resData.data?.refresh_token ||
    resData.data?.tokens?.refresh?.token;

  const user = resData.user || resData.data?.user || (resData.data?.id ? resData.data : null);

  return { token, refreshToken, user };
};

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const resData = response.data;
      const { token, refreshToken, user } = extractAuthPayload(resData);

      if (token) {
        localStorage.setItem('stylesync_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('stylesync_refresh_token', refreshToken);
      }
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }

      return {
        success: true,
        token: token || localStorage.getItem('stylesync_token'),
        refreshToken: refreshToken || localStorage.getItem('stylesync_refresh_token'),
        user,
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please verify your credentials.';
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const resData = response.data;
      const { token, refreshToken, user } = extractAuthPayload(resData);

      if (token) {
        localStorage.setItem('stylesync_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('stylesync_refresh_token', refreshToken);
      }
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }

      return {
        success: true,
        token: token || localStorage.getItem('stylesync_token'),
        refreshToken: refreshToken || localStorage.getItem('stylesync_refresh_token'),
        user,
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Email may already be in use.';
      return { success: false, error: message };
    }
  },

  refreshToken: async () => {
    const storedRefreshToken = localStorage.getItem('stylesync_refresh_token');
    if (!storedRefreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    try {
      // Send refresh request
      const response = await apiClient.post('/auth/refresh', {
        refreshToken: storedRefreshToken,
        refresh_token: storedRefreshToken,
      });

      const resData = response.data;
      const { token, refreshToken: newRefreshToken, user } = extractAuthPayload(resData);

      if (token) {
        localStorage.setItem('stylesync_token', token);
        if (newRefreshToken) {
          localStorage.setItem('stylesync_refresh_token', newRefreshToken);
        }
        if (user) {
          localStorage.setItem('stylesync_user', JSON.stringify(user));
        }
        return {
          success: true,
          token,
          refreshToken: newRefreshToken || storedRefreshToken,
          user,
        };
      }

      return { success: false, error: 'No access token returned from refresh endpoint.' };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Token refresh failed.',
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Could not process request.',
      };
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, password });
      const resData = response.data;
      const { token: resToken, refreshToken, user } = extractAuthPayload(resData);

      if (resToken) {
        localStorage.setItem('stylesync_token', resToken);
      }
      if (refreshToken) {
        localStorage.setItem('stylesync_refresh_token', refreshToken);
      }
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }

      return { success: true, ...resData, token: resToken, refreshToken, user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Could not reset password. The link may have expired.',
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const resData = response.data;
      const user = resData.user || resData.data?.user || (resData.data?.id ? resData.data : resData);
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }
      return { success: true, user };
    } catch {
      const user = JSON.parse(localStorage.getItem('stylesync_user')) || null;
      return { success: !!user, user };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('stylesync_refresh_token');
      // Attempt backend logout notification if endpoint exists
      await apiClient.post('/auth/logout', { refreshToken, refresh_token: refreshToken }).catch(() => {});
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('stylesync_token');
      localStorage.removeItem('stylesync_refresh_token');
      localStorage.removeItem('stylesync_user');
      localStorage.removeItem('stylesync_wardrobe');
      localStorage.removeItem('stylesync_analyzed_products');
      localStorage.removeItem('stylesync_purchases');
      localStorage.removeItem('stylesync_outfits');
      localStorage.removeItem('stylesync_budget');
      localStorage.removeItem('stylesync_notifications');
      localStorage.removeItem('buywise_token');
    }
    return { success: true };
  },
};

