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

/**
 * ✅ VALIDATION AVANT PAIEMENT (dry-run)
 *
 * Vérifie TOUTES les données d'inscription SANS rien enregistrer.
 * Appelée avant d'afficher le bouton de paiement.
 * Si cette validation passe, l'inscription réelle après paiement réussira forcément.
 *
 * Garantit qu'on ne peut jamais payer sans que l'inscription soit possible.
 */
exports.validateCampRegistration = async (req, res) => {
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
      allergyDetails,
      amountPaid,
      numberOfDays
    } = req.body;

    // Refuge
    const validRefuges = ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'];
    if (!refuge || !validRefuges.includes(refuge)) {
      return res.status(400).json({ valid: false, message: 'Veuillez sélectionner un refuge CRPT valide.' });
    }

    // Sexe
    if (!sex || !['M', 'F'].includes(sex)) {
      return res.status(400).json({ valid: false, message: 'Veuillez sélectionner un sexe valide (M ou F).' });
    }

    // Email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ valid: false, message: 'Email invalide.' });
    }

    // Champs obligatoires
    if (!firstName || !lastName) {
      return res.status(400).json({ valid: false, message: 'Le nom et le prénom sont obligatoires.' });
    }
    if (!address) {
      return res.status(400).json({ valid: false, message: "L'adresse postale est obligatoire." });
    }
    if (!phone) {
      return res.status(400).json({ valid: false, message: 'Le numéro de téléphone est obligatoire.' });
    }

    // Mot de passe (uniquement si nouveau compte)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      if (!password) {
        return res.status(400).json({ valid: false, message: 'Le mot de passe est requis pour créer un compte.' });
      }
      const pwdErrors = [];
      if (password.length < 8) pwdErrors.push('au moins 8 caractères');
      if (!/[A-Z]/.test(password)) pwdErrors.push('une lettre majuscule');
      if (!/[a-z]/.test(password)) pwdErrors.push('une lettre minuscule');
      if (!/[0-9]/.test(password)) pwdErrors.push('un chiffre');
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) pwdErrors.push('un caractère spécial (!@#$%&*...)');
      if (pwdErrors.length > 0) {
        return res.status(400).json({ valid: false, message: `🔒 Mot de passe trop faible ! Il doit contenir : ${pwdErrors.join(', ')}.` });
      }
    } else {
      // Vérifier qu'il n'a pas déjà une inscription
      const existingReg = await Registration.findOne({ user: existingUser._id, isGuest: { $ne: true } });
      if (existingReg) {
        return res.status(409).json({ valid: false, message: '❌ Vous avez déjà une inscription active au camp.' });
      }
    }

    // Montant
    const settings = await Settings.findOne();
    const minAmount = settings?.settings?.registrationMinAmount || 20;
    const days = [1, 2, 3].includes(parseInt(numberOfDays)) ? parseInt(numberOfDays) : 3;
    const totalPrice = days * 40;
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < minAmount || paid > totalPrice) {
      return res.status(400).json({ valid: false, message: `Le montant doit être entre ${minAmount}€ et ${totalPrice}€.` });
    }

    // Allergies
    if (hasAllergies && !allergyDetails) {
      return res.status(400).json({ valid: false, message: 'Veuillez préciser vos allergies.' });
    }

    // Date de naissance : parsing + validité
    let parsedDate;
    if (dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.includes('/')) {
      const [day, month, year] = dateOfBirth.split('/');
      const d = parseInt(day), m = parseInt(month), y = parseInt(year);
      parsedDate = new Date(y, m - 1, d);
      // Vérifier que la date reconstruite correspond (évite les débordements type 99/99/9999)
      const currentYear = new Date().getFullYear();
      if (
        isNaN(parsedDate.getTime()) ||
        parsedDate.getDate() !== d ||
        parsedDate.getMonth() !== m - 1 ||
        parsedDate.getFullYear() !== y ||
        y < 1900 || y > currentYear
      ) {
        return res.status(400).json({ valid: false, message: 'La date de naissance est invalide (format JJ/MM/AAAA attendu).' });
      }
    } else {
      parsedDate = new Date(dateOfBirth);
      if (!dateOfBirth || isNaN(parsedDate.getTime())) {
        return res.status(400).json({ valid: false, message: 'La date de naissance est invalide (format JJ/MM/AAAA attendu).' });
      }
    }

    // Simulation Mongoose : construit l'objet et valide sans sauvegarder
    const testRegistration = new Registration({
      user: existingUser?._id || new (require('mongoose')).Types.ObjectId(),
      firstName, lastName, email: email.toLowerCase(),
      sex, dateOfBirth: parsedDate, address, phone, refuge,
      hasAllergies: !!hasAllergies,
      allergyDetails: hasAllergies ? allergyDetails : null,
      numberOfDays: days, totalPrice,
      amountPaid: paid, amountRemaining: Math.max(0, totalPrice - paid),
      paymentStatus: (totalPrice - paid) === 0 ? 'paid' : (paid > 0 ? 'partial' : 'unpaid')
    });
    const validationError = testRegistration.validateSync();
    if (validationError) {
      const msg = Object.values(validationError.errors).map(e => e.message).join(' | ');
      return res.status(400).json({ valid: false, message: `Erreur de validation : ${msg}` });
    }

    // ✅ Tout est bon
    return res.status(200).json({
      valid: true,
      message: '✅ Toutes les informations sont valides. Vous pouvez procéder au paiement.',
      isNewUser: !existingUser
    });
  } catch (error) {
    console.error('❌ Erreur validation avant paiement:', error);
    return res.status(500).json({ valid: false, message: 'Erreur lors de la validation des informations.' });
  }
};

