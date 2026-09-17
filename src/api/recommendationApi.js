import { apiClient, simulateNetworkDelay } from './client';
import { SAMPLE_PRODUCTS } from '../data/mockData';

export const recommendationApi = {
  getRecentRecommendations: async () => {
    try {
      const response = await apiClient.get('/recommendations/recent');
      return response.data;
    } catch {
      await simulateNetworkDelay(250);
      const saved = localStorage.getItem('stylesync_analyzed_products');
      return saved ? JSON.parse(saved) : SAMPLE_PRODUCTS;
    }
  },

  getWardrobeGaps: async () => {
    try {
      const response = await apiClient.get('/recommendations/gaps');
      return response.data;
    } catch {
      await simulateNetworkDelay(300);
      return [
        {
          id: 'gap_1',
          title: 'Footwear Versatility Gap',
          description: 'You have 4 tailored neutral tops but only 1 pair of versatile minimal smart sneakers.',
          suggestedCategory: 'Shoes',
          priority: 'High',
          suggestedProduct: 'Clean White Minimalist Low-Top Sneakers'
        },
        {
          id: 'gap_2',
          title: 'Mid-layer Knitwear',
          description: 'Your wardrobe is strong on light tees, but could benefit from a merino crewneck or zip polo for transitional weather.',
          suggestedCategory: 'Outerwear',
          priority: 'Medium',
          suggestedProduct: 'Charcoal Merino Wool Zip Polo'
        }
      ];
    }
  },

  compareProducts: async (productIds) => {
    try {
      const response = await apiClient.post('/recommendations/compare', { productIds });
      return response.data;
    } catch {
      await simulateNetworkDelay(400);
      const saved = localStorage.getItem('stylesync_analyzed_products');
      const products = saved ? JSON.parse(saved) : SAMPLE_PRODUCTS;
      const selected = products.filter(p => productIds.includes(p.id));
      
      return {
        products: selected.length > 0 ? selected : products.slice(0, 2),
        buyWisePickId: selected[0]?.score >= (selected[1]?.score || 0) ? selected[0]?.id : selected[1]?.id,
        summary: 'Product 1 offers superior wardrobe compatibility (88% vs 78%) and higher daily versatility at a competitive cost per wear.'
      };
    }
  }
};
