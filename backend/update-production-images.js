/**
 * Script pour mettre à jour les slides de production avec des URLs Cloudinary valides
 * À exécuter une seule fois pour corriger les chemins d'images
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connexion MongoDB Atlas (Production)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://GJ-Camp_Website:JeunesseCrptGj@cluster0.juxp1sw.mongodb.net/gj-camp?retryWrites=true&w=majority';

// URLs Cloudinary des images migrées (à ajuster selon vos besoins)
const IMAGE_MAPPINGS = {
  'carousel-1765027992136-127770765.jpg': 'https://res.cloudinary.com/dbouijio-1/image/upload/v1767948919/gj-camp/carousel/favdcyaqoyx48wrnheon.jpg',
  'carousel-1765030510063-985821372.jpg': 'https://res.cloudinary.com/dbouijio-1/image/upload/v1767948926/gj-camp/carousel/whvlzjytrlmyhljrgecv.jpg'
};

async function updateProductionImages() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas (Production)...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté\n');

    const CarouselSlide = require('./src/models/CarouselSlide');
    const Settings = require('./src/models/Settings');

    // Mettre à jour les slides du carrousel
    console.log('📸 Mise à jour des slides du carrousel...\n');
    const slides = await CarouselSlide.find({});
    
    for (const slide of slides) {
      if (slide.image && !slide.image.startsWith('http')) {
        console.log(`🔄 ${slide.title}`);
        console.log(`   Ancien: ${slide.image}`);
        
        // Chercher un mapping
        if (IMAGE_MAPPINGS[slide.image]) {
          slide.image = IMAGE_MAPPINGS[slide.image];
          await slide.save();
          console.log(`   ✅ Nouveau: ${slide.image}\n`);
        } else {
          console.log(`   ⚠️  Pas de mapping trouvé - cette image devra être re-uploadée\n`);
        }
      } else if (slide.image && slide.image.startsWith('http')) {
        console.log(`✅ ${slide.title} - Déjà sur Cloudinary\n`);
      }
    }

    // Vérifier le logo
    console.log('🎨 Vérification du logo...');
    const settings = await Settings.findOne();
    
    if (settings && settings.logoUrl) {
      if (!settings.logoUrl.startsWith('http')) {
        console.log(`   ⚠️  Logo actuel: ${settings.logoUrl}`);
        console.log(`   💡 Le logo devra être re-uploadé depuis l'interface d'administration\n`);
      } else {
        console.log(`   ✅ Logo déjà sur Cloudinary: ${settings.logoUrl}\n`);
      }
    }

    console.log('✨ Mise à jour terminée !\n');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion MongoDB');
  }
}

console.log('🚀 Démarrage de la mise à jour production...\n');
console.log(`MongoDB: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}\n`);

updateProductionImages();
