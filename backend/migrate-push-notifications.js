#!/usr/bin/env node

/**
 * Script de migration pour activer les notifications push par défaut
 * pour TOUS les utilisateurs existants
 * 
 * Usage: node migrate-push-notifications.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const migrateUsers = async () => {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gj-camp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Trouver tous les utilisateurs sans pushNotifications défini (undefined ou null)
    const usersToUpdate = await User.find({
      $or: [
        { pushNotifications: { $exists: false } },
        { pushNotifications: null }
      ]
    });

    console.log(`📊 Utilisateurs trouvés sans pushNotifications: ${usersToUpdate.length}`);

    if (usersToUpdate.length === 0) {
      console.log('✅ Tous les utilisateurs ont déjà pushNotifications défini');
      await mongoose.connection.close();
      return;
    }

    // Mettre à jour tous les utilisateurs
    const result = await User.updateMany(
      {
        $or: [
          { pushNotifications: { $exists: false } },
          { pushNotifications: null }
        ]
      },
      {
        $set: {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false
        }
      }
    );

    console.log('✅ Migration terminée!');
    console.log(`   📝 Utilisateurs mis à jour: ${result.modifiedCount}`);
    console.log(`   🔔 pushNotifications activé par défaut pour tous`);

    // Vérification
    const verifyCount = await User.countDocuments({ pushNotifications: true });
    const totalCount = await User.countDocuments();
    console.log(`   ✓ Total utilisateurs: ${totalCount}`);
    console.log(`   ✓ Avec pushNotifications=true: ${verifyCount}`);

    await mongoose.connection.close();
    console.log('🔌 Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Exécuter la migration
migrateUsers();
