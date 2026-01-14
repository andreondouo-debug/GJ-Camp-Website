const webpush = require('web-push');
const User = require('../models/User');

/**
 * Service de notifications push Web Push API native
 * Remplace OneSignal par une solution native gratuite
 */

// Configuration VAPID
const initializeWebPush = () => {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'contact@gjsdecrpt.fr',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    console.log('✅ Web Push configuré avec VAPID');
    return true;
  } else {
    console.warn('⚠️ VAPID keys manquantes - Notifications push désactivées');
    return false;
  }
};

// Initialiser au chargement du module
const isPushEnabled = initializeWebPush();

/**
 * Envoyer une notification push à un utilisateur
 */
const sendPushToUser = async (userId, payload) => {
  if (!isPushEnabled) {
    console.log('⚠️ Push désactivé (VAPID non configuré)');
    return { success: false, error: 'Push non configuré' };
  }

  try {
    const user = await User.findById(userId).select('pushSubscription pushNotifications firstName');
    
    if (!user || !user.pushNotifications || !user.pushSubscription) {
      return { success: false, error: 'Utilisateur sans abonnement push' };
    }

    const notification = JSON.stringify({
      title: payload.title || 'GJ Camp',
      body: payload.body || 'Nouvelle notification',
      icon: payload.icon || '/images/logo-192.png',
      badge: payload.badge || '/images/logo-192.png',
      data: payload.data || {},
      tag: payload.tag || 'gj-camp',
      requireInteraction: payload.requireInteraction || false
    });

    await webpush.sendNotification(user.pushSubscription, notification);
    
    console.log(`✅ Push envoyé à ${user.firstName}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur envoi push:', error);
    
    // Si abonnement expiré (410 Gone), le supprimer
    if (error.statusCode === 410) {
      await User.findByIdAndUpdate(userId, {
        pushSubscription: null,
        pushNotifications: false
      });
      console.log('🗑️ Abonnement expiré supprimé');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer une notification push à plusieurs utilisateurs
 */
const sendBulkPush = async (userIds, payload) => {
  if (!isPushEnabled) {
    console.log('⚠️ Push désactivé (VAPID non configuré)');
    return { sent: 0, failed: 0, total: 0 };
  }

  try {
    const users = await User.find({
      _id: { $in: userIds },
      pushNotifications: true,
      pushSubscription: { $exists: true, $ne: null }
    }).select('pushSubscription firstName');

    if (users.length === 0) {
      console.log('⚠️ Aucun utilisateur avec push activé');
      return { sent: 0, failed: 0, total: 0 };
    }

    console.log(`📤 Envoi push à ${users.length} utilisateurs`);

    const notification = JSON.stringify({
      title: payload.title || 'GJ Camp',
      body: payload.body || 'Nouvelle notification',
      icon: payload.icon || '/images/logo-192.png',
      badge: payload.badge || '/images/logo-192.png',
      data: payload.data || {},
      tag: payload.tag || 'gj-camp',
      requireInteraction: payload.requireInteraction || false
    });

    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          await webpush.sendNotification(user.pushSubscription, notification);
          return { success: true, userId: user._id };
        } catch (error) {
          // Si abonnement expiré, le supprimer
          if (error.statusCode === 410) {
            await User.findByIdAndUpdate(user._id, {
              pushSubscription: null,
              pushNotifications: false
            });
            console.log(`🗑️ Abonnement expiré supprimé: ${user.firstName}`);
          }
          throw error;
        }
      })
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Push: ${succeeded} envoyés, ${failed} échoués`);

    return { sent: succeeded, failed, total: users.length };
  } catch (error) {
    console.error('❌ Erreur bulk push:', error);
    return { sent: 0, failed: 0, total: 0 };
  }
};

/**
 * Notifier tous les utilisateurs actifs
 */
