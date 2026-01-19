/**
 * Service de notifications push - GJ Camp
 * Gère les permissions et l'enregistrement des notifications push
 */

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';

// Vérifier que la clé VAPID est configurée
if (!VAPID_PUBLIC_KEY) {
  console.error('❌ VAPID_PUBLIC_KEY manquante ! Configurez REACT_APP_VAPID_PUBLIC_KEY dans Vercel.');
  console.log('📝 Documentation: Voir NOTIFICATIONS_PUSH_CONFIG.md');
}

/**
 * Demander la permission pour les notifications push
 */
export const requestNotificationPermission = async () => {
  console.log('═══════════════════════════════════════════');
  console.log('🔔 requestNotificationPermission DÉBUT');
  console.log('═══════════════════════════════════════════');
  
  try {
    if (!VAPID_PUBLIC_KEY) {
      console.error('❌ Clé VAPID manquante - Notifications désactivées');
      alert('⚠️ Les notifications push ne sont pas configurées. Contactez l\'administrateur.');
      return false;
    }

    console.log('✅ Clé VAPID présente:', VAPID_PUBLIC_KEY.substring(0, 20) + '...');

    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications non supportées par ce navigateur');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker non supporté');
      return false;
    }

    console.log('📊 Permission actuelle:', Notification.permission);

    // Vérifier si déjà accordée
    if (Notification.permission === 'granted') {
      console.log('✅ Permission notifications déjà accordée');
      const subscription = await subscribeToPush();
      console.log('📊 Résultat subscribeToPush:', !!subscription);
      return !!subscription;
    }

    // Demander la permission
    console.log('🔔 Demande de permission...');
    const permission = await Notification.requestPermission();
    console.log('📊 Résultat permission:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Permission notifications accordée');
      const subscription = await subscribeToPush();
      console.log('📊 Résultat subscribeToPush:', !!subscription);
      return !!subscription;
    } else {
      console.log('❌ Permission notifications refusée');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur demande permission:', error);
    return false;
  } finally {
    console.log('═══════════════════════════════════════════');
    console.log('🔔 requestNotificationPermission FIN');
    console.log('═══════════════════════════════════════════');
  }
};

/**
 * S'abonner aux notifications push
 */
export const subscribeToPush = async () => {
  try {
    console.log('🔄 Attente du Service Worker...');
    
    // Attendre que le Service Worker soit prêt (timeout 10s)
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout Service Worker')), 10000)
      )
    ]);
    
    console.log('✅ Service Worker prêt:', registration.scope);
    
    // Vérifier si déjà abonné
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('🔔 Création nouvel abonnement push...');
      
      // Créer un nouvel abonnement
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      console.log('✅ Abonnement push créé:', subscription.endpoint);
    } else {
      console.log('✅ Déjà abonné aux push:', subscription.endpoint);
    }

    // Envoyer l'abonnement au backend
    const sent = await sendSubscriptionToBackend(subscription);
    
    if (!sent) {
      console.error('❌ Échec envoi abonnement au backend');
      return null;
    }
    
    return subscription;
  } catch (error) {
    console.error('❌ Erreur abonnement push:', error);
    if (error.message === 'Timeout Service Worker') {
      alert('⚠️ Service Worker non disponible. Rechargez la page et réessayez.');
    }
    return null;
  }
};

/**
 * Se désabonner des notifications push
 */
export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Désabonné des push');
      
      // Informer le backend
      await removeSubscriptionFromBackend();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erreur désabonnement push:', error);
    return false;
  }
};

/**
 * Envoyer l'abonnement au backend
 */
const sendSubscriptionToBackend = async (subscription) => {
  console.log('═══════════════════════════════════════════');
  console.log('📤 sendSubscriptionToBackend DÉBUT');
  console.log('═══════════════════════════════════════════');
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Utilisateur non connecté, abonnement local uniquement');
      return false;
    }

    console.log('✅ Token présent');

    const API_URL = process.env.REACT_APP_API_URL || '';
    const url = `${API_URL}/api/notifications/subscribe`;
    
    console.log('📊 URL backend:', url);
    console.log('📊 Subscription endpoint:', subscription.endpoint);

    const body = {
      subscription: subscription.toJSON()
    };
    
    console.log('📊 Body à envoyer:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    console.log('📊 Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Abonnement envoyé au backend:', data);
      console.log('═══════════════════════════════════════════');
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Erreur envoi abonnement:', response.status, error);
      console.log('═══════════════════════════════════════════');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur communication backend:', error);
    console.log('═══════════════════════════════════════════');
    return false;
  }
};

/**
 * Supprimer l'abonnement du backend
 */
const removeSubscriptionFromBackend = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const API_URL = process.env.REACT_APP_API_URL || '';

    await fetch(`${API_URL}/api/notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Abonnement supprimé du backend');
  } catch (error) {
    console.error('❌ Erreur suppression abonnement:', error);
  }
};

/**
 * Vérifier si l'utilisateur est abonné
 */
export const isPushSubscribed = async () => {
  try {
    if (!('serviceWorker' in navigator)) return false;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return subscription !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Afficher une notification de test
 */
export const showTestNotification = async () => {
  try {
    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Permission notifications non accordée');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification('🎉 GJ Camp', {
      body: 'Notifications activées avec succès !',
      icon: '/images/logo-192.png',
      badge: '/images/logo-192.png',
      vibrate: [200, 100, 200],
      data: { url: '/' }
    });
    
    console.log('✅ Notification test affichée');
  } catch (error) {
    console.error('❌ Erreur notification test:', error);
  }
};

/**
 * Convertir VAPID key en format Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default {
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  showTestNotification
};
