import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { Queue } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache the Google Fonts with a stale-while-revalidate strategy
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache images with a cache-first strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache audio files for sound effects
registerRoute(
  ({ url }) => url.pathname.startsWith('/sounds/'),
  new CacheFirst({
    cacheName: 'audio-files',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache API calls with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);

// Background sync for offline data updates
const bgSyncPlugin = new BackgroundSyncPlugin('gameDataSync', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

// Queue for background sync
const queue = new Queue('gameDataQueue', {
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        // Process the queued request when back online
        await fetch(entry.request);
        console.log('Synced:', entry.request.url);
      } catch (error) {
        console.error('Sync failed:', error);
        // Re-queue the request for later
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

// Cache localStorage changes for background sync
registerRoute(
  ({ url }) => url.pathname === '/sync-data',
  async ({ event }) => {
    try {
      return await fetch(event.request);
    } catch (error) {
      // Add to background sync queue if offline
      await queue.pushRequest({ request: event.request });
      return new Response('Queued for sync', { status: 202 });
    }
  }
);

// Navigation route - serve app shell for all navigation requests
const navigationRoute = new NavigationRoute(
  async ({ event }) => {
    const response = await caches.match('/index.html');
    return response || fetch('/index.html');
  }
);
registerRoute(navigationRoute);

// Handle install event
(self as any).addEventListener('install', (event: any) => {
  console.log('Service worker installing...');
  // Skip waiting to activate immediately
  (self as any).skipWaiting();
});

// Handle activate event
(self as any).addEventListener('activate', (event: any) => {
  console.log('Service worker activating...');
  // Take control of all clients immediately
  event.waitUntil((self as any).clients.claim());
});

// Handle background sync
(self as any).addEventListener('sync', (event: any) => {
  if (event.tag === 'gameDataSync') {
    event.waitUntil(
      // Sync localStorage changes when back online
      syncGameData()
    );
  }
});

// Handle push notifications (for future use)
(self as any).addEventListener('push', (event: any) => {
  console.log('Push notification received:', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
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
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      (self as any).registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
(self as any).addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      (self as any).clients.openWindow('/')
    );
  }
});

// Sync game data when back online
async function syncGameData() {
  try {
    // Get stored game data from IndexedDB or localStorage
    const gameData = localStorage.getItem('kickoff-storage');

    if (gameData) {
      // In a real app, this would sync with your backend
      console.log('Syncing game data:', gameData);

      // For now, just log that sync would happen
      // await fetch('/api/sync', {
      //   method: 'POST',
      //   body: gameData,
      //   headers: { 'Content-Type': 'application/json' }
      // });
    }
  } catch (error) {
    console.error('Failed to sync game data:', error);
  }
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  }

  if (event.data && event.data.type === 'SYNC_DATA') {
    // Trigger background sync
    syncGameData();
  }
});

// Offline fallback
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await fetch(event.request);
    } catch (error) {
      // Return cached app shell when offline
      const response = await caches.match('/index.html');
      return response || new Response('Offline', { status: 503 });
    }
  }
);

console.log('Kickoff Service Worker loaded');