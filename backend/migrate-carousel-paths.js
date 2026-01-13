require('dotenv').config();
const mongoose = require('mongoose');
const CarouselSlide = require('./src/models/CarouselSlide');

async function migrateCarouselPaths() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver toutes les slides
    const slides = await CarouselSlide.find();
    console.log(`📊 ${slides.length} slides trouvées\n`);

    let updated = 0;
    let skipped = 0;

    for (const slide of slides) {
      const oldPath = slide.image;
      
      // Si l'image commence déjà par /uploads/ ou http, on saute
      if (oldPath.startsWith('/uploads/') || oldPath.startsWith('http://') || oldPath.startsWith('https://')) {
        console.log(`⏭️  Sauté (déjà bon): ${oldPath}`);
        skipped++;
        continue;
      }

      // Ajouter /uploads/ au début
      const newPath = `/uploads/${oldPath}`;
      slide.image = newPath;
      await slide.save();
      
      console.log(`✅ Migré: ${oldPath} → ${newPath}`);
      updated++;
    }

    console.log(`\n✅ Migration terminée:`);
    console.log(`   - ${updated} slide(s) mise(s) à jour`);
    console.log(`   - ${skipped} slide(s) ignorée(s)`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  }
}

migrateCarouselPaths();
