const CACHE_NAME = 'medlembrar-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Instala e faz cache dos assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Serve do cache (offline-first)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// Exibe notificação agendada (recebida via postMessage)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    const { title, body, tag, delay } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: './icon-192.png',
        badge: './icon-192.png',
        requireInteraction: true,
        renotify: true,
        vibrate: [200, 100, 200]
      });
    }, delay);
  }
});

// Clique na notificação abre o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('index.html') || c.url.endsWith('/'));
      if (existing) return existing.focus();
      return clients.openWindow('./index.html');
    })
  );
});
