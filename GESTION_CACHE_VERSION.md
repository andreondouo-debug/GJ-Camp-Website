# 🔄 Gestion du Cache par Version - GJ Camp

**Date de mise en place:** 16 janvier 2026  
**Statut:** ✅ Actif en production

---

## 🎯 Problème Résolu

### Ancien Système ❌
- Cache basé sur hash de commit et timestamp
- Versions non synchronisées avec les releases
- Utilisateurs voient d'anciennes versions après déploiement
- Nécessité de vider manuellement le cache

### Nouveau Système ✅
- Cache basé sur la version de `package.json` + date de build
- Invalidation automatique du cache à chaque nouvelle version
- Rechargement forcé de tous les fichiers JS/CSS/JSON
- Meta tags pour désactiver le cache navigateur sur index.html

---

## 📦 Comment ça Marche

### 1. Version Automatique
Le Service Worker utilise maintenant :
```javascript
const APP_VERSION = '0.1.0';  // Depuis package.json
const BUILD_DATE = '2026-01-16';  // Date du build
const CACHE_VERSION = 'v0.1.0-2026-01-16';
```

### 2. Mise à Jour Automatique
Lors du build (`npm run build`), le script `update-sw-version.js` :
1. Lit la version dans `package.json`
2. Génère la date du jour
3. Met à jour automatiquement le Service Worker
4. Crée un nouveau cache avec la nouvelle version

### 3. Invalidation du Cache
Le Service Worker :
- Supprime automatiquement les anciens caches
- Ajoute le paramètre `?v=VERSION` à tous les fichiers statiques
- Force le téléchargement de la dernière version

---

## 🚀 Utilisation

### Développement Local
```bash
cd frontend
npm start
# Le Service Worker se met à jour automatiquement
```

### Production (Vercel)
```bash
# 1. Mettre à jour la version dans package.json
nano package.json  # Changer "version": "0.1.0" → "0.1.1"

# 2. Build et déploiement
npm run build
git add .
git commit -m "🔄 Version 0.1.1"
git push

# Vercel détecte le push et redéploie automatiquement
# Le nouveau cache v0.1.1-2026-01-16 sera créé
```

### Forcer une Nouvelle Version
Pour forcer tous les utilisateurs à recharger :
```bash
# Incrémenter la version dans package.json
"version": "0.1.1" → "0.1.2"

# Build et deploy
npm run build
git push
```

---

## 🧪 Tests et Vérification

### Vérifier la Version Actuelle
1. Ouvrir DevTools (F12)
2. Console → Taper :
```javascript
caches.keys()
// Résultat : ["gj-camp-v0.1.0-2026-01-16"]
```

### Tester l'Invalidation
```bash
# 1. Noter la version actuelle du cache
# 2. Changer la version dans package.json
# 3. Rebuild
npm run build

# 4. Recharger le site
# 5. Vérifier dans DevTools que l'ancien cache est supprimé
```

### Simuler un Problème de Cache
```javascript
// Dans la console navigateur
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  caches.keys().then(names => names.forEach(name => caches.delete(name)));
  console.log('✅ Cache et Service Worker supprimés');
});
// Recharger la page
location.reload();
```

---

## 📋 Checklist Déploiement

Avant chaque déploiement production :

- [ ] Incrémenter la version dans `frontend/package.json`
- [ ] Vérifier que `update-sw-version.js` est exécutable
- [ ] Tester en local : `npm run build` puis ouvrir `build/service-worker.js`
- [ ] Vérifier que APP_VERSION et BUILD_DATE sont corrects
- [ ] Push et vérifier le déploiement Vercel
- [ ] Tester sur mobile et desktop
- [ ] Vérifier dans DevTools que le nouveau cache est créé
- [ ] Confirmer que l'ancien cache est supprimé

---

## 🔧 Configuration Fichiers

### `frontend/package.json`
```json
{
  "version": "0.1.0",  // ← À incrémenter à chaque version
  "scripts": {
    "build": "node update-sw-version.js && react-scripts build",
    "prebuild": "node update-sw-version.js"
  }
}
```

### `frontend/public/service-worker.js`
```javascript
const APP_VERSION = '0.1.0';  // Mis à jour automatiquement
const BUILD_DATE = '2026-01-16';  // Mis à jour automatiquement
const CACHE_VERSION = `v${APP_VERSION}-${BUILD_DATE}`;
```

### `frontend/public/index.html`
```html
<!-- Cache Control - Force rechargement -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

---

## 🎨 Bonnes Pratiques

### Versioning Sémantique
Suivre le format `MAJOR.MINOR.PATCH` :
- **MAJOR** (1.0.0) : Changements majeurs, incompatibilités
- **MINOR** (0.1.0) : Nouvelles fonctionnalités
- **PATCH** (0.0.1) : Corrections de bugs

### Exemples
```
0.1.0 → 0.1.1  // Bug fix (changement de couleur)
0.1.1 → 0.2.0  // Nouvelle feature (notifications push)
0.2.0 → 1.0.0  // Version stable production
```

### Fréquence de Mise à Jour
- **Patch** : À chaque correction de bug
- **Minor** : À chaque nouvelle fonctionnalité
- **Major** : Lors de changements majeurs (refonte UI, etc.)

---

## 🐛 Dépannage

### Problème : Les utilisateurs voient encore l'ancienne version
**Solution :**
```bash
# 1. Vérifier que la version a bien été incrémentée
cat frontend/package.json | grep version

# 2. Vérifier le Service Worker
cat frontend/public/service-worker.js | grep APP_VERSION

# 3. Forcer un rebuild
cd frontend
rm -rf build node_modules/.cache
npm run build

# 4. Redéployer
git push
```

### Problème : Le script update-sw-version.js échoue
**Solution :**
```bash
# Rendre le script exécutable
chmod +x frontend/update-sw-version.js

# Tester manuellement
cd frontend
node update-sw-version.js
```

### Problème : Cache non supprimé sur mobile
**Solution :**
- Sur iOS Safari : Réglages → Safari → Effacer historique et données
- Sur Android Chrome : Paramètres → Confidentialité → Effacer données de navigation
- Demander aux utilisateurs de fermer et rouvrir l'app

---

## 📊 Avantages du Nouveau Système

✅ **Automatique** - Pas besoin de modifier manuellement le Service Worker  
✅ **Prévisible** - Version synchronisée avec package.json  
✅ **Traçable** - Historique des versions dans Git  
✅ **Fiable** - Invalidation garantie du cache à chaque version  
✅ **Simple** - Un seul endroit à modifier (package.json)  

---

## 🔗 Références

- [Service Workers MDN](https://developer.mozilla.org/fr/docs/Web/API/Service_Worker_API)
- [Cache Storage API](https://developer.mozilla.org/fr/docs/Web/API/Cache)
- [Semantic Versioning](https://semver.org/lang/fr/)

---

**Dernière mise à jour:** 16 janvier 2026  
**Auteur:** Équipe GJ Camp
