require('dotenv').config();
const oneSignalService = require('./src/services/oneSignalService');

const PLAYER_ID = '15661b11-46e0-4baa-8eba-73ace9fdb00d';

console.log('🧪 Test service backend OneSignal\n');

const notification = {
  title: '🎯 Test Service Backend',
  message: 'Ce test utilise le service oneSignalService.js du backend',
  url: 'https://gjsdecrpt.fr',
  data: { type: 'test', timestamp: Date.now() }
};

async function test() {
  try {
    console.log('📤 Envoi notification via service backend...');
    console.log('📱 Player ID:', PLAYER_ID);
    
    const result = await oneSignalService.sendNotificationToUser(PLAYER_ID, notification);
    
    console.log('\n✅ Résultat:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

test();
