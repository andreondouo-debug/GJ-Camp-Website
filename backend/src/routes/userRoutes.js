const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const requireVerifiedEmail = require('../middleware/requireVerifiedEmail');
const requireProfileCompletion = require('../middleware/requireProfileCompletion');
const userController = require('../controllers/userController');
const { ADMIN_ROLES, MANAGEMENT_ROLES, SUPER_ADMIN_ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/roles', auth, requireVerifiedEmail, authorize(...ADMIN_ROLES), userController.getRoleOptions);
router.get('/audits', auth, requireVerifiedEmail, authorize(...SUPER_ADMIN_ROLES), userController.listRoleAudits);
// Vérifier si un email a déjà un compte (admin)
router.get('/check-email', auth, requireVerifiedEmail, authorize(...MANAGEMENT_ROLES), async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ exists: false });
  const User = require('../models/User');
  const user = await User.findOne({ email: email.toLowerCase() }).select('firstName lastName email');
  res.json({ exists: !!user, user: user || null });
});
router.get('/', auth, requireVerifiedEmail, authorize(...ADMIN_ROLES), userController.listUsers);
router.get('/:id', auth, requireVerifiedEmail, authorize(...MANAGEMENT_ROLES), userController.getUserById);
router.patch(
	'/:id/role',
	auth,
	requireVerifiedEmail,
	authorize(...SUPER_ADMIN_ROLES),
	requireProfileCompletion(),
	userController.updateUserRole
);
router.put(
	'/:id/profile',
	auth,
	requireVerifiedEmail,
	authorize(...ADMIN_ROLES),
	requireProfileCompletion(),
	userController.adminUpdateUserProfile
);

router.patch(
	'/:id/verify-email',
	auth,
	authorize(...ADMIN_ROLES),
	requireProfileCompletion(),
	userController.adminConfirmEmail
);

router.patch(
	'/:id/permissions',
	auth,
	requireVerifiedEmail,
	authorize(...ADMIN_ROLES),
	userController.updateUserPermissions
);

router.patch(
	'/:id/deactivate',
	auth,
	requireVerifiedEmail,
	authorize(...ADMIN_ROLES),
	userController.deactivateUser
);

router.patch(
	'/:id/activate',
	auth,
	requireVerifiedEmail,
	authorize(...ADMIN_ROLES),
	userController.activateUser
);

router.delete(
	'/:id',
	auth,
	requireVerifiedEmail,
	authorize(...ADMIN_ROLES),
	userController.deleteUser
);

module.exports = router;
