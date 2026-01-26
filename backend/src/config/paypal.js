const paypal = require('@paypal/payouts-sdk');
const Settings = require('../models/Settings');

/**
 * Configuration du client PayPal Payouts
 * Utilise le mode configuré dans Settings (sandbox ou live)
 */
async function paypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  // Récupérer le mode depuis Settings
  let paypalMode = 'sandbox'; // Mode par défaut
  try {
    const settings = await Settings.findOne();
    paypalMode = settings?.settings?.paypalMode || 'sandbox';
    console.log(`💳 PayPal Client - Mode: ${paypalMode.toUpperCase()}`);
  } catch (err) {
    console.error('⚠️ Erreur récupération mode PayPal, utilisation sandbox:', err.message);
  }
  
  const environment = paypalMode === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
}

module.exports = { paypalClient };
