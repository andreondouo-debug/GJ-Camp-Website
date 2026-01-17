require('dotenv').config();
const https = require('https');

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const PLAYER_ID = '15661b11-46e0-4baa-8eba-73ace9fdb00d';

console.log('🔍 Vérification du Player ID sur OneSignal\n');
console.log('📱 Player ID:', PLAYER_ID);

const options = {
  hostname: 'onesignal.com',
  path: `/api/v1/players/${PLAYER_ID}?app_id=${ONESIGNAL_APP_ID}`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 Statut:', res.statusCode);
    
    if (res.statusCode === 200) {
      const player = JSON.parse(data);
      console.log('\n✅ Player trouvé sur OneSignal:');
      console.log('   ID:', player.id);
      console.log('   Langue:', player.language);
      console.log('   Timezone:', player.timezone);
      console.log('   Type d\'appareil:', player.device_type);
      console.log('   Plateforme:', player.device_os);
      console.log('   SDK:', player.sdk);
      console.log('\n📊 État de l\'abonnement:');
      console.log('   Notification types:', player.notification_types);
      console.log('   Session count:', player.session_count);
      console.log('   Last active:', player.last_active);
      console.log('   Créé le:', player.created_at);
      
      if (player.notification_types === -2) {
        console.log('\n❌ PROBLÈME: L\'utilisateur a refusé les permissions de notification !');
        console.log('💡 Solution: Autoriser les notifications dans les paramètres du navigateur');
      } else if (player.notification_types === 0) {
        console.log('\n⚠️ ATTENTION: Les notifications sont désactivées');
      } else if (player.notification_types === 1) {
        console.log('\n✅ Les notifications sont activées pour cet utilisateur');
      }
      
      if (player.invalid_identifier) {
        console.log('\n❌ Identifiant invalide !');
      }
      
    } else if (res.statusCode === 404) {
      console.log('\n❌ Player ID non trouvé sur OneSignal');
      console.log('💡 Ce Player ID n\'existe pas ou n\'est pas abonné');
    } else {
      console.log('\n❌ Erreur:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur requête:', error);
});

req.end();
