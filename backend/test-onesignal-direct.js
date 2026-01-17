require('dotenv').config();
const https = require('https');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

// Player ID depuis les logs frontend
const PLAYER_ID = '15661b11-46e0-4baa-8eba-73ace9fdb00d';

console.log('🧪 Test direct OneSignal API');
console.log('📱 Player ID:', PLAYER_ID);
console.log('🔑 App ID:', ONESIGNAL_APP_ID);

const notification = {
  app_id: ONESIGNAL_APP_ID,
  include_player_ids: [PLAYER_ID],
  headings: { en: '🧪 Test Direct OneSignal' },
  contents: { en: 'Si vous recevez ceci, OneSignal fonctionne parfaitement !' },
  url: 'https://gjsdecrpt.fr'
};

const options = {
  hostname: 'onesignal.com',
  path: '/api/v1/notifications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 Réponse OneSignal:');
    console.log('Status:', res.statusCode);
    
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.id) {
        console.log('\n✅ Notification envoyée avec succès !');
        console.log('🆔 Notification ID:', response.id);
        console.log('👥 Recipients:', response.recipients);
      } else if (response.errors) {
        console.log('\n❌ Erreurs:');
        console.log(response.errors);
      }
    } catch (error) {
      console.log('❌ Erreur parsing réponse:', error.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur requête:', error);
});

req.write(JSON.stringify(notification));
req.end();
