import { apiClient, simulateNetworkDelay } from './client';

const STORAGE_KEY = 'stylesync_collections';

export const collectionApi = {
  // GET /api/v1/collections
  getCollections: async () => {
    try {
      const response = await apiClient.get('/collections');
      const collections = response.data?.data || response.data?.collections || response.data || [];
      if (Array.isArray(collections) && collections.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
      }
      return collections;
    } catch (err) {
      console.warn('Failed to fetch collections from server, falling back to cache:', err.message);
      await simulateNetworkDelay(200);
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  },

  // POST /api/v1/collections
  createCollection: async (collectionData) => {
    try {
      const response = await apiClient.post('/collections', collectionData);
      const created = response.data?.data || response.data?.collection || response.data;
      
      // Update local storage cache
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [created, ...cached.filter((c) => (c.id || c._id) !== (created.id || created._id))];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return created;
    } catch (err) {
      console.warn('Failed to create collection on server, saving locally:', err.message);
      await simulateNetworkDelay(300);
      const newCol = {
        ...collectionData,
        id: 'col_' + Date.now(),
        itemIds: collectionData.itemIds || [],
        outfitIds: collectionData.outfitIds || [],
        looks: collectionData.looks || [],
        createdAt: new Date().toISOString()
      };
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = [newCol, ...cached];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newCol;
    }
  },

  // GET /api/v1/collections/{id}
  getCollectionById: async (id) => {
    try {
      const response = await apiClient.get(`/collections/${id}`);
      return response.data?.data || response.data?.collection || response.data;
    } catch (err) {
      console.warn(`Failed to fetch collection ${id} from server:`, err.message);
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const found = cached.find((c) => (c.id || c._id) === id);
      if (found) return found;
      throw err;
    }
  },

  // PUT /api/v1/collections/{id}
  updateCollection: async (id, updatedData) => {
    try {
      const response = await apiClient.put(`/collections/${id}`, updatedData);
      const updated = response.data?.data || response.data?.collection || response.data;

      // Update cache
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const mapped = cached.map((c) => ((c.id || c._id) === id ? { ...c, ...updated } : c));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));

      return updated;
    } catch (err) {
      console.warn(`Failed to update collection ${id} on server, saving locally:`, err.message);
      await simulateNetworkDelay(300);
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const mapped = cached.map((c) => ((c.id || c._id) === id ? { ...c, ...updatedData } : c));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      return { id, ...updatedData };
    }
  },

  // DELETE /api/v1/collections/{id}
  deleteCollection: async (id) => {
    try {
      const response = await apiClient.delete(`/collections/${id}`);
      // Remove from cache
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filtered = cached.filter((c) => (c.id || c._id) !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return response.data;
    } catch (err) {
      console.warn(`Failed to delete collection ${id} on server, removing locally:`, err.message);
      await simulateNetworkDelay(200);
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filtered = cached.filter((c) => (c.id || c._id) !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return { success: true, message: 'Collection deleted locally' };
    }
  },

  // POST /api/v1/collections/{id}/items
  addItemsToCollection: async (id, payload) => {
    // payload: { itemIds: [...], outfitIds: [...] }
    try {
      const response = await apiClient.post(`/collections/${id}/items`, payload);
      const updated = response.data?.data || response.data?.collection || response.data;

      // Update cache
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const mapped = cached.map((c) => ((c.id || c._id) === id ? { ...c, ...updated } : c));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));

      return updated;
    } catch (err) {
      console.warn(`Failed to add items to collection ${id} on server:`, err.message);
      await simulateNetworkDelay(250);
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const mapped = cached.map((c) => {
        if ((c.id || c._id) === id) {
          const newItemIds = Array.from(new Set([...(c.itemIds || []), ...(payload.itemIds || [])]));
          const newOutfitIds = Array.from(new Set([...(c.outfitIds || []), ...(payload.outfitIds || [])]));
          return { ...c, itemIds: newItemIds, outfitIds: newOutfitIds };
        }
        return c;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      return mapped.find((c) => (c.id || c._id) === id);
    }
  }
};

export default collectionApi;
