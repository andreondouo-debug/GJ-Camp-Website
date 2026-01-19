#!/usr/bin/env node

/**
 * Générer des clés VAPID pour Web Push
 * Utiliser si les clés actuelles ne fonctionnent pas
 */

const webpush = require('web-push');

console.log('🔑 Génération de nouvelles clés VAPID...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('═══════════════════════════════════════════');
console.log('✅ NOUVELLES CLÉS VAPID GÉNÉRÉES');
console.log('═══════════════════════════════════════════\n');

console.log('📋 BACKEND (Render) - Ajouter 3 variables:\n');
console.log('VAPID_PUBLIC_KEY');
console.log(vapidKeys.publicKey);
console.log('');
console.log('VAPID_PRIVATE_KEY');
console.log(vapidKeys.privateKey);
console.log('');
console.log('VAPID_EMAIL');
console.log('mailto:contact@gjsdecrpt.fr');

console.log('\n═══════════════════════════════════════════\n');

console.log('📋 FRONTEND (Vercel) - Ajouter 1 variable:\n');
console.log('REACT_APP_VAPID_PUBLIC_KEY');
console.log(vapidKeys.publicKey);

console.log('\n═══════════════════════════════════════════');
console.log('⚠️  IMPORTANT:');
console.log('- Remplacer les anciennes clés par celles-ci');
console.log('- Redéployer backend ET frontend');
console.log('- Les anciens abonnements seront invalides');
console.log('- Les utilisateurs devront se réabonner');
console.log('═══════════════════════════════════════════\n');

// Sauvegarder dans un fichier
const fs = require('fs');
const output = `
# Clés VAPID générées le ${new Date().toLocaleString('fr-FR')}

## Backend (Render)
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_EMAIL=mailto:contact@gjsdecrpt.fr

## Frontend (Vercel)
REACT_APP_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
`;

fs.writeFileSync('VAPID_KEYS_NEW.txt', output);
console.log('💾 Clés sauvegardées dans: VAPID_KEYS_NEW.txt\n');
