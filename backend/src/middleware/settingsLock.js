/**
 * Middleware pour gérer le verrouillage de la page de paramétrage
 * Une seule personne peut modifier les paramètres à la fois
 */

// Stockage en mémoire du verrou (pour un déploiement production, utiliser Redis)
let settingsLock = {
  isLocked: false,
  userId: null,
  userName: null,
  lockedAt: null,
  expiresAt: null
};

// Durée du verrou : 15 minutes d'inactivité
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes

/**
 * Middleware pour acquérir le verrou sur la page de paramétrage
 */
const acquireSettingsLock = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = Date.now();

    // Vérifier si le verrou a expiré
    if (settingsLock.isLocked && settingsLock.expiresAt < now) {
      console.log('🔓 Verrou de paramétrage expiré, réinitialisation');
      settingsLock.isLocked = false;
      settingsLock.userId = null;
      settingsLock.userName = null;
      settingsLock.lockedAt = null;
      settingsLock.expiresAt = null;
    }

    // Si déjà verrouillé par un autre utilisateur
    if (settingsLock.isLocked && settingsLock.userId !== userId) {
      const timeRemaining = Math.ceil((settingsLock.expiresAt - now) / 1000 / 60);
      return res.status(423).json({
        locked: true,
        message: `La page de paramétrage est actuellement verrouillée par ${settingsLock.userName || 'un autre administrateur'}`,
        lockedBy: settingsLock.userName,
        lockedAt: settingsLock.lockedAt,
        expiresIn: `${timeRemaining} minute(s)`
      });
    }

    // Si l'utilisateur actuel a déjà le verrou, prolonger la durée
    if (settingsLock.isLocked && settingsLock.userId === userId) {
      settingsLock.expiresAt = now + LOCK_DURATION;
      console.log(`🔄 Verrou de paramétrage prolongé pour ${req.user.firstName || 'utilisateur'}`);
      return next();
    }

    // Acquérir le verrou pour cet utilisateur
    settingsLock = {
      isLocked: true,
      userId: userId,
      userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Administrateur',
      lockedAt: now,
      expiresAt: now + LOCK_DURATION
    };

    console.log(`🔒 Verrou de paramétrage acquis par ${settingsLock.userName}`);
    next();
  } catch (error) {
    console.error('❌ Erreur lors de l\'acquisition du verrou:', error);
    res.status(500).json({ message: 'Erreur serveur lors du verrouillage' });
  }
};

/**
 * Libérer manuellement le verrou (quand l'utilisateur quitte la page)
 */
const releaseSettingsLock = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Vérifier que c'est bien l'utilisateur qui a le verrou
    if (settingsLock.isLocked && settingsLock.userId === userId) {
      const userName = settingsLock.userName;
      settingsLock = {
        isLocked: false,
        userId: null,
        userName: null,
        lockedAt: null,
        expiresAt: null
      };
      console.log(`🔓 Verrou de paramétrage libéré par ${userName}`);
      return res.json({ message: 'Verrou libéré avec succès' });
    }

    res.json({ message: 'Aucun verrou actif pour cet utilisateur' });
  } catch (error) {
    console.error('❌ Erreur lors de la libération du verrou:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Vérifier l'état du verrou (sans l'acquérir)
 */
const checkSettingsLockStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = Date.now();

    // Vérifier si le verrou a expiré
    if (settingsLock.isLocked && settingsLock.expiresAt < now) {
      settingsLock.isLocked = false;
      settingsLock.userId = null;
      settingsLock.userName = null;
      settingsLock.lockedAt = null;
      settingsLock.expiresAt = null;
    }

    if (!settingsLock.isLocked) {
      return res.json({ locked: false, message: 'Page de paramétrage disponible' });
    }

    if (settingsLock.userId === userId) {
      return res.json({
        locked: true,
        ownedByCurrentUser: true,
        message: 'Vous avez le verrou actif',
        expiresAt: settingsLock.expiresAt
      });
    }

    const timeRemaining = Math.ceil((settingsLock.expiresAt - now) / 1000 / 60);
    res.json({
      locked: true,
      ownedByCurrentUser: false,
      message: `Verrouillé par ${settingsLock.userName}`,
      lockedBy: settingsLock.userName,
      lockedAt: settingsLock.lockedAt,
      expiresIn: `${timeRemaining} minute(s)`
    });
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du verrou:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Forcer la libération du verrou (admin uniquement, en cas d'urgence)
 */
const forceReleaseSettingsLock = async (req, res) => {
  try {
    if (settingsLock.isLocked) {
      const previousOwner = settingsLock.userName;
      settingsLock = {
        isLocked: false,
        userId: null,
        userName: null,
        lockedAt: null,
        expiresAt: null
      };
      console.log(`⚠️ Verrou de paramétrage forcé à être libéré (précédemment détenu par ${previousOwner})`);
      return res.json({ 
        message: `Verrou forcé à être libéré (précédemment détenu par ${previousOwner})` 
      });
    }

    res.json({ message: 'Aucun verrou actif' });
  } catch (error) {
    console.error('❌ Erreur lors de la libération forcée du verrou:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  acquireSettingsLock,
  releaseSettingsLock,
  checkSettingsLockStatus,
  forceReleaseSettingsLock
};
