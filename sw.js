/* Basic offline-first service worker for the book */
const CACHE_NAME = 'w2k-cache-v1';
const OFFLINE_URL = 'assets/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const scope = new URL(self.registration.scope);
    const toCache = [
      '.',
      'index.html',
      'assets/css/style.css',
      'assets/manifest.webmanifest',
      OFFLINE_URL,
    ].map(p => new URL(p, scope).toString());
    try { await cache.addAll(toCache); } catch (_) {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

// Network-first for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests within scope
  if (request.method !== 'GET' || !url.href.startsWith(self.registration.scope)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const network = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, network.clone());
        return network;
      } catch (err) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        return cached || cache.match(OFFLINE_URL);
      }
    })());
    return;
  }

  // Static assets: cache-first
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const network = await fetch(request);
        cache.put(request, network.clone());
        return network;
      } catch (err) {
        return new Response('', { status: 504 });
      }
    })());
  }
});

