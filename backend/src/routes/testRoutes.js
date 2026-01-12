const express = require('express');
const router = express.Router();
const { sendEmailViaBrevoAPI } = require('../config/email');

// @route   GET /api/test/email-config
// @desc    Tester la configuration email (API Brevo)
router.get('/email-config', async (req, res) => {
  try {
    console.log('🧪 Test de configuration email avec API Brevo');
    
    // Vérifier que BREVO_API_KEY est configurée
    if (!process.env.BREVO_API_KEY) {
      return res.status(500).json({
        success: false,
        message: '❌ BREVO_API_KEY non configurée',
        details: {
          hint: 'Ajoutez BREVO_API_KEY dans les variables d\'environnement Render'
        }
      });
    }

    // Email de test
    const testEmail = process.env.EMAIL_FROM || 'gjcontactgj0@gmail.com';
    
    console.log('📨 Envoi email de test via API Brevo...');
    const result = await sendEmailViaBrevoAPI(
      testEmail,
      '✅ Test API Brevo - GJ Camp',
      `
        <h2>✅ Configuration API Brevo Fonctionnelle!</h2>
        <p>Si vous recevez cet email, l'API Brevo fonctionne correctement sur Render.</p>
        <p><strong>Détails:</strong></p>
        <ul>
          <li>Méthode: API HTTP Brevo (port 443)</li>
          <li>Email: ${testEmail}</li>
          <li>Date: ${new Date().toLocaleString('fr-FR')}</li>
          <li>Environnement: ${process.env.NODE_ENV || 'production'}</li>
        </ul>
        <p><em>✅ Le blocage SMTP de Render a été contourné avec succès!</em></p>
      `,
      'Test de configuration API Brevo - Si vous recevez cet email, tout fonctionne!'
    );

    console.log('✅ Email de test envoyé via API Brevo!');
    console.log('  - Message ID:', result.messageId);

    res.json({
      success: true,
      message: '✅ Configuration API Brevo fonctionnelle',
      details: {
        method: 'Brevo HTTP API (port 443)',
        email: testEmail,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      },
    });
  } catch (error) {
    console.error('❌ Erreur test API Brevo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test API Brevo',
      error: {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      },
    });
  }
});

// @route   GET /api/test/paypal-config
// @desc    Vérifier la configuration PayPal
router.get('/paypal-config', async (req, res) => {
  try {
    console.log('🧪 Test de configuration PayPal');
    
    const config = {
      clientId: process.env.PAYPAL_CLIENT_ID ? '✅ Configuré' : '❌ Manquant',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET ? '✅ Configuré' : '❌ Manquant',
      environment: process.env.NODE_ENV === 'production' ? 'Production (Live)' : 'Sandbox (Test)',
      baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://api.paypal.com'
        : 'https://api-m.sandbox.paypal.com'
    };

    // Vérifier si les credentials sont présentes
    const hasClientId = !!process.env.PAYPAL_CLIENT_ID;
    const hasClientSecret = !!process.env.PAYPAL_CLIENT_SECRET;

    res.json({
      success: hasClientId && hasClientSecret,
      message: (hasClientId && hasClientSecret) 
        ? '✅ Configuration PayPal complète' 
        : '❌ Credentials PayPal manquants',
      config: {
        clientIdConfigured: !!process.env.PAYPAL_CLIENT_ID,
        clientSecretConfigured: !!process.env.PAYPAL_CLIENT_SECRET,
        environment: process.env.NODE_ENV || 'production',
        baseURL: process.env.NODE_ENV === 'production' 
          ? 'https://api.paypal.com'
          : 'https://api-m.sandbox.paypal.com'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test',
      error: error.message
    });
  }
});

module.exports = router;
