import OneSignal from 'react-onesignal';

/**
 * Service OneSignal pour les notifications push
 * App ID: 100f3c29-e9fd-4ea0-a23c-db1add2ebee8
 */

const ONESIGNAL_APP_ID = '100f3c29-e9fd-4ea0-a23c-db1add2ebee8';

let isInitialized = false;

/**
 * Initialiser OneSignal
 */
export const initOneSignal = async () => {
  try {
    if (isInitialized) {
      console.log('✅ OneSignal déjà initialisé');
      return true;
    }

    console.log('🔔 Initialisation de OneSignal...');
    
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      autoResubscribe: true,
      autoRegister: true
    });

    isInitialized = true;
    console.log('✅ OneSignal initialisé avec succès');
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
    await OneSignal.Slidedown.promptPush();
    return true;
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
    if (!isInitialized) {
      console.log('⏳ OneSignal pas encore initialisé, attente...');
      await initOneSignal();
      // Attendre un peu que l'initialisation se termine
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const userId = await OneSignal.User.PushSubscription.id;
    console.log('🆔 OneSignal Player ID:', userId);
    return userId;
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
    const optedIn = await OneSignal.User.PushSubscription.optedIn;
    return optedIn;
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
    await OneSignal.login(email);
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
    await OneSignal.User.addTags(tags);
    console.log('✅ Tags définis:', tags);
  } catch (error) {
    console.error('❌ Erreur définition tags:', error);
  }
};

export default {
  initOneSignal,
  requestNotificationPermission,
  getOneSignalPlayerId,
  isSubscribed,
  setUserEmail,
  setUserTags
};
