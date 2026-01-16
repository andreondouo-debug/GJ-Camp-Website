#!/usr/bin/env node

/**
 * Script pour mettre à jour automatiquement la version du Service Worker
 * Synchronise avec package.json et ajoute la date de build
 * Usage: node update-sw-version.js
 */

const fs = require('fs');
const path = require('path');

// Déterminer le dossier de travail (peut être racine ou frontend/)
const workingDir = fs.existsSync(path.join(__dirname, 'package.json')) 
  ? __dirname 
  : path.join(__dirname, 'frontend');

// Lire package.json
const packageJsonPath = path.join(workingDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Lire service-worker.js
const swPath = path.join(workingDir, 'public', 'service-worker.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Date et heure du build en heure de Paris (CET/CEST)
const now = new Date();
const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
const buildDate = parisTime.toISOString().split('T')[0];
const hours = parisTime.getHours().toString().padStart(2, '0');
const minutes = parisTime.getMinutes().toString().padStart(2, '0');
const buildTime = `${hours}h${minutes}`;
const buildDateTime = `${buildDate}-${buildTime}`;

// Remplacer la version dans le service worker
const versionRegex = /const APP_VERSION = '[^']*';/;
swContent = swContent.replace(versionRegex, `const APP_VERSION = '${version}';`);

// Remplacer la date de build (match les deux formats possibles)
const dateRegex = /const BUILD_DATE = '[^']*';/;
swContent = swContent.replace(dateRegex, `const BUILD_DATE = '${buildDateTime}';`);

// Écrire le fichier mis à jour
fs.writeFileSync(swPath, swContent, 'utf8');

console.log(`✅ Service Worker mis à jour:`);
console.log(`   📦 Version: ${version}`);
console.log(`   📅 Date: ${buildDate}`);
console.log(`   ⏰ Heure: ${buildTime}`);
console.log(`   🔄 Cache: v${version}-${buildDateTime}`);
