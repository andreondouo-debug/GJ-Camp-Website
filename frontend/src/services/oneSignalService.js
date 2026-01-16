import OneSignal from 'react-onesignal';

/**
 * Service OneSignal pour les notifications push
 * App ID: 100f3c29-e9fd-4ea0-a23c-db1add2ebee8
 */

const ONESIGNAL_APP_ID = '100f3c29-e9fd-4ea0-a23c-db1add2ebee8';

/**
 * Initialiser OneSignal
 */
export const initOneSignal = async () => {
  try {
    console.log('🔔 Initialisation de OneSignal...');
    
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true, // Pour dev local
      notifyButton: {
        enable: false, // On gère manuellement dans les paramètres
      },
      autoResubscribe: true,
      autoRegister: true,
      serviceWorkerParam: { scope: '/' },
      serviceWorkerPath: 'OneSignalSDKWorker.js'
    });

    console.log('✅ OneSignal initialisé');

    // Écouter les événements
    OneSignal.on('subscriptionChange', (isSubscribed) => {
      console.log('📊 Changement d\'abonnement:', isSubscribed);
    });

    OneSignal.on('notificationDisplay', (event) => {
      console.log('🔔 Notification affichée:', event);
    });

    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation OneSignal:', error);
    return false;
  }
};

/**
 * Demander permission pour les notifications
 */
export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Demande de permission notifications...');
    const permission = await OneSignal.showNativePrompt();
    console.log('📋 Permission:', permission);
    return permission;
  } catch (error) {
    console.error('❌ Erreur demande permission:', error);
    return false;
  }
};

/**
 * Obtenir l'ID du player OneSignal (pour enregistrer côté serveur)
 */
export const getOneSignalPlayerId = async () => {
  try {
    const playerId = await OneSignal.getUserId();
    console.log('🆔 OneSignal Player ID:', playerId);
    return playerId;
  } catch (error) {
    console.error('❌ Erreur récupération Player ID:', error);
    return null;
  }
};

/**
 * Vérifier si l'utilisateur est abonné
 */
export const isSubscribed = async () => {
  try {
    const subscribed = await OneSignal.isPushNotificationsEnabled();
    return subscribed;
  } catch (error) {
    console.error('❌ Erreur vérification abonnement:', error);
    return false;
  }
};

/**
 * Définir l'email de l'utilisateur (pour segmentation)
 */
export const setUserEmail = async (email) => {
  try {
    await OneSignal.setEmail(email);
    console.log('✅ Email défini:', email);
  } catch (error) {
    console.error('❌ Erreur définition email:', error);
  }
};

/**
 * Définir des tags pour l'utilisateur (segmentation avancée)
 */
export const setUserTags = async (tags) => {
  try {
    await OneSignal.sendTags(tags);
    console.log('✅ Tags définis:', tags);
  } catch (error) {
    console.error('❌ Erreur définition tags:', error);
  }
};

/**
 * Envoyer une notification de test
 */
export const sendTestNotification = async () => {
  try {
    console.log('🧪 Envoi notification de test...');
    // Cette fonction nécessite l'API REST côté backend
    console.log('⚠️ Utilisez l\'API backend pour envoyer des notifications');
  } catch (error) {
    console.error('❌ Erreur envoi notification test:', error);
  }
};

export default {
  initOneSignal,
  requestNotificationPermission,
  getOneSignalPlayerId,
  isSubscribed,
  setUserEmail,
  setUserTags,
  sendTestNotification
};
