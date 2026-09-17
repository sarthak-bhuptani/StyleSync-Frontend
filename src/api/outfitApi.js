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
  getOutfits: async () => {
    try {
      const response = await apiClient.get('/outfits');
      const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
      localStorage.setItem('stylesync_outfits', JSON.stringify(list));
      return list;
    } catch {
      return getStoredOutfits();
    }
  },

  generateOutfit: async ({ occasion = 'Office', weather = 'Mild', style = 'Smart Casual' }) => {
    try {
      const response = await apiClient.post('/outfits/generate', { occasion, weather, style });
      const outfit = response.data?.data || response.data;
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
