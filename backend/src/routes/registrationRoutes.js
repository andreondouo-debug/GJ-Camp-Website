const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const registrationController = require('../controllers/registrationController');
const authorize = require('../middleware/authorize');
const requireVerifiedEmail = require('../middleware/requireVerifiedEmail');
const checkCampusResponsable = require('../middleware/checkCampusResponsable');

// Route publique pour inscription camp avec création automatique de compte
router.post('/camp-with-account', registrationController.createCampRegistrationWithAccount);

// Route admin pour créer inscription sans paiement
router.post('/create-without-payment', 
  auth, 
  requireVerifiedEmail, 
  authorize('responsable', 'admin'), 
  registrationController.createRegistrationWithoutPayment
);

// Routes protégées (utilisateur connecté)
router.post('/', auth, requireVerifiedEmail, registrationController.createRegistration);
router.get('/mes-inscriptions', auth, registrationController.getUserRegistrations);
router.get('/my-registration', auth, registrationController.getMyRegistration);
router.put('/:id/additional-payment', auth, registrationController.addAdditionalPayment);

// Routes pour les invités
router.post('/guest', auth, requireVerifiedEmail, registrationController.createGuestRegistration);
router.get('/mes-invites', auth, registrationController.getUserGuests);

// Routes pour paiement en espèces (routes spécifiques AVANT les routes avec paramètres)
router.post('/cash', auth, requireVerifiedEmail, registrationController.createCashRegistration);
router.get(
	'/cash/stats',
	auth,
	requireVerifiedEmail,
	authorize('referent', 'responsable', 'admin'),
	registrationController.getCashPaymentsStats
);
router.get(
	'/cash/pending-count',
	auth,
	requireVerifiedEmail,
	authorize('referent', 'responsable', 'admin'),
	registrationController.getPendingCashPaymentsCount
);
router.post('/:registrationId/cash-payment', auth, registrationController.addCashPayment);
router.patch(
	'/:registrationId/cash-payment/:paymentId/validate',
	auth,
	requireVerifiedEmail,
	checkCampusResponsable, // Vérifie que l'utilisateur est responsable du campus ou admin
	registrationController.validateCashPayment
);
router.patch(
	'/:registrationId/cash-payment/:paymentId/reject',
	auth,
	requireVerifiedEmail,
	checkCampusResponsable, // Vérifie que l'utilisateur est responsable du campus ou admin
	registrationController.rejectCashPayment
);

// Routes admin pour le suivi des inscriptions
router.get(
	'/all',
	auth,
	requireVerifiedEmail,
	authorize('referent', 'responsable', 'admin'),
	registrationController.getAllRegistrations
);
router.patch(
	'/:id/payment-status',
	auth,
	requireVerifiedEmail,
	authorize('responsable', 'admin'),
	registrationController.updatePaymentStatus
);

// Route pour supprimer une inscription (admin uniquement)
router.delete(
	'/:id',
	auth,
	requireVerifiedEmail,
	authorize('admin'),
	registrationController.deleteRegistration
);

module.exports = router;
