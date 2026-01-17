const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ADMIN_ROLES } = require('../constants/roles');
const Settings = require('../models/Settings');
const crptDefaults = require('../config/crptPageDefaults');

/**
 * @route   GET /api/settings/crpt
 * @desc    Récupérer les paramètres CRPT (public pour affichage page)
 * @access  Public
 */
router.get('/crpt', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Si aucun settings ou pas de crptSettings, retourner les valeurs par défaut
    if (!settings || !settings.settings.crptSettings) {
      console.log('📝 Aucun paramètres CRPT trouvés, utilisation des valeurs par défaut');
      return res.json({ crptSettings: crptDefaults });
    }

    console.log('✅ Paramètres CRPT récupérés depuis la base de données');
    res.json({ crptSettings: settings.settings.crptSettings });
  } catch (error) {
    console.error('❌ Erreur récupération paramètres CRPT:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des paramètres CRPT',
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/settings/crpt
 * @desc    Mettre à jour les paramètres CRPT
 * @access  Admin uniquement
 */
router.put('/crpt', auth, authorize(...ADMIN_ROLES), async (req, res) => {
  try {
    const { crptSettings } = req.body;

    if (!crptSettings) {
      return res.status(400).json({ message: 'Paramètres CRPT manquants' });
    }

    // Trouver ou créer le document Settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({ settings: {} });
    }

    // Mettre à jour les paramètres CRPT
    settings.settings.crptSettings = crptSettings;
    await settings.save();

    console.log('✅ Paramètres CRPT sauvegardés avec succès');
    res.json({ 
      message: '✅ Paramètres CRPT enregistrés avec succès !',
      crptSettings: settings.settings.crptSettings 
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde paramètres CRPT:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la sauvegarde des paramètres CRPT',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/settings/crpt/reset
 * @desc    Réinitialiser les paramètres CRPT aux valeurs par défaut
 * @access  Admin uniquement
 */
router.post('/crpt/reset', auth, authorize(...ADMIN_ROLES), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({ settings: {} });
    }

    settings.settings.crptSettings = crptDefaults;
    await settings.save();

    console.log('🔄 Paramètres CRPT réinitialisés aux valeurs par défaut');
    res.json({ 
      message: '🔄 Paramètres CRPT réinitialisés avec succès !',
      crptSettings: crptDefaults 
    });
  } catch (error) {
    console.error('❌ Erreur réinitialisation paramètres CRPT:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la réinitialisation des paramètres CRPT',
      error: error.message 
    });
  }
});

module.exports = router;
