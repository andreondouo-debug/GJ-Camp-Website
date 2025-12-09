const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
  },
  campus: {
    type: String,
    required: true,
    enum: ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'],
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est obligatoire'],
    min: [0, 'Le montant doit être supérieur ou égal à 0'],
  },
  originalAmount: {
    type: Number,
    required: true,
  },
  redistributionPercentage: {
    type: Number,
    required: true,
    default: 100,
  },
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  recipientType: {
    type: String,
    enum: ['paypal', 'bank'],
    default: 'paypal',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
    default: 'pending',
  },
  paypalBatchId: {
    type: String,
    trim: true,
  },
  paypalPayoutItemId: {
    type: String,
    trim: true,
  },
  transactionId: {
    type: String,
    trim: true,
  },
  paypalFee: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    trim: true,
  },
  processedAt: {
    type: Date,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index pour recherche rapide
payoutSchema.index({ campus: 1, status: 1 });
payoutSchema.index({ registration: 1 });
payoutSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payout', payoutSchema);
