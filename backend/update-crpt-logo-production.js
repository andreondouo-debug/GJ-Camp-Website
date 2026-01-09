/**
 * Script pour ajouter le logo CRPT dans les settings de production
 * Usage: node update-crpt-logo-production.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('./src/models/Settings');

const PRODUCTION_MONGODB_URI = 'mongodb+srv://GJ-Camp_Website:JeunesseCrptGj@cluster0.juxp1sw.mongodb.net/gj-camp?retryWrites=true&w=majority';
const CRPT_LOGO_URL = 'https://res.cloudinary.com/dbouijio-1/image/upload/v1767961427/gj-camp/logo/crpt-logo.png';

async function updateCrptLogo() {
  try {
    console.log('🔌 Connexion à MongoDB Production...');
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log('✅ Connecté à MongoDB Production');

    // Récupérer les settings existants
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('❌ Aucun settings trouvé');
      process.exit(1);
    }

    console.log('📝 Mise à jour du logo CRPT...');
    
    // Ajouter ou mettre à jour crptLogoUrl
    if (!settings.settings) {
      settings.settings = {};
    }
    
    settings.settings.crptLogoUrl = CRPT_LOGO_URL;
    settings.markModified('settings'); // Important pour Mongoose
    await settings.save();

    console.log('✅ Logo CRPT ajouté aux settings production');
    console.log(`\n📌 URL du logo CRPT: ${CRPT_LOGO_URL}\n`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

updateCrptLogo();
