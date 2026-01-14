// Service Worker pour PWA - GJ Camp
const CACHE_VERSION = '1.0.3'; // Incrémenter pour forcer mise à jour
const CACHE_NAME = `gj-camp-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/logo-gj.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache ouvert');
        // Essayer d'ajouter les URLs au cache, mais ne pas échouer si certaines ne se trouvent pas
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('⚠️ Certaines ressources ne peuvent pas être mises en cache:', error);
        });
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activé');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes réseau - Network First Strategy
self.addEventListener('fetch', (event) => {
  // Toujours récupérer depuis le réseau pour éviter cache excessif
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Vérifier si réponse valide
        if (!response || response.status !== 200) {
          return response;
        }

        // Ne mettre en cache que les ressources statiques importantes
        const urlsToCache = ['/', '/manifest.json', '/images/logo-gj.png'];
        if (urlsToCache.includes(new URL(event.request.url).pathname)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, essayer le cache
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/');
        });
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('📩 Push notification reçue');
  
  let notificationData = {
    title: 'GJ Camp',
    body: 'Nouvelle notification',
    icon: '/images/logo-192.png',
    badge: '/images/logo-192.png',
    vibrate: [200, 100, 200],
    data: { url: '/' }
  };
gj.png',
    badge: '/images/logo-gj.png',
    vibrate: [200, 100, 200],
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'GJ Camp',
        body: data.body || 'Nouvelle notification',
        icon: data.icon || '/images/logo-gj.png',
        badge: data.badge || '/images/logo-gj
    } catch (error) {
      console.error('❌ Erreur parsing notification:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification cliquée');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Chercher si une fenêtre est déjà ouverte
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