const notifyAllUsers = async (payload) => {
  try {
    const users = await User.find({
      isActive: true,
      pushNotifications: true,
      pushSubscription: { $exists: true, $ne: null }
    }).select('_id');

    const userIds = users.map(u => u._id);
    return await sendBulkPush(userIds, payload);
  } catch (error) {
    console.error('❌ Erreur notification tous utilisateurs:', error);
    return { sent: 0, failed: 0, total: 0 };
  }
};

/**
 * Notifier pour un nouveau post
 */
const notifyNewPost = async (post) => {
  const payload = {
    title: '📰 Nouveau Post',
    body: `${post.author.firstName} ${post.author.lastName}: ${post.text.substring(0, 100)}...`,
    icon: '/images/logo-192.png',
    data: {
      url: '/newsletter',
      postId: post._id.toString(),
      type: 'new_post'
    },
    tag: 'new-post',
    requireInteraction: false
  };

  return await notifyAllUsers(payload);
};

/**
 * Notifier pour un nouveau message
 */
const notifyNewMessage = async (message, recipientId) => {
  const payload = {
    title: '💬 Nouveau Message',
    body: `${message.sender.firstName} ${message.sender.lastName}: ${message.content.substring(0, 100)}...`,
    icon: '/images/logo-192.png',
    data: {
      url: '/messages',
      messageId: message._id.toString(),
      senderId: message.sender._id.toString(),
      type: 'new_message'
    },
    tag: 'new-message',
    requireInteraction: true
  };

  return await sendPushToUser(recipientId, payload);
};

/**
 * Notifier pour une nouvelle activité
 */
const notifyNewActivity = async (activity) => {
  const payload = {
    title: '🎯 Nouvelle Activité',
    body: `${activity.name} - Inscrivez-vous maintenant !`,
    icon: '/images/logo-192.png',
    data: {
      url: '/programme',
      activityId: activity._id.toString(),
      type: 'new_activity'
    },
    tag: 'new-activity',
    requireInteraction: false
  };

  return await notifyAllUsers(payload);
};

/**
 * Notifier pour une mise à jour d'inscription
 */
const notifyRegistrationUpdate = async (userId, status) => {
  const statusMessages = {
    confirmed: 'Votre inscription est confirmée ! 🎉',
    pending: 'Votre inscription est en attente de paiement',
    rejected: 'Votre inscription nécessite une révision'
  };

  const payload = {
    title: '📋 Mise à jour inscription',
    body: statusMessages[status] || 'Statut de votre inscription mis à jour',
    icon: '/images/logo-192.png',
    data: {
      url: '/tableau-de-bord',
      type: 'registration_update',
      status
    },
    tag: 'registration-update',
    requireInteraction: true
  };

  return await sendPushToUser(userId, payload);
};

/**
 * Notifier pour un paiement confirmé
 */
const notifyPaymentConfirmed = async (userId, amount) => {
  const payload = {
    title: '💰 Paiement confirmé',
    body: `Votre paiement de ${amount}€ a été confirmé avec succès !`,
    icon: '/images/logo-192.png',
    data: {
      url: '/tableau-de-bord',
      type: 'payment_confirmed',
      amount
    },
    tag: 'payment-confirmed',
    requireInteraction: false
  };

  return await sendPushToUser(userId, payload);
};

/**
 * Notifier les admins
 */
const notifyAdmins = async (payload) => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'responsable'] },
      pushNotifications: true,
      pushSubscription: { $exists: true, $ne: null }
    }).select('_id');

    const adminIds = admins.map(a => a._id);
    
    if (adminIds.length === 0) {
      console.log('⚠️ Aucun admin avec push activé');
      return { sent: 0, failed: 0, total: 0 };
    }

    return await sendBulkPush(adminIds, payload);
  } catch (error) {
    console.error('❌ Erreur notification admins:', error);
    return { sent: 0, failed: 0, total: 0 };
  }
};

module.exports = {
  sendPushToUser,
  sendBulkPush,
  notifyAllUsers,
  notifyNewPost,
  notifyNewMessage,
  notifyNewActivity,
  notifyRegistrationUpdate,
  notifyPaymentConfirmed,
  notifyAdmins
};
