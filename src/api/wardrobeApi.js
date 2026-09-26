import { apiClient } from './client';

// In-memory fast cache and in-flight promise deduplication
let memoryWardrobeCache = null;
let inFlightWardrobePromise = null;

const safeSetStoredWardrobe = (items) => {
  if (!Array.isArray(items)) return;
  memoryWardrobeCache = items;
  try {
    localStorage.setItem('stylesync_wardrobe', JSON.stringify(items));
  } catch (err) {
    console.warn('LocalStorage quota limit reached, pruning cache:', err.message);
    try {
      localStorage.removeItem('stylesync_chat_messages');
      localStorage.removeItem('stylesync_analyzed_products');
      localStorage.setItem('stylesync_wardrobe', JSON.stringify(items));
    } catch {
      // Memory cache is preserved even if local storage quota is full
    }
  }
};

export const getStoredWardrobe = () => {
  if (memoryWardrobeCache && memoryWardrobeCache.length > 0) {
    return memoryWardrobeCache;
  }
  const saved = localStorage.getItem('stylesync_wardrobe');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        memoryWardrobeCache = parsed;
        return parsed;
      }
    } catch {
      return [];
    }
  }
  return [];
};

export const wardrobeApi = {
  // Stale-While-Revalidate with Fast 7-Second Timeout and Deduplication
  getWardrobe: async (forceNetwork = false) => {
    const cached = getStoredWardrobe();

    // 1. If we have cached items and network wasn't explicitly forced, return immediately
    // and sync fresh items in the background
    if (cached.length > 0 && !forceNetwork) {
      // Trigger background silent revalidation without blocking caller
      wardrobeApi.fetchFreshWardrobe().catch(() => {});
      return cached;
    }

    return wardrobeApi.fetchFreshWardrobe();
  },

  fetchFreshWardrobe: async () => {
    // 2. Return existing in-flight request to avoid duplicate network calls
    if (inFlightWardrobePromise) {
      return inFlightWardrobePromise;
    }

    inFlightWardrobePromise = (async () => {
      try {
        const response = await apiClient.get('/wardrobe', {
          timeout: 7000, // 7s fast timeout to prevent long serverless hangs
          cacheTtl: 30000,
        });

        const rawList = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.items || [];

        const list = rawList.map((item) => ({
          ...item,
          id: item.id || item._id,
          image: item.image || item.imageUrl,
        }));

        safeSetStoredWardrobe(list);
        return list;
      } catch (err) {
        console.warn('Wardrobe network fetch failed or timed out, using cached items:', err.message);
        return getStoredWardrobe();
      } finally {
        inFlightWardrobePromise = null;
      }
    })();

    return inFlightWardrobePromise;
  },

  getAllItems: async () => {
    return wardrobeApi.getWardrobe();
  },

  addItem: async (item) => {
    // 1. Immediate optimistic creation for 0ms latency
    const localId = 'wb_' + Date.now();
    const optimisticItem = {
      id: item.id || localId,
      usageCount: 0,
      currency: '₹',
      dateAdded: new Date().toISOString().split('T')[0],
      ...item,
      image: item.image || item.imageUrl,
    };

    const current = getStoredWardrobe();
    safeSetStoredWardrobe([optimisticItem, ...current]);

    // 2. Background sync with backend
    try {
      const payload = {
        ...optimisticItem,
        imageUrl: optimisticItem.image,
        wearCount: optimisticItem.usageCount || 0,
      };

      const response = await apiClient.post('/wardrobe', payload, { timeout: 8000 });
      const created = response.data?.data || response.data?.item || response.data;
      if (created) {
        const serverItem = {
          ...optimisticItem,
          ...created,
          id: created.id || created._id || optimisticItem.id,
          image: created.image || created.imageUrl || optimisticItem.image,
        };
        const updated = getStoredWardrobe().map((it) => (it.id === localId ? serverItem : it));
        safeSetStoredWardrobe(updated);
        return serverItem;
      }
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err.message);
    }

    return optimisticItem;
  },

  updateItem: async (id, updates) => {
    // 1. Immediate optimistic update
    const items = getStoredWardrobe();
    const updated = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    safeSetStoredWardrobe(updated);

    // 2. Sync to server in background
    try {
      await apiClient.put(`/wardrobe/${id}`, updates, { timeout: 8000 });
    } catch (err) {
      console.warn('Failed to sync item update to server:', err.message);
    }

    return updated.find((item) => item.id === id);
  },

  deleteItem: async (id) => {
    // 1. Immediate optimistic deletion
    const items = getStoredWardrobe();
    const updated = items.filter((item) => item.id !== id);
    safeSetStoredWardrobe(updated);

    // 2. Sync to server in background
    try {
      await apiClient.delete(`/wardrobe/${id}`, { timeout: 8000 });
    } catch (err) {
      console.warn('Failed to sync item deletion to server:', err.message);
    }

    return { success: true, id };
  },

  // Auto-analyze clothing photo with Gemini AI Vision
  analyzeWardrobeItem: async (fileOrPayload) => {
    try {
      let body;
      let headers = {};

      const isFormData = fileOrPayload instanceof FormData;
      if (isFormData) {
        body = fileOrPayload;
        // Do NOT manually set Content-Type so Axios calculates boundary automatically
      } else if (fileOrPayload instanceof File || fileOrPayload instanceof Blob) {
        body = new FormData();
        body.append('image', fileOrPayload);
      } else if (typeof fileOrPayload === 'string') {
        body = { image: fileOrPayload };
        headers = { 'Content-Type': 'application/json' };
      } else if (fileOrPayload && typeof fileOrPayload === 'object' && fileOrPayload.image) {
        body = fileOrPayload;
        headers = { 'Content-Type': 'application/json' };
      } else {
        body = fileOrPayload;
      }

      const response = await apiClient.post('/wardrobe/analyze', body, {
        headers,
        timeout: 30000,
      });

      return response.data;
    } catch (err) {
      console.warn('AI Vision analysis endpoint call error:', err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'AI Vision analysis failed',
      };
    }
  },
};

// Export standalone function for flexible imports
export const analyzeWardrobeItem = wardrobeApi.analyzeWardrobeItem;



