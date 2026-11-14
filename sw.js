// 30 Seconden: offline spelen. De pagina zelf eerst van internet (zodat updates meteen binnenkomen), anders uit de cache.
const VERSIE = 'ts30-v2';
const BESTANDEN = ['./', 'index.html', 'manifest.webmanifest', 'favicon.png', 'apple-touch-icon.png', 'icoon-192.png', 'icoon-512.png', 'icoon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSIE).then(c => c.addAll(BESTANDEN)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSIE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const font = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !font) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const k = r.clone(); caches.open(VERSIE).then(c => c.put('./', k)); return r; }).catch(() => caches.match('./', {ignoreSearch: true})));
    return;
  }
  e.respondWith(caches.open(VERSIE).then(async c => {
    const oud = await c.match(req, {ignoreSearch: !font});
    const nieuw = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => oud);
    return oud || nieuw;
  }));
});
