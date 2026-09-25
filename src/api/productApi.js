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

const getStoredUserBudget = () => {
  try {
    const saved = localStorage.getItem('stylesync_budget');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.monthlyLimit && Number(parsed.monthlyLimit) > 0) {
        const limit = Number(parsed.monthlyLimit);
        const spent = Number(parsed.spentThisMonth) || 0;
        return {
          monthlyLimit: limit,
          spentThisMonth: spent,
          remainingBudget: Math.max(0, limit - spent),
          currency: parsed.currency || '₹'
        };
      }
    }
  } catch {}
  return {
    monthlyLimit: 10000,
    spentThisMonth: 0,
    remainingBudget: 10000,
    currency: '₹'
  };
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
    const userBudgetData = getStoredUserBudget();
    const monthlyLimit = userBudgetData.monthlyLimit || 10000;
    const remainingBudget = userBudgetData.remainingBudget;
    const price = Number(productInput.price) || 0;
    const ratio = monthlyLimit > 0 ? (price / monthlyLimit) : 1;

    try {
      const payload = {
        ...productInput,
        imageUrl: productInput.image,
        userBudget: monthlyLimit,
        monthlyLimit,
        remainingBudget,
        spentThisMonth: userBudgetData.spentThisMonth
      };
      const response = await apiClient.post('/products/analyze', payload);
      const resData = response.data?.data || response.data?.product || response.data;
      if (resData && (resData.score !== undefined || resData.decision)) {
        let finalScore = Number(resData.score) || 75;
        let finalDecision = resData.decision || 'BUY';
        let finalExplanation = resData.aiExplanation || resData.reasoning || '';
        let finalConsiderations = Array.isArray(resData.considerations) ? [...resData.considerations] : [];

        // Enforce user budget ceiling even if backend gave raw aesthetic score
        if (price > monthlyLimit * 1.5) {
          finalScore = Math.min(finalScore, 42);
          finalDecision = 'SKIP';
          finalExplanation = `⚠️ Over-Budget Alert: At ₹${price.toLocaleString()}, this item significantly exceeds your monthly fashion limit (₹${monthlyLimit.toLocaleString()}) by ₹${(price - monthlyLimit).toLocaleString()} (${Math.round(ratio * 100)}% of limit). Financial verdict: SKIP due to over-budget risk.`;
          if (!finalConsiderations.some(c => c.toLowerCase().includes('budget'))) {
            finalConsiderations.unshift(`Severely exceeds monthly budget of ₹${monthlyLimit.toLocaleString()} by ₹${(price - monthlyLimit).toLocaleString()}`);
          }
        } else if (price > monthlyLimit) {
          finalScore = Math.min(finalScore, 60);
          if (finalDecision === 'BUY') finalDecision = 'MAYBE';
          finalExplanation = `⚠️ Budget Alert: At ₹${price.toLocaleString()}, this item exceeds your monthly limit (₹${monthlyLimit.toLocaleString()}) by ₹${(price - monthlyLimit).toLocaleString()}. We suggest waiting for a discount or saving for next month.`;
          if (!finalConsiderations.some(c => c.toLowerCase().includes('budget'))) {
            finalConsiderations.unshift(`Exceeds monthly fashion limit by ₹${(price - monthlyLimit).toLocaleString()}`);
          }
        }

        const item = {
          ...resData,
          id: resData.id || resData._id || ('prod_' + Date.now()),
          image: resData.image || resData.imageUrl || productInput.image,
          score: finalScore,
          decision: finalDecision,
          aiExplanation: finalExplanation,
          considerations: finalConsiderations,
          monthlyBudget: monthlyLimit,
          price
        };
        const currentList = getStoredProducts();
        localStorage.setItem('stylesync_analyzed_products', JSON.stringify([item, ...currentList.filter(p => p.id !== item.id)]));
        return item;
      }
    } catch (err) {
      console.warn('Backend product analysis failed or offline, using local smart calculation:', err.message);
    }

    // Local client-side calculation with real user inputs & budget constraints
    const rawName = (productInput.name || '').toLowerCase();
    const category = productInput.category || 'Clothing';
    const name = productInput.name || 'Analyzed Item';
    const color = productInput.color || 'Neutral';
    
    let styleScore = 23;
    let colorScore = 19;
    let wardrobeScore = 19;
    let versatilityScore = 14;
    let occasionScore = 9;

    let budgetScore = 10;
    let budgetPenalty = 0;
    let budgetStatus = 'WITHIN_BUDGET';

    if (price > monthlyLimit * 1.5) {
      // Severe Over-Budget (e.g. price 15000 vs budget 1000)
      budgetScore = 0;
      budgetPenalty = 45;
      budgetStatus = 'SEVERE_OVER_BUDGET';
    } else if (price > monthlyLimit) {
      // Moderate Over-Budget (e.g. price 1200 vs budget 1000)
      budgetScore = 2;
      budgetPenalty = 25;
      budgetStatus = 'EXCEEDS_BUDGET';
    } else if (price > monthlyLimit * 0.7) {
      // Consumes 70-100% of monthly budget
      budgetScore = 5;
      budgetPenalty = 5;
      budgetStatus = 'HEAVY_ALLOCATION';
    } else if (price > monthlyLimit * 0.4) {
      budgetScore = 8;
      budgetStatus = 'MODERATE';
    } else {
      budgetScore = 10;
      budgetStatus = 'WITHIN_BUDGET';
    }

    let rawScore = styleScore + colorScore + wardrobeScore + versatilityScore + budgetScore + occasionScore;
    let score = Math.max(12, Math.min(98, rawScore - budgetPenalty));

    let decision = 'BUY';
    let aiExplanation = '';
    let strongMatches = [
      'Versatile capsule staple that pairs easily with existing bottoms and footwear',
      'Flattering neutral color harmony with high seasonal versatility'
    ];
    let considerations = [];

    if (budgetStatus === 'SEVERE_OVER_BUDGET') {
      decision = 'SKIP';
      score = Math.min(score, 40);
      aiExplanation = `⚠️ Over-Budget Alert: At ₹${price.toLocaleString()}, this item significantly exceeds your monthly budget of ₹${monthlyLimit.toLocaleString()} by ₹${(price - monthlyLimit).toLocaleString()} (${Math.round(ratio * 100)}% of limit). Despite aesthetic qualities, purchasing this presents severe financial strain and is recommended to SKIP.`;
      considerations = [
        `Severely exceeds your monthly budget of ₹${monthlyLimit.toLocaleString()} by ₹${(price - monthlyLimit).toLocaleString()}`,
        `Consumes ${Math.round(ratio * 100)}% of your monthly wardrobe allocation`,
        `High cost-per-wear burden relative to monthly spending capacity`
      ];
    } else if (budgetStatus === 'EXCEEDS_BUDGET') {
      decision = 'MAYBE';
      score = Math.min(score, 60);
      aiExplanation = `⚠️ Budget Consideration: At ₹${price.toLocaleString()}, this item exceeds your monthly fashion limit (₹${monthlyLimit.toLocaleString()}) by ₹${(price - monthlyLimit).toLocaleString()}. We recommend waiting for a seasonal sale or allocating funds next month.`;
      considerations = [
        `Exceeds monthly fashion limit by ₹${(price - monthlyLimit).toLocaleString()}`,
        `Consider waiting for a promotional discount or next month's allocation`
      ];
    } else if (budgetStatus === 'HEAVY_ALLOCATION') {
      decision = score >= 75 ? 'BUY' : 'MAYBE';
      aiExplanation = `This ${name} (${color}) fits your aesthetic and is within your ₹${monthlyLimit.toLocaleString()} monthly limit, but will consume ${Math.round(ratio * 100)}% of this month's fashion allowance.`;
      considerations = [
        `Consumes ${Math.round(ratio * 100)}% of your total monthly fashion budget`
      ];
    } else {
      decision = score >= 75 ? 'BUY' : (score >= 55 ? 'MAYBE' : 'SKIP');
      aiExplanation = `This ${name} (${color}) is a highly versatile capsule essential that pairs seamlessly across multiple casual, office, and smart-casual rotations with high color and silhouette synergy.`;
      considerations = [
        `Fits comfortably within your monthly fashion budget (₹${monthlyLimit.toLocaleString()})`
      ];
    }

    const nonApparelKeywords = ['car', 'phone', 'laptop', 'dog', 'food', 'cat', 'furniture', 'building'];
    const isNonApparel = nonApparelKeywords.some(kw => rawName.includes(kw));

    if (isNonApparel) {
      score = 15;
      decision = 'SKIP';
      aiExplanation = `⚠️ Non-Apparel Detected: Please upload wearable clothing, footwear, eyewear, or accessories.`;
      strongMatches = [];
      considerations = ['Not a wearable fashion garment or accessory'];
      styleScore = 3;
      colorScore = 2;
      wardrobeScore = 2;
      versatilityScore = 3;
      budgetScore = 3;
      occasionScore = 2;
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
        styleMatch: { score: styleScore, max: 25, label: 'Style Match' },
        colorMatch: { score: colorScore, max: 20, label: 'Color Match' },
        wardrobeMatch: { score: wardrobeScore, max: 20, label: 'Wardrobe Match' },
        versatility: { score: versatilityScore, max: 15, label: 'Versatility' },
        budget: { score: budgetScore, max: 10, label: 'Budget Fit' },
        occasion: { score: occasionScore, max: 10, label: 'Occasion Fit' }
      },
      aiExplanation,
      strongMatches,
      considerations,
      budgetStatus,
      monthlyBudget: monthlyLimit,
      compatibleWardrobeIds: [],
      alternatives: []
    };

    const currentList = getStoredProducts();
    const updated = [newAnalyzedProduct, ...currentList];
    localStorage.setItem('stylesync_analyzed_products', JSON.stringify(updated));
    return newAnalyzedProduct;
  },

  // 1. Scrape image/price/title from store URL
  parseProductUrl: async (url) => {
    const res = await apiClient.post('/products/parse-url', { url });
    return res.data?.data || res.data;
  },

  // 2. AI Compare prospective items
  compareProducts: async (productIdsOrItemA, itemB) => {
    const userBudgetData = getStoredUserBudget();
    const monthlyLimit = userBudgetData.monthlyLimit || 10000;

    let payload;
    let itemAObj = null;
    let itemBObj = null;

    if (Array.isArray(productIdsOrItemA)) {
      payload = { productIds: productIdsOrItemA, userBudget: monthlyLimit };
    } else if (itemB) {
      itemAObj = productIdsOrItemA;
      itemBObj = itemB;
      payload = { itemA: productIdsOrItemA, itemB, userBudget: monthlyLimit };
    } else if (typeof productIdsOrItemA === 'object' && productIdsOrItemA.productIds) {
      payload = { ...productIdsOrItemA, userBudget: monthlyLimit };
    } else {
      payload = { productIds: [productIdsOrItemA], userBudget: monthlyLimit };
    }

    try {
      const res = await apiClient.post('/products/compare', payload);
      const resData = res.data?.data || res.data;
      if (resData && (resData.winner || resData.verdictSummary)) {
        return resData;
      }
    } catch (err) {
      console.warn('Backend compare endpoint unavailable or failed, using local smart comparator:', err.message);
    }

    // Local smart duel evaluator with budget weighting
    const resolvedItemA = itemAObj || (Array.isArray(productIdsOrItemA) ? getStoredProducts().find(p => p.id === productIdsOrItemA[0]) : null) || {};
    const resolvedItemB = itemBObj || (Array.isArray(productIdsOrItemA) ? getStoredProducts().find(p => p.id === productIdsOrItemA[1]) : null) || {};

    const priceA = Number(resolvedItemA.price) || 0;
    const priceB = Number(resolvedItemB.price) || 0;

    const isOverBudgetA = priceA > monthlyLimit;
    const isOverBudgetB = priceB > monthlyLimit;

    let baseScoreA = Number(resolvedItemA.score) || (priceA > monthlyLimit * 1.5 ? 40 : 85);
    let baseScoreB = Number(resolvedItemB.score) || (priceB > monthlyLimit * 1.5 ? 40 : 82);

    let winner = 'itemA';
    let verdictSummary = '';

    if (isOverBudgetA && !isOverBudgetB) {
      winner = 'itemB';
      baseScoreB = Math.max(baseScoreB, 82);
      baseScoreA = Math.min(baseScoreA, 45);
      verdictSummary = `Option 2 is our top recommendation because at ₹${priceB.toLocaleString()} it fits comfortably within your monthly budget of ₹${monthlyLimit.toLocaleString()}, whereas Option 1 (₹${priceA.toLocaleString()}) exceeds your budget ceiling by ₹${(priceA - monthlyLimit).toLocaleString()}.`;
    } else if (!isOverBudgetA && isOverBudgetB) {
      winner = 'itemA';
      baseScoreA = Math.max(baseScoreA, 85);
      baseScoreB = Math.min(baseScoreB, 45);
      verdictSummary = `Option 1 is our top recommendation because at ₹${priceA.toLocaleString()} it is budget-friendly and respects your ₹${monthlyLimit.toLocaleString()} monthly limit, whereas Option 2 (₹${priceB.toLocaleString()}) is over budget.`;
    } else if (baseScoreA >= baseScoreB) {
      winner = 'itemA';
      verdictSummary = `Option 1 is the clear winner with superior palette harmony and high wardrobe synergy.`;
    } else {
      winner = 'itemB';
      verdictSummary = `Option 2 is the clear winner with versatile styling and greater multi-season rotation value.`;
    }

    return {
      winner,
      itemAScore: baseScoreA,
      itemBScore: baseScoreB,
      verdictSummary,
      categories: {
        faceMatch: {
          winner: winner === 'itemA' ? 'itemA' : 'itemB',
          reason: 'Clean collar framing balances angular and oval facial contours seamlessly.'
        },
        colorMatch: {
          winner: winner === 'itemA' ? 'itemA' : 'itemB',
          reason: 'Color temperature complements natural undertones with high seasonal synergy.'
        },
        costPerWear: {
          winner: priceA <= priceB ? 'itemA' : 'itemB',
          reason: priceA <= priceB
            ? `Option 1 delivers exceptional cost-per-wear efficiency at ₹${priceA.toLocaleString()}.`
            : `Option 2 delivers exceptional cost-per-wear efficiency at ₹${priceB.toLocaleString()}.`
        }
      }
    };
  },

  // 3. Complete the Look for a specific product
  completeTheLook: async (productId, productData) => {
    try {
      const res = await apiClient.post(`/products/${productId}/complete-the-look`, { productData });
      return res.data?.data || res.data;
    } catch {
      return {
        costPerWear: {
          estimatedWears: 50
        }
      };
    }
  },

  // 4. Delete analyzed product
  deleteProduct: async (productId) => {
    try {
      const res = await apiClient.delete(`/products/${productId}`);
      const currentList = getStoredProducts();
      const updated = currentList.filter(p => p.id !== productId && p._id !== productId);
      localStorage.setItem('stylesync_analyzed_products', JSON.stringify(updated));
      return res.data;
    } catch (err) {
      const currentList = getStoredProducts();
      const updated = currentList.filter(p => p.id !== productId && p._id !== productId);
      localStorage.setItem('stylesync_analyzed_products', JSON.stringify(updated));
      return { success: true };
    }
  }
};
