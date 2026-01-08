/**
 * Script de migration des données locales vers MongoDB Atlas
 */

const mongoose = require('mongoose');

// URI de connexion
const LOCAL_URI = 'mongodb://localhost:27017/gj-camp-dev';
const PROD_URI = 'mongodb+srv://andreondouo_db_user:7PZsQpBFJnlt5yGI@cluster0.zkcdnex.mongodb.net/gj-camp-prod';

async function migrateData() {
  try {
    console.log('🔄 Connexion à la base locale...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connecté à la base locale');

    console.log('🔄 Connexion à MongoDB Atlas...');
    const prodConn = await mongoose.createConnection(PROD_URI).asPromise();
    console.log('✅ Connecté à MongoDB Atlas');

    // Définir les schémas (simplifiés pour l'export)
    const carouselSchema = new mongoose.Schema({}, { strict: false });
    const settingsSchema = new mongoose.Schema({}, { strict: false });
    const userSchema = new mongoose.Schema({}, { strict: false });

    // Modèles local
    const LocalCarousel = localConn.model('Carousel', carouselSchema);
    const LocalSettings = localConn.model('Settings', settingsSchema);
    const LocalUser = localConn.model('User', userSchema);

    // Modèles production
    const ProdCarousel = prodConn.model('Carousel', carouselSchema);
    const ProdSettings = prodConn.model('Settings', settingsSchema);
    const ProdUser = prodConn.model('User', userSchema);

    // 1. Migration Carousel
    console.log('\n📊 Migration des slides du carousel...');
    const localSlides = await LocalCarousel.find({});
    console.log(`   Trouvé ${localSlides.length} slides en local`);
    
    if (localSlides.length > 0) {
      await ProdCarousel.deleteMany({});
      console.log('   🗑️  Anciennes slides supprimées de la production');
      
      const slidesData = localSlides.map(slide => slide.toObject());
      await ProdCarousel.insertMany(slidesData);
      console.log(`   ✅ ${localSlides.length} slides copiées vers la production`);
    }

    // 2. Migration Settings
    console.log('\n⚙️  Migration des paramètres...');
    const localSettings = await LocalSettings.findOne({});
    if (localSettings) {
      await ProdSettings.deleteMany({});
      const settingsData = localSettings.toObject();
      await ProdSettings.create(settingsData);
      console.log('   ✅ Paramètres copiés vers la production');
    }

    // 3. Migration Users (optionnel - vous devrez recréer les mots de passe)
    console.log('\n👥 Migration des utilisateurs...');
    const localUsers = await LocalUser.find({});
    console.log(`   Trouvé ${localUsers.length} utilisateurs en local`);
    
    if (localUsers.length > 0) {
      await ProdUser.deleteMany({});
      const usersData = localUsers.map(user => user.toObject());
      await ProdUser.insertMany(usersData);
      console.log(`   ✅ ${localUsers.length} utilisateurs copiés vers la production`);
    }

    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Allez sur https://gj-camp-website-3fuu.vercel.app');
    console.log('   2. Connectez-vous avec vos identifiants');
    console.log('   3. Vérifiez que tout est correct');

    await localConn.close();
    await prodConn.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error.message);
    process.exit(1);
  }
}

// Lancer la migration
migrateData();
