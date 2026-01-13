const paypal = require('@paypal/payouts-sdk');
const { paypalClient } = require('../config/paypal');
const Registration = require('../models/Registration');
const Campus = require('../models/Campus');
const Payout = require('../models/Payout');

/**
 * Service de redistribution automatique des paiements par campus
 */
class PayoutService {
  /**
   * Créer un payout pour une inscription
   */
  async createPayoutForRegistration(registrationId, processedBy = null) {
    try {
      const registration = await Registration.findById(registrationId);
      
      if (!registration) {
        throw new Error('Inscription introuvable');
      }

      // Récupérer les infos du campus
      let campus = await Campus.findOne({ name: registration.refuge, isActive: true });

      // ✅ Si le campus n'existe pas, le créer automatiquement
      if (!campus) {
        console.log(`📝 Création automatique du campus: ${registration.refuge}`);
        campus = await Campus.create({
          name: registration.refuge,
          paypalEmail: '', // À configurer manuellement plus tard
          iban: '',
          redistributionPercentage: 100,
          isActive: true,
          contactPerson: {
            name: '',
            email: '',
            phone: ''
          },
          notes: 'Campus créé automatiquement lors d\'une inscription'
        });
      }

      // Vérifier si l'email PayPal est configuré
      if (!campus.paypalEmail) {
        console.warn(`⚠️ Email PayPal non configuré pour le campus ${registration.refuge}`);
        // Ne pas bloquer, créer quand même le payout en attente de configuration
      }

      // Calculer le montant à redistribuer
      const originalAmount = registration.amountPaid || 0;
      const percentage = campus.redistributionPercentage || 100;
      const amountToSend = (originalAmount * percentage) / 100;

      // Vérifier si un payout existe déjà
      const existingPayout = await Payout.findOne({ 
        registration: registrationId, 
        status: { $in: ['pending', 'processing', 'success'] } 
      });

      if (existingPayout) {
        // ✅ Mettre à jour le payout existant avec le nouveau montant
        existingPayout.amount = amountToSend;
        existingPayout.originalAmount = originalAmount;
        existingPayout.redistributionPercentage = percentage;
        existingPayout.recipientEmail = campus.paypalEmail || '';
        existingPayout.note = `Redistribution pour inscription de ${registration.firstName} ${registration.lastName} (mis à jour: ${originalAmount}€/${registration.totalPrice}€)`;
        existingPayout.updatedAt = new Date();
        
        await existingPayout.save();
        
        console.log(`🔄 Payout mis à jour: ${amountToSend}€ pour ${campus.name} (${originalAmount}€ payés)`);
        return existingPayout;
      }

      // Créer l'enregistrement du payout (même si montant faible ou email manquant)
      const payout = new Payout({
        registration: registrationId,
        campus: registration.refuge,
        amount: amountToSend,
        originalAmount: originalAmount,
        redistributionPercentage: percentage,
        recipientEmail: campus.paypalEmail || '',
        recipientType: 'paypal',
        status: 'pending',
        processedBy: processedBy,
        note: `Redistribution pour inscription de ${registration.firstName} ${registration.lastName} (${originalAmount}€/${registration.totalPrice}€)`,
      });

      await payout.save();

      console.log(`✅ Payout créé: ${amountToSend}€ pour ${campus.name} (${originalAmount}€ payés)`);
      return payout;
    } catch (error) {
      console.error('❌ Erreur création payout:', error);
      throw error;
    }
  }

  /**
   * Exécuter les payouts en attente par lot (batch)
   */
  async executePendingPayouts(limit = 50) {
    try {
      const pendingPayouts = await Payout.find({ status: 'pending' })
        .limit(limit)
        .populate('registration');

      if (pendingPayouts.length === 0) {
        console.log('ℹ️ Aucun payout en attente');
        return { success: true, processed: 0, message: 'Aucun payout à traiter' };
      }

      console.log(`🔄 ${pendingPayouts.length} payout(s) en attente...`);

      // Grouper par campus pour optimiser
      const payoutsByCampus = {};
      pendingPayouts.forEach(payout => {
        if (!payoutsByCampus[payout.campus]) {
          payoutsByCampus[payout.campus] = [];
        }
        payoutsByCampus[payout.campus].push(payout);
      });

      const results = { success: 0, failed: 0, errors: [] };

      // Traiter chaque campus séparément
      for (const [campusName, payouts] of Object.entries(payoutsByCampus)) {
        try {
          const result = await this.sendPayoutBatch(payouts);
          results.success += result.success;
          results.failed += result.failed;
          if (result.errors) {
            results.errors.push(...result.errors);
          }
        } catch (error) {
          console.error(`❌ Erreur batch ${campusName}:`, error);
          results.failed += payouts.length;
          results.errors.push(`${campusName}: ${error.message}`);
        }
      }

      console.log(`✅ Redistribution terminée: ${results.success} succès, ${results.failed} échecs`);
      return results;
    } catch (error) {
      console.error('❌ Erreur exécution payouts:', error);
      throw error;
    }
  }

