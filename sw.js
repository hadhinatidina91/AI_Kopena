/* Tanya KOPENA — Service Worker */
const CACHE = 'tanya-kopena-v2';
const SHELL = [
  '/AI_Kopena/',
  '/AI_Kopena/index.html',
  '/AI_Kopena/manifest.json',
  '/AI_Kopena/icon-192.png',
  '/AI_Kopena/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      for (const url of SHELL) {
        try { await c.add(url); } catch (err) { console.warn('cache skip', url, err); }
      }
    }).then(() => self.skipWaiting())
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
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/AI_Kopena/')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request).then((res) => {
        if (res && res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
