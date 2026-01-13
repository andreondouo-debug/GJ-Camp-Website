require('dotenv').config();
const mongoose = require('mongoose');
const Campus = require('./src/models/Campus');
const Payout = require('./src/models/Payout');
const Registration = require('./src/models/Registration');

async function checkPayoutNantes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Vérifier la configuration du campus Nantes
    console.log('📍 Campus Nantes:');
    const campusNantes = await Campus.findOne({ name: 'Nantes' });
    if (campusNantes) {
      console.log('✅ Campus trouvé:', {
        name: campusNantes.name,
        paypalEmail: campusNantes.paypalEmail || '❌ NON CONFIGURÉ',
        redistributionPercentage: campusNantes.redistributionPercentage,
        isActive: campusNantes.isActive,
      });
    } else {
      console.log('❌ Campus Nantes non trouvé dans la base');
    }
    console.log('');

    // 2. Vérifier la configuration du campus Laval (pour comparaison)
    console.log('📍 Campus Laval:');
    const campusLaval = await Campus.findOne({ name: 'Laval' });
    if (campusLaval) {
      console.log('✅ Campus trouvé:', {
        name: campusLaval.name,
        paypalEmail: campusLaval.paypalEmail || '❌ NON CONFIGURÉ',
        redistributionPercentage: campusLaval.redistributionPercentage,
        isActive: campusLaval.isActive,
      });
    } else {
      console.log('❌ Campus Laval non trouvé dans la base');
    }
    console.log('');

    // 3. Vérifier les payouts récents pour Nantes
    console.log('💰 Payouts récents pour Nantes:');
    const payoutsNantes = await Payout.find({ campus: 'Nantes' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('registration', 'firstName lastName amountPaid');

    if (payoutsNantes.length > 0) {
      payoutsNantes.forEach(payout => {
        console.log({
          id: payout._id,
          montant: payout.amount + '€',
          email: payout.recipientEmail || '❌ MANQUANT',
          status: payout.status,
          erreur: payout.errorMessage || '-',
          date: payout.createdAt.toLocaleString('fr-FR'),
        });
      });
    } else {
      console.log('ℹ️  Aucun payout trouvé pour Nantes');
    }
    console.log('');

    // 4. Vérifier les payouts récents pour Laval (pour comparaison)
    console.log('💰 Payouts récents pour Laval:');
    const payoutsLaval = await Payout.find({ campus: 'Laval' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('registration', 'firstName lastName amountPaid');

    if (payoutsLaval.length > 0) {
      payoutsLaval.forEach(payout => {
        console.log({
          id: payout._id,
          montant: payout.amount + '€',
          email: payout.recipientEmail || '❌ MANQUANT',
          status: payout.status,
          erreur: payout.errorMessage || '-',
          date: payout.createdAt.toLocaleString('fr-FR'),
        });
      });
    } else {
      console.log('ℹ️  Aucun payout trouvé pour Laval');
    }
    console.log('');

    // 5. Vérifier les inscriptions récentes pour Nantes
    console.log('📝 Inscriptions récentes pour Nantes:');
    const registrationsNantes = await Registration.find({ refuge: 'Nantes' })
      .sort({ createdAt: -1 })
      .limit(3);

    if (registrationsNantes.length > 0) {
      registrationsNantes.forEach(reg => {
        console.log({
          nom: `${reg.firstName} ${reg.lastName}`,
          montantPayé: reg.amountPaid + '€',
          statutPaiement: reg.paymentStatus,
          date: reg.createdAt.toLocaleString('fr-FR'),
        });
      });
    } else {
      console.log('ℹ️  Aucune inscription trouvée pour Nantes');
    }
    console.log('');

    // 6. Statistiques des payouts par statut
    console.log('📊 Statistiques des payouts Nantes:');
    const statsNantes = await Payout.aggregate([
      { $match: { campus: 'Nantes' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        }
      }
    ]);
    console.table(statsNantes);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  }
}

checkPayoutNantes();
