const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const auth = require('../middleware/auth');
const activityUpload = require('../middleware/activityCloudinaryUpload');
const authorize = require('../middleware/authorize');
const requireVerifiedEmail = require('../middleware/requireVerifiedEmail');
const requireProfileCompletion = require('../middleware/requireProfileCompletion');

// Routes publiques
router.get('/', activitiesController.getAllActivities);
router.get('/:id', activitiesController.getActivityById);

// Routes protégées (admin uniquement)
router.post(
  '/',
  auth,
  requireVerifiedEmail,
  authorize('referent', 'responsable', 'admin'),
  requireProfileCompletion(),
  activityUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'fichierPdf', maxCount: 1 }
  ]),
  activitiesController.createActivity
);

router.put(
  '/:id',
  auth,
  requireVerifiedEmail,
  authorize('referent', 'responsable', 'admin'),
  requireProfileCompletion(),
  activityUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'fichierPdf', maxCount: 1 }
  ]),
  activitiesController.updateActivity
);

router.delete(
  '/:id',
  auth,
  requireVerifiedEmail,
  authorize('responsable', 'admin'),
  activitiesController.deleteActivity
);
router.delete(
  '/:id/hard',
  auth,
  requireVerifiedEmail,
  authorize('admin'),
  activitiesController.hardDeleteActivity
);

module.exports = router;
