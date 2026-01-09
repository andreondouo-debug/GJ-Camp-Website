/**
 * Script pour uploader le logo sur Cloudinary et mettre à jour la base de production
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const MONGODB_URI = 'mongodb+srv://GJ-Camp_Website:JeunesseCrptGj@cluster0.juxp1sw.mongodb.net/gj-camp?retryWrites=true&w=majority';

async function uploadLogo() {
  try {
    console.log('⬆️  Upload du logo sur Cloudinary...');
    const result = await cloudinary.uploader.upload('uploads/logo-1764717959319.png', {
      folder: 'gj-camp/logo',
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });
    
    console.log(`✅ Logo uploadé: ${result.secure_url}\n`);
    
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté\n');
    
    const Settings = require('./src/models/Settings');
    const settings = await Settings.findOne();
    
    if (settings) {
      console.log(`📝 Ancien logoUrl: ${settings.settings.logoUrl}`);
      settings.settings.logoUrl = result.secure_url;
      settings.markModified('settings'); // Important pour Mongoose
      await settings.save();
      console.log(`✅ Nouveau logoUrl: ${settings.settings.logoUrl}\n`);
      
      // Vérifier que c'est bien sauvegardé
      const check = await Settings.findOne();
      console.log(`🔍 Vérification: ${check.settings.logoUrl}\n`);
    } else {
      console.log('⚠️  Aucun settings trouvé\n');
    }
    
    console.log('✨ Logo migré avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

console.log('🚀 Migration du logo vers Cloudinary...\n');
uploadLogo();
