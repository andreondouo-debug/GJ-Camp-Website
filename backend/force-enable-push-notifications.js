/**
 * Script pour forcer l'activation des notifications push pour TOUS les utilisateurs
 * À exécuter une seule fois pour corriger les données existantes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const forceEnablePushNotifications = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔄 Activation forcée des notifications push pour TOUS les utilisateurs...');
    
    const result = await User.updateMany(
      {}, // Tous les utilisateurs
      { 
        $set: { 
          pushNotifications: true,
          emailNotifications: true 
        } 
      }
    );

    console.log(`\n✅ Migration terminée !`);
    console.log(`   📊 ${result.modifiedCount} utilisateurs mis à jour`);
    console.log(`   📊 ${result.matchedCount} utilisateurs trouvés au total`);

    // Vérification
    const users = await User.find({}).select('email pushNotifications emailNotifications');
    console.log('\n📋 État après migration:');
    users.forEach(user => {
      console.log(`   - ${user.email}: pushNotifications=${user.pushNotifications}, emailNotifications=${user.emailNotifications}`);
    });

    const enabledCount = await User.countDocuments({ pushNotifications: true });
    const totalCount = await User.countDocuments({});
    console.log(`\n✅ ${enabledCount}/${totalCount} utilisateurs ont pushNotifications activé`);

    await mongoose.connection.close();
    console.log('\n✅ Migration terminée avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

forceEnablePushNotifications();
