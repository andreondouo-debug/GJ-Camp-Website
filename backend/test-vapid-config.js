#!/usr/bin/env node

/**
 * Tester la configuration VAPID actuelle
 */

require('dotenv').config();
const webpush = require('web-push');

console.log('🔍 Test de la configuration VAPID...\n');

console.log('═══════════════════════════════════════════');
console.log('📊 VARIABLES D\'ENVIRONNEMENT');
console.log('═══════════════════════════════════════════\n');

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const email = process.env.VAPID_EMAIL;

console.log('VAPID_PUBLIC_KEY:', publicKey ? `✅ Présente (${publicKey.length} chars)` : '❌ Manquante');
console.log('VAPID_PRIVATE_KEY:', privateKey ? `✅ Présente (${privateKey.length} chars)` : '❌ Manquante');
console.log('VAPID_EMAIL:', email || '❌ Manquante');

if (!publicKey || !privateKey) {
  console.log('\n❌ Configuration incomplète !');
  console.log('Lancez: node generate-vapid-keys.js');
  process.exit(1);
}

console.log('\n═══════════════════════════════════════════');
console.log('🧪 TEST DE CONFIGURATION');
console.log('═══════════════════════════════════════════\n');

try {
  // Tester la configuration
  const formattedEmail = email.startsWith('mailto:') ? email : `mailto:${email}`;
  
  webpush.setVapidDetails(
    formattedEmail,
    publicKey,
    privateKey
  );
  
  console.log('✅ webpush.setVapidDetails() réussi');
  console.log('✅ Configuration VAPID valide !');
  
  // Vérifier le format des clés
  console.log('\n📊 Validation des clés:');
  console.log('- Public Key commence par:', publicKey.substring(0, 4));
  console.log('- Public Key longueur:', publicKey.length, publicKey.length === 88 ? '✅' : '⚠️');
  console.log('- Private Key commence par:', privateKey.substring(0, 4));
  console.log('- Private Key longueur:', privateKey.length, privateKey.length === 43 ? '✅' : '⚠️');
  console.log('- Email format:', formattedEmail.startsWith('mailto:') ? '✅' : '❌');
  
  console.log('\n═══════════════════════════════════════════');
  console.log('✅ CONFIGURATION CORRECTE');
  console.log('═══════════════════════════════════════════\n');
  
  console.log('Si les notifications ne fonctionnent toujours pas:');
  console.log('1. Vérifier que ces variables sont dans Render');
  console.log('2. Redémarrer le service Render');
  console.log('3. Vérifier les logs Render après envoi de notification');
  
} catch (error) {
  console.error('\n❌ ERREUR DE CONFIGURATION');
  console.error('Message:', error.message);
  console.error('\nSolution: Générer de nouvelles clés');
  console.error('Lancez: node generate-vapid-keys.js');
  process.exit(1);
}
