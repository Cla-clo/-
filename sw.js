const CACHE_NAME = 'c-editor-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const fresh = await fetch(event.request);
      if (event.request.method === 'GET' && new URL(event.request.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, fresh.clone());
      }
      return fresh;
    } catch {
      return caches.match('./index.html');
    }
  })());
});
