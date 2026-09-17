import { apiClient, simulateNetworkDelay } from './client';

export const chatApi = {
  sendMessage: async (message, history = []) => {
    try {
      const response = await apiClient.post('/chat/message', { message, history });
      return response.data?.reply || response.data?.data?.reply || response.data;
    } catch {
      await simulateNetworkDelay(700);
      return null; // Signals component to use local intelligent stylist response
    }
  }
};
