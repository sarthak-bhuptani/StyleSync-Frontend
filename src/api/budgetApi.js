import { apiClient, simulateNetworkDelay } from './client';
import { INITIAL_BUDGET } from '../data/mockData';

const getStoredBudget = () => {
  const saved = localStorage.getItem('stylesync_budget');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_BUDGET;
    }
  }
  localStorage.setItem('stylesync_budget', JSON.stringify(INITIAL_BUDGET));
  return INITIAL_BUDGET;
};

export const budgetApi = {
  getBudget: async () => {
    try {
      const response = await apiClient.get('/budget');
      return response.data;
    } catch {
      await simulateNetworkDelay(250);
      return getStoredBudget();
    }
  },

  updateLimit: async (newLimit) => {
    try {
      const response = await apiClient.patch('/budget/limit', { limit: newLimit });
      return response.data;
    } catch {
      await simulateNetworkDelay(300);
      const budget = getStoredBudget();
      const updated = { ...budget, monthlyLimit: Number(newLimit) };
      localStorage.setItem('stylesync_budget', JSON.stringify(updated));
      return updated;
    }
  },

  addExpense: async ({ category, amount }) => {
    try {
      const response = await apiClient.post('/budget/expense', { category, amount });
      return response.data;
    } catch {
      await simulateNetworkDelay(300);
      const budget = getStoredBudget();
      const numAmount = Number(amount) || 0;
      const updatedCategories = budget.categories.map(c => {
        if (c.name.toLowerCase().includes(category.toLowerCase())) {
          return { ...c, spent: c.spent + numAmount };
        }
        return c;
      });
      const updated = {
        ...budget,
        spentThisMonth: budget.spentThisMonth + numAmount,
        categories: updatedCategories
      };
      localStorage.setItem('stylesync_budget', JSON.stringify(updated));
      return updated;
    }
  }
};
