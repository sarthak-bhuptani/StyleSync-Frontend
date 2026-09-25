import { notificationApi } from '../api/notificationApi';

export const notificationService = {
  // Check current browser notification permission
  getPermissionStatus: () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission; // 'granted' | 'denied' | 'default'
  },

  // Request browser permission and register push subscription
  requestPushPermission: async () => {
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported by your browser.');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, permission };
    }

    // Try to register with Service Worker Push Manager if available
    let subscription = null;
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.pushManager) {
          subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            // Subscribe with sample applicationServerKey or standard push subscription
            try {
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuNxUhSwUxW0UlxSm84LzsEgW0'
              });
            } catch (subErr) {
              console.warn('Push subscription without VAPID key:', subErr.message);
            }
          }

          if (subscription) {
            await notificationApi.subscribePush(subscription);
          }
        }
      } catch (err) {
        console.warn('Service worker push registration note:', err.message);
      }
    }

    return { success: true, permission: 'granted', subscription };
  },

  // Dual Dispatch: Handles both Foreground (In-App) and Background (OS System) Notifications
  dispatchNotification: async ({ title, message, url = '/dashboard', type = 'info', onForegroundToast }) => {
    const isTabActive = document.visibilityState === 'visible';

    // 1. Foreground Notification: If user is actively viewing the tab, show in-app styled Toast
    if (isTabActive && typeof onForegroundToast === 'function') {
      onForegroundToast(message || title, type);
    }

    // 2. Background Notification: If user has tab minimized/in background or permission granted, show OS notification
    if ('Notification' in window && Notification.permission === 'granted') {
      if (!isTabActive || !onForegroundToast) {
        if ('serviceWorker' in navigator) {
          try {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification(title || 'StyleSync', {
              body: message,
              icon: '/favicon.png',
              badge: '/favicon.png',
              data: { url },
              vibrate: [100, 50, 100]
            });
            return;
          } catch {}
        }

        // Fallback to Window Notification API
        try {
          new Notification(title || 'StyleSync', {
            body: message,
            icon: '/favicon.png',
            data: { url }
          });
        } catch {}
      }
    }
  },

  // Trigger immediate test notification to verify foreground & background delivery
  sendTestNotification: async (showToastCallback) => {
    const perm = notificationService.getPermissionStatus();
    if (perm !== 'granted') {
      const result = await notificationService.requestPushPermission();
      if (!result.success) {
        throw new Error('Please enable browser notification permissions first.');
      }
    }

    // Dispatch dual notification
    await notificationService.dispatchNotification({
      title: 'StyleSync Daily Stylist',
      message: '✨ Your today look is ready! 22°C Mild weather — pair your Camp Collar Shirt with Sandstone Chinos.',
      url: '/daily-stylist',
      type: 'success',
      onForegroundToast: showToastCallback
    });

    // Also persist into backend database list
    await notificationApi.sendTestAlert({
      title: 'StyleSync Daily Stylist',
      message: 'Your today look is ready! 22°C Mild weather — pair your Camp Collar Shirt with Sandstone Chinos.',
      type: 'success'
    });

    return true;
  }
};

export default notificationService;
