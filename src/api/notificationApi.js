import { apiClient, simulateNetworkDelay } from './client';

const getStoredNotifications = () => {
  const saved = localStorage.getItem('stylesync_notifications');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [
    {
      id: 'notif_1',
      title: 'High Match Alert',
      message: 'The White Leather Low-Tops you analyzed scored 88/100.',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'notif_2',
      title: 'Budget Tip',
      message: 'You have ₹3,550 left in your monthly fashion budget.',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'notif_3',
      title: 'Wardrobe Gap Detected',
      message: 'A classic mid-layer zip polo would unlock 8 new outfits with your current closet.',
      type: 'recommendation',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};

export const notificationApi = {
  // 1. Get VAPID Public Key for Web Push service worker
  getVapidKey: async () => {
    try {
      const res = await apiClient.get('/notifications/vapid-key');
      return res.data?.data?.vapidPublicKey || res.data?.publicKey || res.data?.data?.publicKey || res.data;
    } catch {
      return 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuNxUhSwUxW0UlxSm84LzsEgW0';
    }
  },

  // 2. Register Web Push Subscription
  subscribeToPush: async (subscription) => {
    try {
      const payload = subscription?.toJSON ? subscription.toJSON() : subscription;
      const res = await apiClient.post('/notifications/subscribe', {
        endpoint: payload.endpoint,
        keys: payload.keys
      });
      return res.data?.data || res.data;
    } catch {
      localStorage.setItem('stylesync_push_sub', JSON.stringify(subscription));
      return { success: true, localOnly: true };
    }
  },

  // Alias for backward compatibility
  subscribePush: async (subscription) => {
    return notificationApi.subscribeToPush(subscription);
  },

  // 3. Fetch In-App Notifications Feed
  getNotifications: async (unreadOnly = false) => {
    const token = localStorage.getItem('stylesync_token') || localStorage.getItem('buywise_token');
    if (!token) {
      return getStoredNotifications();
    }

    try {
      const url = typeof unreadOnly === 'boolean'
        ? `/notifications?unreadOnly=${unreadOnly}`
        : '/notifications';
      const res = await apiClient.get(url);
      const list = res.data?.data || res.data?.notifications || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(list)) {
        localStorage.setItem('stylesync_notifications', JSON.stringify(list));
        return list;
      }
      return getStoredNotifications();
    } catch {
      return getStoredNotifications();
    }
  },

  // Fetch notification preferences
  getPreferences: async () => {
    try {
      const res = await apiClient.get('/notifications/preferences');
      return res.data?.data || res.data;
    } catch {
      try {
        const profileRes = await apiClient.get('/profile');
        const user = profileRes.data?.data || profileRes.data;
        return user?.preferences?.notifications || {
          priceDrops: true,
          gapAlerts: true,
          budgetReminders: true,
          weeklyReport: false,
          outfitSuggestions: true,
          weatherAutoSync: true
        };
      } catch {
        return {
          priceDrops: true,
          gapAlerts: true,
          budgetReminders: true,
          weeklyReport: false,
          outfitSuggestions: true,
          weatherAutoSync: true
        };
      }
    }
  },

  // Update notification preferences in DB
  updatePreferences: async (preferences) => {
    try {
      const res = await apiClient.put('/profile', {
        preferences: { notifications: preferences }
      });
      return res.data?.data || res.data;
    } catch {
      localStorage.setItem('stylesync_notif_prefs', JSON.stringify(preferences));
      return preferences;
    }
  },

  // 4. Mark single notification as read
  markAsRead: async (notificationId) => {
    const current = getStoredNotifications();
    const updated = current.map(n => n.id === notificationId || n._id === notificationId ? { ...n, read: true, isRead: true } : n);
    localStorage.setItem('stylesync_notifications', JSON.stringify(updated));

    // Only ping backend for remote database IDs (not local sample IDs)
    if (notificationId && !String(notificationId).startsWith('notif_')) {
      try {
        await apiClient.patch(`/notifications/${notificationId}/read`);
      } catch {}
    }
    return updated;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const current = getStoredNotifications();
    const updated = current.map(n => ({ ...n, read: true, isRead: true }));
    localStorage.setItem('stylesync_notifications', JSON.stringify(updated));

    try {
      await apiClient.patch('/notifications/read-all');
    } catch {}
    return updated;
  },

  // 5. Delete notification
  deleteNotification: async (notificationId) => {
    const current = getStoredNotifications();
    const updated = current.filter(n => n.id !== notificationId && n._id !== notificationId);
    localStorage.setItem('stylesync_notifications', JSON.stringify(updated));

    // Only ping backend for remote database IDs (not local sample IDs)
    if (notificationId && !String(notificationId).startsWith('notif_')) {
      try {
        await apiClient.delete(`/notifications/${notificationId}`);
      } catch {}
    }
    return updated;
  },

  // 6. Trigger a Test Push
  sendTestPush: async () => {
    try {
      const res = await apiClient.post('/notifications/test-send', {
        title: 'StyleSync Daily Stylist',
        body: 'Today looks chilly! Check your weather-ready outfit recommendation.',
        type: 'DAILY_OUTFIT',
        url: '/daily-stylist'
      });
      return res.data?.data || res.data;
    } catch {}
    const newAlert = {
      id: 'notif_' + Date.now(),
      title: 'StyleSync Daily Stylist',
      message: 'Today looks chilly! Check your weather-ready outfit recommendation.',
      type: 'DAILY_OUTFIT',
      read: false,
      createdAt: new Date().toISOString()
    };
    const current = getStoredNotifications();
    const updated = [newAlert, ...current];
    localStorage.setItem('stylesync_notifications', JSON.stringify(updated));
    return newAlert;
  },

  // Alias for backward compatibility
  sendTestAlert: async (payload) => {
    return notificationApi.sendTestPush();
  },

  // Unsubscribe push
  unsubscribePush: async (endpoint) => {
    try {
      await apiClient.post('/notifications/unsubscribe', { endpoint });
    } catch {}
    localStorage.removeItem('stylesync_push_sub');
    return { success: true };
  }
};

