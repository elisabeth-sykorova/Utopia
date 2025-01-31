const cacheName = 'PWA_lab';
const filesToCache = [
  '.',
  'main.js',
  'index.html',
  'assets/css/style.css',
  './Elisabeth_Sykorova_C00301316-UI-Programming-Module-Project',
  './Elisabeth_Sykorova_C00301316-UI-Programming-Module-Project/main.js',
  './Elisabeth_Sykorova_C00301316-UI-Programming-Module-Project/index.html',
  './Elisabeth_Sykorova_C00301316-UI-Programming-Module-Project/assets/css/style.css',

]; //files to download?

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(filesToCache);
  return self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('fetch', async e => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(req));
  } else {
    e.respondWith(networkAndCache(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req.url);
  return cached || fetch(req);
}

async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    await cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached;
  }
}