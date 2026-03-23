const Registration = require('../models/Registration');
const PreRegistration = require('../models/PreRegistration');
const User = require('../models/User');
const Campus = require('../models/Campus');
const TransactionLog = require('../models/TransactionLog');
const Settings = require('../models/Settings');
const paypalService = require('../services/paypalService');
const payoutService = require('../services/payoutService');
const { sendCampRegistrationConfirmation, sendCashPaymentRequestToResponsable } = require('../config/email');
const pushService = require('../services/pushService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Importer la fonction de création de compte avec inscription
const { createCampRegistrationWithAccount } = require('./campRegistrationWithAccount');
exports.createCampRegistrationWithAccount = createCampRegistrationWithAccount;

// Créer une inscription au camp
exports.createRegistration = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      sex,
      dateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies,
      allergyDetails,
      amountPaid,
      paymentDetails
    } = req.body;

    // Récupérer l'utilisateur connecté
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Validation du refuge
    const validRefuges = ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'];
    if (!refuge || !validRefuges.includes(refuge)) {
      return res.status(400).json({ message: 'Veuillez sélectionner un refuge CRPT valide.' });
    }

    // Validation du sexe
    if (!sex || !['M', 'F'].includes(sex)) {
      return res.status(400).json({ message: 'Veuillez sélectionner un sexe valide (M ou F).' });
    }

    // Récupérer les montants min/max depuis les paramètres
    const settings = await Settings.findOne();
    const minAmount = settings?.settings?.registrationMinAmount || 20;
    const maxAmount = settings?.settings?.registrationMaxAmount || 120;
    
    // 🔐 Récupérer le mode PayPal actuel (sandbox ou live)
    const paypalMode = settings?.settings?.paypalMode || 'sandbox';
    console.log(`💳 Mode PayPal actuel: ${paypalMode.toUpperCase()}`);

    // Validation du montant payé
    const paid = Math.round(parseFloat(amountPaid) * 100) / 100;
    if (isNaN(paid) || paid < minAmount || paid > maxAmount) {
      return res.status(400).json({ message: `Le montant doit être entre ${minAmount}€ et ${maxAmount}€.` });
    }

    // Calcul du reste à payer
    // ✅ VÉRIFICATION SÉCURISÉE DU PAIEMENT PAYPAL
    if (!paymentDetails || !paymentDetails.orderID) {
      return res.status(400).json({ 
        message: '❌ Détails de paiement PayPal manquants' 
      });
    }

    // ✅ Vérifier que la transaction n'a pas déjà été utilisée (anti-replay)
    try {
      await paypalService.checkDuplicateTransaction(
        paymentDetails.orderID, 
        Registration
      );
    } catch (error) {
      return res.status(409).json({ 
        message: error.message
      });
    }

    // ✅ Vérifier la transaction auprès de PayPal
    console.log('🔍 Vérification PayPal pour orderID:', paymentDetails.orderID);
    const verification = await paypalService.verifyPayment(
      paymentDetails.orderID
    );

    console.log('📋 Résultat vérification:', verification);

    if (!verification.verified) {
      console.error('❌ Paiement non vérifié:', verification.error);
      console.error('❌ Détails complets:', JSON.stringify(verification, null, 2));
      return res.status(400).json({ 
        message: '❌ Paiement invalide ou non complété',
        error: verification.error,
        details: verification
      });
    }

    // ✅ Vérifier que le montant correspond (sauf en mode dev)
    if (!verification.isDevelopmentMode && verification.amount !== paid) {
      console.error('❌ Montant incohérent:', {
        claimed: paid,
        actual: verification.amount
      });
      return res.status(400).json({ 
        message: `❌ Le montant payé ne correspond pas (PayPal: ${verification.amount}€, Formulaire: ${paid}€)`
      });
    }

    // ✅ Utiliser le montant vérifié par PayPal
    const verifiedAmount = verification.isDevelopmentMode ? paid : verification.amount;

    const totalPrice = 120;
    const remaining = totalPrice - verifiedAmount;
    const status = remaining === 0 ? 'paid' : (verifiedAmount > 0 ? 'partial' : 'unpaid');

    // Si allergies cochées, vérifier que les détails sont fournis
    if (hasAllergies && !allergyDetails) {
      return res.status(400).json({ message: 'Veuillez préciser vos allergies.' });
    }

    // Créer l'inscription
    const registration = new Registration({
      user: user._id,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      sex,
      dateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies: !!hasAllergies,
      allergyDetails: hasAllergies ? allergyDetails : null,
      totalPrice,
      amountPaid: verifiedAmount,
      amountRemaining: remaining,
      paymentStatus: status,
      paypalMode: paypalMode, // 🔐 Enregistrer le mode PayPal utilisé (sandbox ou live)
      paymentDetails: {
        orderID: verification.orderID,
        payerID: paymentDetails.payerID,
        status: verification.status,
        verifiedAt: new Date(),
        payerEmail: verification.payerEmail,
        isDevelopmentMode: verification.isDevelopmentMode,
        amountPaid: verifiedAmount // 🐛 FIX: Sauvegarder le montant PayPal pour calculs futurs
      }
    });

    await registration.save();

    // ✅ Logger la transaction dans TransactionLog
    try {
      await TransactionLog.create({
        orderID: verification.orderID,
        userId: user._id,
        registrationId: registration._id,
        amount: verifiedAmount,
        currency: 'EUR',
        status: verification.status,
        payerEmail: verification.payerEmail,
        payerName: verification.payerName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        verificationResult: verification,
        isDevelopmentMode: verification.isDevelopmentMode
      });
      console.log('✅ Transaction loggée:', verification.orderID);
    } catch (logError) {
      console.error('⚠️ Erreur logging transaction:', logError.message);
      // Ne pas bloquer l'inscription si le log échoue
    }

    // ✅ Envoyer l'email de confirmation (même pour paiement partiel)
    try {
      await sendCampRegistrationConfirmation(
        registration.email,
        registration.firstName,
        registration
      );
      console.log('✅ Email de confirmation d\'inscription envoyé à:', registration.email);
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email de confirmation:', emailError.message);
      // Ne pas bloquer l'inscription si l'email échoue
    }

    // ✅ Créer/mettre à jour le payout pour redistribution (même pour paiements partiels)
    try {
      console.log(`🔍 Tentative création payout pour registration._id: ${registration._id}`);
      const payout = await payoutService.createPayoutForRegistration(registration._id, user._id);
      console.log('✅ Payout créé/mis à jour automatiquement pour redistribution:', payout);
    } catch (payoutError) {
      console.error('⚠️ Erreur lors de la création du payout:', payoutError.message);
      console.error('Stack:', payoutError.stack);
      // Ne pas bloquer l'inscription si la création du payout échoue
    }

    // Envoyer notification push de confirmation d'inscription
    pushService.notifyRegistrationUpdate(user._id, 'confirmed').catch(err => {
      console.error('❌ Erreur notification push inscription:', err);
    });
    
    res.status(201).json({
      message: '✅ Inscription au camp enregistrée avec succès !',
      registration
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};

// Récupérer les inscriptions de l'utilisateur connecté
exports.getUserRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ 
      user: req.user.userId,
      $or: [
        { isGuest: false },
        { isGuest: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ registrations });
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer toutes les inscriptions (admin - page de suivi)
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Inscriptions récupérées avec succès',
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des inscriptions',
      error: error.message 
    });
  }
};

