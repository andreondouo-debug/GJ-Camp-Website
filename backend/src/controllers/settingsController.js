/**
 * Contrôleur pour la gestion des paramètres du site
 * Gère la récupération, mise à jour et réinitialisation des paramètres de la charte graphique
 */

const Settings = require('../models/Settings');

// Paramètres par défaut
const DEFAULT_SETTINGS = {
  // Couleur barre de statut mobile (globale)
  statusBarColor: '#a01e1e',
  
  // Palette de couleurs
  colorPrimary: '#a01e1e',
  colorPrimaryLight: '#e74c3c',
  colorPrimaryDark: '#7a1515',
  colorSecondary: '#d4af37',
  colorGoldLight: '#f3d87c',
  colorGoldDark: '#b8942a',
  colorNavy: '#001a4d',
  
  // Typographie
  fontPrimary: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  fontHeading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  textBase: '1rem',
  textLg: '1.125rem',
  textXl: '1.25rem',
  text2xl: '1.5rem',
  
  // Espacements
  spaceXs: '0.25rem',
  spaceSm: '0.5rem',
  spaceMd: '1rem',
  spaceLg: '1.5rem',
  spaceXl: '2rem',
  
  // Border Radius
  radiusSm: '0.25rem',
  radiusMd: '0.5rem',
  radiusLg: '0.75rem',
  radiusXl: '1rem',
  radius2xl: '1.5rem',
  
  // Ombres
  shadowSm: '0 1px 3px rgba(0, 0, 0, 0.12)',
  shadowMd: '0 4px 12px rgba(0, 0, 0, 0.15)',
  shadowLg: '0 8px 24px rgba(0, 0, 0, 0.2)',
  
  // Transitions
  transitionFast: '150ms',
  transitionBase: '300ms',
  transitionSlow: '500ms',
  
  // Dark Mode
  darkModeEnabled: false,
  
  // Animations
  animationsEnabled: true,
  hoverEffectsEnabled: true,
  glassmorphismEnabled: true,
  
  // Compte à rebours
  countdownDate: '2026-08-19T00:00:00',
  countdownTitle: 'Camp GJ dans',
  
  // Logo
  logoUrl: '',
  logoWidth: '120px',
  logoHeight: 'auto',
  logoShape: 'none',
  logoEffect: 'none',
  logoAnimation: 'none',
  logoBorderColor: '#d4af37',
  logoGlowColor: '#d4af37',
  logoPosition: 'header',
  logoCustomX: '50',
  logoCustomY: '50',
  
  // Fonds d'écran
  backgroundType: 'gradient',
  backgroundImage: '',
  backgroundColorStart: '#667eea',
  backgroundColorEnd: '#764ba2',
  backgroundSolidColor: '#ffffff',
  
  // Fonds par page
  homeBackground: 'default',
  aboutBackground: 'default',
  activitiesBackground: 'default',
  
  // Styles d'en-tête
  headerStyle: 'gradient',
  headerTextColor: '#ffffff',
  
  // Réseaux sociaux
  instagramUrl: '',
  facebookUrl: '',
  youtubeUrl: '',
  twitterUrl: '',
  linkedinUrl: '',
  
  // Paramètres du carrousel
  carouselEnabled: true,
  carouselHeight: '500px',
  carouselAutoplayInterval: 6000, // 6 secondes par défaut
  carouselTransitionDuration: 1000, // 1 seconde de transition
  
  // Logo PWA (pour l'installation de l'application)
  pwaLogoUrl: '',
  pwaLogoPublicId: '', // ID Cloudinary pour supprimer l'ancienne version
  
  // Montants d'inscription au camp
  registrationMinAmount: 20,  // Montant minimum en euros
  registrationMaxAmount: 120, // Montant maximum en euros
};

/**
 * Récupérer les paramètres actuels
 */
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Si aucun paramètre n'existe, créer avec les valeurs par défaut
    if (!settings) {
      settings = new Settings({ settings: DEFAULT_SETTINGS });
      await settings.save();
      console.log('✅ Paramètres par défaut créés');
    }
    
    res.json({ 
      success: true,
      settings: settings.settings,
      lastUpdated: settings.updatedAt,
      updatedBy: settings.updatedBy
    });
  } catch (error) {
    console.error('❌ Erreur récupération paramètres:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des paramètres',
      error: error.message 
    });
  }
};

/**
 * Mettre à jour les paramètres
 */
exports.updateSettings = async (req, res) => {
  try {
    const { settings: newSettings } = req.body;
    
    if (!newSettings) {
      return res.status(400).json({ 
        message: 'Les paramètres sont requis' 
      });
    }
    
    // Valider les champs requis
    const requiredFields = ['colorPrimary', 'colorSecondary', 'fontPrimary'];
    for (const field of requiredFields) {
      if (!newSettings[field]) {
        return res.status(400).json({ 
          message: `Le champ ${field} est requis` 
        });
      }
    }
    
    let settings = await Settings.findOne();
    
    if (settings) {
      // Mettre à jour les paramètres existants
      settings.settings = { ...settings.settings, ...newSettings };
      settings.updatedBy = req.user.userId;
    } else {
      // Créer de nouveaux paramètres
      settings = new Settings({
        settings: { ...DEFAULT_SETTINGS, ...newSettings },
        updatedBy: req.user.userId
      });
    }
    
    await settings.save();
    
    console.log(`✅ Paramètres mis à jour par l'utilisateur ${req.user.userId}`);
    
    res.json({ 
      success: true,
      message: 'Paramètres sauvegardés avec succès',
      settings: settings.settings,
      lastUpdated: settings.updatedAt
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour paramètres:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour des paramètres',
      error: error.message 
    });
  }
};

