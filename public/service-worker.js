// Service Worker for Fondation Jardin Majorelle - Concours 2026
// Provides offline functionality and asset caching for better mobile performance

const CACHE_NAME = 'fjm-concours-v1';
const RUNTIME_CACHE = 'fjm-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remove old caches
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated successfully');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests - always fetch fresh
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .catch((error) => {
          console.error('[Service Worker] API fetch failed:', error);
          // Return a custom offline response for API failures
          return new Response(
            JSON.stringify({
              success: false,
              message: 'You are offline. Please check your internet connection.'
            }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the response for offline use
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page if available
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // For all other requests - Cache First strategy for assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version and update in background
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
            })
            .catch(() => {
              // Silently fail - we already have cached version
            });
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a success
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cache the fetched resource
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, responseClone));

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            throw error;
          });
      })
  );
});

// Message event - for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls || [];
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(urlsToCache))
        .then(() => {
          console.log('[Service Worker] URLs cached:', urlsToCache);
        })
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(
      // Implement background sync logic here if needed
      console.log('[Service Worker] Background sync triggered')
    );
  }
});

console.log('[Service Worker] Loaded');
