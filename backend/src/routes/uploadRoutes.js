const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ADMIN_ROLES } = require('../constants/roles');

// Configuration multer pour la mémoire (pas de stockage local)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: fileFilter
});

/**
 * @route   POST /api/upload/crpt-image
 * @desc    Upload une image pour la page CRPT vers Cloudinary
 * @access  Private (Admin/Responsable)
 */
router.post('/crpt-image', 
  auth, 
  authorize(...ADMIN_ROLES),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '❌ Aucune image fournie' });
      }

      // Upload vers Cloudinary via buffer
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'gj-camp/crpt',
            resource_type: 'image',
            transformation: [
              { width: 1920, height: 1080, crop: 'limit' }, // Limite max
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      console.log('✅ Image CRPT uploadée sur Cloudinary:', result.secure_url);

      res.json({
        message: '✅ Image uploadée avec succès',
        url: result.secure_url,
        publicId: result.public_id
      });

    } catch (error) {
      console.error('❌ Erreur upload image CRPT:', error);
      res.status(500).json({ 
        message: '❌ Erreur lors de l\'upload de l\'image',
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/upload/gj-image
 * @desc    Upload une image pour la page GJ vers Cloudinary (logo)
 * @access  Private (Admin/Responsable)
 */
router.post('/gj-image', 
  auth, 
  authorize(...ADMIN_ROLES),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '❌ Aucune image fournie' });
      }

      // Upload vers Cloudinary via buffer
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'gj-camp/gj-logos',
            resource_type: 'image',
            transformation: [
              { width: 500, height: 500, crop: 'limit' }, // Logo max 500x500
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      console.log('✅ Logo GJ uploadé sur Cloudinary:', result.secure_url);

      res.json({
        message: '✅ Logo uploadé avec succès',
        url: result.secure_url,
        publicId: result.public_id
      });

    } catch (error) {
      console.error('❌ Erreur upload logo GJ:', error);
      res.status(500).json({ 
        message: '❌ Erreur lors de l\'upload du logo',
        error: error.message 
      });
    }
  }
);

module.exports = router;
