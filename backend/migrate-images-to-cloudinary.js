/**
 * Script de migration des images locales vers Cloudinary
 * Transfère les images du carrousel et le logo vers Cloudinary
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gj-camp-dev';

async function migrateImages() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Importer les modèles
    const CarouselSlide = require('./src/models/CarouselSlide');
    const Settings = require('./src/models/Settings');

    // 1. Migrer les images du carrousel
    console.log('📸 Migration des images du carrousel...');
    const slides = await CarouselSlide.find({});
    
    for (const slide of slides) {
      if (slide.image && !slide.image.startsWith('http')) {
        console.log(`\n🔄 Traitement: ${slide.title}`);
        console.log(`   Image actuelle: ${slide.image}`);
        
        // Construire le chemin complet
        let imagePath;
        if (slide.image.startsWith('/uploads/')) {
          imagePath = path.join(__dirname, slide.image);
        } else {
          imagePath = path.join(__dirname, 'uploads', slide.image);
        }
        
        console.log(`   Chemin: ${imagePath}`);
        
        // Vérifier si le fichier existe localement
        if (fs.existsSync(imagePath)) {
          try {
            // Vérifier la taille du fichier
            const stats = fs.statSync(imagePath);
            const fileSizeMB = stats.size / (1024 * 1024);
            console.log(`   📊 Taille originale: ${fileSizeMB.toFixed(2)} MB`);
            
            // Compresser l'image si elle est trop grosse
            let uploadPath = imagePath;
            if (fileSizeMB > 5) {
              console.log('   🗜️  Compression de l\'image...');
              const tempPath = path.join(__dirname, 'uploads', `temp-${Date.now()}.jpg`);
              
              await sharp(imagePath)
                .resize(1920, null, { // Largeur max 1920px, hauteur proportionnelle
                  withoutEnlargement: true,
                  fit: 'inside'
                })
                .jpeg({ quality: 85 }) // Compression JPEG qualité 85%
                .toFile(tempPath);
              
              const compressedStats = fs.statSync(tempPath);
              const compressedSizeMB = compressedStats.size / (1024 * 1024);
              console.log(`   ✅ Compressée: ${compressedSizeMB.toFixed(2)} MB`);
              
              uploadPath = tempPath;
            }
            
            // Upload vers Cloudinary
            console.log('   ⬆️  Upload vers Cloudinary...');
            const result = await cloudinary.uploader.upload(uploadPath, {
              folder: 'gj-camp/carousel',
              resource_type: 'auto',
              quality: 'auto',
              fetch_format: 'auto'
            });
            
            // Supprimer le fichier temporaire si créé
            if (uploadPath !== imagePath && fs.existsSync(uploadPath)) {
              fs.unlinkSync(uploadPath);
            }
            
            // Mettre à jour la base de données
            slide.image = result.secure_url;
            await slide.save();
            
            console.log(`   ✅ Migré: ${result.secure_url}`);
          } catch (error) {
            console.error(`   ❌ Erreur upload:`, error.message);
          }
        } else {
          console.log(`   ⚠️  Fichier introuvable localement`);
          console.log(`   💡 Vous devrez re-uploader cette image manuellement`);
        }
      } else if (slide.image && slide.image.startsWith('http')) {
        console.log(`\n✅ ${slide.title} - Déjà sur Cloudinary`);
      }
    }

    // 2. Migrer le logo
    console.log('\n\n🎨 Migration du logo...');
    const settings = await Settings.findOne();
    
    if (settings && settings.logoUrl && !settings.logoUrl.startsWith('http')) {
      console.log(`   Logo actuel: ${settings.logoUrl}`);
      
      let logoPath;
      if (settings.logoUrl.startsWith('/uploads/')) {
        logoPath = path.join(__dirname, settings.logoUrl);
      } else {
        logoPath = path.join(__dirname, 'uploads', settings.logoUrl);
      }
      
      console.log(`   Chemin: ${logoPath}`);
      
      if (fs.existsSync(logoPath)) {
        try {
          const stats = fs.statSync(logoPath);
          const fileSizeMB = stats.size / (1024 * 1024);
          console.log(`   📊 Taille originale: ${fileSizeMB.toFixed(2)} MB`);
          
          // Compresser si nécessaire
          let uploadPath = logoPath;
          if (fileSizeMB > 1) {
            console.log('   🗜️  Compression du logo...');
            const tempPath = path.join(__dirname, 'uploads', `temp-logo-${Date.now()}.png`);
            
            await sharp(logoPath)
              .resize(500, null, {
                withoutEnlargement: true,
                fit: 'inside'
              })
              .png({ quality: 90 })
              .toFile(tempPath);
            
            const compressedStats = fs.statSync(tempPath);
            const compressedSizeMB = compressedStats.size / (1024 * 1024);
            console.log(`   ✅ Compressé: ${compressedSizeMB.toFixed(2)} MB`);
            
            uploadPath = tempPath;
          }
          
          console.log('   ⬆️  Upload vers Cloudinary...');
          const result = await cloudinary.uploader.upload(uploadPath, {
            folder: 'gj-camp/logo',
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto'
          });
          
          // Supprimer le fichier temporaire si créé
          if (uploadPath !== logoPath && fs.existsSync(uploadPath)) {
            fs.unlinkSync(uploadPath);
          }
          
          settings.logoUrl = result.secure_url;
          await settings.save();
          
          console.log(`   ✅ Logo migré: ${result.secure_url}`);
        } catch (error) {
          console.error(`   ❌ Erreur upload logo:`, error.message);
        }
      } else {
        console.log(`   ⚠️  Fichier logo introuvable localement`);
        console.log(`   💡 Vous devrez re-uploader le logo manuellement`);
      }
    } else if (settings && settings.logoUrl && settings.logoUrl.startsWith('http')) {
      console.log('   ✅ Logo déjà sur Cloudinary');
    }

    console.log('\n\n✨ Migration terminée !');
    console.log('\n📝 Résumé:');
    console.log(`   - Slides traités: ${slides.length}`);
    console.log(`   - Logo: ${settings ? 'traité' : 'non trouvé'}`);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion MongoDB');
  }
}

// Vérifier la configuration Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error('❌ Variables Cloudinary manquantes!');
  console.error('Assurez-vous que CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET sont définis.');
  process.exit(1);
}

console.log('🚀 Démarrage de la migration...\n');
console.log(`Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`MongoDB: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}\n`);

migrateImages();
