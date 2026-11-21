// 앱 화면 파일을 저장해 두어, 인터넷이 약해도 앱이 바로 열리게 합니다.
// 화면 파일을 고치면 아래 버전 숫자를 하나 올려 주세요.
var CACHE = 'food-app-v1';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// 화면 파일: 새 버전을 먼저 받아 보고, 안 되면 저장해 둔 것을 씁니다.
// 시트 데이터(Apps Script)는 항상 인터넷으로 가져옵니다.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('index.html'); });
      })
  );
});
