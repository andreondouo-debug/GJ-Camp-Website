const paypal = require('@paypal/payouts-sdk');
const Settings = require('../models/Settings');

/**
 * Configuration du client PayPal Payouts
 * Utilise le mode configuré dans Settings (sandbox ou live)
 */
async function paypalClient() {
  // Récupérer le mode depuis Settings
  let paypalMode = 'sandbox'; // Mode par défaut
  try {
    const settings = await Settings.findOne();
    paypalMode = settings?.settings?.paypalMode || 'sandbox';
    console.log(`💳 PayPal Client - Mode: ${paypalMode.toUpperCase()}`);
  } catch (err) {
    console.error('⚠️ Erreur récupération mode PayPal, utilisation sandbox:', err.message);
  }
  
  // Utiliser les bonnes credentials selon le mode
  const clientId = paypalMode === 'live'
    ? process.env.PAYPAL_LIVE_CLIENT_ID
    : process.env.PAYPAL_SANDBOX_CLIENT_ID;
    
  const clientSecret = paypalMode === 'live'
    ? process.env.PAYPAL_LIVE_CLIENT_SECRET
    : process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
  
  const environment = paypalMode === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(environment);
}

module.exports = { paypalClient };
