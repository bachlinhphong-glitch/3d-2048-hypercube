const CACHE_NAME = 'v3.1-2048-hypercube';
const CACHE_URLS = [
  '.',
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
  './libs/three.module.js',
  './libs/gsap.module.js',
  './libs/controls/OrbitControls.js',
  './libs/geometries/RoundedBoxGeometry.js',
  './assets/backgrounds/cat_moon.png',
  './assets/backgrounds/elmo_fire.png',
  './assets/backgrounds/patrick_space.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return response;
      }).catch(() => cached);
    })
  );
});
