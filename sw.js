const CACHE_NAME = 'v6.4.2-2048-hypercube';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './src/main.js',
  './src/style.css',
  './src/board.js',
  './src/tile.js',
  './src/gameLogic.js',
  './src/inputManager.js',
  './src/sceneManager.js',
  './src/sound.js',
  './src/particles.js',
  './src/textureManager.js',
  './src/ghostPreview.js',
  './src/aiBot.js',
  './src/bossManager.js',
  './src/i18n.js',
  './src/trophy.js',
  './src/questManager.js',
  './libs/three.module.js',
  './libs/gsap.module.js',
  './libs/controls/OrbitControls.js',
  './libs/geometries/RoundedBoxGeometry.js',
  './assets/backgrounds/cat_moon.png',
  './assets/backgrounds/elmo_fire.png',
  './assets/backgrounds/patrick_space.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-First caching strategy: Always attempt fresh fetch from network and update cache;
// fallback to cache only when offline or network fails.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          }).catch(() => {});
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return (await caches.match('./index.html')) || (await caches.match('.'));
        }
        return null;
      })
  );
});
