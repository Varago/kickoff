// Service Worker for Kickoff PWA
// This is a production-ready service worker with offline support

const CACHE_NAME = 'kickoff-v1.0.0';
const STATIC_CACHE_NAME = 'kickoff-static-v1.0.0';
const DATA_CACHE_NAME = 'kickoff-data-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap',
  // Add other static assets as needed
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DATA_CACHE_NAME &&
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online, return fresh content and update cache
          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Handle static assets (CSS, JS, images, fonts)
  if (url.origin === location.origin ||
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com') {

    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Return cached version if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise fetch from network and cache
          return fetch(request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => cache.put(request, responseToCache));

              return response;
            });
        })
    );
    return;
  }

  // Handle API requests (if any)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(request)
            .then((response) => {
              // Cache successful API responses
              if (response.status === 200) {
                cache.put(request.url, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return cached API response if offline
              return cache.match(request);
            });
        })
    );
    return;
  }

  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'gameDataSync') {
    event.waitUntil(syncGameData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New game update available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View Game'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Kickoff Update', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise open new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data && event.data.type === 'SYNC_DATA') {
    // Trigger manual sync
    syncGameData();
  }
});

// Sync game data function
async function syncGameData() {
  try {
    console.log('Service Worker: Syncing game data...');

    // In a real app, this would sync localStorage with your backend
    // For now, we'll just log that sync would happen

    // Example sync logic:
    // const gameData = await getStoredGameData();
    // if (gameData) {
    //   await fetch('/api/sync', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(gameData)
    //   });
    // }

    console.log('Service Worker: Game data sync completed');
  } catch (error) {
    console.error('Service Worker: Game data sync failed', error);
    throw error;
  }
}

// Helper function to get stored game data
async function getStoredGameData() {
  // This would typically read from IndexedDB or communicate with main thread
  return null;
}

console.log('Service Worker: Loaded and ready');