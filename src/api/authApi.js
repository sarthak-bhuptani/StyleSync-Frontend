import { apiClient } from './client';

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const resData = response.data;
      const token = resData.token || resData.data?.token;
      const user = resData.user || resData.data?.user;
      
      if (token) {
        localStorage.setItem('stylesync_token', token);
      }
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }
      return { success: true, token, user };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please verify your credentials.';
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const resData = response.data;
      const token = resData.token || resData.data?.token;
      const user = resData.user || resData.data?.user;
      if (token) {
        localStorage.setItem('stylesync_token', token);
      }
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }
      return { success: true, token, user };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed. Email may already be in use.';
      return { success: false, error: message };
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
      const resToken = resData.token || resData.data?.token;
      const user = resData.user || resData.data?.user;
      if (resToken) {
        localStorage.setItem('stylesync_token', resToken);
      }
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }
      return { success: true, ...resData };
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
      return response.data;
    } catch {
      const user = JSON.parse(localStorage.getItem('stylesync_user')) || null;
      return { success: !!user, user };
    }
  },

  logout: async () => {
    localStorage.removeItem('stylesync_token');
    localStorage.removeItem('stylesync_user');
    return { success: true };
  }
};
