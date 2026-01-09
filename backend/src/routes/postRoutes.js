const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdminRole, canCreatePost } = require('../middleware/roleCheck');
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const { notifyNewPost } = require('../services/notificationService');

// Récupérer tous les posts (avec pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'firstName lastName profilePhoto')
      .populate({
        path: 'comments.author',
        select: 'firstName lastName profilePhoto'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Erreur récupération posts:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un post (avec médias)
router.post('/', auth, canCreatePost, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]), async (req, res) => {
  try {
    const { text, linkUrl, linkText, videoUrl, pollQuestion, pollOptions, pollType, pollEndsAt } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Le texte est obligatoire' });
    }

    const postData = {
      author: req.user.userId,
      text: text.trim(),
      image: req.files?.image ? `/uploads/${req.files.image[0].filename}` : null,
      video: req.files?.video ? `/uploads/${req.files.video[0].filename}` : null,
      videoUrl: videoUrl || null,
      document: req.files?.document ? `/uploads/${req.files.document[0].filename}` : null,
      link: linkUrl ? { url: linkUrl, text: linkText || linkUrl } : null
    };

    // Ajouter le sondage si présent
    if (pollQuestion && pollOptions) {
      const options = typeof pollOptions === 'string' ? JSON.parse(pollOptions) : pollOptions;
      
      if (options.length < 2) {
        return res.status(400).json({ message: 'Un sondage doit avoir au moins 2 options' });
      }

      postData.poll = {
        question: pollQuestion,
        options: options.map(opt => ({ text: opt, votes: [] })),
        pollType: pollType || 'single',
        endsAt: pollEndsAt || null,
        isActive: true
      };
    }

    const post = new Post(postData);
    await post.save();

    // Populate pour retourner les infos auteur
    await post.populate('author', 'firstName lastName profilePhoto');

    console.log('✅ Post créé:', post._id);
    
    // Envoyer les notifications en arrière-plan (ne bloque pas la réponse)
    notifyNewPost(post).catch(err => {
      console.error('❌ Erreur notifications:', err);
    });

    res.status(201).json({ message: 'Post publié avec succès', post });
  } catch (error) {
    console.error('Erreur création post:', error);
    res.status(500).json({ message: 'Erreur lors de la création du post' });
  }
});

// Liker un post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const userId = req.user.userId;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Déjà liké → retirer le like
      post.likes.splice(likeIndex, 1);
    } else {
      // Pas encore liké → ajouter le like
      post.likes.push(userId);
    }

    await post.save();

    res.json({ 
      message: 'Like mis à jour', 
      likes: post.likes,
      likesCount: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Erreur like:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un commentaire
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Le commentaire ne peut pas être vide' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    post.comments.push({
      author: req.user.userId,
      text: text.trim()
    });

    await post.save();
    await post.populate('comments.author', 'firstName lastName profilePhoto');

    res.json({ 
      message: 'Commentaire ajouté', 
      comments: post.comments 
    });
  } catch (error) {
    console.error('Erreur commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un post (auteur ou admin/responsable)
router.patch('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    // Vérifier les permissions
    const isAuthor = post.author.toString() === req.user.userId;
    const isAdmin = ['admin', 'responsable'].includes(req.user.role);
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce post' });
    }

    // Mettre à jour uniquement les champs autorisés
    const { text, linkUrl, linkText, videoUrl } = req.body;
    
    if (text) post.text = text.trim();
    if (linkUrl !== undefined) {
      post.link = linkUrl ? { url: linkUrl, text: linkText || linkUrl } : null;
    }
    if (videoUrl !== undefined) post.videoUrl = videoUrl || null;

    await post.save();
    await post.populate('author', 'firstName lastName profilePhoto');

    res.json({ message: 'Post modifié avec succès', post });
  } catch (error) {
    console.error('Erreur modification post:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un post (réservé aux responsables et admins)
router.delete('/:id', auth, requireAdminRole, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression post:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un commentaire (auteur ou admin/responsable)
router.patch('/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Le commentaire ne peut pas être vide' });
    }

    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Vérifier les permissions
    const isAuthor = comment.author.toString() === req.user.userId;
    const isAdmin = ['admin', 'responsable'].includes(req.user.role);
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce commentaire' });
    }

    comment.text = text.trim();
    await post.save();
    await post.populate('comments.author', 'firstName lastName profilePhoto');

    res.json({ message: 'Commentaire modifié avec succès', comments: post.comments });
  } catch (error) {
    console.error('Erreur modification commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un commentaire (auteur ou admin/responsable)
router.delete('/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Vérifier les permissions (auteur ou admin/responsable)
    const isAuthor = comment.author.toString() === req.user.userId;
    const isAdmin = ['admin', 'responsable'].includes(req.user.role);
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce commentaire' });
    }

    comment.remove();
    await post.save();
    await post.populate('comments.author', 'firstName lastName profilePhoto');

    res.json({ message: 'Commentaire supprimé avec succès', comments: post.comments });
  } catch (error) {
    console.error('Erreur suppression commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Voter sur un sondage
router.post('/:id/poll/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post || !post.poll || !post.poll.question) {
      return res.status(404).json({ message: 'Sondage non trouvé' });
    }

    if (!post.poll.isActive) {
      return res.status(400).json({ message: 'Ce sondage est fermé' });
    }

    if (post.poll.endsAt && new Date() > new Date(post.poll.endsAt)) {
      post.poll.isActive = false;
      await post.save();
      return res.status(400).json({ message: 'Ce sondage est terminé' });
    }

    if (optionIndex === undefined || optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({ message: 'Option invalide' });
    }

    const userId = req.user.userId;

    // Vérifier si l'utilisateur a déjà voté
    const hasVoted = post.poll.options.some(opt => 
      opt.votes.some(v => v.user.toString() === userId)
    );

    if (hasVoted && !post.poll.allowMultipleVotes) {
      // Retirer le vote précédent si on change de vote
      post.poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(v => v.user.toString() !== userId);
      });
    }

    // Ajouter le nouveau vote
    post.poll.options[optionIndex].votes.push({ user: userId });
    await post.save();

    // Retourner le poll complet avec la structure attendue par le frontend
    res.json({ 
      message: 'Vote enregistré', 
      poll: {
        question: post.poll.question,
        options: post.poll.options.map(opt => ({
          text: opt.text,
          votes: opt.votes
        })),
        pollType: post.poll.pollType,
        isActive: post.poll.isActive,
        endsAt: post.poll.endsAt
      }
    });
  } catch (error) {
    console.error('Erreur vote sondage:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
