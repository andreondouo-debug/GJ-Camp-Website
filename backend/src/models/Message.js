const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Expéditeur (null si anonyme)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    comment: 'Null si message anonyme'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Destinataires
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      comment: 'Rôle du destinataire au moment de l\'envoi'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  }],
  
  // Type de destinataires
  recipientType: {
    type: String,
    enum: ['specific', 'all-responsables', 'all-users', 'role-based'],
    default: 'specific'
  },
  
  // Contenu
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  // Réponses
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    replyType: {
      type: String,
      enum: ['private', 'all-users', 'all-responsables', 'specific'],
      default: 'private',
      comment: 'À qui la réponse est destinée'
    },
    recipientsForReply: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statut
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  
  // Priorité
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Édition du message
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  
  // Suppressions individuelles (supprimer pour moi)
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Suppression totale (supprimer pour tous)
  isDeletedForAll: {
    type: Boolean,
    default: false
  },
  deletedForAllAt: {
    type: Date,
    default: null
  },
  deletedForAllBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour recherche et tri
messageSchema.index({ 'recipients.user': 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
