import axios from 'axios';

const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const rawBase = (import.meta.env.VITE_API_BASE_URL || `http://${host}:5000/api/v1`).trim().replace(/\/+$/, '');
const BASE_URL = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// In-flight deduplication and response cache
const inFlightRequests = new Map();
const responseCache = new Map();
const DEFAULT_CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Invalidate cache when data is modified
export const clearApiCache = (urlPrefix = null) => {
  if (!urlPrefix) {
    responseCache.clear();
  } else {
    for (const key of responseCache.keys()) {
      if (key.includes(urlPrefix)) {
        responseCache.delete(key);
      }
    }
  }
};

// Request interceptor to attach JWT auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stylesync_token') || localStorage.getItem('buywise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Auto-clear cache on mutations
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      clearApiCache();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for silent token refresh on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip interceptor if no response or if it's already a retry / auth route
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/reset-password');

    if (is401 && !originalRequest._retry && !isAuthRoute) {
      const refreshToken = localStorage.getItem('stylesync_refresh_token');

      // If no refresh token is stored, trigger clean logout and reject
      if (!refreshToken) {
        localStorage.removeItem('stylesync_token');
        localStorage.removeItem('stylesync_user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Direct call to refresh endpoint using standalone axios to avoid recursive loops
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
          refresh_token: refreshToken,
        });

        const resData = refreshResponse.data;
        const newToken =
          resData.token ||
          resData.accessToken ||
          resData.access_token ||
          resData.data?.token ||
          resData.data?.accessToken;

        const newRefreshToken =
          resData.refreshToken ||
          resData.refresh_token ||
          resData.data?.refreshToken ||
          resData.data?.refresh_token;

        if (newToken) {
          localStorage.setItem('stylesync_token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('stylesync_refresh_token', newRefreshToken);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token exchange failed: No access token returned');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Wipe local auth credentials upon token failure
        localStorage.removeItem('stylesync_token');
        localStorage.removeItem('stylesync_refresh_token');
        localStorage.removeItem('stylesync_user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Override GET with in-flight deduplication & smart memory caching
const originalGet = apiClient.get.bind(apiClient);
apiClient.get = function (url, config = {}) {
  const token = localStorage.getItem('stylesync_token') || '';
  const cacheKey = `GET:${url}:${token}`;
  const now = Date.now();
  const ttl = config.cacheTtl || DEFAULT_CACHE_TTL_MS;

  // 1. Return fresh cached response if available
  const cached = responseCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < ttl) {
    return Promise.resolve(cached.response);
  }

  // 2. Return existing in-flight promise to prevent duplicate network calls
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Dispatch single network request and cache
  const reqPromise = originalGet(url, config)
    .then((response) => {
      responseCache.set(cacheKey, { response, timestamp: Date.now() });
      return response;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, reqPromise);
  return reqPromise;
};

// Simulated network latency helper for mock API calls (300ms - 700ms)
export const simulateNetworkDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

