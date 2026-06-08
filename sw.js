/* English Coach — service worker.
   Cache-first app shell so the app opens instantly and works offline once
   it has been loaded with a connection at least once. Bump CACHE on release. */
const CACHE = 'english-coach-v1';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.jsx',
  './content.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://unpkg.com/react@18.3.1/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // addAll fails the whole install if any single request errors; add
      // individually and ignore failures (e.g. a CDN hiccup) so install
      // still succeeds and the app shell is cached.
      Promise.all(ASSETS.map((url) => c.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // refresh in the background
        fetch(request).then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()));
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then((res) => {
        if (res && res.ok && (request.url.startsWith(self.location.origin) || /unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(request.url))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
