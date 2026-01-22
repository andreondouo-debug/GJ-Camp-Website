const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/roleCheck');
const Campus = require('../models/Campus');

/**
 * GET /api/campus - Lister tous les campus (PUBLIC - utilisé pour formulaires)
 */
router.get('/', async (req, res) => {
  try {
    const campus = await Campus.find().sort({ name: 1 });
    res.json(campus);
  } catch (error) {
    console.error('❌ Erreur récupération campus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /api/campus/:name - Obtenir un campus par nom (PUBLIC)
 */
router.get('/:name', async (req, res) => {
  try {
    const campus = await Campus.findOne({ name: req.params.name });
    
    if (!campus) {
      return res.status(404).json({ message: 'Campus introuvable' });
    }

    res.json({ campus });
  } catch (error) {
    console.error('❌ Erreur récupération campus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * POST /api/campus - Créer ou mettre à jour un campus (PROTÉGÉ - Admin uniquement)
 */
router.post('/', auth, requireAdminRole, async (req, res) => {
  try {
    const { name, paypalEmail, iban, redistributionPercentage, isActive, contactPerson, notes } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom du campus est obligatoire' });
    }

    // Vérifier si le campus existe déjà
    let campus = await Campus.findOne({ name });

    if (campus) {
      // Mise à jour
      campus.paypalEmail = paypalEmail || campus.paypalEmail;
      campus.iban = iban || campus.iban;
      campus.redistributionPercentage = redistributionPercentage !== undefined ? redistributionPercentage : campus.redistributionPercentage;
      campus.isActive = isActive !== undefined ? isActive : campus.isActive;
      campus.contactPerson = contactPerson || campus.contactPerson;
      campus.notes = notes || campus.notes;

      await campus.save();

      res.json({
        message: 'Campus mis à jour avec succès',
        campus,
      });
    } else {
      // Création
      campus = new Campus({
        name,
        paypalEmail,
        iban,
        redistributionPercentage: redistributionPercentage || 100,
        isActive: isActive !== undefined ? isActive : true,
        contactPerson,
        notes,
      });

      await campus.save();

      res.status(201).json({
        message: 'Campus créé avec succès',
        campus,
      });
    }
  } catch (error) {
    console.error('❌ Erreur création/mise à jour campus:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
});

/**
 * PATCH /api/campus/:name - Mettre à jour un campus (PROTÉGÉ - Admin uniquement)
 */
router.patch('/:name', auth, requireAdminRole, async (req, res) => {
  try {
    const { paypalEmail, iban, redistributionPercentage, isActive, contactPerson, notes } = req.body;

    const campus = await Campus.findOne({ name: req.params.name });

    if (!campus) {
      return res.status(404).json({ message: 'Campus introuvable' });
    }

    if (paypalEmail !== undefined) campus.paypalEmail = paypalEmail;
    if (iban !== undefined) campus.iban = iban;
    if (redistributionPercentage !== undefined) campus.redistributionPercentage = redistributionPercentage;
    if (isActive !== undefined) campus.isActive = isActive;
    if (contactPerson !== undefined) campus.contactPerson = contactPerson;
    if (notes !== undefined) campus.notes = notes;

    await campus.save();

    res.json({
      message: 'Campus mis à jour avec succès',
      campus,
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour campus:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
});

/**
 * DELETE /api/campus/:name - Supprimer un campus (PROTÉGÉ - Admin uniquement)
 */
router.delete('/:name', auth, requireAdminRole, async (req, res) => {
  try {
    const campus = await Campus.findOneAndDelete({ name: req.params.name });

    if (!campus) {
      return res.status(404).json({ message: 'Campus introuvable' });
    }

    res.json({ message: 'Campus supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression campus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
