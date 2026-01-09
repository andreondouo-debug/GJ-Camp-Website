/**
 * Script pour uploader le logo CRPT sur Cloudinary
 * Usage: node upload-crpt-logo-cloudinary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Settings = require('./src/models/Settings');
const path = require('path');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadCrptLogoToCloudinary() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Chercher le fichier logo CRPT local
    const logoPath = path.join(__dirname, '../frontend/public/images/crpt-logo.png');
    console.log(`📁 Recherche du logo CRPT: ${logoPath}`);

    // Upload vers Cloudinary dans le dossier gj-camp/logo
    console.log('📤 Upload du logo CRPT vers Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(logoPath, {
      folder: 'gj-camp/logo',
      public_id: 'crpt-logo',
      overwrite: true,
      resource_type: 'image'
    });

    console.log('✅ Logo CRPT uploadé sur Cloudinary:', uploadResult.secure_url);

    // Mettre à jour les Settings dans MongoDB (production)
    console.log('💾 Mise à jour des settings dans MongoDB...');
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ settings: {} });
    }

    // Accéder à settings.settings.crptLogoUrl
    if (!settings.settings) {
      settings.settings = {};
    }
    
    settings.settings.crptLogoUrl = uploadResult.secure_url;
    settings.markModified('settings'); // Important pour Mongoose
    await settings.save();

    console.log('✅ Settings mis à jour avec le logo CRPT Cloudinary');
    console.log('🎉 Migration terminée !');
    console.log(`\n📌 URL du logo CRPT: ${uploadResult.secure_url}\n`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

uploadCrptLogoToCloudinary();
