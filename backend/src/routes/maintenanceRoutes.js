const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/roleCheck');
const CarouselSlide = require('../models/CarouselSlide');

/**
 * POST /api/maintenance/migrate-carousel-paths
 * Migrer les chemins d'images du carousel
 */
router.post('/migrate-carousel-paths', auth, requireAdminRole, async (req, res) => {
  try {
    const slides = await CarouselSlide.find();
    
    let updated = 0;
    let skipped = 0;
    const details = [];

    for (const slide of slides) {
      const oldPath = slide.image;
      
      // Si l'image commence déjà par /uploads/ ou http, on saute
      if (oldPath.startsWith('/uploads/') || oldPath.startsWith('http://') || oldPath.startsWith('https://')) {
        skipped++;
        details.push({ id: slide._id, status: 'skipped', path: oldPath });
        continue;
      }

      // Ajouter /uploads/ au début
      const newPath = `/uploads/${oldPath}`;
      slide.image = newPath;
      await slide.save();
      
      updated++;
      details.push({ id: slide._id, status: 'updated', oldPath, newPath });
    }

    res.json({
      success: true,
      message: `Migration terminée: ${updated} mise(s) à jour, ${skipped} ignorée(s)`,
      updated,
      skipped,
      total: slides.length,
      details
    });
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la migration',
      error: error.message 
    });
  }
});

module.exports = router;
