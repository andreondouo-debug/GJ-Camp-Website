require('dotenv').config();
const mongoose = require('mongoose');
const Payout = require('./src/models/Payout');
const Campus = require('./src/models/Campus');
const Registration = require('./src/models/Registration');

async function checkAllPayouts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. TOUS les payouts, tous statuts
    console.log('💰 TOUS LES PAYOUTS (derniers 20):');
    const allPayouts = await Payout.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('registration', 'firstName lastName refuge amountPaid');

    if (allPayouts.length > 0) {
      console.log(`\nTotal: ${allPayouts.length} payouts\n`);
      allPayouts.forEach((payout, index) => {
        console.log(`\n[${index + 1}] Payout ${payout._id}`);
        console.log({
          campus: payout.campus,
          montant: payout.amount + '€',
          montantOriginal: payout.originalAmount + '€',
          emailRecipient: payout.recipientEmail || '❌ VIDE',
          status: payout.status,
          erreur: payout.errorMessage || '-',
          batchId: payout.paypalBatchId || '-',
          inscription: payout.registration ? `${payout.registration.firstName} ${payout.registration.lastName}` : 'N/A',
          date: payout.createdAt.toLocaleString('fr-FR'),
        });
      });
    } else {
      console.log('ℹ️  Aucun payout trouvé dans la base');
    }

    // 2. Tous les campus
    console.log('\n\n📍 TOUS LES CAMPUS:');
    const allCampus = await Campus.find();
    if (allCampus.length > 0) {
      allCampus.forEach(campus => {
        console.log(`\n${campus.name}:`);
        console.log({
          paypalEmail: campus.paypalEmail || '❌ NON CONFIGURÉ',
          redistribution: campus.redistributionPercentage + '%',
          actif: campus.isActive ? '✅' : '❌',
          notes: campus.notes || '-'
        });
      });
    } else {
      console.log('ℹ️  Aucun campus trouvé');
    }

    // 3. Statistiques par campus
    console.log('\n\n📊 STATISTIQUES PAR CAMPUS:');
    const statsByCampus = await Payout.aggregate([
      {
        $group: {
          _id: {
            campus: '$campus',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.campus': 1, '_id.status': 1 } }
    ]);

    if (statsByCampus.length > 0) {
      console.table(statsByCampus.map(s => ({
        Campus: s._id.campus,
        Status: s._id.status,
        Nombre: s.count,
        Total: s.totalAmount.toFixed(2) + '€'
      })));
    } else {
      console.log('Aucune statistique');
    }

    // 4. Inscriptions récentes tous campus
    console.log('\n\n📝 INSCRIPTIONS RÉCENTES (10 dernières):');
    const recentRegistrations = await Registration.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName refuge amountPaid paymentStatus createdAt');

    if (recentRegistrations.length > 0) {
      recentRegistrations.forEach(reg => {
        console.log({
          nom: `${reg.firstName} ${reg.lastName}`,
          refuge: reg.refuge,
          montantPayé: reg.amountPaid + '€',
          statutPaiement: reg.paymentStatus,
          date: reg.createdAt.toLocaleString('fr-FR')
        });
      });
    } else {
      console.log('Aucune inscription');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  }
}

checkAllPayouts();
