const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du campus est obligatoire'],
    unique: true,
    enum: ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'],
  },
  paypalEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Permettre vide OU valide email
        if (!v || v === '') return true;
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Email PayPal invalide'
    }
  },
  iban: {
    type: String,
    trim: true,
    uppercase: true,
  },
  redistributionPercentage: {
    type: Number,
    default: 100, // 100% par défaut
    min: [0, 'Le pourcentage ne peut pas être négatif'],
    max: [100, 'Le pourcentage ne peut pas dépasser 100'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  contactPerson: {
    name: String,
    email: String,
    phone: String,
  },
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    comment: 'Responsable affecté à ce campus pour valider les paiements en espèces'
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Campus', campusSchema);