/**
 * Réinitialiser les paramètres aux valeurs par défaut
 */
exports.resetSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (settings) {
      settings.settings = DEFAULT_SETTINGS;
      settings.updatedBy = req.user.userId;
      await settings.save();
    } else {
      settings = new Settings({
        settings: DEFAULT_SETTINGS,
        updatedBy: req.user.userId
      });
      await settings.save();
    }
    
    console.log(`✅ Paramètres réinitialisés par l'utilisateur ${req.user.userId}`);
    
    res.json({ 
      success: true,
      message: 'Paramètres réinitialisés aux valeurs par défaut',
      settings: settings.settings,
      lastUpdated: settings.updatedAt
    });
  } catch (error) {
    console.error('❌ Erreur réinitialisation paramètres:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la réinitialisation des paramètres',
      error: error.message 
    });
  }
};

/**
 * Upload du logo
 */
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Aucun fichier logo fourni' 
      });
    }
    
    // Utiliser l'URL Cloudinary si disponible, sinon URL locale
    const logoUrl = req.file.cloudinaryUrl || `/uploads/${req.file.filename}`;
    
    console.log(`✅ Logo uploadé avec succès: ${logoUrl}`);
    
    res.json({ 
      success: true,
      message: 'Logo uploadé avec succès',
      logoUrl: logoUrl
    });
  } catch (error) {
    console.error('❌ Erreur upload logo:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upload du logo',
      error: error.message 
    });
  }
};

/**
 * Upload du logo CRPT sur Cloudinary
 */
exports.uploadCrptLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Aucun fichier logo CRPT fourni' 
      });
    }
    
    // Utiliser l'URL Cloudinary si disponible, sinon URL locale
    const crptLogoUrl = req.file.cloudinaryUrl || `/uploads/${req.file.filename}`;
    
    console.log(`✅ Logo CRPT uploadé avec succès: ${crptLogoUrl}`);
    
    res.json({ 
      success: true,
      message: 'Logo CRPT uploadé avec succès',
      crptLogoUrl: crptLogoUrl
    });
  } catch (error) {
    console.error('❌ Erreur upload logo CRPT:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upload du logo CRPT',
      error: error.message 
    });
  }
};

/**
 * Upload du logo PWA sur Cloudinary
 * Ce logo sera utilisé pour l'icône de l'application installée
 */
exports.uploadPwaLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Aucun fichier logo PWA fourni' 
      });
    }

    const fs = require('fs');
    const path = require('path');
    const cloudinary = require('../config/cloudinary');
    
    // Sauvegarder temporairement le fichier si multer utilise memoryStorage
    let tempFilePath = req.file.path;
    if (!tempFilePath) {
      const uploadDir = path.join(__dirname, '../../uploads/temp');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      tempFilePath = path.join(uploadDir, `${Date.now()}-${req.file.originalname}`);
      fs.writeFileSync(tempFilePath, req.file.buffer);
    }
    
    // Upload vers Cloudinary avec transformations pour les tailles PWA
    const uploadOptions = {
      folder: 'gj-camp/pwa-logos',
      public_id: `pwa-logo-${Date.now()}`,
      transformation: [
        { width: 512, height: 512, crop: 'fill', quality: 'auto' }
      ]
    };

    const result = await cloudinary.uploader.upload(tempFilePath, uploadOptions);
    
    // Créer aussi une version 192x192
    const result192 = await cloudinary.uploader.upload(tempFilePath, {
      ...uploadOptions,
      public_id: `${uploadOptions.public_id}-192`,
      transformation: [
        { width: 192, height: 192, crop: 'fill', quality: 'auto' }
      ]
    });

    // Supprimer le fichier temporaire
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    // Mettre à jour les paramètres avec les URLs des logos PWA
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ settings: DEFAULT_SETTINGS });
    }

    // Supprimer l'ancien logo PWA de Cloudinary si existant
    if (settings.settings.pwaLogoPublicId) {
      try {
        await cloudinary.uploader.destroy(settings.settings.pwaLogoPublicId);
        await cloudinary.uploader.destroy(`${settings.settings.pwaLogoPublicId}-192`);
        console.log('🗑️ Ancien logo PWA supprimé de Cloudinary');
      } catch (err) {
        console.error('⚠️ Erreur suppression ancien logo:', err.message);
      }
    }

    settings.settings.pwaLogoUrl = result.secure_url;
    settings.settings.pwaLogoPublicId = result.public_id;
    settings.updatedBy = req.user.userId;
    settings.markModified('settings');
    await settings.save();

    // Mettre à jour le manifest.json
    const manifestPath = path.join(__dirname, '../../../frontend/public/manifest.json');
    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      
      manifest.icons = [
        {
          src: result192.secure_url,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: result.secure_url,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ];
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log('✅ manifest.json mis à jour avec les nouveaux logos PWA');
    } catch (err) {
      console.error('⚠️ Erreur mise à jour manifest.json:', err.message);
    }
    
    console.log(`✅ Logo PWA uploadé avec succès: ${result.secure_url}`);
    
    res.json({ 
      success: true,
      message: 'Logo PWA uploadé avec succès',
      pwaLogoUrl: result.secure_url,
      pwaLogo192Url: result192.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('❌ Erreur upload logo PWA:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upload du logo PWA',
      error: error.message 
    });
  }
};

/**
 * Récupérer uniquement la couleur de la barre de statut mobile (public)
 */
exports.getStatusBarColor = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    const statusBarColor = settings?.settings?.statusBarColor || '#a01e1e';
    
    res.json({ statusBarColor });
  } catch (error) {
    console.error('❌ Erreur récupération statusBarColor:', error);
    res.json({ statusBarColor: '#a01e1e' }); // Fallback en cas d'erreur
  }
};

