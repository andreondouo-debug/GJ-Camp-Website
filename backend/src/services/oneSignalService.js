const https = require('https');

/**
 * Service OneSignal pour envoyer des notifications push côté backend
 * Documentation: https://documentation.onesignal.com/reference
 */

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || '100f3c29-e9fd-4ea0-a23c-db1add2ebee8';
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

/**
 * Envoyer une notification à un utilisateur spécifique via son Player ID
 */
const sendNotificationToUser = async (playerId, notification) => {
  if (!ONESIGNAL_REST_API_KEY) {
    console.error('❌ ONESIGNAL_REST_API_KEY manquante dans .env');
    return { success: false, error: 'API Key manquante' };
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: [playerId],
    headings: { en: notification.title || 'GJ Camp' },
    contents: { en: notification.message || 'Nouvelle notification' }
  };

  // Ajouter l'URL seulement si elle existe
  if (notification.url) {
    payload.url = notification.url;
  }

  // Ajouter les data seulement si elles existent et ne sont pas vides
  if (notification.data && Object.keys(notification.data).length > 0) {
    payload.data = notification.data;
  }

  const data = JSON.stringify(payload);

  const options = {
    hostname: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode === 200) {
            console.log('✅ Notification OneSignal envoyée:', result.id);
            resolve({ success: true, id: result.id, recipients: result.recipients });
          } else {
            console.error('❌ Erreur OneSignal:', result);
            resolve({ success: false, error: result });
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur requête OneSignal:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

/**
 * Envoyer une notification à plusieurs utilisateurs
 */
const sendNotificationToUsers = async (playerIds, notification) => {
  if (!ONESIGNAL_REST_API_KEY) {
    console.error('❌ ONESIGNAL_REST_API_KEY manquante dans .env');
    return { success: false, error: 'API Key manquante' };
  }

  const data = JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: playerIds,
    headings: { en: notification.title || 'GJ Camp' },
    contents: { en: notification.message || 'Nouvelle notification' },
    url: notification.url || 'https://gjsdecrpt.fr',
    data: notification.data || {}
  });

  const options = {
    hostname: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode === 200) {
            console.log(`✅ Notification OneSignal envoyée à ${playerIds.length} users:`, result.id);
            resolve({ success: true, id: result.id, recipients: result.recipients });
          } else {
            console.error('❌ Erreur OneSignal:', result);
            resolve({ success: false, error: result });
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur requête OneSignal:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

/**
 * Envoyer une notification à tous les utilisateurs abonnés
 */
const sendNotificationToAll = async (notification) => {
  if (!ONESIGNAL_REST_API_KEY) {
    console.error('❌ ONESIGNAL_REST_API_KEY manquante dans .env');
    return { success: false, error: 'API Key manquante' };
  }

  const data = JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    included_segments: ['All'], // Tous les utilisateurs abonnés
    headings: { en: notification.title || 'GJ Camp' },
    contents: { en: notification.message || 'Nouvelle notification' },
    url: notification.url || 'https://gjsdecrpt.fr',
    data: notification.data || {}
  });

  const options = {
    hostname: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode === 200) {
            console.log('✅ Notification OneSignal envoyée à tous:', result.id);
            resolve({ success: true, id: result.id, recipients: result.recipients });
          } else {
            console.error('❌ Erreur OneSignal:', result);
            resolve({ success: false, error: result });
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur requête OneSignal:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

/**
 * Envoyer une notification pour un nouveau post
 */
const sendPostNotification = async (post, playerIds = null) => {
  const notification = {
    title: '📰 Nouveau post - GJ Camp',
    message: `${post.author?.firstName} a publié: ${post.text.substring(0, 100)}...`,
    url: 'https://gjsdecrpt.fr/newsletter',
    data: {
      type: 'post',
      postId: post._id,
      authorId: post.author?._id
    }
  };

  if (playerIds && playerIds.length > 0) {
    return await sendNotificationToUsers(playerIds, notification);
  } else {
    return await sendNotificationToAll(notification);
  }
};

/**
 * Envoyer une notification pour un nouveau message
 */
const sendMessageNotification = async (message, recipientPlayerId) => {
  const notification = {
    title: '💬 Nouveau message',
    message: `${message.sender?.firstName} vous a envoyé un message`,
    url: 'https://gjsdecrpt.fr/messages',
    data: {
      type: 'message',
      messageId: message._id,
      senderId: message.sender?._id
    }
  };

  return await sendNotificationToUser(recipientPlayerId, notification);
};

/**
 * Envoyer une notification pour une inscription validée
 */
const sendRegistrationNotification = async (registration, playerId) => {
  const notification = {
    title: '✅ Inscription confirmée - GJ Camp',
    message: `Votre inscription au camp est confirmée ! Montant: ${registration.amountPaid}€`,
    url: 'https://gjsdecrpt.fr/tableau-de-bord',
    data: {
      type: 'registration',
      registrationId: registration._id
    }
  };

  return await sendNotificationToUser(playerId, notification);
};

/**
 * Envoyer une notification pour une nouvelle activité
 */
const sendActivityNotification = async (activity, playerIds = null) => {
  const notification = {
    title: '🎯 Nouvelle activité disponible',
    message: `${activity.titre} - ${activity.description.substring(0, 100)}...`,
    url: 'https://gjsdecrpt.fr/activites',
    data: {
      type: 'activity',
      activityId: activity._id
    }
  };

  if (playerIds && playerIds.length > 0) {
    return await sendNotificationToUsers(playerIds, notification);
  } else {
    return await sendNotificationToAll(notification);
  }
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToAll,
  sendPostNotification,
  sendMessageNotification,
  sendRegistrationNotification,
  sendActivityNotification
};
