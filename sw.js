/* Offline support for Lai's Trip. Bump CACHE_VERSION on every deploy that changes cached files. */
const CACHE_VERSION = 'lais-trip-v1';
const FONT_CACHE = 'lais-trip-fonts-v1';
const PRECACHE = [
  './', 'index.html', 'upgrade.css', 'upgrade.js', 'manifest.json',
  'cover.jpg', 'DAY1.jpg', 'DAY2.jpg', 'DAY3.jpg', 'DAY4.jpg', 'DAY5.jpg',
  'DAY6.jpg', 'DAY7.jpg', 'DAY8.jpg', 'DAY9.jpg',
  'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page itself: try network first so updates show, fall back to saved copy offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put('index.html', copy)); return res; })
        .catch(() => caches.match('index.html', { ignoreSearch: true }))
    );
    return;
  }

  // Google Fonts: cache after first load.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; })))
    );
    return;
  }

  // Own files: always try the network first so a new version shows up as soon as the phone is online;
  // use the saved copy only when offline.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }))
    );
  }
  // Everything else (weather, exchange rate, maps) goes straight to the network.
});
