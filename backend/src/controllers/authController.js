// @route   PATCH /api/auth/update-selected-creneaux
// @desc    Enregistrer les choix d'activités par créneau pour l'utilisateur connecté
exports.updateSelectedCreneaux = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { selectedCreneaux } = req.body;
    if (!selectedCreneaux || typeof selectedCreneaux !== 'object') {
      return res.status(400).json({ message: 'selectedCreneaux doit être un objet' });
    }
    await User.findByIdAndUpdate(userId, { selectedCreneaux });
    console.log(`✅ Choix de créneaux mis à jour pour l'utilisateur ${userId}`);
    res.status(200).json({
      message: 'Choix de créneaux enregistrés avec succès',
      selectedCreneaux
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des créneaux:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des créneaux' });
  }
};
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../config/email');

// Générer JWT
const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @route   POST /api/auth/signup
// @desc    Inscription d'un nouvel utilisateur
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, churchWebsite } = req.body;

    // Vérifier si l'utilisateur existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        message: '❌ Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter.' 
      });
    }

    // Créer un nouvel utilisateur
    user = new User({
      firstName,
      lastName,
      email,
      password,
      churchWebsite,
    });

    // Générer le token de vérification d'email
    const verificationToken = user.generateEmailVerificationToken();

    await user.save();

    // Envoyer l'email de vérification
    try {
      await sendVerificationEmail(email, firstName, verificationToken);
      console.log(`✉️ Email de vérification envoyé à ${email}`);
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue quand même l'inscription
    }

    const sanitizedUser = await User.findById(user._id);
    const token = generateToken(sanitizedUser);

    res.status(201).json({
      message: 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
      token,
      user: sanitizedUser.toJSON(),
      emailSent: true,
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.' });
  }
};

// @route   POST /api/auth/check-email
// @desc    Vérifier si un email est déjà utilisé
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    const user = await User.findOne({ email });
    
    if (user) {
      return res.status(200).json({ 
        available: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    res.status(200).json({ 
      available: true, 
      message: 'Cet email est disponible' 
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification' });
  }
};

// @route   POST /api/auth/login
// @desc    Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        message: 'Aucun compte trouvé avec cet email. Veuillez vérifier votre email ou créer un compte.' 
      });
    }

    // Vérifier le mot de passe
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        message: 'Mot de passe incorrect. Veuillez réessayer.' 
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const freshUser = await User.findById(user._id);
    const token = generateToken(freshUser);

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: freshUser.toJSON(),
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      message: 'Une erreur est survenue lors de la connexion. Veuillez réessayer.' 
    });
  }
};

// @route   GET /api/auth/me
// @desc    Récupérer le profil de l'utilisateur connecté
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -emailVerificationToken -emailVerificationExpires');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/auth/profile
// @desc    Mettre à jour le profil de l'utilisateur
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      churchWebsite,
      phoneNumber,
      bio,
      ministryRole,
      socialLinks,
    } = req.body;

    const allowedUpdates = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(churchWebsite !== undefined && { churchWebsite }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(bio !== undefined && { bio }),
      ...(ministryRole !== undefined && { ministryRole }),
    };

    if (socialLinks && typeof socialLinks === 'object') {
      const cleanedLinks = Object.entries(socialLinks).reduce((acc, [key, value]) => {
        if (typeof value === 'string' && value.trim() !== '') {
          acc[key] = value.trim();
        }
        return acc;
      }, {});
      allowedUpdates.socialLinks = cleanedLinks;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Profil mis à jour',
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/auth/verify-email/:token
// @desc    Vérifier l'email avec le token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hasher le token reçu pour le comparer
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Trouver l'utilisateur avec ce token qui n'a pas expiré
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        message: 'Token invalide ou expiré. Veuillez demander un nouveau lien de vérification.',
      });
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      message: '✅ Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
      success: true,
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la vérification.',
    });
  }
};

// @route   POST /api/auth/resend-verification
// @desc    Renvoyer l'email de vérification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'Aucun compte trouvé avec cet email.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: 'Cet email est déjà vérifié.',
      });
    }

    // Générer un nouveau token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Renvoyer l'email
    await sendVerificationEmail(email, user.firstName, verificationToken);

    res.status(200).json({
      message: '📧 Email de vérification renvoyé ! Veuillez vérifier votre boîte de réception.',
      success: true,
    });
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de l\'envoi de l\'email.',
    });
  }
};

// @route   POST /api/auth/upload-photo
// @desc    Upload photo de profil
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const userId = req.user.userId;
    const photoUrl = `/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(userId, { profilePhoto: photoUrl });

    res.status(200).json({
      message: 'Photo de profil mise à jour avec succès',
      profilePhoto: photoUrl
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload de la photo' });
  }
};

// @desc    Mettre à jour les activités sélectionnées
exports.updateSelectedActivities = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { selectedActivities } = req.body;

    if (!Array.isArray(selectedActivities)) {
      return res.status(400).json({ message: 'selectedActivities doit être un tableau' });
    }

    await User.findByIdAndUpdate(userId, { selectedActivities });

    console.log(`✅ Activités mises à jour pour l'utilisateur ${userId}`);
    res.status(200).json({
      message: 'Activités mises à jour avec succès',
      selectedActivities
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des activités:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des activités' });
  }
};
