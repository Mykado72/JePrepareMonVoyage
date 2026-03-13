/* ============================================================
   Service Worker – JePrepareMonVoyage
   VERSION: 2.0.0   ← incrémenter à chaque déploiement
   ============================================================ */
const CACHE_VERSION = '2.0.0';
const CACHE_NAME    = 'jpmv-v' + CACHE_VERSION;

// Fichiers mis en cache au premier chargement (shell de l'app)
const PRECACHE_ASSETS = [
  '/JePrepareMonVoyage/',
  '/JePrepareMonVoyage/index.html',
  '/JePrepareMonVoyage/css/app.css',
  '/JePrepareMonVoyage/js/app.js',
  '/JePrepareMonVoyage/js/villes.js',
  '/JePrepareMonVoyage/js/regions.js',
  '/JePrepareMonVoyage/manifest.json',
];

// ── Install : précache + activation immédiate ───────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())   // active immédiatement sans attendre fermeture des onglets
  );
});

// ── Activate : supprime TOUS les anciens caches ─────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Suppression ancien cache :', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())  // prend le contrôle de tous les onglets ouverts
  );
});

// ── Fetch : stratégie hybride ────────────────────────────────
//   • JS / CSS / HTML  → Network First  (toujours vérifier si une version plus récente existe)
//   • Reste (images, fonts, APIs) → Cache First (performance)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Ne pas intercepter les appels externes (Google Maps, APIs…)
  if (url.origin !== location.origin) return;

  const isAppFile = /\.(html|js|css|json)(\?|$)/.test(url.pathname) || url.pathname.endsWith('/');

  if (isAppFile) {
    // Network First : récupère la version réseau, met en cache, sinon fallback cache
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(e.request)
          .then(cached => cached || caches.match('/JePrepareMonVoyage/index.html'))
        )
    );
  } else {
    // Cache First pour tout le reste
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, resp.clone()));
          }
          return resp;
        }).catch(() => caches.match('/JePrepareMonVoyage/index.html'));
      })
    );
  }
});

// ── Message : rechargement forcé demandé par l'app ──────────
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
