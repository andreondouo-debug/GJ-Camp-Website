const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ADMIN_ROLES } = require('../constants/roles');
const Settings = require('../models/Settings');
const gjDefaults = require('../config/gjPageDefaults');

/**
 * @route   GET /api/settings/gj
 * @desc    Récupérer les paramètres GJ (public pour affichage page)
 * @access  Public
 */
router.get('/gj', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Si aucun settings ou pas de gjSettings, retourner les valeurs par défaut
    if (!settings || !settings.settings.gjSettings) {
      console.log('📝 Aucun paramètres GJ trouvés, utilisation des valeurs par défaut');
      return res.json({ gjSettings: gjDefaults });
    }

    console.log('✅ Paramètres GJ récupérés depuis la base de données');
    res.json({ gjSettings: settings.settings.gjSettings });
  } catch (error) {
    console.error('❌ Erreur récupération paramètres GJ:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des paramètres GJ',
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/settings/gj
 * @desc    Mettre à jour les paramètres GJ
 * @access  Admin/Responsable uniquement
 */
router.put('/gj', auth, authorize(...ADMIN_ROLES), async (req, res) => {
  try {
    console.log('💾 Réception requête PUT /api/settings/gj');
    console.log('👤 Utilisateur:', req.user.userId, 'Role:', req.user.role);
    
    const { gjSettings } = req.body;

    if (!gjSettings) {
      console.log('❌ Paramètres GJ manquants dans le body');
      return res.status(400).json({ message: 'Paramètres GJ manquants' });
    }

    console.log('📦 Données reçues (preview):', JSON.stringify(gjSettings).substring(0, 200) + '...');

    // Trouver ou créer le document Settings
    let settings = await Settings.findOne();
    
    if (!settings) {
      console.log('🆕 Création nouveau document Settings');
      settings = new Settings({ settings: {} });
    } else {
      console.log('📝 Mise à jour document Settings existant');
    }

    // Mettre à jour les paramètres GJ
    settings.settings.gjSettings = gjSettings;
    settings.markModified('settings.gjSettings'); // Force Mongoose à détecter le changement
    await settings.save();

    console.log('✅ Paramètres GJ sauvegardés avec succès dans MongoDB');
    console.log('🔍 Vérification sauvegarde...');
    
    // Vérifier que les données sont bien sauvegardées
    const verification = await Settings.findOne();
    if (verification && verification.settings.gjSettings) {
      console.log('✅ Vérification OK: Données bien en base');
    } else {
      console.log('⚠️ Warning: Vérification échouée');
    }

    res.json({ 
      message: '✅ Paramètres GJ enregistrés avec succès !',
      gjSettings: settings.settings.gjSettings,
      saved: true
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde paramètres GJ:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la sauvegarde des paramètres GJ',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/settings/gj/reset
 * @desc    Réinitialiser les paramètres GJ aux valeurs par défaut
 * @access  Admin/Responsable uniquement
 */
router.post('/gj/reset', auth, authorize(...ADMIN_ROLES), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({ settings: {} });
    }

    settings.settings.gjSettings = gjDefaults;
    await settings.save();

    console.log('🔄 Paramètres GJ réinitialisés aux valeurs par défaut');
    res.json({ 
      message: '🔄 Paramètres GJ réinitialisés avec succès !',
      gjSettings: gjDefaults 
    });
  } catch (error) {
    console.error('❌ Erreur réinitialisation paramètres GJ:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la réinitialisation des paramètres GJ',
      error: error.message 
    });
  }
});

module.exports = router;
