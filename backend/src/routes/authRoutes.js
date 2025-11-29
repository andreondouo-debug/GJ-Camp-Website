const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

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
router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);
router.post('/check-email', authController.checkEmail);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Routes protégées
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.post('/upload-photo', auth, upload.single('profilePhoto'), authController.uploadPhoto);
router.patch('/update-selected-activities', auth, authController.updateSelectedActivities);
// Enregistrer les choix d'activités par créneau
router.patch('/update-selected-creneaux', auth, authController.updateSelectedCreneaux);

module.exports = router;
