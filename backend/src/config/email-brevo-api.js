const fetch = require('node-fetch');

// 🌟 VERSION BREVO API - Contourne le blocage SMTP de Render.com
// Cette version utilise l'API HTTP de Brevo au lieu de SMTP
// Port 443 (HTTPS) fonctionne sur Render, alors que les ports SMTP (25, 465, 587) sont bloqués

/**
 * Envoie un email via l'API Brevo (v3)
 * @param {string} to - Email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} htmlContent - Contenu HTML
 * @param {string} textContent - Contenu texte (optionnel)
 * @returns {Promise<Object>} - Réponse de l'API Brevo
 */
const sendEmailViaBrevoAPI = async (to, subject, htmlContent, textContent = '') => {
  console.log('📧 Envoi d\'email via Brevo API...');
  console.log(`   Destinataire: ${to}`);
  console.log(`   Sujet: ${subject}`);
  
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('❌ BREVO_API_KEY manquante dans les variables d\'environnement');
    throw new Error('BREVO_API_KEY non configurée');
  }
  
  const emailFrom = process.env.EMAIL_FROM || 'noreply@gjcamp.com';
  
  const payload = {
    sender: {
      name: "ELIJAH'GOD",
      email: emailFrom
    },
    to: [
      {
        email: to
      }
    ],
    subject: subject,
    htmlContent: htmlContent,
    textContent: textContent || subject
  };
  
  try {
    console.log('🚀 Appel API Brevo: POST https://api.brevo.com/v3/smtp/email');
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erreur API Brevo:', responseData);
      throw new Error(`Brevo API Error: ${JSON.stringify(responseData)}`);
    }
    
    console.log('✅ Email envoyé avec succès via Brevo API');
    console.log('   Message ID:', responseData.messageId);
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi via Brevo API:', error.message);
    throw error;
  }
};

