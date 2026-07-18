// Diary App - Service Worker
// اس کا کام: انٹرنیٹ نہ ہونے پر بھی ڈائری کھلی رہے (آف لائن سپورٹ)

const CACHE_NAME = 'diary-cache-v1';
const CORE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

// انسٹال: بنیادی فائلیں کیش کریں
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// ایکٹیویٹ: پرانے کیش صاف کریں
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// فیچ: پہلے نیٹ ورک آزمائیں، ناکامی پر کیش سے دیں (اور کیش تازہ کریں)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // نیویگیشن ریکویسٹ ہو تو مرکزی صفحہ واپس دیں
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        })
      )
  );
});
