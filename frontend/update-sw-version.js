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

// Date du build
const buildDate = new Date().toISOString().split('T')[0];

// Remplacer la version dans le service worker
const versionRegex = /const APP_VERSION = '[^']*';/;
swContent = swContent.replace(versionRegex, `const APP_VERSION = '${version}';`);

// Remplacer la date de build
const dateRegex = /const BUILD_DATE = new Date\(\).toISOString\(\).split\('T'\)\[0\];/;
swContent = swContent.replace(dateRegex, `const BUILD_DATE = '${buildDate}';`);

// Écrire le fichier mis à jour
fs.writeFileSync(swPath, swContent, 'utf8');

console.log(`✅ Service Worker mis à jour:`);
console.log(`   📦 Version: ${version}`);
console.log(`   📅 Date: ${buildDate}`);
console.log(`   🔄 Cache: v${version}-${buildDate}`);