/**
 * Envoie un email de vérification avec lien de vérification
 */
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  console.log('📧 Préparation email de vérification pour:', email);
  
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
  
  const subject = '✉️ Vérifiez votre adresse email - ELIJAH’GOD';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #a01e1e; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background-color: #001a4d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Bienvenue chez ELIJAH'GOD !</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName},</h2>
            <p>Merci de vous être inscrit sur notre plateforme. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✅ Vérifier mon email</a>
            </div>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="background-color: #e9e9e9; padding: 10px; border-radius: 3px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p><strong>⏰ Ce lien expire dans 24 heures.</strong></p>
            
            <p>Si vous n'avez pas créé de compte sur ELIJAH'GOD, ignorez cet email.</p>
            
            <p>Cordialement,<br>L'équipe ELIJAH'GOD</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ELIJAH'GOD - Tous droits réservés</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const textContent = `
    Bonjour ${firstName},
    
    Merci de vous être inscrit sur ELIJAH'GOD. Pour activer votre compte, cliquez sur ce lien :
    ${verificationUrl}
    
    Ce lien expire dans 24 heures.
    
    Si vous n'avez pas créé de compte, ignorez cet email.
    
    Cordialement,
    L'équipe ELIJAH'GOD
  `;
  
  return await sendEmailViaBrevoAPI(email, subject, htmlContent, textContent);
};

/**
 * Renvoie un email de vérification
 */
const resendVerificationEmail = async (email, firstName, verificationToken) => {
  console.log('🔄 Renvoi de l\'email de vérification pour:', email);
  return await sendVerificationEmail(email, firstName, verificationToken);
};

/**
 * Envoie un email de demande de réinitialisation de mot de passe (pour validation admin)
 */
const sendPasswordResetRequestEmail = async (email, firstName) => {
  console.log('📧 Préparation email de demande de réinitialisation pour:', email);
  
  const subject = '🔐 Demande de réinitialisation de mot de passe - ELIJAH’GOD';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #a01e1e; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .info-box { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Demande de réinitialisation</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName},</h2>
            <p>Nous avons bien reçu votre demande de réinitialisation de mot de passe.</p>
            
            <div class="info-box">
              <strong>📋 Processus de validation :</strong><br><br>
              Votre demande est en attente de validation par un administrateur. Ceci est une mesure de sécurité pour protéger votre compte.<br><br>
              Vous recevrez un email avec un lien de réinitialisation dès qu'un administrateur aura approuvé votre demande.
            </div>
            
            <p><strong>⚠️ Si vous n'avez pas fait cette demande, contactez immédiatement un administrateur.</strong></p>
            
            <p>Cordialement,<br>L'équipe GJ Camp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GJ Camp - Tous droits réservés</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const textContent = `
    Bonjour ${firstName},
    
    Nous avons bien reçu votre demande de réinitialisation de mot de passe.
    
    PROCESSUS DE VALIDATION :
    Votre demande est en attente de validation par un administrateur. Ceci est une mesure de sécurité pour protéger votre compte.
    
    Vous recevrez un email avec un lien de réinitialisation dès qu'un administrateur aura approuvé votre demande.
    
    ⚠️ Si vous n'avez pas fait cette demande, contactez immédiatement un administrateur.
    
    Cordialement,
    L'équipe GJ Camp
  `;
  
  return await sendEmailViaBrevoAPI(email, subject, htmlContent, textContent);
};

/**
 * Envoie un email de réinitialisation de mot de passe (après validation admin)
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  console.log('📧 Préparation email de réinitialisation pour:', email);
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const subject = '✅ Réinitialisation de mot de passe approuvée - ELIJAH’GOD';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #a01e1e; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background-color: #001a4d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Réinitialisation approuvée</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName},</h2>
            <p>Votre demande de réinitialisation de mot de passe a été approuvée par un administrateur.</p>
            
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">🔐 Réinitialiser mon mot de passe</a>
            </div>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="background-color: #e9e9e9; padding: 10px; border-radius: 3px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important :</strong><br>
              • Ce lien expire dans 24 heures<br>
              • N'utilisez ce lien que si vous avez demandé une réinitialisation<br>
              • Contactez immédiatement un administrateur si vous n'avez pas fait cette demande
            </div>
            
            <p>Cordialement,<br>L'équipe GJ Camp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GJ Camp - Tous droits réservés</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const textContent = `
    Bonjour ${firstName},
    
    Votre demande de réinitialisation de mot de passe a été approuvée par un administrateur.
    
    Cliquez sur ce lien pour créer un nouveau mot de passe :
    ${resetUrl}
    
    ⚠️ IMPORTANT :
    • Ce lien expire dans 24 heures
    • N'utilisez ce lien que si vous avez demandé une réinitialisation
    • Contactez immédiatement un administrateur si vous n'avez pas fait cette demande
    
    Cordialement,
    L'équipe GJ Camp
  `;
  
  return await sendEmailViaBrevoAPI(email, subject, htmlContent, textContent);
};

/**
 * Envoie un email de confirmation d'inscription au camp (après validation du paiement)
 */
const sendCampRegistrationConfirmation = async (email, firstName, registration, options = {}) => {
  console.log('📧 Préparation email de confirmation d\'inscription pour:', email);
  
  const isCashPayment = registration.paymentMethod === 'cash' || registration.paymentMethod === 'mixed';
  const hasPendingCash = registration.cashPayments?.some(p => p.status === 'pending');
  const isPartialPayment = registration.paymentStatus !== 'paid';
  
  let paymentStatusText, subjectText, messageIntro, nextSteps;

  // Paiement en espèces en attente
  if (options.cashPaymentPending) {
    paymentStatusText = `⏳ En attente de validation (${options.cashAmount}€ en espèces)`;
    subjectText = '⏳ Demande enregistrée - GJ Camp 2026 (Paiement espèces en attente)';
    messageIntro = `Merci pour votre demande d'inscription au <span class="highlight">GJ Camp 2026</span>. Votre paiement de <strong>${options.cashAmount}€ en espèces</strong> doit être validé par un responsable avant que votre inscription ne soit créée.`;
    nextSteps = `
      <li><strong>⚠️ IMPORTANT : Votre inscription n'est PAS encore créée</strong></li>
      <li>Remettez le montant de <strong>${options.cashAmount}€</strong> en espèces à un responsable de votre campus</li>
      <li>Le responsable validera votre paiement dans le système</li>
      <li>Votre inscription sera alors <strong>CRÉÉE automatiquement</strong></li>
      <li>Vous recevrez un email de confirmation une fois validé</li>
      <li>🚫 Vous n'avez pas encore accès au tableau de bord ni aux activités</li>
    `;
  }
  // Paiement en espèces validé
  else if (options.cashPaymentValidated) {
    const isComplete = registration.paymentStatus === 'paid';
    paymentStatusText = isComplete ? '✅ Complet' : `⏳ Partiel (${registration.amountRemaining}€ restants)`;
    subjectText = isComplete 
      ? '✅ Paiement validé - GJ Camp 2026' 
      : '✅ Paiement partiel validé - GJ Camp 2026';
    messageIntro = `Bonne nouvelle ! Votre paiement de <strong>${options.validatedAmount}€ en espèces</strong> a été validé par un responsable.`;
    nextSteps = `
      <li>Votre paiement a été validé, vous pouvez maintenant accéder au planning des activités !</li>
      ${isComplete 
        ? '<li>Votre inscription est complète (120€ payés)</li>'
        : `<li>Vous pouvez compléter le paiement restant de <strong>${registration.amountRemaining}€</strong> à tout moment</li>`
      }
      <li>Connectez-vous à votre compte pour voir tous les détails</li>
    `;
  }
  // Paiement partiel classique
  else if (isPartialPayment) {
    paymentStatusText = `⏳ Partiel (${registration.amountRemaining}€ restants)`;
    subjectText = '📝 Inscription enregistrée - GJ Camp 2026 (Paiement partiel)';
    messageIntro = `Merci pour votre inscription au <span class="highlight">GJ Camp 2026</span>. Votre paiement partiel de <strong>${registration.amountPaid}€</strong> a bien été enregistré.`;
    nextSteps = `
      <li>Votre paiement a été validé, vous pouvez maintenant accéder au planning des activités !</li>
      <li>Vous pouvez compléter le paiement restant de <strong>${registration.amountRemaining}€</strong> à tout moment depuis votre compte</li>
      <li>Connectez-vous à votre compte pour voir tous les détails</li>
    `;
  }
  // Paiement complet
  else {
    paymentStatusText = '✅ Complet';
    subjectText = '✅ Inscription confirmée - GJ Camp 2026';
    messageIntro = `Félicitations ! Votre inscription au <span class="highlight">GJ Camp 2026</span> est maintenant <strong>confirmée</strong>.`;
    nextSteps = `
      <li>Vous pouvez maintenant accéder au planning des activités et sélectionner vos créneaux</li>
      <li>Connectez-vous à votre compte pour voir tous les détails</li>
      <li>Vous recevrez prochainement plus d'informations sur le camp</li>
    `;
  }

  const subject = subjectText;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #a01e1e; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; background-color: #a01e1e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
          .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
          .highlight { color: #a01e1e; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${options.cashPaymentPending ? '⏳ Demande enregistrée !' : 
                  (options.cashPaymentValidated ? '✅ Paiement validé !' :
                  (isPartialPayment ? '📝 Inscription enregistrée !' : '🎉 Inscription confirmée !'))}</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${firstName}</strong>,</p>
            
            <p>${messageIntro}</p>
            
            ${options.cashPaymentPending || (isPartialPayment && !options.cashPaymentValidated) ? `
              <div class="warning-box">
                <h4>💰 ${options.cashPaymentPending ? '⚠️ Paiement en espèces en attente de validation' : 'Paiement partiel'}</h4>
                ${options.cashPaymentPending ? `
                  <p><strong>⚠️ IMPORTANT :</strong> Votre inscription n'est <strong>PAS encore créée</strong></p>
                  <p><strong>Montant déclaré :</strong> ${options.cashAmount}€ en espèces</p>
                  <p><strong>Statut :</strong> ⏳ En attente de validation</p>
                  <p><strong>Ce que vous devez faire :</strong></p>
                  <ol>
                    <li>Remettez le montant de <strong>${options.cashAmount}€</strong> en espèces à un responsable de votre campus</li>
                    <li>Le responsable validera votre paiement dans le système</li>
                    <li>Votre inscription sera alors <strong>CRÉÉE automatiquement</strong></li>
                    <li>Vous recevrez un email de confirmation</li>
                  </ol>
                  <p style="color: #d32f2f; font-weight: bold; margin-top: 10px;">🚫 Restrictions actuelles :</p>
                  <ul style="color: #d32f2f;">
                    <li>Pas d'accès au tableau de bord</li>
                    <li>Pas d'accès aux activités</li>
                    <li>Pas de QR code disponible</li>
                  </ul>
                ` : `
                  <p><strong>Montant payé :</strong> ${registration.amountPaid}€ / 120€</p>
                  <p><strong>Reste à payer :</strong> ${registration.amountRemaining}€</p>
                  <p style="color: #4caf50;"><strong>✅ Vous avez accès au planning des activités dès maintenant !</strong></p>
                  <p>Vous pouvez compléter le paiement à tout moment depuis votre compte.</p>
                `}
              </div>
            ` : ''}
            
            ${options.cashPaymentValidated ? `
              <div class="info-box">
                <h4>✅ Paiement validé</h4>
                <p><strong>Montant validé :</strong> ${options.validatedAmount}€</p>
                <p><strong>Total payé :</strong> ${registration.amountPaid}€ / 120€</p>
                ${registration.amountRemaining > 0 ? `
                  <p><strong>Reste à payer :</strong> ${registration.amountRemaining}€</p>
                ` : `
                  <p style="color: #4caf50;"><strong>✅ Votre inscription est maintenant complète !</strong></p>
                `}
              </div>
            ` : ''}
            
            <div class="info-box">
              <h3>📋 Récapitulatif de votre inscription :</h3>
              <ul>
                <li><strong>Nom :</strong> ${registration.firstName} ${registration.lastName}</li>
                <li><strong>Email :</strong> ${registration.email}</li>
                <li><strong>Téléphone :</strong> ${registration.phone}</li>
                <li><strong>Refuge CRPT :</strong> ${registration.refuge}</li>
                <li><strong>Montant payé :</strong> ${registration.amountPaid}€ / 120€</li>
                <li><strong>Statut du paiement :</strong> ${paymentStatusText}</li>
                ${registration.paymentMethod && registration.paymentMethod !== 'paypal' ? `
                  <li><strong>Mode de paiement :</strong> ${
                    registration.paymentMethod === 'cash' ? '💵 Espèces' : 
                    registration.paymentMethod === 'mixed' ? '💳💵 Mixte (PayPal + Espèces)' : 
                    '💳 PayPal'
                  }</li>
                ` : ''}
              </ul>
            </div>
            
            ${registration.hasAllergies ? `
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <h4>⚠️ Allergies signalées :</h4>
                <p>${registration.allergyDetails}</p>
              </div>
            ` : ''}
            
            <p><strong>Prochaines étapes :</strong></p>
            <ol>
              ${nextSteps}
            </ol>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/${
                options.cashPaymentPending ? 'profil' : 
                (isPartialPayment ? 'profil' : 'activites')
              }" class="button">
                ${options.cashPaymentPending ? 'Voir mon inscription' :
                  (isPartialPayment ? 'Compléter mon paiement' : 'Voir les activités disponibles')}
              </a>
            </div>
            
            <p style="margin-top: 30px;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            
            <p>À très bientôt au GJ Camp 2026 ! 🏕️</p>
            
            <p>Cordialement,<br>L'équipe GJ Camp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GJ Camp - Tous droits réservés</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const textContent = `
    Bonjour ${firstName},
    
    ${messageIntro.replace(/<[^>]*>/g, '')}
    
    RÉCAPITULATIF DE VOTRE INSCRIPTION :
    - Nom : ${registration.firstName} ${registration.lastName}
    - Email : ${registration.email}
    - Téléphone : ${registration.phone}
    - Refuge CRPT : ${registration.refuge}
    - Montant payé : ${registration.amountPaid}€ / 120€
    - Statut du paiement : ${paymentStatusText}
    
    ${registration.hasAllergies ? `ALLERGIES SIGNALÉES : ${registration.allergyDetails}\n` : ''}
    
    PROCHAINES ÉTAPES :
    ${nextSteps.replace(/<[^>]*>/g, '').split('\n').filter(l => l.trim()).join('\n')}
    
    Si vous avez des questions, n'hésitez pas à nous contacter.
    
    À très bientôt au GJ Camp 2026 !
    
    Cordialement,
    L'équipe GJ Camp
  `;
  
  return await sendEmailViaBrevoAPI(email, subject, htmlContent, textContent);
};

/**
 * Envoyer email de rejet de paiement espèces
 */
const sendCashPaymentRejection = async (email, firstName, amount, reason) => {
  console.log(`📧 Envoi email rejet paiement espèces à ${email}`);
  
  const subject = '❌ Demande d\'inscription rejetée - GJ Camp 2026';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
          .highlight { color: #a01e1e; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Demande rejetée</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${firstName}</strong>,</p>
            
            <p>Nous sommes désolés de vous informer que votre demande d'inscription au <span class="highlight">GJ Camp 2026</span> avec paiement en espèces a été <strong>rejetée</strong> par un responsable.</p>
            
            <div class="warning-box">
              <h4>❌ Informations sur le rejet</h4>
              <p><strong>Montant déclaré :</strong> ${amount}€</p>
              <p><strong>Raison du rejet :</strong></p>
              <p style="background: white; padding: 12px; border-radius: 5px; margin: 10px 0;">${reason}</p>
            </div>
            
            <h3>🔄 Que faire maintenant ?</h3>
            <ul>
              <li>Contactez votre responsable de campus pour plus d'informations</li>
              <li>Vérifiez les détails de votre demande et soumettez-la à nouveau si nécessaire</li>
              <li>Vous pouvez aussi payer en ligne via PayPal/Carte bancaire</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://gjsdecrpt.fr'}/inscription-camp" class="button">
                📝 Nouvelle inscription
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Si vous avez des questions ou si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à contacter votre responsable de campus.
            </p>
          </div>
          <div class="footer">
            <p>Camp Génération Josué 2026 • 16-25 août 2025</p>
            <p style="color: #999; font-size: 11px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const textContent = `
Bonjour ${firstName},

Nous sommes désolés de vous informer que votre demande d'inscription au GJ Camp 2026 avec paiement en espèces a été rejetée.

Montant déclaré : ${amount}€
Raison du rejet : ${reason}

Que faire maintenant ?
- Contactez votre responsable de campus pour plus d'informations
- Vérifiez les détails de votre demande et soumettez-la à nouveau si nécessaire
- Vous pouvez aussi payer en ligne via PayPal/Carte bancaire

Rendez-vous sur ${process.env.FRONTEND_URL || 'https://gjsdecrpt.fr'}/inscription-camp pour faire une nouvelle inscription.

Camp Génération Josué 2026 • 16-25 août 2025
  `;
  
  return await sendEmailViaBrevoAPI(email, subject, htmlContent, textContent);
};

module.exports = {
  sendVerificationEmail,
  resendVerificationEmail,
  sendPasswordResetRequestEmail,
  sendPasswordResetEmail,
  sendCampRegistrationConfirmation,
  sendCashPaymentRequestToResponsable,
  sendCashPaymentRejection,
  sendEmailViaBrevoAPI
};
