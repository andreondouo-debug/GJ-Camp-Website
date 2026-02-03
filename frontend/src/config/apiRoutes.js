// 🔗 Configuration centralisée des routes API
// Utiliser ces constantes pour éviter les erreurs de typo dans les routes

// Base URL de l'API (configurée via variables d'environnement)
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 📝 Routes d'inscription (Registrations)
export const REGISTRATION_ROUTES = {
  // Créer une inscription
  CREATE: '/api/registrations/',
  
  // Inscription avec création de compte
  CAMP_WITH_ACCOUNT: '/api/registrations/camp-with-account',
  
  // Inscription invité
  GUEST: '/api/registrations/guest',
  
  // Paiement en espèces
  CASH: '/api/registrations/cash',
  CASH_STATS: '/api/registrations/cash/stats',
  CASH_PENDING_COUNT: '/api/registrations/cash/pending-count',
  
  // Récupérer mes inscriptions
  MY_REGISTRATIONS: '/api/registrations/mes-inscriptions',
  MY_REGISTRATION: '/api/registrations/my-registration',
  MY_GUESTS: '/api/registrations/mes-invites',
  
  // Gestion des inscriptions (admin)
  ALL: '/api/registrations/all',
  BY_ID: (id) => `/api/registrations/${id}`,
  DELETE: (id) => `/api/registrations/${id}`,
  
  // Paiements
  ADDITIONAL_PAYMENT: (id) => `/api/registrations/${id}/additional-payment`,
  CASH_PAYMENT: (registrationId) => `/api/registrations/${registrationId}/cash-payment`,
  VALIDATE_CASH: (registrationId, paymentId) => 
    `/api/registrations/${registrationId}/cash-payment/${paymentId}/validate`,
  REJECT_CASH: (registrationId, paymentId) => 
    `/api/registrations/${registrationId}/cash-payment/${paymentId}/reject`,
  UPDATE_PAYMENT_STATUS: (id) => `/api/registrations/${id}/payment-status`,
  
  // Admin
  CREATE_WITHOUT_PAYMENT: '/api/registrations/create-without-payment'
};

// 🔐 Routes d'authentification
export const AUTH_ROUTES = {
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  ME: '/api/auth/me',
  VERIFY_EMAIL: (token) => `/api/auth/verify-email/${token}`,
  RESEND_VERIFICATION: '/api/auth/resend-verification',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: (token) => `/api/auth/reset-password/${token}`,
  UPLOAD_PHOTO: '/api/auth/upload-photo',
  NOTIFICATION_SETTINGS: '/api/auth/notification-settings',
  PUSH_PLAYER_ID: '/api/auth/push-player-id'
};

// 🎯 Routes activités
export const ACTIVITY_ROUTES = {
  ALL: '/api/activities',
  BY_ID: (id) => `/api/activities/${id}`,
  SELECT: (id) => `/api/activities/${id}/select`,
  UNSELECT: (id) => `/api/activities/${id}/unselect`,
  MY_ACTIVITIES: '/api/activities/my-activities',
  TRACKING: '/api/activities/tracking',
  VALIDATE_PARTICIPATION: (activityId, userId) => 
    `/api/activities/${activityId}/validate/${userId}`,
  UNVALIDATE_PARTICIPATION: (activityId, userId) => 
    `/api/activities/${activityId}/unvalidate/${userId}`,
  STATS: '/api/activities/stats'
};

// 👥 Routes utilisateurs
export const USER_ROUTES = {
  ALL: '/api/users',
  BY_ID: (id) => `/api/users/${id}`,
  UPDATE_ROLE: (id) => `/api/users/${id}/role`,
  TOGGLE_STATUS: (id) => `/api/users/${id}/toggle-status`,
  ADMIN_UPDATE: (id) => `/api/users/${id}/admin-update`
};

// ⚙️ Routes paramètres
export const SETTINGS_ROUTES = {
  GET: '/api/settings',
  UPDATE: '/api/settings',
  UPDATE_LOGO: '/api/settings/logo',
  PAYPAL_MODE: '/api/settings/paypal-mode'
};

// 💰 Routes versements (Payouts)
export const PAYOUT_ROUTES = {
  ALL: '/api/payouts',
  BY_ID: (id) => `/api/payouts/${id}`,
  CREATE: '/api/payouts',
  UPDATE_STATUS: (id) => `/api/payouts/${id}/status`
};

// 🏫 Routes campus
export const CAMPUS_ROUTES = {
  ALL: '/api/campus',
  BY_ID: (id) => `/api/campus/${id}`,
  CREATE: '/api/campus',
  UPDATE: (id) => `/api/campus/${id}`,
  DELETE: (id) => `/api/campus/${id}`,
  STATS: (id) => `/api/campus/${id}/stats`
};

// 📰 Routes actualités (Posts)
export const POST_ROUTES = {
  ALL: '/api/posts',
  BY_ID: (id) => `/api/posts/${id}`,
  CREATE: '/api/posts',
  UPDATE: (id) => `/api/posts/${id}`,
  DELETE: (id) => `/api/posts/${id}`,
  TOGGLE_PIN: (id) => `/api/posts/${id}/toggle-pin`
};

// 🔔 Routes notifications
export const NOTIFICATION_ROUTES = {
  SUBSCRIBE: '/api/notifications/subscribe',
  UNSUBSCRIBE: '/api/notifications/unsubscribe',
  SEND: '/api/notifications/send',
  TEST: '/api/notifications/test'
};

// 💳 Routes PayPal (si nécessaire)
export const PAYPAL_ROUTES = {
  CREATE_ORDER: '/api/paypal/create-order',
  CAPTURE_ORDER: '/api/paypal/capture-order',
  VERIFY_PAYMENT: '/api/paypal/verify-payment'
};

// 📊 Routes statistiques
export const STATS_ROUTES = {
  DASHBOARD: '/api/stats/dashboard',
  REGISTRATIONS: '/api/stats/registrations',
  PAYMENTS: '/api/stats/payments',
  ACTIVITIES: '/api/stats/activities'
};

// 🏥 Route santé (health check)
export const HEALTH_ROUTE = '/api/health';

// ✅ Exemples d'utilisation:
// 
// import { REGISTRATION_ROUTES } from '../config/apiRoutes';
// 
// // Créer une inscription
// axios.post(REGISTRATION_ROUTES.CREATE, data, { headers });
// 
// // Récupérer mes inscriptions
// axios.get(REGISTRATION_ROUTES.MY_REGISTRATIONS, { headers });
// 
// // Paiement additionnel
// axios.put(REGISTRATION_ROUTES.ADDITIONAL_PAYMENT(registrationId), data, { headers });
// 
// // Valider paiement espèces
// axios.patch(REGISTRATION_ROUTES.VALIDATE_CASH(regId, paymentId), data, { headers });
