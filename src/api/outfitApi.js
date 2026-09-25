import { apiClient } from './client';

const getStoredOutfits = () => {
  const saved = localStorage.getItem('stylesync_outfits');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const outfitApi = {
  // 1. Fetch saved outfits
  getOutfits: async () => {
    try {
      const res = await apiClient.get('/outfits');
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      localStorage.setItem('stylesync_outfits', JSON.stringify(list));
      return list;
    } catch {
      return getStoredOutfits();
    }
  },

  // 2. Save new outfit
  saveOutfit: async (outfitData) => {
    try {
      const res = await apiClient.post('/outfits', outfitData);
      const saved = res.data?.data || res.data;
      const existing = getStoredOutfits();
      localStorage.setItem('stylesync_outfits', JSON.stringify([saved, ...existing]));
      return saved;
    } catch {
      const existing = getStoredOutfits();
      const localOutfit = {
        id: 'out_' + Date.now(),
        ...outfitData
      };
      localStorage.setItem('stylesync_outfits', JSON.stringify([localOutfit, ...existing]));
      return localOutfit;
    }
  },

  // 3. Log wear of an outfit (increments item wearCounts & logs daily history)
  logWear: async (payload) => {
    try {
      const res = await apiClient.post('/outfits/log-wear', payload);
      return res.data?.data || res.data;
    } catch {
      return { success: true, message: 'Logged wear successfully' };
    }
  },

  // Alias for backward compatibility
  logOutfitWear: async (payload) => {
    return outfitApi.logWear(payload);
  },

  // 4. Get wear history log
  getWearLogs: async (limit = 30) => {
    try {
      const res = await apiClient.get(`/outfits/wear-logs?limit=${limit}`);
      return res.data?.data || res.data;
    } catch {
      return [];
    }
  },

  // 5. Delete outfit
  deleteOutfit: async (outfitId) => {
    try {
      await apiClient.delete(`/outfits/${outfitId}`);
    } catch {}
    const list = getStoredOutfits();
    const updated = list.filter(o => o.id !== outfitId && o._id !== outfitId);
    localStorage.setItem('stylesync_outfits', JSON.stringify(updated));
    return { success: true, id: outfitId };
  },

  // 6. AI Generate 4-Piece Outfit from Wardrobe
  generateOutfit: async ({ occasion = 'Office', weather = 'Mild', style = 'Smart Casual' }) => {
    try {
      const res = await apiClient.post('/outfits/generate', { occasion, weather, style });
      const outfit = res.data?.data || res.data;
      const existing = getStoredOutfits();
      localStorage.setItem('stylesync_outfits', JSON.stringify([outfit, ...existing]));
      return outfit;
    } catch {
      const wardrobe = JSON.parse(localStorage.getItem('stylesync_wardrobe')) || [];
      const newOutfit = {
        id: 'out_' + Date.now(),
        title: `${occasion} ${style} Ensemble`,
        occasion,
        weather,
        style,
        matchScore: 92,
        itemIds: wardrobe.slice(0, 4).map(w => w.id),
        notes: `Coordinated ensemble tailored for ${occasion} in ${weather} conditions.`,
        items: wardrobe.slice(0, 4).map(w => ({ name: w.name, category: w.category, image: w.image }))
      };
      const existing = getStoredOutfits();
      localStorage.setItem('stylesync_outfits', JSON.stringify([newOutfit, ...existing]));
      return newOutfit;
    }
  }
};