  /**
   * Envoyer un lot de payouts via PayPal Payouts API
   */
  async sendPayoutBatch(payouts) {
    try {
      if (!payouts || payouts.length === 0) {
        return { success: 0, failed: 0 };
      }

      // ✅ VALIDATION: Vérifier que tous les payouts ont un email
      const payoutsWithoutEmail = payouts.filter(p => !p.recipientEmail || p.recipientEmail.trim() === '');
      
      if (payoutsWithoutEmail.length > 0) {
        console.error(`❌ ${payoutsWithoutEmail.length} payout(s) sans email PayPal pour ${payouts[0].campus}`);
        
        // Marquer ces payouts comme échoués
        await Payout.updateMany(
          { _id: { $in: payoutsWithoutEmail.map(p => p._id) } },
          { 
            status: 'failed', 
            errorMessage: 'Email PayPal non configuré pour ce campus. Configurez l\'email dans la gestion des campus.'
          }
        );
        
        return { 
          success: 0, 
          failed: payoutsWithoutEmail.length,
          errors: [`Campus ${payouts[0].campus}: Email PayPal non configuré`]
        };
      }

      // Marquer comme "processing"
      const payoutIds = payouts.map(p => p._id);
      await Payout.updateMany(
        { _id: { $in: payoutIds } },
        { status: 'processing' }
      );

      // Préparer les items pour PayPal
      const items = payouts.map((payout, index) => ({
        recipient_type: 'EMAIL',
        amount: {
          value: payout.amount.toFixed(2),
          currency: 'EUR',
        },
        receiver: payout.recipientEmail,
        note: payout.note || `Redistribution camp - ${payout.campus}`,
        sender_item_id: payout._id.toString(),
        recipient_wallet: 'PAYPAL',
      }));

      // Créer la requête PayPal Payouts
      const requestBody = {
        sender_batch_header: {
          sender_batch_id: `batch_${Date.now()}_${payouts[0].campus}`,
          email_subject: `Redistribution GJ Camp - ${payouts[0].campus}`,
          email_message: 'Vous avez reçu un paiement pour les inscriptions au camp.',
        },
        items: items,
      };

      const request = new paypal.payouts.PayoutsPostRequest();
      request.requestBody(requestBody);

      const client = paypalClient();
      const response = await client.execute(request);

      console.log(`✅ Batch PayPal créé: ${response.result.batch_header.payout_batch_id}`);
      console.log(`📊 Statut batch: ${response.result.batch_header.batch_status}`);
      console.log(`📦 Items reçus: ${response.result.items?.length || 0}`);
      
      // Debug: Afficher la réponse complète
      if (!response.result.items || response.result.items.length === 0) {
        console.log('ℹ️  PayPal traite les payouts en asynchrone. Marquer comme processing et vérifier plus tard.');
        
        // Marquer tous comme processing avec le batch ID
        const batchId = response.result.batch_header.payout_batch_id;
        let successCount = 0;
        
        for (const payout of payouts) {
          payout.paypalBatchId = batchId;
          payout.status = 'processing';
          payout.processedAt = new Date();
          await payout.save();
          successCount++;
        }
        
        return { success: successCount, failed: 0 };
      }

      // Mettre à jour les payouts avec les infos PayPal
      const batchId = response.result.batch_header.payout_batch_id;
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < payouts.length; i++) {
        const payout = payouts[i];
        const payoutItem = response.result.items?.[i];

        if (payoutItem) {
          payout.paypalBatchId = batchId;
          payout.paypalPayoutItemId = payoutItem.payout_item_id;
          payout.transactionId = payoutItem.transaction_id;
          payout.status = payoutItem.transaction_status === 'SUCCESS' ? 'success' : 'processing';
          payout.processedAt = new Date();
          successCount++;
        } else {
          payout.status = 'failed';
          payout.errorMessage = 'Aucune réponse PayPal pour cet item';
          failedCount++;
        }

        await payout.save();
      }

      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('❌ Erreur envoi batch PayPal:', error);

      // Marquer tous comme échoués
      const payoutIds = payouts.map(p => p._id);
      await Payout.updateMany(
        { _id: { $in: payoutIds } },
        { 
          status: 'failed', 
          errorMessage: error.message || 'Erreur PayPal inconnue' 
        }
      );

      return { 
        success: 0, 
        failed: payouts.length,
        errors: [error.message] 
      };
    }
  }

  /**
   * Obtenir le statut d'un payout depuis PayPal
   */
  async getPayoutStatus(payoutId) {
    try {
      const payout = await Payout.findById(payoutId);
      
      if (!payout || !payout.paypalBatchId) {
        throw new Error('Payout introuvable ou non envoyé à PayPal');
      }

      // Si on a déjà le payout item ID, on l'interroge directement
      if (payout.paypalPayoutItemId) {
        const request = new paypal.payouts.PayoutsItemGetRequest(payout.paypalPayoutItemId);
        const client = paypalClient();
        const response = await client.execute(request);

        // Mettre à jour le statut
        const paypalStatus = response.result.transaction_status;
        
        if (paypalStatus === 'SUCCESS') {
          payout.status = 'success';
        } else if (paypalStatus === 'FAILED' || paypalStatus === 'BLOCKED' || paypalStatus === 'RETURNED') {
          payout.status = 'failed';
          payout.errorMessage = response.result.errors?.[0]?.message || paypalStatus;
        } else {
          payout.status = 'processing';
        }

        payout.paypalFee = parseFloat(response.result.payout_item_fee?.value || 0);
        await payout.save();

        return payout;
      }

      // Sinon, on interroge le batch pour trouver notre item
      const request = new paypal.payouts.PayoutsGetRequest(payout.paypalBatchId);
      const client = paypalClient();
      const response = await client.execute(request);

      // Trouver notre item dans le batch par sender_item_id
      const batchItems = response.result.items || [];
      const ourItem = batchItems.find(item => item.payout_item.sender_item_id === payout._id.toString());

      if (!ourItem) {
        console.log(`⚠️  Item non trouvé dans le batch. Batch status: ${response.result.batch_header.batch_status}`);
        // Le batch existe mais l'item n'est pas encore disponible
        return payout;
      }

      // Mettre à jour avec les infos du batch
      payout.paypalPayoutItemId = ourItem.payout_item_id;
      payout.transactionId = ourItem.transaction_id;
      
      const paypalStatus = ourItem.transaction_status;
      
      if (paypalStatus === 'SUCCESS') {
        payout.status = 'success';
      } else if (paypalStatus === 'FAILED' || paypalStatus === 'BLOCKED' || paypalStatus === 'RETURNED' || paypalStatus === 'REFUNDED') {
        payout.status = 'failed';
        payout.errorMessage = ourItem.errors?.[0]?.message || paypalStatus;
      } else {
        payout.status = 'processing';
      }

      payout.paypalFee = parseFloat(ourItem.payout_item_fee?.value || 0);
      await payout.save();

      return payout;
    } catch (error) {
      console.error('❌ Erreur récupération statut PayPal:', error);
      throw error;
    }
  }

  /**
   * Statistiques de redistribution
   */
  async getStatistics(filters = {}) {
    try {
      const match = {};
      
      if (filters.campus) match.campus = filters.campus;
      if (filters.status) match.status = filters.status;
      if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
      }

      const stats = await Payout.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalFees: { $sum: '$paypalFee' },
          }
        }
      ]);

      const byCampus = await Payout.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$campus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            successCount: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
            },
            failedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
          }
        },
        { $sort: { totalAmount: -1 } }
      ]);

      return {
        byStatus: stats,
        byCampus: byCampus,
      };
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      throw error;
    }
  }
}

module.exports = new PayoutService();
