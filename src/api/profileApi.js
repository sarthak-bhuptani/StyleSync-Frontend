import { apiClient, simulateNetworkDelay } from './client';

export const profileApi = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      const user = response.data?.data || response.data?.user || response.data;
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }
      return user;
    } catch {
      await simulateNetworkDelay(250);
      const saved = localStorage.getItem('stylesync_user');
      return saved ? JSON.parse(saved) : null;
    }
  },

  updateProfile: async (updatedData) => {
    try {
      const response = await apiClient.put('/profile', updatedData);
      const user = response.data?.data || response.data?.user || response.data;
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }
      return user;
    } catch {
      await simulateNetworkDelay(400);
      const current = JSON.parse(localStorage.getItem('stylesync_user')) || {};
      const merged = { ...current, ...updatedData };
      localStorage.setItem('stylesync_user', JSON.stringify(merged));
      return merged;
    }
  },

  completeOnboarding: async (onboardingData) => {
    try {
      const response = await apiClient.post('/profile/onboarding', onboardingData);
      const user = response.data?.user || response.data?.data || response.data;
      if (user) {
        localStorage.setItem('stylesync_user', JSON.stringify(user));
      }
      return user;
    } catch {
      await simulateNetworkDelay(600);
      const current = JSON.parse(localStorage.getItem('stylesync_user')) || {};
      const updated = {
        ...current,
        ...onboardingData,
        profileCompleteness: 95,
        onboardingCompleted: true
      };
      localStorage.setItem('stylesync_user', JSON.stringify(updated));
      return updated;
    }
  },

  scanFaceBody: async (image) => {
    try {
      const response = await apiClient.post('/profile/scan-face-body', { image });
      const data = response.data?.data || response.data;
      if (data?.user) {
        localStorage.setItem('stylesync_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || 'Failed to calibrate physical traits from photo';
      throw new Error(errMsg);
    }
  },

  getColorDraping: async () => {
    try {
      const response = await apiClient.get('/profile/color-draping');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('Failed to fetch color draping from server, using profile traits:', err.message);
      const user = JSON.parse(localStorage.getItem('stylesync_user') || '{}');
      const traits = user.physicalTraits || {};
      return {
        season: traits.colorSeason || 'Deep Autumn',
        undertone: traits.skinUndertone || 'Warm Golden',
        drapingInsight: 'Rich, warm pigments absorb light harmoniously against your undertone. Cool pastels bounce diffuse blue light onto your skin, casting shadows around the jawline.',
        avatar: user.avatar || '',
        faceShape: traits.faceShape || 'Oval',
        swatches: [
          { name: 'Warm Terracotta', hex: '#C85A32', category: 'power', effect: 'Brightens skin, elevates golden warmth' },
          { name: 'Forest Olive', hex: '#3E5C46', category: 'power', effect: 'Complements natural undertone contrast' },
          { name: 'Rich Ochre Gold', hex: '#C2932D', category: 'power', effect: 'Enhances cheekbone illumination' },
          { name: 'Deep Espresso', hex: '#3A271D', category: 'power', effect: 'Frames face with rich grounding contrast' },
          { name: 'Burnt Rust', hex: '#A84825', category: 'power', effect: 'Harmonizes high-contrast warmth' },
          { name: 'Spiced Mustard', hex: '#D4A034', category: 'power', effect: 'Eliminates dullness, adds radiance' },
          { name: 'Deep Teal Marine', hex: '#1C4A54', category: 'power', effect: 'Vibrant complementary contrast' },
          { name: 'Warm Burgundy', hex: '#782635', category: 'power', effect: 'Deep evening elegance without sallow tones' },
          { name: 'Cream Oat Canvas', hex: '#E6D7C3', category: 'neutral', effect: 'Clean neutral foundation without icy glare' },
          { name: 'Charcoal Slate', hex: '#2C3539', category: 'neutral', effect: 'Soft high-end tailoring anchor' },
          { name: 'Raw Sandstone', hex: '#C4AB8E', category: 'neutral', effect: 'Natural transitional layer' },
          { name: 'French Navy', hex: '#1B263B', category: 'neutral', effect: 'Universal modern core' },
          { name: 'Icy Lavender', hex: '#E2D4F0', category: 'caution', effect: 'Creates shadows under jaw, washes out warm tones' },
          { name: 'Pale Frost Blue', hex: '#D4E6F1', category: 'caution', effect: 'Clashes with golden pigment, creates tired look' },
          { name: 'Electric Neon Lime', hex: '#DFFF00', category: 'caution', effect: 'Overpowers facial contrast with optical glare' },
          { name: 'Ash Cool Grey', hex: '#D5D8DC', category: 'caution', effect: 'Flattens natural facial dimension' }
        ]
      };
    }
  }
};
