const CACHE_NAME = 'stylesync-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/favicon.svg',
  '/logo.png',
  '/manifest.webmanifest'
];

// Install & Cache Core Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA Pre-cache skipped asset:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate & Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Network-First for Navigation (HTML) & Stale-While-Revalidate for Static Assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API or backend routes completely
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/chat') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/wardrobe/analyze') ||
    url.hostname.includes('backend') ||
    url.hostname.includes('localhost') && url.port === '5000'
  ) {
    return;
  }

  // 1. Navigation Requests (Page reloads, PWA launches) -> Network-First with Cache Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback to cached page or cached index.html if offline / network fails
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;
          return caches.match('/');
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, Fonts, Images) -> Cache-First with Background Update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notification Listener
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { body: event.data.text() };
  }

  const options = {
    body: data.body || data.message || 'You have a new StyleSync update!',
    icon: data.icon || '/favicon.png',
    badge: '/favicon.png',
    data: {
      url: data.actionUrl || data.url || '/dashboard'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'StyleSync', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
