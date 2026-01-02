/**
 * Routes API pour la gestion des paramètres du site
 * Accessible uniquement aux administrateurs avec système de verrouillage
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { cloudinaryUpload, uploadToCloudinary } = require('../middleware/cloudinaryUpload');
const settingsController = require('../controllers/settingsController');
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
router.get('/lock/status', auth, requireAdmin, checkSettingsLockStatus); // Vérifier état du verrou
router.post('/lock/acquire', auth, requireAdmin, acquireSettingsLock, (req, res) => {
  res.json({ message: 'Verrou acquis avec succès', locked: true });
}); // Acquérir le verrou
router.post('/lock/release', auth, requireAdmin, releaseSettingsLock); // Libérer le verrou
router.post('/lock/force-release', auth, requireAdmin, forceReleaseSettingsLock); // Forcer libération (urgence)
router.put('/', auth, requireAdmin, acquireSettingsLock, settingsController.updateSettings);
router.post('/reset', auth, requireAdmin, acquireSettingsLock, settingsController.resetSettings);
router.post('/upload-logo', auth, requireAdmin, acquireSettingsLock, cloudinaryUpload, uploadToCloudinary, settingsController.uploadLogo);

module.exports = router;
