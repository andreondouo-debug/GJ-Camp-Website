const Campus = require('../models/Campus');
const Registration = require('../models/Registration');
const { ADMIN_ROLES } = require('../constants/roles');

/**
 * Middleware pour vérifier que l'utilisateur est le responsable du campus de l'inscription
 * ou qu'il a un rôle admin
 */
const checkCampusResponsable = async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const { registrationId } = req.params;

    // Les admins et responsables peuvent tout valider
    if (ADMIN_ROLES.includes(role)) {
      console.log(`✅ Utilisateur ${userId} a le rôle ${role} - accès autorisé`);
      return next();
    }

    // Vérifier si l'utilisateur est responsable d'un campus
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Trouver le campus associé au refuge de l'inscription
    const campus = await Campus.findOne({ name: registration.refuge });
    if (!campus) {
      return res.status(404).json({ message: 'Campus non trouvé' });
    }

    // Vérifier si l'utilisateur est le responsable de ce campus
    if (campus.responsable && campus.responsable.toString() === userId) {
      console.log(`✅ Utilisateur ${userId} est responsable du campus ${campus.name}`);
      return next();
    }

    // Sinon, accès refusé
    return res.status(403).json({ 
      message: `❌ Vous n'êtes pas autorisé à valider les paiements pour le campus ${campus.name}. Seul le responsable affecté peut valider.` 
    });

  } catch (error) {
    console.error('❌ Erreur middleware checkCampusResponsable:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = checkCampusResponsable;
