// Service Worker pour PWA - GJ Camp
const BUILD_HASH = 'b426475'; // Hash du commit
const BUILD_TIMESTAMP = '1768513480'; // Timestamp build
const CACHE_VERSION = `${BUILD_HASH}-${BUILD_TIMESTAMP}`;
const CACHE_NAME = `gj-camp-v${CACHE_VERSION}`;
const urlsToCache = [
  `/?v=${CACHE_VERSION}`,
  `/manifest.json?v=${CACHE_VERSION}`,
  `/images/logo-gj.png?v=${CACHE_VERSION}`
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
  const url = new URL(event.request.url);
  // Ajoute le paramètre de version sur les requêtes API et statiques
  if (url.pathname.startsWith('/api/')) {
    // Stratégie network first pour les API
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Mettre en cache la réponse API si succès
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback cache si offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // Stratégie network first pour les pages principales et fichiers statiques
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache si succès et si fichier statique ou HTML
        if (response && response.status === 200 && (
          url.pathname.endsWith('.js') ||
          url.pathname.endsWith('.css') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.jpg') ||
          url.pathname.endsWith('.jpeg') ||
          url.pathname.endsWith('.svg') ||
          url.pathname.endsWith('.json') ||
          url.pathname === '/'
        )) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback cache si offline
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
    icon: 'https://res.cloudinary.com/dbouijio-1/image/upload/v1767949247/gj-camp/logo/raujk6jdnoioiqgjop2f.jpg',
    badge: 'https://res.cloudinary.com/dbouijio-1/image/upload/v1767949247/gj-camp/logo/raujk6jdnoioiqgjop2f.jpg',
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
