const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmailConfiguration = async () => {
  console.log('🔍 TEST DE CONFIGURATION EMAIL');
  console.log('================================\n');

  // Afficher les variables d'environnement (sans le mot de passe complet)
  console.log('📋 Configuration détectée:');
  console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'non défini');
  console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || 'non défini');
  console.log('  EMAIL_PORT:', process.env.EMAIL_PORT || 'non défini');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'non défini');
  console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'non défini');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || 'non défini');
  console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'non défini');
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('\n');

  // Créer le transporteur
  let transporter;
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    console.log('📧 Configuration Gmail détectée\n');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else if (process.env.EMAIL_HOST) {
    console.log('📧 Configuration SMTP personnalisée détectée\n');
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    console.log('❌ Aucune configuration email trouvée!\n');
    console.log('Veuillez définir EMAIL_SERVICE=gmail ou EMAIL_HOST dans .env');
    process.exit(1);
  }

  // Tester la connexion
  console.log('🔌 Test de connexion au serveur SMTP...');
  try {
    await transporter.verify();
    console.log('✅ Connexion au serveur SMTP réussie!\n');
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error.message);
    console.error('Détails:', error);
    process.exit(1);
  }

  // Envoyer un email de test
  console.log('📨 Envoi d\'un email de test...');
  const testEmail = process.env.EMAIL_USER; // Envoyer à soi-même pour tester
  
  const mailOptions = {
    from: `"GJ Camp Test" <${process.env.EMAIL_USER}>`,
    to: testEmail,
    subject: '✅ Test Email - Configuration GJ Camp',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #a01e1e; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Configuration Email Fonctionnelle!</h1>
            </div>
            <div class="content">
              <h2>Félicitations!</h2>
              <p>Si vous recevez cet email, cela signifie que votre configuration email pour GJ Camp fonctionne correctement.</p>
              <p><strong>Configuration testée:</strong></p>
              <ul>
                <li>Service: ${process.env.EMAIL_SERVICE || 'SMTP Personnalisé'}</li>
                <li>Serveur: ${process.env.EMAIL_HOST || 'Gmail'}</li>
                <li>Port: ${process.env.EMAIL_PORT || '587'}</li>
                <li>Utilisateur: ${process.env.EMAIL_USER}</li>
              </ul>
              <p>Date du test: ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Configuration Email Fonctionnelle!
      
      Si vous recevez cet email, cela signifie que votre configuration email pour GJ Camp fonctionne correctement.
      
      Configuration testée:
      - Service: ${process.env.EMAIL_SERVICE || 'SMTP Personnalisé'}
      - Serveur: ${process.env.EMAIL_HOST || 'Gmail'}
      - Port: ${process.env.EMAIL_PORT || '587'}
      - Utilisateur: ${process.env.EMAIL_USER}
      
      Date du test: ${new Date().toLocaleString('fr-FR')}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de test envoyé avec succès!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Destinataire:', testEmail);
    console.log('\n');
    console.log('🎉 Configuration email validée!');
    console.log('Vérifiez votre boîte de réception:', testEmail);
    console.log('(Pensez à vérifier les spams si vous ne le voyez pas)');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
    console.error('Détails:', error);
    process.exit(1);
  }
};

testEmailConfiguration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
