/**
 * Routes API pour la gestion des paramètres du site
 * Accessible uniquement aux administrateurs avec système de verrouillage
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { cloudinaryUpload, cloudinaryUploadCrpt, cloudinaryUploadPwa, uploadToCloudinary } = require('../middleware/cloudinaryUpload');
const settingsController = require('../controllers/settingsController');
const oneSignalService = require('../services/oneSignalService');
const User = require('../models/User');
const { 
  acquireSettingsLock, 
  releaseSettingsLock, 
  checkSettingsLockStatus,
  forceReleaseSettingsLock 
} = require('../middleware/settingsLock');

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les administrateurs peuvent modifier les paramètres.' 
    });
  }
  next();
};

// Routes protégées (admin uniquement avec verrouillage)
router.get('/', settingsController.getSettings); // Public pour charger le logo
router.get('/status-bar-color', settingsController.getStatusBarColor); // Public pour couleur barre statut
router.get('/lock/status', auth, requireAdmin, checkSettingsLockStatus); // Vérifier état du verrou
router.post('/lock/acquire', auth, requireAdmin, acquireSettingsLock, (req, res) => {
  res.json({ message: 'Verrou acquis avec succès', locked: true });
}); // Acquérir le verrou
router.post('/lock/release', auth, requireAdmin, releaseSettingsLock); // Libérer le verrou
router.post('/lock/force-release', auth, requireAdmin, forceReleaseSettingsLock); // Forcer libération (urgence)
router.put('/', auth, requireAdmin, acquireSettingsLock, settingsController.updateSettings);
router.post('/reset', auth, requireAdmin, acquireSettingsLock, settingsController.resetSettings);
router.post('/upload-logo', auth, requireAdmin, acquireSettingsLock, cloudinaryUpload, uploadToCloudinary, settingsController.uploadLogo);
router.post('/upload-crpt-logo', auth, requireAdmin, acquireSettingsLock, cloudinaryUploadCrpt, uploadToCloudinary, settingsController.uploadCrptLogo);
router.post('/upload-pwa-logo', auth, requireAdmin, acquireSettingsLock, cloudinaryUploadPwa, settingsController.uploadPwaLogo);

// Test notification OneSignal
router.post('/test-notification', auth, requireAdmin, async (req, res) => {
  try {
    const { testType, userId, title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Titre et message requis' });
    }

    const notification = {
      title: title || '🧪 Test OneSignal',
      message: message || 'Ceci est une notification de test',
      url: 'https://gjsdecrpt.fr',
      data: { type: 'test', timestamp: Date.now() }
    };

    let result;

    if (testType === 'me') {
      // Envoyer à moi-même
      const currentUser = await User.findById(req.user.userId).select('pushPlayerId firstName');
      if (!currentUser || !currentUser.pushPlayerId) {
        return res.status(400).json({ 
          message: 'Vous n\'avez pas de Player ID. Reconnectez-vous pour l\'enregistrer.' 
        });
      }
      result = await oneSignalService.sendNotificationToUser(currentUser.pushPlayerId, notification);
      return res.json({ 
        message: `✅ Notification envoyée à ${currentUser.firstName}`, 
        result 
      });
    } else if (testType === 'user' && userId) {
      // Envoyer à un utilisateur spécifique
      const targetUser = await User.findById(userId).select('pushPlayerId firstName');
      if (!targetUser || !targetUser.pushPlayerId) {
        return res.status(400).json({ 
          message: 'Cet utilisateur n\'a pas de Player ID enregistré.' 
        });
      }
      result = await oneSignalService.sendNotificationToUser(targetUser.pushPlayerId, notification);
      return res.json({ 
        message: `✅ Notification envoyée à ${targetUser.firstName}`, 
        result 
      });
    } else if (testType === 'all') {
      // Envoyer à tous
      result = await oneSignalService.sendNotificationToAll(notification);
      return res.json({ 
        message: '✅ Notification envoyée à tous les utilisateurs', 
        result 
      });
    } else {
      return res.status(400).json({ message: 'Type de test invalide' });
    }
  } catch (error) {
    console.error('❌ Erreur test notification:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi de la notification',
      error: error.message 
    });
  }
});

module.exports = router;
