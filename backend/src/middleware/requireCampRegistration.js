const Registration = require('../models/Registration');

/**
 * Middleware pour vérifier qu'un utilisateur a une inscription validée au camp
 * Bloque l'accès si l'utilisateur n'est pas inscrit ou si son inscription n'est pas validée
 * ✅ Accès aux activités dès le premier paiement (partiel ou complet)
 */
const requireCampRegistration = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Vérifier si l'utilisateur a une inscription
    const registration = await Registration.findOne({
      user: userId
    });

    if (!registration) {
      return res.status(403).json({
        message: 'Accès refusé. Vous devez être inscrit au camp pour accéder aux activités.',
        requireRegistration: true
      });
    }

    // ✅ Paiement en espèces : accès dès qu'il y a un paiement validé
    if (registration.paymentMethod === 'cash' || registration.paymentMethod === 'mixed') {
      const hasValidatedCashPayment = registration.cashPayments?.some(p => p.status === 'validated');
      
      if (!hasValidatedCashPayment && registration.paymentStatus === 'unpaid') {
        return res.status(403).json({
          message: 'Accès refusé. Votre paiement en espèces est en attente de validation par un responsable.',
          requirePaymentValidation: true,
          hasPendingCashPayment: registration.cashPayments?.some(p => p.status === 'pending')
        });
      }
    }

    // ✅ Vérifier qu'il y a au moins un paiement (partiel ou complet)
    if (registration.paymentStatus === 'unpaid' && registration.amountPaid === 0) {
      return res.status(403).json({
        message: 'Accès refusé. Vous devez effectuer au moins un paiement pour accéder aux activités.',
        requirePayment: true,
        amountRemaining: registration.amountRemaining
      });
    }

    // L'utilisateur a au moins payé partiellement, accès autorisé
    req.registration = registration;
    next();
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification de l\'inscription' });
  }
};

module.exports = requireCampRegistration;
