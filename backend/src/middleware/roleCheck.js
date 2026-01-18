const { ADMIN_ROLES, MANAGEMENT_ROLES } = require('../constants/roles');
const User = require('../models/User');

/**
 * Middleware pour vérifier si l'utilisateur a un rôle administrateur
 * (responsable ou admin uniquement)
 */
const requireAdminRole = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les responsables et administrateurs peuvent effectuer cette action.' 
    });
  }

  next();
};

/**
 * Middleware pour vérifier si l'utilisateur a un rôle de gestion
 * (referent, responsable ou admin)
 */
const requireManagementRole = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  if (!MANAGEMENT_ROLES.includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les référents, responsables et administrateurs peuvent effectuer cette action.' 
    });
  }

  next();
};

/**
 * Middleware pour vérifier si l'utilisateur a la permission de créer des posts
 */
const canCreatePost = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Les admins et responsables peuvent toujours créer des posts
    if (ADMIN_ROLES.includes(req.user.role)) {
      return next();
    }

    // Vérifier la permission pour les autres utilisateurs
    const user = await User.findById(req.user.userId).select('canCreatePost');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (!user.canCreatePost) {
      return res.status(403).json({ 
        message: 'Vous n\'avez pas la permission de créer des posts. Contactez un administrateur.' 
      });
    }

    next();
  } catch (error) {
    console.error('Erreur vérification permission:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est l'auteur ou a un rôle admin
 */
const requireAuthorOrAdmin = (resourceAuthorId) => {
  return (req, res, next) => {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const isAuthor = resourceAuthorId.toString() === req.user.userId;
    const isAdmin = ADMIN_ROLES.includes(req.user.role);

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ 
        message: 'Accès refusé. Vous devez être l\'auteur ou avoir un rôle administrateur.' 
      });
    }

    next();
  };
};

module.exports = {
  requireAdminRole,
  requireManagementRole,
  canCreatePost,
  requireAuthorOrAdmin,
};
