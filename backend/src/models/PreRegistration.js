const mongoose = require('mongoose');

/**
 * 🔄 Pre-Registration Model
 * 
 * Stocke les demandes d'inscription AVANT validation du paiement.
 * Une fois le paiement validé par un responsable, la PreRegistration
 * est convertie en Registration complète.
 * 
 * Utilisé pour les paiements en espèces uniquement.
 */
const preRegistrationSchema = new mongoose.Schema({
  // Utilisateur qui fait la demande (null si compte pas encore créé - cas Revolut)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Mot de passe hashé (uniquement si le compte n'existe pas encore - cas Revolut)
  password: {
    type: String,
    default: null,
    select: false
  },

  // Méthode de paiement déclarée ('cash' ou 'revolut')
  paymentMethod: {
    type: String,
    enum: ['cash', 'revolut'],
    default: 'cash'
  },

  // Nombre de jours de présence (1j=40€, 2j=80€, 3j=120€)
  numberOfDays: {
    type: Number,
    enum: [1, 2, 3],
    default: 3
  },
  
  // Invité ou non
  isGuest: {
    type: Boolean,
    default: false
  },
  
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Informations personnelles
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  sex: {
    type: String,
    enum: ['M', 'F'],
    required: true
  },
  
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  address: {
    type: String,
    required: true
  },
  
  phone: {
    type: String,
    required: true
  },
  
  // Campus
  refuge: {
    type: String,
    required: true
  },
  
  // Allergies
  hasAllergies: {
    type: Boolean,
    default: false
  },
  
  allergyDetails: {
    type: String,
    default: null
  },
  
  // Paiement déclaré en espèces
  cashAmount: {
    type: Number,
    required: true,
    min: 20,
    max: 120
  },
  
  // Statut de la demande
  status: {
    type: String,
    enum: ['pending', 'validated', 'rejected', 'expired'],
    default: 'pending'
  },
  
  // Dates
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  validatedAt: {
    type: Date,
    default: null
  },
  
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  rejectedAt: {
    type: Date,
    default: null
  },
  
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  rejectionReason: {
    type: String,
    default: null
  },
  
  // Référence à l'inscription créée après validation
  registrationCreated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    default: null
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index pour recherche rapide
preRegistrationSchema.index({ user: 1, status: 1 });
preRegistrationSchema.index({ refuge: 1, status: 1 });
preRegistrationSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('PreRegistration', preRegistrationSchema);
