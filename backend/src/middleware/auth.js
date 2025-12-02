const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.userId).select(
      'role isEmailVerified firstName lastName phoneNumber ministryRole bio churchWebsite socialLinks profilePhoto emailVerifiedAt lastLoginAt isActive'
    );

    if (!currentUser) {
      return res.status(401).json({ message: 'Utilisateur introuvable ou supprimé' });
    }

    // Vérifier si le compte est suspendu
    if (currentUser.isActive === false) {
      return res.status(403).json({ message: 'Votre compte a été suspendu. Veuillez contacter un administrateur.' });
    }

    req.user = {
      userId: currentUser._id.toString(),
      role: currentUser.role,
      isEmailVerified: currentUser.isEmailVerified,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      emailVerifiedAt: currentUser.emailVerifiedAt,
      lastLoginAt: currentUser.lastLoginAt,
    };
    req.currentUser = currentUser;
    req.authToken = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = auth;
