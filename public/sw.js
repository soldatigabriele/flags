const CACHE_NAME = 'flag-game-v1.0.2';
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker installation complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
        // Don't fail installation if caching fails
        return Promise.resolve();
      })
  );
});

// Fetch event - serve from cache when offline, but be more flexible
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip caching for chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Only cache certain types of requests
          const url = new URL(event.request.url);
          const shouldCache = url.pathname === '/' || 
                             url.pathname.endsWith('.js') ||
                             url.pathname.endsWith('.css') ||
                             url.pathname.endsWith('.png') ||
                             url.pathname.endsWith('.ico') ||
                             url.pathname.endsWith('.json');
          
          if (shouldCache) {
            // Clone the response because it's a stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('Caching:', event.request.url);
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.log('Failed to cache:', event.request.url, error);
              });
          }
          
          return response;
        }).catch((error) => {
          console.log('Fetch failed:', event.request.url, error);
          // If both network and cache fail, return a basic offline page for documents
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
          throw error;
        });
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      // Claim all clients to ensure the new SW takes control immediately
      return self.clients.claim();
    })
  );
}); 