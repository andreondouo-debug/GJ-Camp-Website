#!/usr/bin/env node

/**
 * Script de test des notifications push - GJ Camp
 * Teste la configuration locale avant déploiement
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = process.env.API_URL || 'http://localhost:5000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testBackendHealth() {
  log('\n📡 Test 1: Connexion Backend...', 'blue');
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    log('✅ Backend accessible: ' + response.data.message, 'green');
    return true;
  } catch (error) {
    log('❌ Backend non accessible: ' + error.message, 'red');
    log('   Assurez-vous que le backend tourne sur ' + API_URL, 'yellow');
    return false;
  }
}

async function testVapidKeys() {
  log('\n🔑 Test 2: Clés VAPID configurées...', 'blue');
  
  if (!process.env.VAPID_PUBLIC_KEY) {
    log('❌ VAPID_PUBLIC_KEY manquante dans .env', 'red');
    return false;
  }
  
  if (!process.env.VAPID_PRIVATE_KEY) {
    log('❌ VAPID_PRIVATE_KEY manquante dans .env', 'red');
    return false;
  }
  
  if (!process.env.VAPID_EMAIL) {
    log('❌ VAPID_EMAIL manquante dans .env', 'red');
    return false;
  }
  
  log('✅ Toutes les clés VAPID sont configurées', 'green');
  log(`   Public Key: ${process.env.VAPID_PUBLIC_KEY.substring(0, 20)}...`, 'blue');
  log(`   Email: ${process.env.VAPID_EMAIL}`, 'blue');
  return true;
}

async function testLogin() {
  log('\n👤 Test 3: Authentification...', 'blue');
  
  const email = await question('Email: ');
  const password = await question('Mot de passe: ');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    
    log('✅ Connexion réussie', 'green');
    log(`   User: ${response.data.user.firstName} ${response.data.user.lastName}`, 'blue');
    log(`   Role: ${response.data.user.role}`, 'blue');
    
    return response.data.token;
  } catch (error) {
    log('❌ Échec connexion: ' + (error.response?.data?.message || error.message), 'red');
    return null;
  }
}

async function testNotificationStatus(token) {
  log('\n📊 Test 4: Statut notifications...', 'blue');
  
  try {
    const response = await axios.get(`${API_URL}/api/notifications/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    log('✅ Statut récupéré', 'green');
    log(`   Notifications push: ${response.data.pushEnabled ? 'Activées' : 'Désactivées'}`, 'blue');
    log(`   Notifications email: ${response.data.emailEnabled ? 'Activées' : 'Désactivées'}`, 'blue');
    
    return true;
  } catch (error) {
    log('❌ Échec récupération statut: ' + (error.response?.data?.message || error.message), 'red');
    return false;
  }
}

async function testSendNotification(token) {
  log('\n🔔 Test 5: Envoi notification test...', 'blue');
  
  try {
    const response = await axios.post(
      `${API_URL}/api/notifications/test`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    log('✅ Notification envoyée: ' + response.data.message, 'green');
    return true;
  } catch (error) {
    log('❌ Échec envoi notification: ' + (error.response?.data?.message || error.message), 'red');
    log('   ' + error.response?.data?.error, 'yellow');
    return false;
  }
}

async function runTests() {
  log('🧪 ═══════════════════════════════════════════', 'blue');
  log('   TEST DES NOTIFICATIONS PUSH - GJ CAMP', 'blue');
  log('═══════════════════════════════════════════', 'blue');
  
  log(`\n🌐 API URL: ${API_URL}`, 'yellow');
  
  // Test 1: Backend
  const backendOk = await testBackendHealth();
  if (!backendOk) {
    log('\n⚠️ Démarrez le backend avec: cd backend && npm run dev', 'yellow');
    rl.close();
    process.exit(1);
  }
  
  // Test 2: VAPID Keys
  const vapidOk = await testVapidKeys();
  if (!vapidOk) {
    log('\n⚠️ Configurez les clés VAPID dans backend/.env', 'yellow');
    log('   Voir: NOTIFICATIONS_PUSH_CONFIG.md', 'yellow');
    rl.close();
    process.exit(1);
  }
  
  // Test 3: Login
  const token = await testLogin();
  if (!token) {
    rl.close();
    process.exit(1);
  }
  
  // Test 4: Status
  await testNotificationStatus(token);
  
  // Test 5: Send notification
  const sendTest = await question('\n🧪 Envoyer une notification test ? (o/n): ');
  if (sendTest.toLowerCase() === 'o') {
    await testSendNotification(token);
  }
  
  log('\n✅ ═══════════════════════════════════════════', 'green');
  log('   TESTS TERMINÉS', 'green');
  log('═══════════════════════════════════════════', 'green');
  
  log('\n📝 Prochaines étapes:', 'blue');
  log('   1. Tester dans le navigateur: http://localhost:3000/profile', 'yellow');
  log('   2. Activer les notifications push', 'yellow');
  log('   3. Cliquer sur "Envoyer notification test"', 'yellow');
  log('   4. Vérifier que vous recevez la notification', 'yellow');
  
  rl.close();
}

// Charger les variables d'environnement
require('dotenv').config({ path: './backend/.env' });

runTests().catch(error => {
  log('\n❌ Erreur inattendue: ' + error.message, 'red');
  rl.close();
  process.exit(1);
});
