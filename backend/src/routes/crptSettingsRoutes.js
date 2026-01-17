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
    console.log('💾 Réception requête PUT /api/settings/crpt');
    console.log('👤 Utilisateur:', req.user.userId, 'Role:', req.user.role);
    
    const { crptSettings } = req.body;

    if (!crptSettings) {
      console.log('❌ Paramètres CRPT manquants dans le body');
      return res.status(400).json({ message: 'Paramètres CRPT manquants' });
    }

    console.log('📦 Données reçues (preview):', JSON.stringify(crptSettings).substring(0, 200) + '...');

    // Trouver ou créer le document Settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('🆕 Création nouveau document Settings');
      settings = new Settings({ settings: {} });
    } else {
      console.log('📝 Mise à jour document Settings existant');
    }

    // Mettre à jour les paramètres CRPT
    settings.settings.crptSettings = crptSettings;
    settings.markModified('settings.crptSettings'); // Force Mongoose à détecter le changement
    await settings.save();

    console.log('✅ Paramètres CRPT sauvegardés avec succès dans MongoDB');
    console.log('🔍 Vérification sauvegarde...');
    
    // Vérifier que les données sont bien sauvegardées
    const verification = await Settings.findOne();
    if (verification && verification.settings.crptSettings) {
      console.log('✅ Vérification OK: Données bien en base');
    } else {
      console.log('⚠️ Warning: Vérification échouée');
    }

    res.json({ 
      message: '✅ Paramètres CRPT enregistrés avec succès !',
      crptSettings: settings.settings.crptSettings,
      saved: true
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde paramètres CRPT:', error);
    console.error('Stack:', error.stack);
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
