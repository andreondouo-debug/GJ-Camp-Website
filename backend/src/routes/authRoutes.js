const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const requireCampRegistration = require('../middleware/requireCampRegistration');
const { profilePhotoUpload, uploadProfilePhotoToCloudinary } = require('../middleware/profilePhotoUpload');

const router = express.Router();

// Validation middleware
const signupValidation = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est obligatoire'),
  body('lastName').trim().notEmpty().withMessage('Le nom est obligatoire'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est obligatoire'),
];

// Routes publiques
// ❌ SIGNUP DÉSACTIVÉ: Utiliser l'inscription au camp pour créer un compte
router.post('/signup', (req, res) => {
  res.status(410).json({ 
    message: '❌ La création de compte classique est désactivée. Veuillez vous inscrire au camp pour créer votre compte.',
    redirectTo: '/inscription'
  });
});
router.post('/login', loginValidation, authController.login);
router.post('/check-email', authController.checkEmail);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Routes de réinitialisation de mot de passe
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Routes protégées
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.post('/upload-photo', auth, profilePhotoUpload, uploadProfilePhotoToCloudinary, authController.uploadPhoto);
router.patch('/update-selected-activities', auth, requireCampRegistration, authController.updateSelectedActivities);
// Enregistrer les choix d'activités par créneau (nécessite inscription validée)
router.patch('/update-selected-creneaux', auth, requireCampRegistration, authController.updateSelectedCreneaux);

// Routes RGPD
router.get('/my-data', auth, authController.downloadMyData);
router.delete('/delete-account', auth, authController.deleteAccount);

// Paramètres de notifications
router.put('/notification-settings', auth, authController.updateNotificationSettings);
router.put('/push-player-id', auth, authController.updatePushPlayerId);

module.exports = router;
