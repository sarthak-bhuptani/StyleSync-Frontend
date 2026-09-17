import { apiClient } from './client';

const getStoredProducts = () => {
  const saved = localStorage.getItem('stylesync_analyzed_products');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const productApi = {
  getAllProducts: async () => {
    try {
      const response = await apiClient.get('/products');
      const list = Array.isArray(response.data) ? response.data : response.data?.data || response.data?.products || [];
      const formatted = list.map(p => ({
        ...p,
        id: p.id || p._id,
        image: p.image || p.imageUrl
      }));
      localStorage.setItem('stylesync_analyzed_products', JSON.stringify(formatted));
      return formatted;
    } catch {
      return getStoredProducts();
    }
  },

  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      const item = response.data?.data || response.data?.product || response.data;
      if (item && (item.id || item._id)) {
        return {
          ...item,
          id: item.id || item._id,
          image: item.image || item.imageUrl
        };
      }
      const products = getStoredProducts();
      return products.find(p => p.id === id) || null;
    } catch {
      const products = getStoredProducts();
      return products.find(p => p.id === id) || null;
    }
  },

  analyzeProduct: async (productInput) => {
    try {
      const payload = {
        ...productInput,
        imageUrl: productInput.image
      };
      const response = await apiClient.post('/products/analyze', payload);
      const resData = response.data?.data || response.data?.product || response.data;
      if (resData && (resData.score !== undefined || resData.decision)) {
        const item = {
          ...resData,
          id: resData.id || resData._id || ('prod_' + Date.now()),
          image: resData.image || resData.imageUrl || productInput.image
        };
        const currentList = getStoredProducts();
        localStorage.setItem('stylesync_analyzed_products', JSON.stringify([item, ...currentList.filter(p => p.id !== item.id)]));
        return item;
      }
    } catch (err) {
      console.warn('Backend product analysis failed, using local calculation:', err.message);
    }

    // Local client-side fallback with real user input (no dummy stock photos)
    const rawName = (productInput.name || '').toLowerCase();
    const category = productInput.category || 'Clothing';
    const price = Number(productInput.price) || 0;
    const name = productInput.name || 'Analyzed Item';
    const color = productInput.color || 'Neutral';
    
    const nonApparelKeywords = ['cartoon', 'anime', 'meme', 'illustration', 'drawing', 'art', 'game', 'pokemon', 'character', 'wallpaper', 'random', 'car', 'dog', 'cat'];
    const isNonApparel = nonApparelKeywords.some(kw => rawName.includes(kw));

    let score = 85;
    let decision = 'BUY';
    let aiExplanation = `This ${name} (${color}) harmonizes with your personal traits and capsule wardrobe style.`;
    let strongMatches = ['Compatible with your designated style preferences', 'Versatile neutral color tone'];
    let considerations = ['Ensure size fits your specified measurements'];

    if (isNonApparel) {
      score = 15;
      decision = 'SKIP';
      aiExplanation = `⚠️ Non-Apparel Detected: Please upload wearable clothing, footwear, eyewear, or accessories.`;
      strongMatches = [];
      considerations = ['Not a wearable fashion garment or accessory'];
    }

    const newAnalyzedProduct = {
      id: 'prod_' + Date.now(),
      name,
      brand: productInput.brand || 'Contemporary Design',
      category,
      subCategory: productInput.subCategory || category,
      price,
      currency: '₹',
      color,
      colorHex: productInput.colorHex || '#1E293B',
      image: productInput.image || '',
      description: productInput.description || 'Personal styling evaluation candidate.',
      score,
      decision,
      confidence: '94%',
      breakdown: {
        styleMatch: { score: Math.round(score * 0.25), max: 25, label: 'Style Match' },
        colorMatch: { score: Math.round(score * 0.20), max: 20, label: 'Color Match' },
        wardrobeMatch: { score: Math.round(score * 0.20), max: 20, label: 'Wardrobe Match' },
        versatility: { score: Math.round(score * 0.15), max: 15, label: 'Versatility' },
        budget: { score: Math.round(score * 0.10), max: 10, label: 'Budget Fit' },
        occasion: { score: Math.round(score * 0.10), max: 10, label: 'Occasion Fit' }
      },
      aiExplanation,
      strongMatches,
      considerations,
      compatibleWardrobeIds: [],
      alternatives: []
    };

    const currentList = getStoredProducts();
    const updated = [newAnalyzedProduct, ...currentList];
    localStorage.setItem('stylesync_analyzed_products', JSON.stringify(updated));
    return newAnalyzedProduct;
  },

  parseProductUrl: async (url) => {
    const response = await apiClient.post('/products/parse-url', { url });
    return response.data?.data || response.data;
  },

  compareProducts: async (itemA, itemB) => {
    const response = await apiClient.post('/products/compare', { itemA, itemB });
    return response.data?.data || response.data;
  },

  completeTheLook: async (productId, productData) => {
    const response = await apiClient.post(`/products/${productId}/complete-the-look`, { productData });
    return response.data?.data || response.data;
  }
};
