/* =========================================================================
   SERVICE WORKER
   -------------------------------------------------------------------------
   The whole game is a handful of small static files, so it is precached on
   install and served from the cache afterwards. That makes it installable
   and lets it run with no connection at all.

   Bump CACHE when any asset changes — the old cache is dropped on activate.
   ========================================================================= */

var CACHE = 'to-scale-v1';

var ASSETS = [
  './',
  './index.html',
  './style.css',
  './silhouettes.js',
  './subjects.js',
  './i18n.js',
  './game.js',
  './favicon.svg',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* A navigation always resolves to the app shell, so deep links and
     offline reloads both land on the game rather than a browser error. */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match('./index.html', { ignoreSearch: true });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        /* Keep anything else the page asks for, but never cache an error. */
        if (res && res.ok && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
