#!/usr/bin/env node

/**
 * Script pour nettoyer tous les anciens abonnements push
 * À lancer avant de migrer vers de nouvelles clés VAPID
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function cleanPushSubscriptions() {
  console.log('🧹 Nettoyage des anciens abonnements push...\n');
  
  try {
    // Connexion MongoDB
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le modèle User
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Compter les utilisateurs avec abonnements
    const usersWithSub = await User.countDocuments({ 
      pushSubscription: { $ne: null } 
    });
    
    console.log(`📊 Utilisateurs avec abonnement push: ${usersWithSub}\n`);

    if (usersWithSub === 0) {
      console.log('✅ Aucun abonnement à nettoyer');
      process.exit(0);
    }

    // Demander confirmation
    console.log('⚠️  ATTENTION: Cette action va supprimer TOUS les abonnements push');
    console.log('   Les utilisateurs devront se réabonner avec les nouvelles clés VAPID\n');
    
    // Supprimer tous les abonnements
    const result = await User.updateMany(
      { pushSubscription: { $ne: null } },
      { 
        $set: { 
          pushSubscription: null,
          pushNotifications: false 
        } 
      }
    );

    console.log(`✅ ${result.modifiedCount} abonnements supprimés\n`);
    console.log('═══════════════════════════════════════════');
    console.log('✅ NETTOYAGE TERMINÉ');
    console.log('═══════════════════════════════════════════\n');
    console.log('Prochaines étapes:');
    console.log('1. Les utilisateurs doivent se reconnecter');
    console.log('2. Aller dans Profil → Activer "Notifications Push"');
    console.log('3. Les nouveaux abonnements utiliseront les nouvelles clés VAPID\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

cleanPushSubscriptions();
