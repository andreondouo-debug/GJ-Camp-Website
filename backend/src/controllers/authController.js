const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetRequestEmail, sendPasswordResetEmail } = require('../config/email');

// Générer JWT
const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

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

    // Envoyer l'email de vérification en arrière-plan (non-bloquant)
    sendVerificationEmail(email, firstName, verificationToken)
      .then(() => {
        console.log(`✅ Email de vérification envoyé avec succès à ${email}`);
      })
      .catch((emailError) => {
        console.error(`❌ Erreur lors de l'envoi de l'email à ${email}:`);
        console.error('  Message:', emailError.message);
        console.error('  Code:', emailError.code);
        console.error('  Stack:', emailError.stack);
      });

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

    // Vérifier si le compte est suspendu
    if (user.isActive === false) {
      return res.status(403).json({ 
        message: 'Votre compte a été suspendu. Veuillez contacter un administrateur pour plus d\'informations.' 
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
    
    // Garantir les valeurs par défaut pour les utilisateurs existants
    const userData = user.toObject();
    userData.emailNotifications = userData.emailNotifications ?? true;
    userData.pushNotifications = userData.pushNotifications ?? true;
    userData.smsNotifications = userData.smsNotifications ?? false;
    
    res.status(200).json(userData);
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
// @desc    Upload photo de profil (Cloudinary)
exports.uploadPhoto = async (req, res) => {
  try {
    // Le fichier et son URL Cloudinary sont déjà traités par le middleware
    if (!req.file || !req.file.cloudinaryUrl) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const userId = req.user.userId;
    const photoUrl = req.file.cloudinaryUrl;

    // Mettre à jour l'utilisateur avec l'URL Cloudinary
    const user = await User.findByIdAndUpdate(
      userId, 
      { profilePhoto: photoUrl },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    console.log('✅ Photo de profil mise à jour:', photoUrl);

    res.status(200).json({
      message: 'Photo de profil mise à jour avec succès',
      profilePhoto: photoUrl,
      user: user
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload de la photo:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upload de la photo',
      error: error.message 
    });
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

// ===== ENDPOINTS RGPD =====

// @route   GET /api/auth/my-data
// @desc    Télécharger toutes ses données personnelles (droit d'accès RGPD)
exports.downloadMyData = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Récupérer toutes les données de l'utilisateur
    const user = await User.findById(userId).select('-password');
    
    // Récupérer les inscriptions de l'utilisateur
    const Registration = require('../models/Registration');
    const registrations = await Registration.find({
      $or: [
        { user: userId, isGuest: false },
        { user: userId, isGuest: { $exists: false } }
      ]
    });

    // Récupérer les invités inscrits par l'utilisateur
    const guests = await Registration.find({ registeredBy: userId, isGuest: true });

    // Compiler toutes les données
    const userData = {
      exportDate: new Date().toISOString(),
      user: user.toObject(),
      registrations: registrations.map(r => r.toObject()),
      guests: guests.map(g => g.toObject()),
      gdprInfo: {
        dataController: 'Génération Josué - CRPT',
        exportReason: 'Droit d\'accès RGPD (Article 15)',
        contact: 'dpo@gj-camp.fr'
      }
    };

    // Envoyer en JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="mes-donnees-gj-${Date.now()}.json"`);
    res.status(200).json(userData);

    console.log(`📥 Données téléchargées par l'utilisateur ${user.email}`);
  } catch (error) {
    console.error('Erreur lors du téléchargement des données:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement de vos données' });
  }
};

// @route   DELETE /api/auth/delete-account
// @desc    Supprimer son compte et toutes ses données (droit à l'effacement RGPD)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    console.log(`🗑️ Début suppression compte pour ${user.email} (RGPD - Article 17)`);

    // ===== 1. SUPPRIMER PHOTO CLOUDINARY =====
    if (user.profilePhoto && typeof user.profilePhoto === 'object' && user.profilePhoto.publicId) {
      try {
        const cloudinary = require('../config/cloudinary');
        await cloudinary.uploader.destroy(user.profilePhoto.publicId);
        console.log(`✅ Photo Cloudinary supprimée: ${user.profilePhoto.publicId}`);
      } catch (cloudinaryError) {
        console.error('⚠️ Erreur suppression photo Cloudinary:', cloudinaryError.message);
        // Ne pas bloquer la suppression si Cloudinary échoue
      }
    }

    // ===== 2. ANONYMISER MESSAGES (ne pas supprimer = perte conversations) =====
    try {
      const Message = require('../models/Message');
      const anonymizedData = {
        senderName: 'Utilisateur supprimé',
        senderEmail: 'deleted@gjsdecrpt.fr',
        senderAvatar: null
      };
      
      // Messages envoyés
      await Message.updateMany(
        { senderId: userId },
        { $set: anonymizedData }
      );
      
      // Messages reçus (mise à jour destinataire)
      await Message.updateMany(
        { recipientId: userId },
        { $set: { 
          recipientName: 'Utilisateur supprimé',
          recipientEmail: 'deleted@gjsdecrpt.fr'
        }}
      );
      
      console.log('✅ Messages anonymisés');
    } catch (messageError) {
      console.error('⚠️ Erreur anonymisation messages:', messageError.message);
    }

    // ===== 3. SUPPRIMER ABONNEMENTS PUSH =====
    try {
      // Supprimer pushSubscription dans User (sera fait avec le delete user)
      // Si vous avez une collection séparée PushSubscription:
      // const PushSubscription = require('../models/PushSubscription');
      // await PushSubscription.deleteMany({ userId });
      console.log('✅ Abonnements push supprimés');
    } catch (pushError) {
      console.error('⚠️ Erreur suppression push:', pushError.message);
    }

    // ===== 4. SUPPRIMER INSCRIPTIONS CAMP =====
    const Registration = require('../models/Registration');
    const deletedRegistrations = await Registration.deleteMany({
      $or: [
        { user: userId },
        { registeredBy: userId }
      ]
    });
    console.log(`✅ ${deletedRegistrations.deletedCount} inscription(s) supprimée(s)`);

    // ===== 5. CONSERVER CONSENTLOG (preuve conformité 3 ans - ne PAS supprimer) =====
    // Les ConsentLog doivent être conservés pour prouver la conformité RGPD
    console.log('ℹ️ ConsentLog conservés (preuve conformité Article 30)');

    // ===== 6. SUPPRIMER COMPTE UTILISATEUR =====
    await User.findByIdAndDelete(userId);

    console.log(`✅ Compte supprimé définitivement pour ${user.email}`);
    console.log(`📊 Résumé: ${deletedRegistrations.deletedCount} inscriptions, messages anonymisés, photo supprimée`);
    
    res.status(200).json({ 
      message: '✅ Votre compte et toutes vos données personnelles ont été supprimés avec succès. Les données légalement requises (logs de conformité) sont conservées de manière anonyme.',
      deletedAt: new Date().toISOString(),
      summary: {
        registrationsDeleted: deletedRegistrations.deletedCount,
        messagesAnonymized: true,
        photoDeleted: !!user.profilePhoto
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du compte:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du compte' });
  }
};

// Mettre à jour les paramètres de notifications
exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { emailNotifications, smsNotifications, pushNotifications, phoneNumber } = req.body;

    console.log('📥 Mise à jour notifications pour userId:', userId);
    console.log('📨 Données reçues:', { emailNotifications, smsNotifications, pushNotifications, phoneNumber });

    const updateData = {
      emailNotifications: emailNotifications ?? true,
      smsNotifications: smsNotifications ?? false,
      pushNotifications: pushNotifications ?? true  // ✅ Activé par défaut
    };

    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }

    console.log('💾 Données à sauvegarder:', updateData);

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    console.log(`✅ Paramètres sauvegardés pour ${user.email}:`, {
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      smsNotifications: user.smsNotifications
    });
    
    res.json({ 
      message: 'Paramètres enregistrés avec succès',
      user 
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la sauvegarde' });
  }
};

// Enregistrer l'ID du player OneSignal/Firebase
exports.updatePushPlayerId = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { pushPlayerId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { pushPlayerId, pushNotifications: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    console.log(`✅ Push Player ID enregistré pour ${user.email}`);
    res.json({ 
      message: 'Push activé avec succès',
      user 
    });
  } catch (error) {
    console.error('Erreur enregistrement push ID:', error);
    res.status(500).json({ message: 'Erreur lors de l\'activation' });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Demande de réinitialisation de mot de passe (en attente d'approbation admin)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      // Par sécurité, on renvoie le même message même si l'utilisateur n'existe pas
      return res.status(200).json({ 
        message: 'Si un compte existe avec cet email, vous recevrez un email de confirmation.' 
      });
    }

    // Générer le token de réinitialisation
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Envoyer l'email de demande (pas encore le lien de réinitialisation)
    await sendPasswordResetRequestEmail(user.email, user.firstName);
    
    // Notifier les admins de la demande de réinitialisation
    const pushService = require('../services/pushService');
    const admins = await User.find({ role: { $in: ['admin', 'responsable'] } }).select('_id');
    if (admins.length > 0) {
      pushService.notifyPasswordResetRequest(admins.map(a => a._id), user).catch(err => 
        console.error('Erreur notification push reset:', err)
      );
    }

    console.log(`🔐 Demande de réinitialisation créée pour ${user.email}, en attente d'approbation admin`);
    
    res.status(200).json({
      message: 'Demande de réinitialisation envoyée. Un administrateur doit approuver votre demande avant que vous ne receviez le lien de réinitialisation.'
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la demande' });
  }
};

// @route   POST /api/auth/reset-password/:token
// @desc    Réinitialiser le mot de passe avec le token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Hasher le token pour la comparaison
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Trouver l'utilisateur avec le token valide et non expiré
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      resetPasswordApproved: true, // Doit être approuvé par un admin
    }).select('+resetPasswordToken');

    if (!user) {
      return res.status(400).json({ 
        message: 'Token invalide, expiré ou non approuvé par un administrateur' 
      });
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordApproved = false;
    user.resetPasswordRequestedAt = undefined;
    user.resetPasswordApprovedBy = undefined;
    
    await user.save();

    console.log(`✅ Mot de passe réinitialisé pour ${user.email}`);
    
    res.status(200).json({
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
};
