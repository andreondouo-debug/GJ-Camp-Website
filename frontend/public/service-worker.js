// Service Worker pour PWA - GJ Camp
const CACHE_NAME = 'gj-camp-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/logo-192.png',
  '/images/logo-512.png'
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

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retourner la réponse depuis le cache
        if (response) {
          return response;
        }

        // Clone de la requête
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Vérifier si réponse valide
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone de la réponse
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // En cas d'échec, retourner une page offline personnalisée
          return caches.match('/');
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

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'GJ Camp',
        body: data.body || 'Nouvelle notification',
        icon: data.icon || '/images/logo-192.png',
        badge: data.badge || '/images/logo-192.png',
        vibrate: [200, 100, 200],
        data: data.data || { url: data.url || '/' },
        tag: data.tag || 'gj-camp-notification',
        requireInteraction: data.requireInteraction || false
      };
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

  event.waitUntil(
    clients.openWindow('/')
  );
});
