const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const webpush = require('web-push');

// Configuration Web Push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:contact@gjsdecrpt.fr';
  // S'assurer que l'email a le préfixe mailto:
  const formattedEmail = vapidEmail.startsWith('mailto:') ? vapidEmail : `mailto:${vapidEmail}`;
  
  webpush.setVapidDetails(
    formattedEmail,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('✅ Web Push configuré');
} else {
  console.warn('⚠️ VAPID keys manquantes - Notifications push désactivées');
}

/**
 * @route   POST /api/notifications/subscribe
 * @desc    Enregistrer un abonnement push
 * @access  Private
 */
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Abonnement invalide' });
    }

    // Sauvegarder l'abonnement dans l'utilisateur
    await User.findByIdAndUpdate(req.user.userId, {
      pushSubscription: subscription,
      pushNotifications: true
    });

    console.log('✅ Abonnement push enregistré pour utilisateur:', req.user.userId);
    
    res.json({ 
      message: 'Abonnement enregistré avec succès',
      success: true 
    });
  } catch (error) {
    console.error('❌ Erreur enregistrement abonnement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route   POST /api/notifications/unsubscribe
 * @desc    Supprimer un abonnement push
 * @access  Private
 */
router.post('/unsubscribe', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      pushSubscription: null,
      pushNotifications: false
    });

    console.log('✅ Abonnement push supprimé pour utilisateur:', req.user.userId);
    
    res.json({ 
      message: 'Abonnement supprimé avec succès',
      success: true 
    });
  } catch (error) {
    console.error('❌ Erreur suppression abonnement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Envoyer une notification test
 * @access  Private
 */
router.post('/test', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('pushSubscription firstName');
    
    if (!user || !user.pushSubscription) {
      return res.status(400).json({ message: 'Aucun abonnement push trouvé' });
    }

    const payload = JSON.stringify({
      title: '🎉 GJ Camp',
      body: `Salut ${user.firstName} ! Les notifications fonctionnent parfaitement.`,
      icon: '/images/logo-192.png',
      badge: '/images/logo-192.png',
      data: { url: '/' }
    });

    await webpush.sendNotification(user.pushSubscription, payload);
    
    console.log('✅ Notification test envoyée à:', req.user.userId);
    
    res.json({ 
      message: 'Notification test envoyée',
      success: true 
    });
  } catch (error) {
    console.error('❌ Erreur envoi notification test:', error);
    
    // Si l'abonnement est invalide, le supprimer
    if (error.statusCode === 410) {
      await User.findByIdAndUpdate(req.user.userId, {
        pushSubscription: null,
        pushNotifications: false
      });
      return res.status(410).json({ message: 'Abonnement expiré, réabonnez-vous' });
    }
    
    res.status(500).json({ message: 'Erreur envoi notification' });
  }
});

/**
 * @route   GET /api/notifications/status
 * @desc    Vérifier le statut des notifications
 * @access  Private
 */
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('emailNotifications pushNotifications pushSubscription');
    
    res.json({
      emailEnabled: user.emailNotifications || false,
      pushEnabled: user.pushNotifications || false,
      pushSubscribed: !!user.pushSubscription,
      vapidConfigured: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
    });
  } catch (error) {
    console.error('❌ Erreur statut notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route   POST /api/notifications/settings
 * @desc    Mettre à jour les préférences de notifications
 * @access  Private
 */
router.post('/settings', auth, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications } = req.body;
    
    const updates = {};
    if (typeof emailNotifications === 'boolean') {
      updates.emailNotifications = emailNotifications;
    }
    if (typeof pushNotifications === 'boolean') {
      updates.pushNotifications = pushNotifications;
    }

    await User.findByIdAndUpdate(req.user.userId, updates);

    console.log('✅ Préférences notifications mises à jour:', req.user.userId);
    
    res.json({ 
      message: 'Préférences mises à jour',
      success: true 
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour préférences:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * Fonction utilitaire: Envoyer une notification push à plusieurs utilisateurs
 */
const sendBulkPushNotifications = async (userIds, payload) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      pushNotifications: true,
      pushSubscription: { $exists: true, $ne: null }
    }).select('pushSubscription firstName');

    console.log(`📤 Envoi notifications à ${users.length} utilisateurs`);

    const results = await Promise.allSettled(
      users.map(user => 
        webpush.sendNotification(
          user.pushSubscription, 
          JSON.stringify(payload)
        ).catch(async (error) => {
          // Si abonnement expiré, le supprimer
          if (error.statusCode === 410) {
            await User.findByIdAndUpdate(user._id, {
              pushSubscription: null,
              pushNotifications: false
            });
            console.log('🗑️ Abonnement expiré supprimé:', user._id);
          }
          throw error;
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Notifications envoyées: ${succeeded} réussies, ${failed} échouées`);

    return { succeeded, failed, total: users.length };
  } catch (error) {
    console.error('❌ Erreur envoi bulk notifications:', error);
    return { succeeded: 0, failed: 0, total: 0 };
  }
};

// Exporter la fonction bulk pour utilisation dans d'autres routes
router.sendBulkPushNotifications = sendBulkPushNotifications;

module.exports = router;
