const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide'],
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: 6,
    select: false,
  },
  churchWebsite: {
    type: String,
    trim: true,
    default: null,
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: null,
  },
  ministryRole: {
    type: String,
    trim: true,
    default: null,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 600,
    default: '',
  },
  socialLinks: {
    type: Map,
    of: String,
    default: () => ({}),
  },
  role: {
    type: String,
    enum: ROLES,
    default: 'utilisateur',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
  resetPasswordRequestedAt: {
    type: Date,
    default: null,
  },
  resetPasswordApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resetPasswordApproved: {
    type: Boolean,
    default: false,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
    comment: 'Compte actif ou désactivé par un admin'
  },
  deactivatedAt: {
    type: Date,
    default: null
  },
  deactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deactivationReason: {
    type: String,
    default: null
  },
  emailVerifiedAt: {
    type: Date,
    default: null,
  },
  selectedActivities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  // Mapping créneau -> activité choisie
  selectedCreneaux: {
    type: Object,
    default: {},
  },
  // Préférences de notifications
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  smsNotifications: {
    type: Boolean,
    default: false,
  },
  pushNotifications: {
    type: Boolean,
    default: false,
  },
  pushPlayerId: {
    type: String,
    default: null,
  },
  // Permissions
  canCreatePost: {
    type: Boolean,
    default: true, // Par défaut, tous peuvent créer des posts
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password avant de sauvegarder
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    // Réduit à 8 rounds pour améliorer les performances sur Render free tier
    // (toujours sécurisé, mais 4x plus rapide que 10 rounds)
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Harmoniser les anciens rôles lors de la validation
userSchema.pre('validate', function(next) {
  if (this.role === 'user') {
    this.role = 'utilisateur';
  }
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Générer un token de vérification d'email
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Token expire dans 24 heures
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Générer un token de réinitialisation de mot de passe
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Token expire dans 24 heures
  this.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;
  this.resetPasswordRequestedAt = Date.now();
  this.resetPasswordApproved = false;
  
  return resetToken;
};

// Supprimer le mot de passe lors de la sérialisation
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
