import { apiClient } from './client';

const getStoredWardrobe = () => {
  const saved = localStorage.getItem('stylesync_wardrobe');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const wardrobeApi = {
  getWardrobe: async () => {
    try {
      const response = await apiClient.get('/wardrobe');
      const rawList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.items || [];
      const list = rawList.map(item => ({
        ...item,
        id: item.id || item._id,
        image: item.image || item.imageUrl
      }));
      localStorage.setItem('stylesync_wardrobe', JSON.stringify(list));
      return list;
    } catch {
      return getStoredWardrobe();
    }
  },

  getAllItems: async () => {
    return wardrobeApi.getWardrobe();
  },

  addItem: async (item) => {
    try {
      const payload = {
        ...item,
        imageUrl: item.image,
        wearCount: item.usageCount || 0
      };
      const response = await apiClient.post('/wardrobe', payload);
      const created = response.data?.data || response.data?.item || response.data;
      const formatted = {
        ...created,
        id: created.id || created._id || ('wb_' + Date.now()),
        image: created.image || created.imageUrl || item.image
      };
      const current = getStoredWardrobe();
      localStorage.setItem('stylesync_wardrobe', JSON.stringify([formatted, ...current]));
      return formatted;
    } catch {
      const items = getStoredWardrobe();
      const newItem = {
        id: 'wb_' + Date.now(),
        usageCount: 0,
        currency: '₹',
        dateAdded: new Date().toISOString().split('T')[0],
        ...item
      };
      const updated = [newItem, ...items];
      localStorage.setItem('stylesync_wardrobe', JSON.stringify(updated));
      return newItem;
    }
  },

  updateItem: async (id, updates) => {
    try {
      const response = await apiClient.put(`/wardrobe/${id}`, updates);
      return response.data?.data || response.data;
    } catch {
      const items = getStoredWardrobe();
      const updated = items.map(item => item.id === id ? { ...item, ...updates } : item);
      localStorage.setItem('stylesync_wardrobe', JSON.stringify(updated));
      return updated.find(item => item.id === id);
    }
  },

  deleteItem: async (id) => {
    try {
      await apiClient.delete(`/wardrobe/${id}`);
    } catch {}
    const items = getStoredWardrobe();
    const updated = items.filter(item => item.id !== id);
    localStorage.setItem('stylesync_wardrobe', JSON.stringify(updated));
    return { success: true, id };
  }
};
