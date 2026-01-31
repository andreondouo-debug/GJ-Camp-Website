const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  firstName: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    trim: true,
    lowercase: true
  },
  sex: {
    type: String,
    required: [true, 'Le sexe est obligatoire'],
    enum: ['M', 'F']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'La date de naissance est obligatoire']
  },
  address: {
    type: String,
    required: [true, "L'adresse postale est obligatoire"],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est obligatoire'],
    trim: true
  },
  refuge: {
    type: String,
    required: [true, 'Le refuge CRPT est obligatoire'],
    enum: ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres']
  },
  hasAllergies: {
    type: Boolean,
    default: false
  },
  allergyDetails: {
    type: String,
    trim: true
  },
  // RGPD - Consentement parental pour mineurs <15 ans (Article 8 RGPD)
  parentalConsent: {
    isMinor: {
      type: Boolean,
      default: false,
      comment: 'True si participant a moins de 15 ans à la date d\'inscription'
    },
    parentName: {
      type: String,
      trim: true,
      comment: 'Nom complet du parent ou tuteur légal'
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      comment: 'Email du parent pour contact légal'
    },
    parentPhone: {
      type: String,
      trim: true,
      comment: 'Téléphone du parent'
    },
    consentGivenAt: {
      type: Date,
      comment: 'Date et heure du consentement parental'
    },
    consentConfirmed: {
      type: Boolean,
      default: false,
      comment: 'Parent a explicitement accepté le traitement des données'
    }
  },
  totalPrice: {
    type: Number,
    default: 120
  },
  amountPaid: {
    type: Number,
    required: [true, 'Le montant payé est obligatoire'],
    min: [0, 'Le montant ne peut pas être négatif'],
    max: [120, 'Le montant ne peut pas dépasser 120 euros'],
    default: 0
  },
  amountRemaining: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'cash', 'mixed'],
    default: 'paypal'
  },
  cashPayments: [{
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'validated', 'rejected'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validatedAt: Date,
    note: String,
    rejectionReason: String
  }],
  paymentDetails: {
    orderId: String,
    payerId: String,
    payerEmail: String,
    status: String,
    amountPaid: Number,
    paymentDate: {
      type: Date,
      default: Date.now
    }
  },
  paypalMode: {
    type: String,
    enum: ['sandbox', 'live', 'cash'],
    default: 'sandbox',
    index: true // Pour filtrer facilement les inscriptions par mode
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registration', registrationSchema);
