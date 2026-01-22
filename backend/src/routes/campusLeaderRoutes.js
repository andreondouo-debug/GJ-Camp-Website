const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllCampusLeaders,
  getCampusLeaderById,
  createCampusLeader,
  updateCampusLeader,
  deleteCampusLeader,
  uploadCampusLeaderPhoto
} = require('../controllers/campusLeaderController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ADMIN_ROLES } = require('../constants/roles');

// Configuration Multer pour upload de photos
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Routes publiques
router.get('/', getAllCampusLeaders);
router.get('/:id', getCampusLeaderById);

// Routes protégées (Admin/Responsable)
router.post('/', auth, authorize(...ADMIN_ROLES), createCampusLeader);
router.put('/:id', auth, authorize(...ADMIN_ROLES), updateCampusLeader);
router.delete('/:id', auth, authorize(...ADMIN_ROLES), deleteCampusLeader);
router.post('/:id/upload-photo', auth, authorize(...ADMIN_ROLES), upload.single('photo'), uploadCampusLeaderPhoto);

module.exports = router;
