// 一度開いたら、電波がなくても使えるようにする（記録は端末の中なので通信は不要）。作りは ../66days/sw.js と同じ
// 画面（HTML）はネットを先に見て、つながらないときだけ保存しておいた版を出す。更新がすぐ届くようにするため。
const CACHE = 'recall-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('recall-') && k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  const put = (res) => { if (res.ok && sameOrigin) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return res; };
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then(put).catch(() => hit)));
});
