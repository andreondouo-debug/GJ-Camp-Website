/**
 * SUPPRESSION DES DONNÉES DE TEST (avant Février 2026)
 * Supprime: TransactionLog + Payouts de test
 * NE SUPPRIME PAS: Utilisateurs, Inscriptions récentes
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const CUTOFF_DATE = new Date('2026-02-01T00:00:00.000Z');

async function runCleanup() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('🔗 Connexion à MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ Connecté\n');

    const TransactionLog = require('../src/models/TransactionLog');
    const Payout = require('../src/models/Payout');

    console.log(`📅 Suppression des données de test avant le ${CUTOFF_DATE.toLocaleDateString('fr-FR')}`);
    console.log('='.repeat(60));

    // 1. Supprimer les TransactionLog de test
    const txResult = await TransactionLog.deleteMany({ createdAt: { $lt: CUTOFF_DATE } });
    console.log(`✅ TransactionLog supprimés : ${txResult.deletedCount}`);

    // 2. Supprimer les Payouts de test
    const payoutResult = await Payout.deleteMany({ createdAt: { $lt: CUTOFF_DATE } });
    console.log(`✅ Payouts supprimés : ${payoutResult.deletedCount}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Nettoyage terminé ! Base de données propre.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

runCleanup();
