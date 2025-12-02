const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const registrationController = require('../controllers/registrationController');
const authorize = require('../middleware/authorize');
const requireVerifiedEmail = require('../middleware/requireVerifiedEmail');

// Routes protégées (utilisateur connecté)
router.post('/', auth, requireVerifiedEmail, registrationController.createRegistration);
router.get('/mes-inscriptions', auth, registrationController.getUserRegistrations);
router.put('/:id/additional-payment', auth, registrationController.addAdditionalPayment);

// Routes pour les invités
router.post('/guest', auth, requireVerifiedEmail, registrationController.createGuestRegistration);
router.get('/mes-invites', auth, registrationController.getUserGuests);

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