/**
 * 🎯 NOUVELLE ROUTE: Inscription camp avec création automatique de compte
 * 
 * Workflow:
 * 1. Valider les données du formulaire
 * 2. Vérifier le paiement PayPal
 * 3. SI paiement réussi → Créer compte User (ou lier si existe)
 * 4. Créer inscription Registration
 * 5. Connecter automatiquement l'utilisateur
 * 
 * SI paiement échoue → RIEN n'est créé, utilisateur peut réessayer
 */
exports.createCampRegistrationWithAccount = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password, // Nouveau: pour créer le compte
      sex,
      dateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies,
      allergyDetails,
      amountPaid,
      paymentMethod, // 'paypal' ou 'cash'
      numberOfDays,
      paymentDetails
    } = req.body;

    // ===== VALIDATION DES DONNÉES =====
    console.log('📝 Nouvelle inscription camp avec création de compte pour:', email);

    // Validation du refuge
    const validRefuges = ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'];
    if (!refuge || !validRefuges.includes(refuge)) {
      return res.status(400).json({ message: 'Veuillez sélectionner un refuge CRPT valide.' });
    }

    // Validation du sexe
    if (!sex || !['M', 'F'].includes(sex)) {
      return res.status(400).json({ message: 'Veuillez sélectionner un sexe valide (M ou F).' });
    }

    // Validation email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Email invalide.' });
    }

    // Validation mot de passe (seulement si pas d'utilisateur existant)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser && password) {
      // Validation de force du mot de passe
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
    } else if (!existingUser && !password) {
      return res.status(400).json({ 
        message: 'Le mot de passe est requis pour créer un compte.' 
      });
    }

    // Récupérer les paramètres
    const settings = await Settings.findOne();
    const minAmount = settings?.settings?.registrationMinAmount || 20;
    const maxAmount = settings?.settings?.registrationMaxAmount || 120;
    const paypalMode = settings?.settings?.paypalMode || 'sandbox';

    // Validation du montant payé
    const paid = parseFloat(amountPaid);
    if (isNaN(paid) || paid < minAmount || paid > maxAmount) {
      return res.status(400).json({ 
        message: `Le montant doit être entre ${minAmount}€ et ${maxAmount}€.` 
      });
    }

    // ===== VÉRIFICATION PAIEMENT =====
    let verifiedAmount = paid;
    let verification = null;
    
    // Si paiement PayPal, vérifier les détails
    if (paymentMethod === 'paypal') {
      if (!paymentDetails || !paymentDetails.orderID) {
        return res.status(400).json({ 
          message: '❌ Détails de paiement PayPal manquants' 
        });
      }

      // Vérifier transaction non dupliquée
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

      // ✅ VÉRIFIER LE PAIEMENT AUPRÈS DE PAYPAL
      console.log('🔍 Vérification PayPal pour orderID:', paymentDetails.orderID);
      verification = await paypalService.verifyPayment(
        paymentDetails.orderID
      );

      console.log('📋 Résultat vérification:', verification);

      if (!verification.verified) {
        console.error('❌ Paiement non vérifié:', verification.error);
        return res.status(400).json({ 
          message: '❌ Paiement invalide ou non complété. Aucun compte créé.',
          error: verification.error,
          details: verification
        });
      }

      // Vérifier montant
      if (!verification.isDevelopmentMode && verification.amount !== paid) {
        console.error('❌ Montant incohérent:', {
          claimed: paid,
          actual: verification.amount
        });
        return res.status(400).json({ 
          message: `❌ Montant incohérent : ${paid}€ reçu mais ${verification.amount}€ payé`
        });
      }
      
      // Utiliser le montant vérifié
      verifiedAmount = verification.isDevelopmentMode ? paid : verification.amount;
      
    } else if (paymentMethod === 'cash') {
      // Paiement espèces : montant = 0 (sera payé au camp)
      console.log('💵 Inscription avec paiement espèces (différé)');
      verifiedAmount = 0; // Pas de paiement immédiat
    } else {
      return res.status(400).json({ 
        message: '❌ Mode de paiement invalide. Utilisez "paypal" ou "cash".' 
      });
    }

    // ===== CALCUL DU STATUT =====
    // Calculer le totalPrice selon le nombre de jours (40€/jour)
    const validDays = [1, 2, 3];
    const days = validDays.includes(parseInt(numberOfDays)) ? parseInt(numberOfDays) : 3;
    const totalPrice = days * 40; // 1j=40€, 2j=80€, 3j=120€
    console.log(`📅 Nombre de jours: ${days} → Total: ${totalPrice}€`);

    const remaining = Math.max(0, totalPrice - verifiedAmount);
    // Status selon enum du modèle: 'unpaid', 'partial', 'paid'
    const status = remaining === 0 ? 'paid' : (verifiedAmount > 0 ? 'partial' : 'unpaid');

    // ===== 🎉 PAIEMENT RÉUSSI → CRÉER/RÉCUPÉRER LE COMPTE USER =====
    let user;
    let newToken = null;
    let isNewUser = false;

    if (existingUser) {
      // Utilisateur existe déjà → lier l'inscription
      console.log('👤 Utilisateur existe déjà:', email);
      user = existingUser;
      
      // Mettre à jour les infos si nécessaires
      if (!user.phoneNumber) user.phoneNumber = phone;
      if (!user.ministryRole) user.ministryRole = refuge;
      await user.save();
      
    } else {
      // 🆕 CRÉER UN NOUVEAU COMPTE
      console.log('✨ Création d\'un nouveau compte pour:', email);
      isNewUser = true;

      console.log('🔐 Hashing mot de passe...');
      console.log('   - Password reçu:', password);
      console.log('   - Longueur:', password.length);
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('   - Hash généré:', hashedPassword.substring(0, 20) + '...');
      console.log('   - Longueur hash:', hashedPassword.length);

      user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'utilisateur',
        phoneNumber: phone,
        ministryRole: refuge,
        isEmailVerified: true, // ✅ Email vérifié automatiquement (paiement réussi)
        emailVerifiedAt: new Date(),
        isActive: true
      });

      await user.save();
      console.log('✅ Compte créé avec succès pour:', user.email);
      console.log('📋 Détails compte:');
      console.log('   - ID:', user._id);
      console.log('   - Email:', user.email);
      console.log('   - Password hash:', user.password.substring(0, 20) + '...');
      console.log('   - Email vérifié:', user.isEmailVerified);
      console.log('   - Role:', user.role);

      // Générer un token JWT pour connexion automatique
      newToken = jwt.sign(
        { 
          userId: user._id, 
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          firstName: user.firstName,
          lastName: user.lastName
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    }

    // Convertir la date du format JJ/MM/AAAA en Date
    let parsedDateOfBirth;
    if (dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.includes('/')) {
      const [day, month, year] = dateOfBirth.split('/');
      parsedDateOfBirth = new Date(year, month - 1, day);
      console.log('📅 Date convertie:', dateOfBirth, '→', parsedDateOfBirth);
    } else {
      parsedDateOfBirth = new Date(dateOfBirth);
    }

    // ===== CRÉER L'INSCRIPTION =====
    const registrationData = {
      user: user._id,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      sex,
      dateOfBirth: parsedDateOfBirth,
      address,
      phone,
      refuge,
      hasAllergies: !!hasAllergies,
      allergyDetails: hasAllergies ? allergyDetails : null,
      numberOfDays: days,
      totalPrice,
      amountPaid: verifiedAmount,
      amountRemaining: remaining,
      paymentStatus: status,
      paypalMode: paypalMode
    };

    // Ajouter les détails PayPal uniquement si paiement PayPal
    if (paymentMethod === 'paypal' && verification) {
      registrationData.paymentDetails = {
        orderID: verification.orderID,
        payerID: paymentDetails.payerID,
        status: verification.status,
        verifiedAt: new Date(),
        payerEmail: verification.payerEmail,
        isDevelopmentMode: verification.isDevelopmentMode,
        amountPaid: verifiedAmount
      };
    } else if (paymentMethod === 'cash') {
      // 🚫 NE PAS créer Registration pour paiement espèces
      // ✅ Créer PreRegistration en attente de validation
      console.log('💵 Inscription espèces → Création PreRegistration');
      
      const requestedAmount = parseFloat(amountPaid);
      
      // Convertir la date du format JJ/MM/AAAA en Date
      let parsedDate;
      if (dateOfBirth && typeof dateOfBirth === 'string' && dateOfBirth.includes('/')) {
        const [day, month, year] = dateOfBirth.split('/');
        parsedDate = new Date(year, month - 1, day); // Mois commence à 0
        console.log('📅 Date convertie:', dateOfBirth, '→', parsedDate);
      } else {
        parsedDate = new Date(dateOfBirth);
      }
      
      const preRegistration = new PreRegistration({
        user: user._id,
        isGuest: false,
        firstName,
        lastName,
        email,
        sex,
        dateOfBirth: parsedDate,
        address,
        phone,
        refuge,
        hasAllergies: !!hasAllergies,
        allergyDetails: hasAllergies ? allergyDetails : null,
        cashAmount: requestedAmount,
        status: 'pending',
        submittedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      await preRegistration.save();
      console.log('✅ PreRegistration créée:', preRegistration._id);
      
      // Envoyer email d'information au participant
      try {
        await sendCampRegistrationConfirmation(
          preRegistration.email,
          preRegistration.firstName,
          {
            email: preRegistration.email,
            firstName: preRegistration.firstName,
            amountPaid: 0,
            amountRemaining: 120,
            paymentStatus: 'pending_validation',
            cashAmount: requestedAmount
          },
          { cashPaymentPending: true, cashAmount: requestedAmount }
        );
        console.log('✅ Email information envoyé au participant');
      } catch (emailError) {
        console.error('⚠️ Erreur email participant:', emailError.message);
      }
      
      // Envoyer email au responsable du campus
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
      
      // Retourner succès SANS créer de Registration
      return res.status(201).json({
        success: true,
        message: `⏳ Demande enregistrée ! Votre paiement de ${requestedAmount}€ en espèces doit être validé par un responsable avant que votre inscription ne soit créée.`,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        preRegistration: {
          _id: preRegistration._id,
          status: 'pending',
          cashAmount: requestedAmount
        },
        token: newToken,
        isNewUser,
        instructions: {
          important: '⚠️ Votre inscription n\'est PAS encore créée',
          step1: 'Remettez le montant de ' + requestedAmount + '€ en espèces à un responsable de votre campus',
          step2: 'Le responsable validera votre paiement dans le système',
          step3: 'Votre inscription sera alors CRÉÉE automatiquement',
          step4: 'Vous recevrez un email de confirmation',
          access: '🚫 Vous n\'avez pas encore accès au tableau de bord ni aux activités'
        }
      });
    } else {
      // Pour paiement espèces, créer une entrée dans cashPayments pour compatibilité
      const requestedAmount = parseFloat(amountPaid); // Montant demandé par l'utilisateur
      registrationData.paymentMethod = 'cash';
      registrationData.cashPayments = [{
        amount: requestedAmount,
        status: 'pending',
        submittedAt: new Date(),
        note: 'Paiement en espèces au camp (inscription directe)'
      }];
      registrationData.paymentDetails = {
        method: 'cash',
        status: 'pending',
        note: 'Paiement en espèces au camp'
      };
    }

    const registration = new Registration(registrationData);

    // 🔍 Log avant sauvegarde pour débogage
    console.log('📋 Données inscription à sauvegarder:', {
      user: registrationData.user,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      sex: registrationData.sex,
      dateOfBirth: registrationData.dateOfBirth,
      refuge: registrationData.refuge,
      numberOfDays: registrationData.numberOfDays,
      totalPrice: registrationData.totalPrice,
      amountPaid: registrationData.amountPaid,
      paymentStatus: registrationData.paymentStatus,
      paypalMode: registrationData.paypalMode
    });

    await registration.save();
    console.log('✅ Inscription créée:', registration._id);

    // ===== LOGGER LE CONSENTEMENT RGPD =====
    try {
      const ConsentLog = require('../models/ConsentLog');
      
      // Logger consentement traitement données personnelles
      await ConsentLog.logConsent(
        user._id,
        'inscription',
        true,
        req.ip,
        req.get('user-agent'),
        { 
          registrationId: registration._id.toString(),
          paypalMode,
          consentVersion: '1.1',
          privacyPolicyAccepted: true
        }
      );
      
      // Logger consentement données de santé si allergies
      if (hasAllergies && allergyDetails) {
        await ConsentLog.logConsent(
          user._id,
          'donnees_sante',
          true,
          req.ip,
          req.get('user-agent'),
          { 
            registrationId: registration._id.toString(),
            allergyType: 'alimentaire'
          }
        );
      }
      
      console.log('✅ Consentements RGPD loggés (Article 30)');
    } catch (consentError) {
      console.error('⚠️ Erreur logging consentement:', consentError.message);
      // Ne pas bloquer l'inscription si logging échoue
    }

    // ===== LOGGER LA TRANSACTION =====
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
    }

    // ===== ENVOYER EMAIL DE CONFIRMATION =====
    try {
      await sendCampRegistrationConfirmation(
        registration.email,
        registration.firstName,
        registration
      );
      console.log('✅ Email de confirmation envoyé à:', registration.email);
    } catch (emailError) {
      console.error('⚠️ Erreur email:', emailError.message);
    }

    // ===== CRÉER PAYOUT POUR REDISTRIBUTION =====
    try {
      const payout = await payoutService.createPayoutForRegistration(registration._id, user._id);
      console.log('✅ Payout créé:', payout);
    } catch (payoutError) {
      console.error('⚠️ Erreur payout:', payoutError.message);
    }

    // ===== NOTIFICATION PUSH =====
    pushService.notifyRegistrationUpdate(user._id, 'confirmed').catch(err => {
      console.error('❌ Erreur notification push:', err);
    });

    // ===== RÉPONSE SUCCÈS =====
    const responseData = {
      message: isNewUser 
        ? '🎉 Compte créé et inscription réussie !' 
        : '✅ Inscription réussie !',
      registration: {
        id: registration._id,
        amountPaid: registration.amountPaid,
        amountRemaining: registration.amountRemaining,
        status: registration.paymentStatus
      },
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    };

    // Ajouter token si nouveau compte (connexion automatique)
    if (isNewUser && newToken) {
      responseData.token = newToken;
      responseData.message = '🎉 Compte créé et inscription réussie ! Vous êtes maintenant connecté.';
    }

    res.status(201).json(responseData);

  } catch (error) {
    console.error('❌ Erreur inscription camp avec compte:', error);
    // Extraire les erreurs de validation Mongoose
    let detailedMessage = error.message;
    if (error.name === 'ValidationError') {
      detailedMessage = Object.values(error.errors).map(e => e.message).join(' | ');
    }
    console.error('❌ Détail:', detailedMessage);
    res.status(500).json({ 
      message: detailedMessage || 'Erreur lors de l\'inscription',
      error: error.message,
      type: error.name
    });
  }
};
