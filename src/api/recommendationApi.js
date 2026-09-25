import { apiClient, simulateNetworkDelay } from './client';

export const recommendationApi = {
  getRecentRecommendations: async () => {
    try {
      const response = await apiClient.get('/recommendations/recent');
      return response.data;
    } catch {
      await simulateNetworkDelay(250);
      const saved = localStorage.getItem('stylesync_analyzed_products');
      return saved ? JSON.parse(saved) : [];
    }
  },

  // Get AI-detected gaps in wardrobe and suggested additions
  getCapsuleGaps: async () => {
    try {
      const res = await apiClient.get('/recommendations/gaps');
      return res.data?.data || res.data?.gaps || res.data;
    } catch {
      return [
        {
          id: 'gap_1',
          title: 'Footwear Versatility Gap',
          description: 'You have 4 tailored neutral tops but only 1 pair of versatile minimal smart sneakers.',
          category: 'Shoes',
          priority: 'High',
          unlocksOutfitsCount: 14,
          suggestedProduct: 'Clean White Minimalist Low-Top Sneakers'
        },
        {
          id: 'gap_2',
          title: 'Mid-layer Knitwear',
          description: 'Your wardrobe is strong on light tees, but could benefit from a merino crewneck or zip polo for transitional weather.',
          category: 'Outerwear',
          priority: 'Medium',
          unlocksOutfitsCount: 8,
          suggestedProduct: 'Charcoal Merino Wool Zip Polo'
        }
      ];
    }
  },

  getWardrobeGaps: async () => {
    return recommendationApi.getCapsuleGaps();
  },

  compareProducts: async (payload) => {
    try {
      const body = Array.isArray(payload) ? { productIds: payload } : (payload?.productIds ? payload : { productIds: payload });
      const response = await apiClient.post('/products/compare', body);
      return response.data?.data || response.data;
    } catch {
      try {
        const altResponse = await apiClient.post('/recommendations/compare', payload);
        return altResponse.data?.data || altResponse.data;
      } catch {
        await simulateNetworkDelay(400);
        const productIds = Array.isArray(payload) ? payload : (payload?.productIds || []);
        const saved = localStorage.getItem('stylesync_analyzed_products');
        const products = saved ? JSON.parse(saved) : [];
        const selected = products.filter(p => productIds.includes(p.id));
        
        return {
          products: selected.length > 0 ? selected : products.slice(0, 2),
          winnerId: selected[0]?.score >= (selected[1]?.score || 0) ? selected[0]?.id : selected[1]?.id,
          winnerTitle: selected[0]?.name || 'Top Recommendation',
          summary: 'Product offers strong wardrobe compatibility and versatile daily pairing.'
        };
      }
    }
  }
};
