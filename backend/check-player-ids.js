require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkPlayerIds() {
  try {
    console.log('🔍 Vérification des Player IDs OneSignal...\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gj-camp');
    console.log('✅ Connecté à MongoDB\n');

    const users = await User.find({}).select('firstName lastName email pushPlayerId');
    
    console.log(`📊 Total utilisateurs: ${users.length}\n`);
    
    const usersWithPlayerId = users.filter(u => u.pushPlayerId);
    const usersWithoutPlayerId = users.filter(u => !u.pushPlayerId);
    
    console.log(`✅ Utilisateurs AVEC Player ID: ${usersWithPlayerId.length}`);
    usersWithPlayerId.forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName} (${u.email})`);
      console.log(`     Player ID: ${u.pushPlayerId}\n`);
    });
    
    console.log(`❌ Utilisateurs SANS Player ID: ${usersWithoutPlayerId.length}`);
    usersWithoutPlayerId.forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName} (${u.email})\n`);
    });
    
    console.log('\n💡 Solution:');
    if (usersWithoutPlayerId.length > 0) {
      console.log('   1. Déconnectez-vous du site');
      console.log('   2. Reconnectez-vous');
      console.log('   3. Acceptez les notifications OneSignal si demandé');
      console.log('   4. Le Player ID sera automatiquement sauvegardé');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkPlayerIds();
