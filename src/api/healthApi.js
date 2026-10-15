import axios from 'axios';

const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const rawBase = (import.meta.env.VITE_API_BASE_URL || `http://${host}:5000/api/v1`).trim().replace(/\/+$/, '');
const HEALTH_URL = rawBase.replace(/\/api\/v1\/?$/, '') + '/health';

export const healthApi = {
  // GET /health
  checkHealth: async () => {
    try {
      const response = await axios.get(HEALTH_URL, { timeout: 5000 });
      return response.data;
    } catch (err) {
      console.warn('Backend health check unreachable:', err.message);
      return { status: 'offline', error: err.message };
    }
  }
};

export default healthApi;
