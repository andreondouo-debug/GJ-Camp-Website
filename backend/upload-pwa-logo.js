#!/usr/bin/env node

/**
 * Script pour uploader le logo PWA sur Cloudinary
 * Usage: node upload-pwa-logo.js <chemin-vers-image>
 * Exemple: node upload-pwa-logo.js ~/Downloads/logo-gj.png
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadLogo = async (imagePath) => {
  try {
    // Vérifier que le fichier existe
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Fichier introuvable:', imagePath);
      console.log('\n💡 Astuce: Glissez-déposez l\'image dans le terminal pour obtenir le chemin');
      process.exit(1);
    }

    console.log('📤 Upload du logo PWA sur Cloudinary...');
    console.log('   Fichier:', imagePath);

    // Upload sur Cloudinary
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'gj-camp/pwa',
      public_id: 'logo-gj-official',
      overwrite: true,
      transformation: [
        { width: 512, height: 512, crop: 'fill', gravity: 'center' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    console.log('\n✅ Logo uploadé avec succès !');
    console.log('   URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);
    console.log('   Taille:', result.width, 'x', result.height);
    console.log('\n📋 Copiez cette URL pour le manifest.json:');
    console.log('   ' + result.secure_url);

    // Créer aussi une version 192x192
    const result192 = await cloudinary.uploader.upload(imagePath, {
      folder: 'gj-camp/pwa',
      public_id: 'logo-gj-official-192',
      overwrite: true,
      transformation: [
        { width: 192, height: 192, crop: 'fill', gravity: 'center' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    console.log('\n✅ Version 192x192 créée:');
    console.log('   ' + result192.secure_url);

    console.log('\n🔄 Mise à jour automatique du manifest...');
    
    // Mettre à jour le manifest.json
    const manifestPath = path.join(__dirname, '../frontend/public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    manifest.icons = [
      {
        src: result192.secure_url,
        type: 'image/png',
        sizes: '192x192',
        purpose: 'any maskable'
      },
      {
        src: result.secure_url,
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any maskable'
      }
    ];
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ manifest.json mis à jour !');
    
    console.log('\n🎉 Terminé ! Le logo PWA est configuré.');
    console.log('💡 N\'oubliez pas de commit et push les changements.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error.message);
    process.exit(1);
  }
};

// Récupérer le chemin de l'image depuis les arguments
const imagePath = process.argv[2];

if (!imagePath) {
  console.log('📝 Usage: node upload-pwa-logo.js <chemin-vers-image>');
  console.log('\nExemples:');
  console.log('  node upload-pwa-logo.js ~/Downloads/logo.png');
  console.log('  node upload-pwa-logo.js "/Users/nom/Images/logo.jpg"');
  console.log('\n💡 Astuce: Glissez-déposez l\'image dans le terminal');
  process.exit(1);
}

uploadLogo(path.resolve(imagePath));
