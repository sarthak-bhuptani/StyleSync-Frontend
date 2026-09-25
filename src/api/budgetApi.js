import { apiClient, simulateNetworkDelay } from './client';

const DEFAULT_BUDGET = {
  monthlyLimit: 10000,
  spentThisMonth: 0,
  currency: '₹',
  categories: [
    { name: 'Clothing', allocated: 4000, spent: 0, color: '#10B981' },
    { name: 'Shoes', allocated: 3000, spent: 0, color: '#3B82F6' },
    { name: 'Accessories', allocated: 2000, spent: 0, color: '#F59E0B' },
    { name: 'Other', allocated: 1000, spent: 0, color: '#8B5CF6' }
  ]
};

const getStoredBudget = () => {
  const saved = localStorage.getItem('stylesync_budget');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_BUDGET;
    }
  }
  return DEFAULT_BUDGET;
};

export const budgetApi = {
  // 1. Get current month budget stats & breakdown
  getBudget: async (monthYear) => {
    try {
      const url = monthYear ? `/budget?monthYear=${monthYear}` : '/budget';
      const res = await apiClient.get(url);
      return res.data?.data || res.data;
    } catch {
      await simulateNetworkDelay(200);
      return getStoredBudget();
    }
  },

  // 2. Update monthly budget ceiling
  updateMonthlyLimit: async (monthlyLimit) => {
    try {
      const res = await apiClient.patch('/budget/limit', {
        monthlyLimit: Number(monthlyLimit),
        limit: Number(monthlyLimit)
      });
      return res.data?.data || res.data;
    } catch {
      await simulateNetworkDelay(250);
      const budget = getStoredBudget();
      const updated = { ...budget, monthlyLimit: Number(monthlyLimit) };
      localStorage.setItem('stylesync_budget', JSON.stringify(updated));
      return updated;
    }
  },

  // Alias for backward compatibility
  updateLimit: async (newLimit) => {
    return budgetApi.updateMonthlyLimit(newLimit);
  },

  // 3. Record an expense
  addExpense: async ({ name, amount, category, date, purchaseId }) => {
    try {
      const res = await apiClient.post('/budget/expense', {
        name: name || `${category} purchase`,
        amount: Number(amount) || 0,
        category: category || 'Clothing',
        date: date || new Date().toISOString().split('T')[0],
        purchaseId
      });
      return res.data?.data || res.data;
    } catch {
      await simulateNetworkDelay(250);
      const budget = getStoredBudget();
      const numAmount = Number(amount) || 0;
      const updatedCategories = (budget.categories || []).map(c => {
        if (c.name.toLowerCase().includes((category || '').toLowerCase())) {
          return { ...c, spent: c.spent + numAmount };
        }
        return c;
      });
      const updated = {
        ...budget,
        spentThisMonth: (budget.spentThisMonth || 0) + numAmount,
        categories: updatedCategories
      };
      localStorage.setItem('stylesync_budget', JSON.stringify(updated));
      return updated;
    }
  }
};
