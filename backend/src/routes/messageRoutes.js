const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/roleCheck');
const Message = require('../models/Message');
const User = require('../models/User');
const pushService = require('../services/pushService');
const oneSignalService = require('../services/oneSignalService');

// Récupérer la liste des responsables pour la sélection
router.get('/responsables', auth, async (req, res) => {
  try {
    const responsables = await User.find({ 
      role: { $in: ['responsable', 'admin', 'referent'] },
      isActive: true 
    })
    .select('firstName lastName email role profilePhoto')
    .sort({ firstName: 1, lastName: 1 });

    res.json(responsables);
  } catch (error) {
    console.error('❌ Erreur récupération responsables:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des responsables' });
  }
});

// Compter les messages non lus (sans les marquer comme lus)
router.get('/unread-count', auth, async (req, res) => {
  try {
    const messages = await Message.find({ 
      'recipients.user': req.user.userId 
    });

    // Compter uniquement les messages où l'utilisateur n'a pas encore lu
    const unreadCount = messages.filter(m => {
      const recipient = m.recipients.find(r => r.user._id.toString() === req.user.userId);
      return recipient && !recipient.read;
    }).length;

    res.json({ unreadCount });
  } catch (error) {
    console.error('❌ Erreur comptage messages non lus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Envoyer un message
router.post('/', auth, async (req, res) => {
  try {
    const { subject, content, recipientType, recipientIds, isAnonymous, priority } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Le sujet et le contenu sont obligatoires' });
    }

    let recipients = [];

    if (recipientType === 'all-responsables') {
      // Envoyer à tous les responsables et admins
      const responsables = await User.find({ 
        role: { $in: ['responsable', 'admin'] },
        isActive: true 
      });
      recipients = responsables.map(u => ({ 
        user: u._id, 
        role: u.role,
        read: false 
      }));
    } else if (recipientType === 'all-users') {
      // Envoyer à tous les utilisateurs
      const users = await User.find({ isActive: true });
      recipients = users.map(u => ({ 
        user: u._id, 
        role: u.role,
        read: false 
      }));
    } else if (recipientType === 'specific' && recipientIds && recipientIds.length > 0) {
      // Envoyer à des utilisateurs spécifiques
      const users = await User.find({ 
        _id: { $in: recipientIds },
        isActive: true 
      });
      recipients = users.map(u => ({ 
        user: u._id, 
        role: u.role,
        read: false 
      }));
    } else {
      return res.status(400).json({ message: 'Type de destinataire invalide' });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: 'Aucun destinataire trouvé' });
    }

    const message = new Message({
      sender: isAnonymous ? null : req.user.userId,
      isAnonymous: isAnonymous || false,
      recipients,
      recipientType,
      subject,
      content,
      priority: priority || 'normal',
      status: 'unread'
    });

    await message.save();

    // Envoyer notifications push aux destinataires (Web Push natif)
    const sender = await User.findById(req.user.userId).select('firstName lastName');
    recipients.forEach(recipient => {
      pushService.notifyNewMessage({
        _id: message._id,
        content: content.substring(0, 100),
        sender: sender
      }, recipient.user).catch(err => {
        console.error('❌ Erreur notification push message:', err);
      });
    });

    // Envoyer notifications OneSignal
    try {
      const recipientUsers = await User.find({ 
        _id: { $in: recipients.map(r => r.user) },
        pushPlayerId: { $exists: true, $ne: null }
      }).select('pushPlayerId');

      const playerIds = recipientUsers.map(u => u.pushPlayerId);
      
      if (playerIds.length > 0) {
        await oneSignalService.sendNotificationToUsers(playerIds, {
          title: `💬 Nouveau message${isAnonymous ? '' : ` de ${sender.firstName}`}`,
          message: `${subject}: ${content.substring(0, 100)}...`,
          url: 'https://gjsdecrpt.fr/messages',
          data: { type: 'message', messageId: message._id }
        });
        console.log(`✅ Notification OneSignal envoyée à ${playerIds.length} users`);
      }
    } catch (error) {
      console.error('❌ Erreur notification OneSignal:', error);
    }

    res.status(201).json({ 
      message: 'Message envoyé avec succès', 
      messageId: message._id,
      recipientsCount: recipients.length
    });
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
});

// Récupérer les messages reçus
router.get('/inbox', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { 
      'recipients.user': req.user.userId 
    };

    if (status) {
      query.status = status;
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName email role profilePhoto')
      .populate('recipients.user', 'firstName lastName email role')
      .populate('replies.author', 'firstName lastName email role profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    // Marquer comme lu si pas encore lu
    const unreadMessages = messages.filter(m => {
      const recipient = m.recipients.find(r => r.user._id.toString() === req.user.userId);
      return recipient && !recipient.read;
    });

    for (const msg of unreadMessages) {
      const recipient = msg.recipients.find(r => r.user._id.toString() === req.user.userId);
      if (recipient) {
        recipient.read = true;
        recipient.readAt = new Date();
        if (msg.status === 'unread') {
          msg.status = 'read';
        }
        await msg.save();
      }
    }

    res.json({
      messages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les messages envoyés
router.get('/sent', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ 
      sender: req.user.userId 
    })
      .populate('recipients.user', 'firstName lastName email role')
      .populate('replies.author', 'firstName lastName email role profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ sender: req.user.userId });

    res.json({
      messages,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('❌ Erreur récupération messages envoyés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer un message par ID
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName email role profilePhoto')
      .populate('recipients.user', 'firstName lastName email role profilePhoto')
      .populate('replies.author', 'firstName lastName email role profilePhoto')
      .populate('replies.recipientsForReply', 'firstName lastName email role');

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est destinataire ou expéditeur
    const isRecipient = message.recipients.some(r => r.user._id.toString() === req.user.userId);
    const isSender = message.sender && message.sender._id.toString() === req.user.userId;

    if (!isRecipient && !isSender) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    res.json({ message });
  } catch (error) {
    console.error('❌ Erreur récupération message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Répondre à un message
router.post('/:id/reply', auth, requireAdminRole, async (req, res) => {
  try {
    const { content, replyType, recipientIds } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Le contenu de la réponse est obligatoire' });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    let recipientsForReply = [];

    if (replyType === 'private') {
      // Répondre uniquement à l'expéditeur (si pas anonyme)
      if (message.sender) {
        recipientsForReply = [message.sender];
      }
    } else if (replyType === 'all-users') {
      // Répondre à tous les utilisateurs
      const users = await User.find({ isActive: true });
      recipientsForReply = users.map(u => u._id);
    } else if (replyType === 'all-responsables') {
      // Répondre à tous les responsables
      const responsables = await User.find({ 
        role: { $in: ['responsable', 'admin'] },
        isActive: true 
      });
      recipientsForReply = responsables.map(u => u._id);
    } else if (replyType === 'specific' && recipientIds && recipientIds.length > 0) {
      recipientsForReply = recipientIds;
    }

    message.replies.push({
      author: req.user.userId,
      content: content.trim(),
      replyType,
      recipientsForReply
    });

    message.status = 'replied';
    message.updatedAt = new Date();
    await message.save();

    await message.populate('replies.author', 'firstName lastName email role profilePhoto');
    await message.populate('replies.recipientsForReply', 'firstName lastName email role');

    res.json({ 
      message: 'Réponse envoyée avec succès', 
      messageData: message 
    });
  } catch (error) {
    console.error('❌ Erreur réponse message:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la réponse' });
  }
});

// Archiver un message
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est destinataire
    const isRecipient = message.recipients.some(r => r.user.toString() === req.user.userId);

    if (!isRecipient) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    message.status = 'archived';
    await message.save();

    res.json({ message: 'Message archivé' });
  } catch (error) {
    console.error('❌ Erreur archivage message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