// Mettre à jour le statut de paiement
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!['unpaid', 'partial', 'paid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Statut de paiement invalide' });
    }

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    res.status(200).json({
      message: 'Statut de paiement mis à jour avec succès',
      registration
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer l'inscription de l'utilisateur connecté
exports.getMyRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({ 
      user: req.user.userId,
      isGuest: false  // Exclure les invités
    })
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });  // La plus récente

    if (!registration) {
      return res.status(404).json({ message: 'Aucune inscription trouvée' });
    }

    res.status(200).json(registration);
  } catch (error) {
    console.error('❌ Erreur récupération inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Ajouter un paiement supplémentaire (pour payer le solde)
exports.addAdditionalPayment = async (req, res) => {
  try {
    const { additionalAmount, paymentDetails } = req.body;
    
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Vérifier que l'inscription appartient à l'utilisateur connecté
    if (registration.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // ✅ VÉRIFICATION SÉCURISÉE DU PAIEMENT PAYPAL
    if (!paymentDetails || !paymentDetails.orderID) {
      return res.status(400).json({ 
        message: '❌ Détails de paiement PayPal manquants' 
      });
    }

    // ✅ Vérifier que la transaction n'a pas déjà été utilisée
    try {
      await paypalService.checkDuplicateTransaction(
        paymentDetails.orderID, 
        Registration
      );
    } catch (error) {
      return res.status(409).json({ 
        message: error.message
      });
    }

    // ✅ Vérifier la transaction auprès de PayPal
    const verification = await paypalService.verifyPayment(
      paymentDetails.orderID
    );

    if (!verification.verified) {
      console.error('❌ Paiement additionnel non vérifié:', verification.error);
      return res.status(400).json({ 
        message: '❌ Paiement invalide ou non complété',
        error: verification.error
      });
    }

    // ✅ Vérifier que le montant correspond
    const claimed = parseFloat(additionalAmount);
    if (!verification.isDevelopmentMode && verification.amount !== claimed) {
      console.error('❌ Montant paiement additionnel incohérent:', {
        claimed: claimed,
        actual: verification.amount
      });
      return res.status(400).json({ 
        message: `❌ Le montant payé ne correspond pas (PayPal: ${verification.amount}€, Formulaire: ${claimed}€)`
      });
    }

    const verifiedAmount = verification.isDevelopmentMode ? claimed : verification.amount;

    // Calculer le nouveau montant payé
    const newAmountPaid = registration.amountPaid + verifiedAmount;
    const newAmountRemaining = 120 - newAmountPaid;
    const newStatus = newAmountRemaining === 0 ? 'paid' : 'partial';

    // Mettre à jour l'inscription
    registration.amountPaid = newAmountPaid;
    registration.amountRemaining = newAmountRemaining;
    registration.paymentStatus = newStatus;
    
    // Ajouter les détails du paiement supplémentaire
    registration.paymentDetails = {
      orderID: verification.orderID,
      payerID: paymentDetails.payerID,
      status: verification.status,
      verifiedAt: new Date(),
      payerEmail: verification.payerEmail,
      isDevelopmentMode: verification.isDevelopmentMode,
      amountPaid: registration.amountPaid, // 🐛 FIX: Sauvegarder montant total PayPal
      previousOrderID: registration.paymentDetails?.orderID // Garder trace du paiement initial
    };

    await registration.save();

    // ✅ Logger la transaction additionnelle
    try {
      await TransactionLog.create({
        orderID: verification.orderID,
        userId: req.user.userId,
        registrationId: registration._id,
        amount: verifiedAmount,
        currency: 'EUR',
        status: verification.status,
        payerEmail: verification.payerEmail,
        payerName: verification.payerName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        verificationResult: verification,
        isDevelopmentMode: verification.isDevelopmentMode,
        notes: 'Paiement additionnel'
      });
      console.log('✅ Paiement additionnel loggé:', verification.orderID);
    } catch (logError) {
      console.error('⚠️ Erreur logging paiement additionnel:', logError.message);
    }

    // ✅ Envoyer l'email de confirmation (à chaque paiement)
    try {
      await sendCampRegistrationConfirmation(
        registration.email,
        registration.firstName,
        registration
      );
      console.log('✅ Email de confirmation d\'inscription envoyé à:', registration.email);
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email de confirmation:', emailError.message);
      // Ne pas bloquer le paiement si l'email échoue
    }

    // ✅ Créer/mettre à jour le payout pour redistribution (à chaque paiement)
    try {
      console.log(`🔍 Tentative création payout pour registration._id: ${registration._id}`);
      const payout = await payoutService.createPayoutForRegistration(registration._id, req.user.userId);
      console.log('✅ Payout créé/mis à jour automatiquement pour redistribution:', payout);
    } catch (payoutError) {
      console.error('⚠️ Erreur lors de la création du payout:', payoutError.message);
      console.error('Stack:', payoutError.stack);
      // Ne pas bloquer le paiement si la création du payout échoue
    }

    res.status(200).json({
      message: '✅ Paiement supplémentaire enregistré avec succès',
      registration
    });
  } catch (error) {
    console.error('❌ Erreur lors du paiement supplémentaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une inscription invité
exports.createGuestRegistration = async (req, res) => {
  try {
    console.log('🎯 Début createGuestRegistration');
    console.log('👤 User ID:', req.user.userId);
    console.log('📦 Body:', req.body);

    const {
      firstName,
      lastName,
      email,
      sex,
      dateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies,
      allergyDetails,
      amountPaid,
      paymentDetails
    } = req.body;

    // Vérifier que l'utilisateur est déjà inscrit
    console.log('🔍 Vérification inscription utilisateur...');
    const userRegistration = await Registration.findOne({ 
      user: req.user.userId,
      $or: [
        { isGuest: false },
        { isGuest: { $exists: false } }
      ]
    });

    if (!userRegistration) {
      console.log('❌ Utilisateur non inscrit');
      return res.status(403).json({ 
        message: 'Vous devez être inscrit au camp pour pouvoir inscrire un invité' 
      });
    }
    console.log('✅ Utilisateur inscrit trouvé:', userRegistration._id);

    // Validation du refuge
    const validRefuges = ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'];
    if (!refuge || !validRefuges.includes(refuge)) {
      return res.status(400).json({ message: 'Veuillez sélectionner un refuge CRPT valide.' });
    }

    // Validation du sexe
    if (!sex || !['M', 'F'].includes(sex)) {
      return res.status(400).json({ message: 'Veuillez sélectionner un sexe valide (M ou F).' });
    }

    // Validation du montant payé
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < 20 || paid > 120) {
      return res.status(400).json({ message: 'Le montant doit être entre 20€ et 120€.' });
    }

    // Calcul du reste à payer
    const totalPrice = 120;
    const remaining = totalPrice - paid;
    const status = remaining === 0 ? 'paid' : (paid > 0 ? 'partial' : 'unpaid');

    // Si allergies cochées, vérifier que les détails sont fournis
    if (hasAllergies && !allergyDetails) {
      return res.status(400).json({ message: 'Veuillez préciser les allergies de votre invité.' });
    }

    // Créer l'inscription invité
    console.log('📝 Création inscription invité...');
    const guestRegistration = new Registration({
      user: req.user.userId,
      isGuest: true,
      registeredBy: req.user.userId,
      firstName,
      lastName,
      email,
      sex,
      dateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies: !!hasAllergies,
      allergyDetails: hasAllergies ? allergyDetails : null,
      totalPrice,
      amountPaid: paid,
      amountRemaining: remaining,
      paymentStatus: status,
      paymentDetails: paymentDetails || null
    });

    await guestRegistration.save();
    console.log('✅ Invité enregistré:', guestRegistration._id);

    // ✅ Envoyer l'email de confirmation (même pour paiement partiel)
    try {
      await sendCampRegistrationConfirmation(
        guestRegistration.email,
        guestRegistration.firstName,
        guestRegistration
      );
      console.log('✅ Email de confirmation envoyé à l\'invité');
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email de confirmation:', emailError.message);
      // Ne pas bloquer l'inscription si l'email échoue
    }

    // ✅ Créer/mettre à jour le payout pour redistribution (même pour paiements partiels)
    try {
      console.log(`🔍 Tentative création payout pour invité registration._id: ${guestRegistration._id}`);
      const payout = await payoutService.createPayoutForRegistration(guestRegistration._id, req.user.userId);
      console.log('✅ Payout créé/mis à jour automatiquement pour redistribution invité:', payout);
    } catch (payoutError) {
      console.error('⚠️ Erreur lors de la création du payout invité:', payoutError.message);
      console.error('Stack:', payoutError.stack);
      // Ne pas bloquer l'inscription si la création du payout échoue
    }

    res.status(201).json({
      message: '✅ Invité inscrit au camp avec succès !',
      registration: guestRegistration
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription de l\'invité :', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message 
    });
  }
};

// Récupérer les invités inscrits par l'utilisateur
exports.getUserGuests = async (req, res) => {
  try {
    const guests = await Registration.find({ 
      registeredBy: req.user.userId,
      isGuest: true 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ guests });
  } catch (error) {
    console.error('Erreur lors de la récupération des invités :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une inscription (admin uniquement)
exports.deleteRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;
    const Payout = require('../models/Payout');

    // Vérifier que l'inscription existe
    const registration = await Registration.findById(registrationId);
    
    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // ✅ SYNCHRONISATION: Annuler ou supprimer les payouts associés
    const associatedPayouts = await Payout.find({ registration: registrationId });
    
    if (associatedPayouts.length > 0) {
      console.log(`🔄 ${associatedPayouts.length} payout(s) associé(s) trouvé(s)`);
      
      // Annuler les payouts en attente ou échoués, supprimer les autres
      for (const payout of associatedPayouts) {
        if (['pending', 'failed', 'cancelled'].includes(payout.status)) {
          await Payout.findByIdAndDelete(payout._id);
          console.log(`🗑️ Payout supprimé: ${payout._id} (${payout.status})`);
        } else if (payout.status === 'success') {
          payout.status = 'cancelled';
          payout.errorMessage = 'Inscription supprimée - payout annulé';
          await payout.save();
          console.log(`⚠️ Payout réussi marqué comme annulé: ${payout._id}`);
        } else if (payout.status === 'processing') {
          payout.status = 'cancelled';
          payout.errorMessage = 'Inscription supprimée pendant le traitement';
          await payout.save();
          console.log(`⚠️ Payout en cours annulé: ${payout._id}`);
        }
      }
    }

    // Supprimer l'inscription
    await Registration.findByIdAndDelete(registrationId);

    console.log(`✅ Inscription supprimée: ${registration.firstName} ${registration.lastName} (ID: ${registrationId})`);
    
    res.status(200).json({ 
      message: 'Inscription supprimée avec succès',
      deletedRegistration: {
        id: registrationId,
        name: `${registration.firstName} ${registration.lastName}`
      },
      payoutsAffected: associatedPayouts.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'inscription' });
  }
};

// ========== PAIEMENT EN ESPÈCES ==========

// Créer une inscription avec paiement en espèces
exports.createCashRegistration = async (req, res) => {
  try {
    console.log('🎯 Début createCashRegistration');
    console.log('📦 Body:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      sex,
      dateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies,
      allergyDetails,
      amountPaid,
      isGuest = false
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà une inscription (sauf pour invités)
    if (!isGuest) {
      const existingRegistration = await Registration.findOne({
        user: req.user.userId,
        $or: [
          { isGuest: false },
          { isGuest: { $exists: false } }
        ]
      });

      if (existingRegistration) {
        return res.status(400).json({ 
          message: 'Vous avez déjà une inscription active au camp.' 
        });
      }
    }

    // Validation
    const validRefuges = ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'];
    if (!refuge || !validRefuges.includes(refuge)) {
      return res.status(400).json({ message: 'Veuillez sélectionner un refuge CRPT valide.' });
    }

    if (!sex || !['M', 'F'].includes(sex)) {
      return res.status(400).json({ message: 'Veuillez sélectionner un sexe valide (M ou F).' });
    }

    const paid = Math.round(parseFloat(amountPaid) * 100) / 100;
    if (isNaN(paid) || paid < 20 || paid > 120) {
      return res.status(400).json({ message: 'Le montant doit être entre 20€ et 120€.' });
    }

    if (hasAllergies && !allergyDetails) {
      return res.status(400).json({ message: 'Veuillez préciser vos allergies.' });
    }

    const totalPrice = 120;
    const remaining = totalPrice - paid;
    const status = remaining === 0 ? 'paid' : (paid > 0 ? 'partial' : 'unpaid');

    // Convertir la date du format JJ/MM/AAAA en Date
    let parsedDate;
    if (dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.includes('/')) {
      const [day, month, year] = dateOfBirth.split('/');
      parsedDate = new Date(year, month - 1, day); // Mois commence à 0
      console.log('📅 Date convertie:', dateOfBirth, '→', parsedDate);
    } else {
      parsedDate = new Date(dateOfBirth);
    }

    // 🚫 NE PAS créer l'inscription immédiatement pour les paiements espèces
    // ✅ Créer une PRE-REGISTRATION en attente de validation
    const preRegistration = new PreRegistration({
      user: user._id,
      isGuest,
      registeredBy: isGuest ? req.user.userId : null,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      sex,
      dateOfBirth: parsedDate,
      address,
      phone,
      refuge,
      hasAllergies: !!hasAllergies,
      allergyDetails: hasAllergies ? allergyDetails : null,
      cashAmount: paid,
      status: 'pending',
      submittedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await preRegistration.save();
    console.log('✅ Pre-registration créée (en attente validation):', preRegistration._id);

    // Envoyer email d'information (NON de confirmation)
    try {
      await sendCampRegistrationConfirmation(
        preRegistration.email,
        preRegistration.firstName,
        {
          email: preRegistration.email,
          firstName: preRegistration.firstName,
          amountPaid: 0,
          amountRemaining: totalPrice,
          paymentStatus: 'pending_validation',
          cashAmount: paid
        },
        { cashPaymentPending: true, cashAmount: paid }
      );
      console.log('✅ Email information paiement espèces envoyé');
    } catch (emailError) {
      console.error('⚠️ Erreur email:', emailError.message);
    }

    // 📧 Notifier le responsable du campus
    try {
      const campus = await Campus.findOne({ name: refuge }).populate('responsable');
      if (campus && campus.responsable) {
        await sendCashPaymentRequestToResponsable(
          campus.responsable.email,
          campus.responsable.firstName,
          preRegistration,
          campus.name
        );
        console.log('✅ Email envoyé au responsable:', campus.responsable.email);
      } else {
        console.log('⚠️ Aucun responsable trouvé pour le campus:', refuge);
      }
    } catch (emailError) {
      console.error('⚠️ Erreur email responsable:', emailError.message);
    }

    res.status(201).json({
      message: `⏳ Demande enregistrée ! Votre paiement de ${paid}€ en espèces doit être validé par un responsable de votre campus avant que votre inscription ne soit créée.`,
      preRegistration: {
        _id: preRegistration._id,
        status: 'pending',
        cashAmount: paid,
        submittedAt: preRegistration.submittedAt
      },
      instructions: {
        important: '⚠️ Votre inscription n\'est PAS encore créée',
        step1: 'Remettez le montant de ' + paid + '€ en espèces à un responsable de votre campus',
        step2: 'Le responsable validera votre paiement dans le système',
        step3: 'Votre inscription sera alors CRÉÉE automatiquement',
        step4: 'Vous recevrez un email de confirmation et pourrez accéder aux activités',
        access: '🚫 Vous n\'avez pas encore accès au tableau de bord ni aux activités'
      }
    });
  } catch (error) {
    console.error('❌ Erreur inscription espèces:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// Ajouter un paiement en espèces supplémentaire
exports.addCashPayment = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { amount } = req.body;

    const paid = parseFloat(amount);
    if (isNaN(paid) || paid <= 0) {
      return res.status(400).json({ message: 'Montant invalide' });
    }

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Vérifier que c'est bien l'inscription de l'utilisateur
    if (registration.user.toString() !== req.user.userId && 
        registration.registeredBy?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Ajouter le paiement
    registration.cashPayments.push({
      amount: paid,
      status: 'pending',
      submittedAt: new Date()
    });

    if (!registration.paymentMethod || registration.paymentMethod === 'paypal') {
      registration.paymentMethod = 'mixed';
    }

    await registration.save();

    res.status(200).json({
      message: `✅ Paiement de ${paid}€ en espèces ajouté. En attente de validation.`,
      registration
    });
  } catch (error) {
    console.error('❌ Erreur ajout paiement espèces:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Valider un paiement en espèces (responsable/admin)
exports.validateCashPayment = async (req, res) => {
  try {
    const { registrationId, paymentId } = req.params;
    const { amount, note } = req.body;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    const payment = registration.cashPayments.id(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Ce paiement a déjà été traité' });
    }

    // Valider le paiement
    payment.status = 'validated';
    payment.validatedBy = req.user.userId;
    payment.validatedAt = new Date();
    payment.note = note || '';
    
    // Si le montant est modifié par le responsable
    if (amount && parseFloat(amount) !== payment.amount) {
      payment.amount = parseFloat(amount);
    }

    // Mettre à jour le montant total payé
    const totalCashValidated = registration.cashPayments
      .filter(p => p.status === 'validated')
      .reduce((sum, p) => sum + p.amount, 0);

    // 🐛 FIX CRITIQUE : Utiliser paymentDetails.amountPaid (montant PayPal sauvegardé)
    const totalPayPal = registration.paymentDetails?.amountPaid || 0;
    
    console.log('💰 Calcul paiement:');
    console.log('   - PayPal:', totalPayPal, '€');
    console.log('   - Cash validé:', totalCashValidated, '€');
    console.log('   - Total:', totalPayPal + totalCashValidated, '€');
    
    const newTotalPaid = totalCashValidated + totalPayPal;
    
    registration.amountPaid = newTotalPaid;
    registration.amountRemaining = registration.totalPrice - newTotalPaid;
    registration.paymentStatus = registration.amountRemaining === 0 ? 'paid' : 
                                  (newTotalPaid > 0 ? 'partial' : 'unpaid');

    await registration.save();

    // Créer/mettre à jour le payout pour redistribution
    try {
      const payout = await payoutService.createPayoutForRegistration(registrationId, req.user.userId);
      console.log('✅ Payout mis à jour après validation espèces:', payout);
    } catch (payoutError) {
      console.error('⚠️ Erreur payout:', payoutError.message);
    }

    // Envoyer email de confirmation
    try {
      await sendCampRegistrationConfirmation(
        registration.email,
        registration.firstName,
        registration,
        { cashPaymentValidated: true, validatedAmount: payment.amount }
      );
    } catch (emailError) {
      console.error('⚠️ Erreur email:', emailError.message);
    }
    
    // Envoyer notification push de confirmation de paiement
    pushService.notifyPaymentConfirmed(
      registration.user, 
      payment.amount
    ).catch(err => {
      console.error('❌ Erreur notification push paiement:', err);
    });

    res.status(200).json({
      message: `✅ Paiement de ${payment.amount}€ validé avec succès`,
      registration
    });
  } catch (error) {
    console.error('❌ Erreur validation paiement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Rejeter un paiement en espèces (responsable/admin)
exports.rejectCashPayment = async (req, res) => {
  try {
    const { registrationId, paymentId } = req.params;
    const { reason } = req.body;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    const payment = registration.cashPayments.id(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Ce paiement a déjà été traité' });
    }

    payment.status = 'rejected';
    payment.validatedBy = req.user.userId;
    payment.validatedAt = new Date();
    payment.rejectionReason = reason || 'Non spécifié';

    await registration.save();

    res.status(200).json({
      message: '❌ Paiement rejeté',
      registration
    });
  } catch (error) {
    console.error('❌ Erreur rejet paiement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les statistiques des paiements espèces (admin/responsable)
exports.getCashPaymentsStats = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { ADMIN_ROLES } = require('../constants/roles');
    const Campus = require('../models/Campus');

    // Déterminer les campus auxquels l'utilisateur a accès
    let allowedCampusNames = [];
    
    if (ADMIN_ROLES.includes(role)) {
      // Les admins voient tous les campus
      console.log(`✅ Admin ${userId} - accès à tous les campus`);
      allowedCampusNames = null; // null = pas de filtre
    } else {
      // Vérifier si l'utilisateur est responsable d'un ou plusieurs campus
      const responsableCampus = await Campus.find({ responsable: userId });
      
      if (responsableCampus.length === 0) {
        // Pas responsable de campus, pas d'accès
        return res.status(403).json({ 
          message: '❌ Vous devez être responsable d\'un campus pour accéder aux paiements en espèces' 
        });
      }
      
      allowedCampusNames = responsableCampus.map(c => c.name);
      console.log(`✅ Responsable ${userId} - accès aux campus:`, allowedCampusNames);
    }

    // Construire le filtre de recherche
    const searchFilter = {
      $or: [
        { paymentMethod: 'cash' },
        { paymentMethod: 'mixed' },
        { 'cashPayments.0': { $exists: true } } // Au moins 1 paiement espèces
      ]
    };

    // Si non-admin, filtrer par campus
    if (allowedCampusNames !== null) {
      searchFilter.refuge = { $in: allowedCampusNames };
    }

    const registrations = await Registration.find(searchFilter)
      .populate('user', 'firstName lastName email');

    const stats = {
      totalCashRegistrations: 0,
      pendingPayments: [],
      validatedPayments: [],
      rejectedPayments: [],
      totalPending: 0,
      totalValidated: 0,
      totalRejected: 0
    };

    registrations.forEach(reg => {
      // Traiter les paiements espèces
      if (reg.cashPayments && reg.cashPayments.length > 0) {
        reg.cashPayments.forEach(payment => {
          const paymentInfo = {
            registrationId: reg._id,
            paymentId: payment._id,
            userName: `${reg.firstName} ${reg.lastName}`,
            userEmail: reg.email,
            refuge: reg.refuge,
            amount: payment.amount,
            submittedAt: payment.submittedAt,
            validatedAt: payment.validatedAt,
            note: payment.note
          };

          if (payment.status === 'pending') {
            stats.pendingPayments.push(paymentInfo);
            stats.totalPending += payment.amount;
          } else if (payment.status === 'validated') {
            stats.validatedPayments.push(paymentInfo);
            stats.totalValidated += payment.amount;
          } else if (payment.status === 'rejected') {
            stats.rejectedPayments.push(paymentInfo);
            stats.totalRejected += payment.amount;
          }
        });

        stats.totalCashRegistrations++;
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Erreur stats espèces:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📋 Lister les PreRegistrations en attente (pour responsables)
exports.getPendingPreRegistrations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    let preRegistrations;
    
    // Admin voit tout
    if (userRole === 'admin' || userRole === 'responsable') {
      preRegistrations = await PreRegistration.find({ status: 'pending' })
        .populate('user', 'firstName lastName email')
        .sort({ submittedAt: -1 });
    } else if (userRole === 'referent') {
      // Referent ne voit que son campus
      const responsableCampus = await Campus.find({ responsable: userId });
      if (responsableCampus.length === 0) {
        return res.status(403).json({ 
          message: '❌ Vous devez être responsable d\'un campus' 
        });
      }
      
      const campusNames = responsableCampus.map(c => c.name);
      preRegistrations = await PreRegistration.find({ 
        status: 'pending',
        refuge: { $in: campusNames }
      })
        .populate('user', 'firstName lastName email')
        .sort({ submittedAt: -1 });
    } else {
      return res.status(403).json({ message: '❌ Accès non autorisé' });
    }
    
    res.status(200).json({
      count: preRegistrations.length,
      preRegistrations
    });
  } catch (error) {
    console.error('❌ Erreur liste PreRegistrations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🎯 Valider une PreRegistration et créer l'inscription (responsable/admin)
exports.validatePreRegistration = async (req, res) => {
  try {
    const { preRegistrationId } = req.params;
    const { amountValidated, note } = req.body;

    // Récupérer la pre-registration
    const preReg = await PreRegistration.findById(preRegistrationId);
    if (!preReg) {
      return res.status(404).json({ message: '❌ Demande d\'inscription non trouvée' });
    }

    if (preReg.status !== 'pending') {
      return res.status(400).json({ message: '❌ Cette demande a déjà été traitée' });
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(preReg.user);
    if (!user) {
      return res.status(404).json({ message: '❌ Utilisateur non trouvé' });
    }

    // Créer l'inscription maintenant que le paiement est validé
    const validatedAmount = amountValidated || preReg.cashAmount;
    const totalPrice = 120;
    const remaining = totalPrice - validatedAmount;
    const status = remaining === 0 ? 'paid' : (validatedAmount > 0 ? 'partial' : 'unpaid');

    const registration = new Registration({
      user: preReg.user,
      isGuest: preReg.isGuest,
      registeredBy: preReg.registeredBy,
      firstName: preReg.firstName,
      lastName: preReg.lastName,
      email: preReg.email,
      sex: preReg.sex,
      dateOfBirth: preReg.dateOfBirth,
      address: preReg.address,
      phone: preReg.phone,
      refuge: preReg.refuge,
      hasAllergies: preReg.hasAllergies,
      allergyDetails: preReg.allergyDetails,
      totalPrice,
      amountPaid: validatedAmount,
      amountRemaining: remaining,
      paymentStatus: status,
      paymentMethod: 'cash',
      paypalMode: 'cash',
      cashPayments: [{
        amount: validatedAmount,
        status: 'validated',
        submittedAt: preReg.submittedAt,
        validatedAt: new Date(),
        validatedBy: req.user.userId,
        note: note || `Validation initiale depuis pre-registration ${preRegistrationId}`
      }]
    });

    await registration.save();
    console.log('✅ Inscription créée depuis pre-registration:', registration._id);

    // Mettre à jour la PreRegistration
    preReg.status = 'validated';
    preReg.validatedAt = new Date();
    preReg.validatedBy = req.user.userId;
    preReg.registrationCreated = registration._id;
    await preReg.save();

    // Créer le payout pour redistribution
    try {
      const payout = await payoutService.createPayoutForRegistration(registration._id, req.user.userId);
      console.log('✅ Payout créé pour inscription validée:', payout);
    } catch (payoutError) {
      console.error('⚠️ Erreur payout:', payoutError.message);
    }

    // Envoyer email de confirmation au participant
    try {
      await sendCampRegistrationConfirmation(
        registration.email,
        registration.firstName,
        registration,
        { cashPaymentValidated: true, validatedAmount }
      );
      console.log('✅ Email de confirmation envoyé au participant:', registration.email);
    } catch (emailError) {
      console.error('⚠️ Erreur email participant:', emailError.message);
    }

    // Notification push
    pushService.notifyPaymentConfirmed(registration.user, validatedAmount).catch(err => {
      console.error('❌ Erreur notification push:', err);
    });

    res.status(200).json({
      message: `✅ Paiement de ${validatedAmount}€ validé - Inscription créée avec succès`,
      registration,
      preRegistration: preReg
    });
  } catch (error) {
    console.error('❌ Erreur validation pre-registration:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// 🆕 Rejeter une PreRegistration
exports.rejectPreRegistration = async (req, res) => {
  try {
    const { preRegistrationId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: '❌ La raison du rejet est obligatoire' });
    }

    // Récupérer la pre-registration
    const preReg = await PreRegistration.findById(preRegistrationId);
    if (!preReg) {
      return res.status(404).json({ message: '❌ Demande d\'inscription non trouvée' });
    }

    if (preReg.status !== 'pending') {
      return res.status(400).json({ message: '❌ Cette demande a déjà été traitée' });
    }

    // Mettre à jour la PreRegistration
    preReg.status = 'rejected';
    preReg.validatedAt = new Date();
    preReg.validatedBy = req.user.userId;
    preReg.rejectionReason = reason.trim();
    await preReg.save();

    console.log('❌ PreRegistration rejetée:', preReg._id);

    // Envoyer email au participant pour l'informer du rejet
    try {
      const { sendCashPaymentRejection } = require('../config/email-brevo-api');
      await sendCashPaymentRejection(
        preReg.email,
        preReg.firstName,
        preReg.cashAmount,
        reason.trim()
      );
      console.log('✅ Email de rejet envoyé à:', preReg.email);
    } catch (emailError) {
      console.error('⚠️ Erreur email rejet:', emailError.message);
    }

    res.status(200).json({
      message: `❌ Demande de ${preReg.firstName} ${preReg.lastName} rejetée`,
      preRegistration: preReg
    });
  } catch (error) {
    console.error('❌ Erreur rejet pre-registration:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// 🔔 Compter les demandes de paiement en espèces en attente (pour notification badge)
exports.getPendingCashPaymentsCount = async (req, res) => {
  try {
    const registrations = await Registration.find({
      'cashPayments.0': { $exists: true }
    });

    let pendingCount = 0;
    registrations.forEach(reg => {
      const pending = reg.cashPayments.filter(p => p.status === 'pending');
      pendingCount += pending.length;
    });

    res.status(200).json({ 
      pendingCount,
      message: `${pendingCount} demande(s) de paiement en attente`
    });
  } catch (error) {
    console.error('❌ Erreur count espèces:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 👤 Créer une inscription sans paiement (admin uniquement)
exports.createRegistrationWithoutPayment = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      sex,
      dateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies,
      allergyDetails
    } = req.body;

    console.log('👤 Admin crée inscription sans paiement pour:', email);

    // ===== VALIDATIONS =====
    
    // Validation du refuge
    const validRefuges = ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'];
    if (!refuge || !validRefuges.includes(refuge)) {
      return res.status(400).json({ 
        message: 'Veuillez sélectionner un refuge CRPT valide.' 
      });
    }

    // Validation du sexe
    if (!sex || !['M', 'F'].includes(sex)) {
      return res.status(400).json({ 
        message: 'Veuillez sélectionner un sexe valide (M ou F).' 
      });
    }

    // Validation email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Email invalide.' });
    }

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // Vérifier si l'utilisateur a déjà une inscription
      const existingRegistration = await Registration.findOne({ 
        user: user._id 
      });
      
      if (existingRegistration) {
        return res.status(400).json({ 
          message: `❌ Cet utilisateur a déjà une inscription (${existingRegistration.status})` 
        });
      }
    } else {
      // Créer un nouveau compte utilisateur
      
      // Validation de force du mot de passe
      if (!password) {
        return res.status(400).json({ 
          message: 'Le mot de passe est requis pour créer un compte.' 
        });
      }
      
      const passwordErrors = [];
      if (password.length < 8) {
        passwordErrors.push('au moins 8 caractères');
      }
      if (!/[A-Z]/.test(password)) {
        passwordErrors.push('une lettre majuscule');
      }
      if (!/[a-z]/.test(password)) {
        passwordErrors.push('une lettre minuscule');
      }
      if (!/[0-9]/.test(password)) {
        passwordErrors.push('un chiffre');
      }
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
        passwordErrors.push('un caractère spécial (!@#$%&*...)');
      }
      
      if (passwordErrors.length > 0) {
        return res.status(400).json({ 
          message: `🔒 Mot de passe trop faible ! Il doit contenir : ${passwordErrors.join(', ')}.`
        });
      }

      // Créer l'utilisateur
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'utilisateur',
        isEmailVerified: true, // Auto-vérification pour admin
        emailVerifiedAt: new Date()
      });

      await user.save();
      console.log('✅ Compte utilisateur créé:', user._id);
    }

    // Récupérer les paramètres
    const settings = await Settings.findOne();
    const maxAmount = settings?.settings?.registrationMaxAmount || 120;

    // ===== CRÉER L'INSCRIPTION (statut: pending, montant: 0) =====
    const registration = new Registration({
      user: user._id,
      isGuest: false,
      firstName,
      lastName,
      email: email.toLowerCase(),
      sex,
      dateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies,
      allergyDetails: hasAllergies ? allergyDetails : undefined,
      amountPaid: 0,
      amountRemaining: maxAmount,
      paymentMethod: 'pending', // Statut spécial
      status: 'pending', // En attente de paiement
      consent: {
        privacyPolicy: true,
        photoRelease: true,
        codeOfConduct: true
      }
    });

    await registration.save();
    console.log('✅ Inscription créée (sans paiement):', registration._id);

    // Envoyer email de confirmation
    try {
      await sendCampRegistrationConfirmation(
        email,
        firstName,
        {
          registrationId: registration._id,
          amountPaid: 0,
          amountRemaining: maxAmount,
          refuge,
          sex,
          dateOfBirth
        }
      );
      console.log('✅ Email envoyé');
    } catch (emailError) {
      console.error('⚠️ Erreur envoi email:', emailError.message);
      // Ne pas bloquer la création si email échoue
    }

    // Notification push (si activé)
    try {
      if (user.pushNotifications) {
        await pushService.sendToUser(user._id, {
          title: '🎉 Inscription créée !',
          message: `Votre inscription au camp GJ a été créée. Rendez-vous dans votre espace pour effectuer le paiement.`,
          data: { type: 'registration_created' }
        });
      }
    } catch (pushError) {
      console.error('⚠️ Erreur notification push:', pushError.message);
    }

    res.status(201).json({
      message: '✅ Inscription créée avec succès ! L\'utilisateur peut maintenant payer via son espace personnel.',
      registration: {
        id: registration._id,
        status: 'pending',
        amountRemaining: maxAmount
      },
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('❌ Erreur création inscription sans paiement:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'inscription',
      error: error.message 
    });
  }
};
