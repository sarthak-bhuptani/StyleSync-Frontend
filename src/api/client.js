import axios from 'axios';

const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${host}:5000/api/v1`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor to attach JWT auth token when present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stylesync_token') || localStorage.getItem('buywise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simulated network latency helper for mock API calls (300ms - 700ms)
export const simulateNetworkDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));
