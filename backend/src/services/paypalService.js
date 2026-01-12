const axios = require('axios');

class PayPalService {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    // Utiliser PAYPAL_MODE pour déterminer l'environnement (sandbox ou live)
    // Par défaut: sandbox pour éviter les erreurs avec credentials de test
    const mode = process.env.PAYPAL_MODE || 'sandbox';
    this.baseURL = mode === 'live' 
      ? 'https://api.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    
    console.log('🔧 PayPal Service configuré:', {
      mode: mode,
      baseURL: this.baseURL,
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret
    });
  }

  // Obtenir un token d'accès PayPal
  async getAccessToken() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('❌ Erreur obtention token PayPal:', error.response?.data || error.message);
      throw new Error('Impossible d\'obtenir le token PayPal');
    }
  }

  // ✅ VÉRIFIER UNE TRANSACTION CÔTÉ SERVEUR
  async verifyPayment(orderID) {
    try {
      // Si pas de client secret configuré, mode dégradé (dev uniquement)
      if (!this.clientSecret) {
        console.warn('⚠️ PAYPAL_CLIENT_SECRET manquant - Mode dégradé (DÉVELOPPEMENT UNIQUEMENT)');
        return {
          verified: true,
          orderID: orderID,
          amount: 0,
          payerEmail: 'dev@mode.com',
          payerName: 'Mode Développement',
          status: 'COMPLETED',
          capturedAt: new Date().toISOString(),
          isDevelopmentMode: true
        };
      }

      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.baseURL}/v2/checkout/orders/${orderID}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const order = response.data;
      
      // Vérifications de sécurité
      if (order.status !== 'COMPLETED') {
        throw new Error(`Paiement non complété (statut: ${order.status})`);
      }

      const amount = parseFloat(order.purchase_units[0].amount.value);
      const currency = order.purchase_units[0].amount.currency_code;

      if (currency !== 'EUR') {
        throw new Error(`Devise invalide: ${currency} (EUR attendu)`);
      }

      const capture = order.purchase_units[0].payments?.captures?.[0];

      console.log('✅ Paiement PayPal vérifié avec succès:', {
        orderID: order.id,
        amount: amount,
        status: order.status
      });

      return {
        verified: true,
        orderID: order.id,
        amount: amount,
        payerEmail: order.payer?.email_address || 'N/A',
        payerName: `${order.payer?.name?.given_name || ''} ${order.payer?.name?.surname || ''}`.trim() || 'N/A',
        status: order.status,
        capturedAt: capture?.create_time || new Date().toISOString(),
        isDevelopmentMode: false
      };
    } catch (error) {
      console.error('❌ Erreur vérification PayPal:', error.response?.data || error.message);
      return {
        verified: false,
        error: error.message || 'Erreur lors de la vérification du paiement'
      };
    }
  }

  // Vérifier qu'une transaction n'a pas déjà été utilisée
  async checkDuplicateTransaction(orderID, RegistrationModel) {
    const existing = await RegistrationModel.findOne({
      'paymentDetails.orderID': orderID
    });
    
    if (existing) {
      throw new Error('Cette transaction a déjà été utilisée pour une inscription');
    }
  }
}

module.exports = new PayPalService();
