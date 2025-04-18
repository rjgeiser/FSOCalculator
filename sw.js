// sw.js

// Update the version every time you change a cached file to force a new cache.
const CACHE_VERSION = 'v2';
const CACHE_NAME = `fsocalculator-${CACHE_VERSION}`;

// List all the assets you want to cache.
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/main.js',
    '/img/icon-32.png',
    '/img/icon-64.png',
    '/img/icon-128.png',
    '/img/icon-192.png',
    '/img/icon-256.png',
    '/img/icon-512.png'
];

// Install event: Open the cache and add all assets.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache:', CACHE_NAME);
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.error('Error opening cache:', error);
            })
    );
});

// Activate event: Delete any old caches.
self.addEventListener('activate', (event) => {
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
        })
    );
});

// Fetch event: Try to fetch the request from cache first, falling back to the network.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached file if it exists.
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Clone the request as it is a stream that can only be consumed once.
                const fetchRequest = event.request.clone();

                // Proceed with the network request.
                return fetch(fetchRequest).then((networkResponse) => {
                    // Validate the response.
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Clone the response because it is a stream too.
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return networkResponse;
                });
            })
    );
});
