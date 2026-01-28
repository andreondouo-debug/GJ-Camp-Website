// Service Worker pour PWA - GJ Camp
// ✅ Gestion du cache par version pour forcer le rechargement de la dernière version

const APP_VERSION = '0.1.1'; // Synchronisé avec package.json
const BUILD_DATE = '2026-01-28-17h16'; // Format: YYYY-MM-DD
const CACHE_VERSION = `v${APP_VERSION}-${BUILD_DATE}`;
const CACHE_NAME = `gj-camp-${CACHE_VERSION}`;
const urlsToCache = [
  `/?v=${CACHE_VERSION}`,
  `/manifest.json?v=${CACHE_VERSION}`,
  `/images/crpt-logo.png?v=${CACHE_VERSION}`
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installation en cours...', CACHE_VERSION);
  // Force l'activation immédiate sans attendre
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache ouvert:', CACHE_NAME);
        // Essayer d'ajouter les URLs au cache, mais ne pas échouer si certaines ne se trouvent pas
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('⚠️ Certaines ressources ne peuvent pas être mises en cache:', error);
        });
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activé', CACHE_VERSION);
  // Prendre le contrôle immédiatement de tous les clients
  event.waitUntil(
    Promise.all([
      // Supprimer les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  );
});

// Interception des requêtes réseau - Network First Strategy avec versioning automatique

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ajouter automatiquement le paramètre de version pour forcer le rechargement
  const shouldAddVersion = (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json') ||
    url.pathname === '/'
  );
  
  if (shouldAddVersion && !url.searchParams.has('v')) {
    url.searchParams.set('v', CACHE_VERSION);
    const versionedRequest = new Request(url.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      mode: event.request.mode,
      credentials: event.request.credentials,
      redirect: event.request.redirect
    });
    event.respondWith(
      fetch(versionedRequest)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(versionedRequest, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Stratégie Network First pour les API
  if (url.pathname.startsWith('/api/')) {
    // Ne mettre en cache QUE les requêtes GET
    if (event.request.method !== 'GET') {
      // Laisser passer les requêtes non-GET (POST, PUT, DELETE) sans les cacher
      event.respondWith(fetch(event.request));
      return;
    }
    
    // Stratégie network first pour les API GET uniquement
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
        badge: data.badge || '/images/logo-gj.png',
        vibrate: data.vibrate || [200, 100, 200],
        data: data.data || { url: '/' }
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
