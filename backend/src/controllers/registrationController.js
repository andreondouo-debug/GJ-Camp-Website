const Registration = require('../models/Registration');
const User = require('../models/User');
const TransactionLog = require('../models/TransactionLog');
const paypalService = require('../services/paypalService');

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

    // Validation du montant payé
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < 20 || paid > 120) {
      return res.status(400).json({ message: 'Le montant doit être entre 20€ et 120€.' });
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
    const verification = await paypalService.verifyPayment(
      paymentDetails.orderID
    );

    if (!verification.verified) {
      console.error('❌ Paiement non vérifié:', verification.error);
      return res.status(400).json({ 
        message: '❌ Paiement invalide ou non complété',
        error: verification.error
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
      paymentDetails: {
        orderID: verification.orderID,
        payerID: paymentDetails.payerID,
        status: verification.status,
        verifiedAt: new Date(),
        payerEmail: verification.payerEmail,
        isDevelopmentMode: verification.isDevelopmentMode
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

    // Vérifier que l'inscription existe
    const registration = await Registration.findById(registrationId);
    
    if (!registration) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Supprimer l'inscription
    await Registration.findByIdAndDelete(registrationId);

    console.log(`✅ Inscription supprimée: ${registration.firstName} ${registration.lastName} (ID: ${registrationId})`);
    
    res.status(200).json({ 
      message: 'Inscription supprimée avec succès',
      deletedRegistration: {
        id: registrationId,
        name: `${registration.firstName} ${registration.lastName}`
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'inscription' });
  }
};
