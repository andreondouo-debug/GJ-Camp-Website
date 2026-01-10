const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// @route   GET /api/test/email-config
// @desc    Tester la configuration email
router.get('/email-config', async (req, res) => {
  try {
    console.log('🧪 Test de configuration email demandé');
    
    // Créer le transporteur Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Tester la connexion
    console.log('🔌 Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie!');

    // Envoyer un email de test
    console.log('📨 Envoi email de test...');
    const info = await transporter.sendMail({
      from: `"GJ Camp Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // S'envoyer à soi-même
      subject: '✅ Test Email GJ Camp',
      html: `
        <h2>✅ Configuration Email Fonctionnelle!</h2>
        <p>Si vous recevez cet email, la configuration fonctionne.</p>
        <p><strong>Détails:</strong></p>
        <ul>
          <li>Service: Gmail</li>
          <li>Utilisateur: ${process.env.EMAIL_USER}</li>
          <li>Date: ${new Date().toLocaleString('fr-FR')}</li>
        </ul>
      `,
    });

    console.log('✅ Email de test envoyé!');
    console.log('  - Message ID:', info.messageId);
    console.log('  - Réponse:', info.response);

    res.json({
      success: true,
      message: 'Configuration email fonctionnelle',
      details: {
        user: process.env.EMAIL_USER,
        messageId: info.messageId,
        response: info.response,
      },
    });
  } catch (error) {
    console.error('❌ Erreur test email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test email',
      error: {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      },
    });
  }
});

module.exports = router;
