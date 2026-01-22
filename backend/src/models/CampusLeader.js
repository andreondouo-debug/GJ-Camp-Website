const mongoose = require('mongoose');

const campusLeaderSchema = new mongoose.Schema({
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: true
  },
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
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    url: String,
    publicId: String
  },
  role: {
    type: String,
    default: 'Responsable Campus',
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour accélérer les requêtes
campusLeaderSchema.index({ campus: 1, order: 1 });
campusLeaderSchema.index({ isActive: 1 });

const CampusLeader = mongoose.model('CampusLeader', campusLeaderSchema);

module.exports = CampusLeader;
