/**
 * Routes API pour la gestion du carrousel
 * Accessible uniquement aux administrateurs
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const carouselCloudinaryUpload = require('../middleware/carouselCloudinaryUpload');
const carouselController = require('../controllers/carouselController');

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Accès refusé. Seuls les administrateurs peuvent gérer le carrousel.' 
    });
  }
  next();
};

// Routes publiques
router.get('/', carouselController.getSlides);

// Routes protégées (admin uniquement)
router.post('/', auth, requireAdmin, carouselCloudinaryUpload.single('image'), carouselController.addSlide);
router.put('/:id', auth, requireAdmin, carouselCloudinaryUpload.single('image'), carouselController.updateSlide);
router.put('/:id/order', auth, requireAdmin, carouselController.updateSlideOrder);
router.delete('/:id', auth, requireAdmin, carouselController.deleteSlide);

module.exports = router;
