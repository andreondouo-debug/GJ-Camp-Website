const nodemailer = require('nodemailer');

// Configuration du transporteur d'email
const createTransporter = () => {
  console.log('📧 Configuration email détectée:');
  console.log('  - EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'non défini');
  console.log('  - EMAIL_USER:', process.env.EMAIL_USER || 'non défini');
  console.log('  - EMAIL_HOST:', process.env.EMAIL_HOST || 'non défini');
  console.log('  - NODE_ENV:', process.env.NODE_ENV || 'development');
  
  // En production, utiliser un service d'email configuré
  if (process.env.EMAIL_SERVICE === 'gmail') {
    console.log('✅ Utilisation de Gmail pour l\'envoi d\'emails');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
    console.log('✅ Utilisation de SendGrid pour l\'envoi d\'emails');
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else if (process.env.EMAIL_HOST) {
    // Configuration personnalisée (Brevo, Mailgun, etc.)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // En développement, retourner null (on créera un compte Ethereal)
  return null;
};

// Envoyer un email de vérification
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  console.log(`📨 Tentative d'envoi d'email de vérification à: ${email}`);
  
  let transporter = createTransporter();
  
  // Si pas de transporteur configuré, créer un compte de test Ethereal
  if (!transporter) {
    console.log('⚠️ Aucun transporteur configuré, utilisation d\'Ethereal (test)');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Compte email de test créé:', testAccount.user);
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `"GJ Camp" <${process.env.EMAIL_USER || 'noreply@gjcamp.com'}>`,
    to: email,
    subject: '✉️ Confirmez votre adresse email - GJ Camp',
    html: `
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
              <h1>🎉 Bienvenue sur GJ Camp !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${firstName},</h2>
              <p>Merci de vous être inscrit sur GJ Camp. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">✅ Confirmer mon email</a>
              </div>
              
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="background-color: #e9e9e9; padding: 10px; border-radius: 3px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <p><strong>Ce lien expire dans 24 heures.</strong></p>
              
              <p>Si vous n'avez pas créé de compte sur GJ Camp, vous pouvez ignorer cet email.</p>
              
              <p>Cordialement,<br>L'équipe GJ Camp</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} GJ Camp - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Bonjour ${firstName},
      
      Merci de vous être inscrit sur GJ Camp. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur ce lien :
      
      ${verificationUrl}
      
      Ce lien expire dans 24 heures.
      
      Si vous n'avez pas créé de compte sur GJ Camp, vous pouvez ignorer cet email.
      
      Cordialement,
      L'équipe GJ Camp
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  console.log('✅ Email envoyé avec succès!');
  console.log('  - Message ID:', info.messageId);
  console.log('  - Destinataire:', email);
  console.log('  - Réponse serveur:', info.response);
  
  // Si en développement avec Ethereal, afficher le lien de prévisualisation
  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 Email de vérification envoyé en mode test');
    console.log('🔗 Prévisualisation:', nodemailer.getTestMessageUrl(info));
  } else {
    console.log('📨 Email de vérification envoyé en production à:', email);
  }
  
  return info;
};

// Renvoyer un email de vérification
const resendVerificationEmail = async (email, firstName, verificationToken) => {
  return sendVerificationEmail(email, firstName, verificationToken);
};

// Envoyer un email de demande de réinitialisation de mot de passe
const sendPasswordResetRequestEmail = async (email, firstName) => {
  let transporter = createTransporter();
  
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Compte email de test créé:', testAccount.user);
  }

  const mailOptions = {
    from: `"GJ Camp" <${process.env.EMAIL_USER || 'noreply@gjcamp.com'}>`,
    to: email,
    subject: '🔐 Demande de réinitialisation de mot de passe - GJ Camp',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #a01e1e; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
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
              
              <div class="alert">
                <strong>⏳ En attente de validation</strong><br>
                Pour des raisons de sécurité, votre demande doit être approuvée par un administrateur.<br>
                Vous recevrez un email avec un lien de réinitialisation une fois votre demande validée.
              </div>
              
              <p>Ce processus prend généralement quelques heures.</p>
              
              <p>Si vous n'avez pas fait cette demande, veuillez contacter immédiatement un administrateur.</p>
              
              <p>Cordialement,<br>L'équipe GJ Camp</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} GJ Camp - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 Email de demande de réinitialisation envoyé');
    console.log('🔗 Prévisualisation:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

// Envoyer un email avec le lien de réinitialisation (après approbation admin)
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  let transporter = createTransporter();
  
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Compte email de test créé:', testAccount.user);
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"GJ Camp" <${process.env.EMAIL_USER || 'noreply@gjcamp.com'}>`,
    to: email,
    subject: '✅ Réinitialisation de mot de passe approuvée - GJ Camp',
    html: `
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
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 Email de réinitialisation envoyé');
    console.log('🔗 Prévisualisation:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

// Envoyer un email de confirmation d'inscription au camp (après validation du paiement)
const sendCampRegistrationConfirmation = async (email, firstName, registration, options = {}) => {
  let transporter = createTransporter();
  
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const isCashPayment = registration.paymentMethod === 'cash' || registration.paymentMethod === 'mixed';
  const hasPendingCash = registration.cashPayments?.some(p => p.status === 'pending');
  const isPartialPayment = registration.paymentStatus !== 'paid';
  
  let paymentStatusText, subjectText, messageIntro, nextSteps;

  // Paiement en espèces en attente
  if (options.cashPaymentPending) {
    paymentStatusText = `⏳ En attente de validation (${options.cashAmount}€ en espèces)`;
    subjectText = '⏳ Inscription en attente - GJ Camp 2026 (Paiement espèces)';
    messageIntro = `Merci pour votre inscription au <span class="highlight">GJ Camp 2026</span>. Votre paiement de <strong>${options.cashAmount}€ en espèces</strong> est en attente de validation par un responsable.`;
    nextSteps = `
      <li>Remettez le montant de <strong>${options.cashAmount}€</strong> à un responsable</li>
      <li>Le responsable validera votre paiement dans le système</li>
      <li>Vous recevrez un email de confirmation une fois validé</li>
      <li>Votre inscription sera alors complète</li>
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

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@gjcamp.com',
    to: email,
    subject: subjectText,
    html: `
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
              <h1>${options.cashPaymentPending ? '⏳ Inscription en attente !' : 
                    (options.cashPaymentValidated ? '✅ Paiement validé !' :
                    (isPartialPayment ? '📝 Inscription enregistrée !' : '🎉 Inscription confirmée !'))}</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${firstName}</strong>,</p>
              
              <p>${messageIntro}</p>
              
              ${options.cashPaymentPending || (isPartialPayment && !options.cashPaymentValidated) ? `
                <div class="warning-box">
                  <h4>💰 ${options.cashPaymentPending ? 'Paiement en espèces en attente' : 'Paiement partiel'}</h4>
                  ${options.cashPaymentPending ? `
                    <p><strong>Montant déclaré :</strong> ${options.cashAmount}€</p>
                    <p><strong>Statut :</strong> ⏳ En attente de validation</p>
                    <p><strong>Instructions :</strong></p>
                    <ol>
                      <li>Remettez le montant en espèces à un responsable</li>
                      <li>Le responsable validera votre paiement</li>
                      <li>Vous recevrez un email de confirmation</li>
                    </ol>
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
    `,
    text: `
      Bonjour ${firstName},
      
      Félicitations ! Votre inscription au GJ Camp 2026 est maintenant confirmée.
      
      RÉCAPITULATIF DE VOTRE INSCRIPTION :
      - Nom : ${registration.firstName} ${registration.lastName}
      - Email : ${registration.email}
      - Téléphone : ${registration.phone}
      - Refuge CRPT : ${registration.refuge}
      - Montant payé : ${registration.amountPaid}€ / 120€
      - Statut du paiement : Complet
      
      ${registration.hasAllergies ? `ALLERGIES SIGNALÉES : ${registration.allergyDetails}\n` : ''}
      
      PROCHAINES ÉTAPES :
      1. Vous pouvez maintenant accéder au planning des activités et sélectionner vos créneaux
      2. Connectez-vous à votre compte pour voir tous les détails
      3. Vous recevrez prochainement plus d'informations sur le camp
      
      Accédez aux activités : ${process.env.FRONTEND_URL || 'http://localhost:3000'}/activites
      
      Si vous avez des questions, n'hésitez pas à nous contacter.
      
      À très bientôt au GJ Camp 2026 !
      
      Cordialement,
      L'équipe GJ Camp
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('📨 Email de confirmation d\'inscription envoyé');
    console.log('🔗 Prévisualisation:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

module.exports = {
  sendVerificationEmail,
  resendVerificationEmail,
  sendPasswordResetRequestEmail,
  sendPasswordResetEmail,
  sendCampRegistrationConfirmation,
};
