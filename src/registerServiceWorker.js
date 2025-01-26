/* eslint-disable no-restricted-globals */

// Nazwy cache dla zasobów
const STATIC_CACHE_NAME = 'static-cache-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';

// Lista zasobów do cache'owania podczas instalacji Service Workera
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/js/app.js',
  '/css/app.css',
  '/img/icons/android-chrome-192x192.png',
  '/img/icons/android-chrome-512x512.png',
];

// Funkcja do ograniczenia rozmiaru cache
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, maxItems);
  }
}

// Instalacja Service Workera
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Aktywacja Service Workera
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Usunięcie starych cache'ów
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Obsługa żądań sieciowych
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request)
            .then((networkResponse) => {
              return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                // Cache'owanie dynamicznych zasobów
                cache.put(event.request.url, networkResponse.clone());
                limitCacheSize(DYNAMIC_CACHE_NAME, 50);
                return networkResponse;
              });
            })
            .catch(() => {
              // Fallback dla stron (np. offline.html) lub innych zasobów
              if (event.request.url.endsWith('.html')) {
                return caches.match('/index.html');
              }
            })
        );
      })
    );
  }
});

// Obsługa komunikatów z aplikacji
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
