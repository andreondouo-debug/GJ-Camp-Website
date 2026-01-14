/**
 * Service de notifications push - GJ Camp
 * Gère les permissions et l'enregistrement des notifications push
 */

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';

/**
 * Demander la permission pour les notifications push
 */
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications non supportées par ce navigateur');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Worker non supporté');
      return false;
    }

    // Vérifier si déjà accordée
    if (Notification.permission === 'granted') {
      console.log('✅ Permission notifications déjà accordée');
      return true;
    }

    // Demander la permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Permission notifications accordée');
      await subscribeToPush();
      return true;
    } else {
      console.log('❌ Permission notifications refusée');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur demande permission:', error);
    return false;
  }
};

/**
 * S'abonner aux notifications push
 */
export const subscribeToPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Vérifier si déjà abonné
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
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
    await sendSubscriptionToBackend(subscription);
    
    return subscription;
  } catch (error) {
    console.error('❌ Erreur abonnement push:', error);
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
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Utilisateur non connecté, abonnement local uniquement');
      return;
    }

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      })
    });

    if (response.ok) {
      console.log('✅ Abonnement envoyé au backend');
    } else {
      console.error('❌ Erreur envoi abonnement:', response.status);
    }
  } catch (error) {
    console.error('❌ Erreur communication backend:', error);
  }
};

/**
 * Supprimer l'abonnement du backend
 */
const removeSubscriptionFromBackend = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    await fetch('/api/notifications/unsubscribe', {
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
