// In service-worker.js
const CACHE_VERSION = 'diced-rpg-v1.0'; // Increment this when you deploy updates
const CURRENT_CACHES = {
  static: CACHE_VERSION + '-static'
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CURRENT_CACHES.static).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/styles/main.css',
        // List all your critical assets here
      ]);
    }).then(() => {
      return self.skipWaiting(); // Force new service worker to activate immediately
    })
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!Object.values(CURRENT_CACHES).includes(cacheName)) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all clients
    })
  );
});