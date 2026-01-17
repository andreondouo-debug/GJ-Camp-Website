require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

// URI MongoDB Atlas (production)
const MONGODB_ATLAS_URI = 'mongodb+srv://GJ-Camp_Website:JeunesseCrptGj@cluster0.juxp1sw.mongodb.net/gj-camp-prod?retryWrites=true&w=majority';

async function checkPlayerIds() {
  try {
    console.log('🔍 Vérification des Player IDs OneSignal (MongoDB Atlas Production)\n');
    
    // Connexion à MongoDB Atlas
    await mongoose.connect(MONGODB_ATLAS_URI);
    console.log('✅ Connecté à MongoDB Atlas (Production)\n');

    // Récupérer tous les utilisateurs
    const users = await User.find({}).select('firstName lastName email pushPlayerId');
    
    console.log(`📊 Total utilisateurs: ${users.length}\n`);

    // Séparer les utilisateurs avec et sans Player ID
    const withPlayerId = users.filter(u => u.pushPlayerId);
    const withoutPlayerId = users.filter(u => !u.pushPlayerId);

    console.log(`✅ Utilisateurs AVEC Player ID: ${withPlayerId.length}`);
    withPlayerId.forEach(u => {
      console.log(`   ✓ ${u.firstName} ${u.lastName} (${u.email})`);
      console.log(`     Player ID: ${u.pushPlayerId}`);
    });

    console.log(`\n❌ Utilisateurs SANS Player ID: ${withoutPlayerId.length}`);
    withoutPlayerId.forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName} (${u.email})`);
    });

    if (withoutPlayerId.length > 0) {
      console.log('\n💡 Ces utilisateurs doivent cliquer sur "Activer mes notifications" sur le site');
    }

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB Atlas');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkPlayerIds();
