/**
 * PRÉVISUALISATION NETTOYAGE BASE DE DONNÉES
 * Affiche ce qui serait supprimé SANS rien supprimer
 * Affiche aussi les utilisateurs récents sans inscription (paiements récupérables)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const CUTOFF_DATE = new Date('2026-02-01T00:00:00.000Z'); // Supprimer AVANT cette date

async function previewCleanup() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté\n');

    const Registration = require('../src/models/Registration');
    const PreRegistration = require('../src/models/PreRegistration');
    const TransactionLog = require('../src/models/TransactionLog');
    const Payout = require('../src/models/Payout');
    const User = require('../src/models/User');

    console.log(`📅 Date limite : avant le ${CUTOFF_DATE.toLocaleDateString('fr-FR')}`);
    console.log('=' .repeat(60));

    // ===== DONNÉES DE TEST À SUPPRIMER =====
    console.log('\n🗑️  DONNÉES DE TEST (avant Février 2026) :');
    console.log('-'.repeat(60));

    const oldRegistrations = await Registration.find({ createdAt: { $lt: CUTOFF_DATE } })
      .select('firstName lastName email refuge amountPaid paymentStatus createdAt');
    console.log(`\n📋 Inscriptions : ${oldRegistrations.length}`);
    oldRegistrations.forEach(r => {
      console.log(`   - ${r.firstName} ${r.lastName} | ${r.email} | ${r.refuge} | ${r.amountPaid}€ | ${r.paymentStatus} | ${new Date(r.createdAt).toLocaleDateString('fr-FR')}`);
    });

    const oldPreRegs = await PreRegistration.find({ createdAt: { $lt: CUTOFF_DATE } })
      .select('firstName lastName email refuge cashAmount status createdAt');
    console.log(`\n⏳ Pré-inscriptions : ${oldPreRegs.length}`);
    oldPreRegs.forEach(r => {
      console.log(`   - ${r.firstName} ${r.lastName} | ${r.email} | ${r.refuge} | ${r.cashAmount}€ | ${r.status} | ${new Date(r.createdAt).toLocaleDateString('fr-FR')}`);
    });

    const oldTxLogs = await TransactionLog.find({ createdAt: { $lt: CUTOFF_DATE } })
      .select('orderID amount status payerEmail createdAt');
    console.log(`\n💳 Transactions PayPal loggées : ${oldTxLogs.length}`);
    oldTxLogs.forEach(t => {
      console.log(`   - ${t.orderID} | ${t.payerEmail} | ${t.amount}€ | ${t.status} | ${new Date(t.createdAt).toLocaleDateString('fr-FR')}`);
    });

    const oldPayouts = await Payout.find({ createdAt: { $lt: CUTOFF_DATE } })
      .select('campus amount status createdAt');
    console.log(`\n💰 Redistributions (Payouts) : ${oldPayouts.length}`);
    oldPayouts.forEach(p => {
      console.log(`   - ${p.campus} | ${p.amount}€ | ${p.status} | ${new Date(p.createdAt).toLocaleDateString('fr-FR')}`);
    });

    // ===== PAIEMENTS RÉCENTS RÉCUPÉRABLES =====
    console.log('\n\n✅ PAIEMENTS RÉCENTS RÉCUPÉRABLES (Utilisateurs sans inscription) :');
    console.log('-'.repeat(60));

    // Trouver les utilisateurs créés récemment (après la date limite) qui n'ont PAS d'inscription
    const recentUsers = await User.find({ 
      createdAt: { $gte: CUTOFF_DATE },
      role: 'utilisateur'
    }).select('firstName lastName email createdAt isEmailVerified');

    const recentUserIds = recentUsers.map(u => u._id);
    
    // Trouver ceux qui ont une inscription
    const usersWithRegistration = await Registration.find({
      user: { $in: recentUserIds }
    }).select('user');
    
    const usersWithRegIds = new Set(usersWithRegistration.map(r => r.user.toString()));
    
    const orphanUsers = recentUsers.filter(u => !usersWithRegIds.has(u._id.toString()));

    console.log(`\n👤 Utilisateurs sans inscription créés après le 01/02/2026 : ${orphanUsers.length}`);
    if (orphanUsers.length > 0) {
      console.log('   ⚠️  Ces personnes ont probablement payé mais l\'inscription a échoué !\n');
      orphanUsers.forEach(u => {
        console.log(`   - ${u.firstName} ${u.lastName} | ${u.email} | Créé le ${new Date(u.createdAt).toLocaleDateString('fr-FR')} à ${new Date(u.createdAt).toLocaleTimeString('fr-FR')}`);
      });
    }

    // Récentes inscriptions réussies (pour info)
    const recentRegistrations = await Registration.find({ createdAt: { $gte: CUTOFF_DATE } })
      .select('firstName lastName email refuge amountPaid paymentStatus createdAt');
    console.log(`\n✅ Inscriptions récentes déjà en base : ${recentRegistrations.length}`);
    recentRegistrations.forEach(r => {
      console.log(`   - ${r.firstName} ${r.lastName} | ${r.email} | ${r.refuge} | ${r.amountPaid}€ | ${r.paymentStatus} | ${new Date(r.createdAt).toLocaleDateString('fr-FR')}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('💡 Pour effectuer la suppression, lancer : node scripts/run-cleanup.js');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

previewCleanup();
