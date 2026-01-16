#!/usr/bin/env node

/**
 * Script pour générer les informations de build (version + date)
 * Crée un fichier src/version.js avec les infos de version
 * Usage: node generate-build-info.js
 */

const fs = require('fs');
const path = require('path');

// Lire package.json pour obtenir la version
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Date et heure du build
const now = new Date();
const buildDate = now.toISOString().split('T')[0];
const buildTime = now.toTimeString().split(' ')[0].substring(0, 5).replace(':', 'h');
const buildDateTime = `${buildDate}-${buildTime}`;
const buildTimeISO = now.toISOString();

// Créer le contenu du fichier version.js
const versionJsContent = `// Généré automatiquement par generate-build-info.js - NE PAS MODIFIER
// Ce fichier est regénéré à chaque build
export const VERSION_INFO = {
  version: '${version}',
  buildDate: '${buildDate}',
  buildTime: '${buildTime}',
  buildTimeISO: '${buildTimeISO}',
  cacheVersion: 'v${version}-${buildDateTime}'
};
`;

// Écrire le fichier dans src/
const versionJsPath = path.join(__dirname, 'src', 'version.js');
fs.writeFileSync(versionJsPath, versionJsContent, 'utf8');

console.log('✅ Informations de build générées:');
console.log(`   📦 Version: ${version}`);
console.log(`   📅 Date: ${buildDate}`);
console.log(`   ⏰ Heure: ${buildTime}`);
console.log(`   💾 Cache: v${version}-${buildDateTime}`);
console.log(`   📄 Fichier: src/version.js`);

