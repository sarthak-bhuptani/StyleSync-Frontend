import { apiClient } from './client';

const getStoredPurchases = () => {
  const saved = localStorage.getItem('stylesync_purchases');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const purchaseApi = {
  getPurchases: async () => {
    try {
      const response = await apiClient.get('/purchases');
      const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
      localStorage.setItem('stylesync_purchases', JSON.stringify(list));
      return list;
    } catch {
      return getStoredPurchases();
    }
  },

  addPurchase: async (purchase) => {
    try {
      const response = await apiClient.post('/purchases', purchase);
      const created = response.data?.data || response.data;
      const list = getStoredPurchases();
      localStorage.setItem('stylesync_purchases', JSON.stringify([created, ...list]));
      return created;
    } catch {
      const list = getStoredPurchases();
      const newPurchase = {
        id: 'pur_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        currency: '₹',
        userFeedback: null,
        userRating: 5,
        ...purchase
      };
      const updated = [newPurchase, ...list];
      localStorage.setItem('stylesync_purchases', JSON.stringify(updated));
      return newPurchase;
    }
  },

  updateFeedback: async (id, { feedback, rating }) => {
    try {
      const response = await apiClient.patch(`/purchases/${id}/feedback`, { feedback, rating });
      return response.data?.data || response.data;
    } catch {
      const list = getStoredPurchases();
      const updated = list.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...(feedback !== undefined && { userFeedback: feedback }),
            ...(rating !== undefined && { userRating: rating })
          };
        }
        return item;
      });
      localStorage.setItem('stylesync_purchases', JSON.stringify(updated));
      return updated.find(i => i.id === id);
    }
  }
};
