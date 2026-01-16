# 🔄 Gestion du Cache - Architecture Complète

**Date:** 16 janvier 2026  
**Architecture:** Vercel + Render + Cloudinary

---

## 🏗️ Architecture du Projet

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR (Navigateur)                  │
│  • Service Worker (cache local)                              │
│  • IndexedDB / LocalStorage                                  │
└────────────┬───────────────────────────────────┬────────────┘
             │                                   │
             ▼                                   ▼
    ┌────────────────┐                 ┌─────────────────┐
    │ VERCEL (CDN)   │                 │ CLOUDINARY (CDN)│
    │ Frontend React │                 │ Images/Photos   │
    │ gjsdecrpt.fr   │                 │ res.cloudinary  │
    └────────┬───────┘                 └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │ RENDER          │
    │ Backend API     │
    │ Node.js Express │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ MONGODB ATLAS   │
    │ Base de données │
    └─────────────────┘
```

---

## 📦 1. CACHE FRONTEND (Vercel + Service Worker)

### 🎯 Objectif
Assurer que tous les utilisateurs ont toujours la **dernière version** de l'application React.

### 🔧 Système Implémenté

#### A. Service Worker (Cache Navigateur)
**Fichier:** `frontend/public/service-worker.js`

```javascript
// Version automatique synchronisée avec package.json
const APP_VERSION = '0.1.0';        // Depuis package.json
const BUILD_DATE = '2026-01-16';    // Date du build
const CACHE_VERSION = `v${APP_VERSION}-${BUILD_DATE}`;
const CACHE_NAME = `gj-camp-${CACHE_VERSION}`;
```

**Fonctionnement:**
```
Utilisateur visite le site
    ↓
Service Worker vérifie CACHE_VERSION
    ↓
Si différente de la version locale
    ↓
❌ Supprime ancien cache
✅ Télécharge nouvelle version
✅ Installe nouveau cache
```

#### B. Vercel Edge Network
**URL:** https://gjsdecrpt.fr

**Cache CDN Vercel:**
- ✅ Fichiers statiques: `.js`, `.css`, `.json`
- ✅ Images: `.png`, `.jpg`, `.svg`
- ✅ Durée: Invalidé automatiquement à chaque deploy
- ✅ Distribution: 40+ edge locations mondiales

**Headers HTTP envoyés par Vercel:**
```http
Cache-Control: public, max-age=0, must-revalidate
```

#### C. Meta Tags HTML
**Fichier:** `frontend/public/index.html`

```html
<!-- Force rechargement (pas de cache navigateur) -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

**Effet:**
- ❌ Empêche le cache navigateur de stocker index.html
- ✅ Force vérification serveur à chaque visite
- ✅ Garantit détection nouvelle version du Service Worker

### 📋 Stratégie de Cache par Type de Fichier

| Type | Stratégie | Cache | Durée |
|------|-----------|-------|-------|
| **HTML** (`/`, index.html) | Network First | Service Worker | Jusqu'à nouveau deploy |
| **JavaScript** (*.js) | Network First + Version | Service Worker + Vercel | Invalidé par `?v=VERSION` |
| **CSS** (*.css) | Network First + Version | Service Worker + Vercel | Invalidé par `?v=VERSION` |
| **Images locales** (*.png, *.jpg) | Cache First | Service Worker | Permanent |
| **API** (/api/*) | Network First | Service Worker (fallback) | Pas de cache long |

### 🔄 Flux de Mise à Jour

```bash
# 1. Développeur incrémente la version
nano frontend/package.json
"version": "0.1.0" → "0.1.1"

# 2. Build automatique
npm run build
  ↓
update-sw-version.js s'exécute
  ↓
Service Worker mis à jour: v0.1.1-2026-01-16
  ↓
Build React crée fichiers dans /build

# 3. Deploy Vercel
git push
  ↓
Vercel détecte push
  ↓
Build automatique
  ↓
Deploy sur CDN (40+ locations)
  ↓
❌ Ancien cache CDN invalidé
✅ Nouveau cache créé

# 4. Utilisateur visite le site
Navigateur → Vercel CDN
  ↓
Télécharge index.html (no-cache)
  ↓
Service Worker détecte nouvelle version
  ↓
❌ Supprime cache v0.1.0-2026-01-15
✅ Installe cache v0.1.1-2026-01-16
  ↓
Télécharge tous les fichiers .js/.css avec ?v=v0.1.1-2026-01-16
```

---

## 🖼️ 2. CACHE CLOUDINARY (Images)

### 🎯 Objectif
Héberger et servir rapidement les images (logos, photos de profil, carousel).

### 🔧 Configuration

**URL Cloudinary:** `https://res.cloudinary.com/dbouijio-1/`

**Exemples d'URLs:**
```
Logo: https://res.cloudinary.com/dbouijio-1/image/upload/v1767949247/gj-camp/logo/raujk6jdnoioiqgjop2f.jpg
Photo profil: https://res.cloudinary.com/dbouijio-1/image/upload/v1767949247/gj-camp/profiles/{id}.jpg
```

### 📦 Cache Cloudinary

**Automatique et Intégré:**
- ✅ **CDN Global** : 300+ locations mondiales
- ✅ **Cache navigateur** : 1 an (`max-age=31536000`)
- ✅ **Cache CDN** : Permanent jusqu'à purge manuelle
- ✅ **Compression automatique** : WebP, AVIF selon navigateur
- ✅ **Responsive** : Redimensionnement à la volée

**Headers HTTP Cloudinary:**
```http
Cache-Control: public, max-age=31536000
ETag: "hash-unique-de-l-image"
Content-Type: image/jpeg
```

### 🔄 Invalidation Cache Cloudinary

**Méthode 1: Version dans l'URL**
```javascript
// Backend - Upload avec version
const result = await cloudinary.uploader.upload(file, {
  folder: 'gj-camp/profiles',
  public_id: `${userId}_${Date.now()}`,  // Timestamp = version
  overwrite: true
});

// Résultat: .../profiles/user123_1705449600000.jpg
```

**Méthode 2: Paramètres de transformation**
```javascript
// Ajouter un paramètre qui change l'URL
const imageUrl = `${cloudinaryUrl}?t=${Date.now()}`;
// Nouvelle URL = nouveau cache
```

**Méthode 3: Purge manuelle (Admin)**
```javascript
// Via API Cloudinary
await cloudinary.api.delete_resources([publicId]);
```

### 📋 Stratégie par Type d'Image

| Type | Cache | Invalidation | Raison |
|------|-------|--------------|--------|
| **Logo GJ** | 1 an | Jamais (URL avec version) | Logo stable |
| **Photos profil** | 1 an | À l'upload (nouveau timestamp) | Change rarement |
| **Carousel** | 1 an | Manuel (admin) | Contenu long-terme |
| **Posts GJ News** | 1 an | À la publication (timestamp) | Contenu dynamique |

---

## 🔌 3. CACHE BACKEND (Render + API)

### 🎯 Objectif
Servir rapidement les données sans surcharger MongoDB.

### 🔧 Configuration Render

**URL Backend:** `https://gj-camp-backend.onrender.com`

**Type de cache:**
- ❌ **Pas de cache HTTP** pour les réponses API
- ✅ **Cache en mémoire** pour certaines données (settings, activités)
- ✅ **MongoDB cache** : Connexion persistante

**Headers HTTP API:**
```http
Cache-Control: no-store, no-cache, must-revalidate
```

### 📦 Cache Backend en Mémoire

**Exemple - Settings du site:**
```javascript
// backend/src/controllers/settingsController.js
let cachedSettings = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

exports.getSettings = async (req, res) => {
  const now = Date.now();
  
  // Vérifier cache
  if (cachedSettings && cacheTime && (now - cacheTime < CACHE_DURATION)) {
    return res.json(cachedSettings); // ✅ Réponse instantanée
  }
  
  // Sinon requête MongoDB
  const settings = await Settings.findOne();
  cachedSettings = settings;
  cacheTime = now;
  
  res.json(settings);
};
```

**Avantages:**
- ✅ Réduit requêtes MongoDB (~90%)
- ✅ Temps de réponse <10ms (vs ~200ms MongoDB)
- ✅ Économie bande passante

### 🔄 Invalidation Cache Backend

**Automatique:**
```javascript
// Lors d'une mise à jour
exports.updateSettings = async (req, res) => {
  await Settings.updateOne({}, req.body);
  
  // ❌ Invalider cache
  cachedSettings = null;
  cacheTime = null;
  
  res.json({ message: 'Paramètres mis à jour' });
};
```

### 📋 Données Cachées Backend

| Donnée | Cache | Durée | Invalidation |
|--------|-------|-------|--------------|
| **Settings** | Mémoire | 5 min | À chaque modification |
| **Activités** | Mémoire | 10 min | À chaque modification |
| **Liste campus** | Mémoire | 30 min | À chaque modification |
| **Utilisateurs** | ❌ Non | - | Temps réel requis |
| **Inscriptions** | ❌ Non | - | Temps réel requis |
| **Posts** | ❌ Non | - | Temps réel requis |

---

## 🌐 4. CACHE CDN (Vercel Edge Network)

### 🎯 Objectif
Servir le frontend depuis le serveur le plus proche de l'utilisateur.

### 📍 Locations Edge Vercel

**40+ data centers mondiaux:**
- 🇫🇷 **Paris** (ams1) - Utilisateurs français
- 🇬🇧 **Londres** (lhr1) - Utilisateurs UK
- 🇩🇪 **Frankfurt** (fra1) - Utilisateurs Europe centrale
- 🇺🇸 **New York** (iad1) - Utilisateurs US Est
- 🇺🇸 **San Francisco** (sfo1) - Utilisateurs US Ouest

**Latence typique:**
- Paris → Paris Edge: **~10ms**
- Paris → New York direct: **~150ms**

### 🔄 Propagation des Mises à Jour

```
Deploy Vercel
    ↓
Build réussi (2-3 min)
    ↓
Déploiement sur edge network
    ↓
┌──────────────────────────────┐
│ Propagation simultanée       │
│ vers tous les edge servers   │
│ (40+ locations)              │
└──────────────────────────────┘
    ↓
Ancien cache invalidé partout
    ↓
Nouvelle version disponible
    ↓
⏱️ Délai total: ~5 minutes
```

---

## 🧪 TESTS ET VÉRIFICATION

### Test 1: Vérifier Version Cache Frontend
```javascript
// Dans la console navigateur (F12)
caches.keys().then(keys => console.log('Caches:', keys))
// Résultat attendu: ["gj-camp-v0.1.0-2026-01-16"]
```

### Test 2: Vérifier Headers Vercel
```bash
curl -I https://gjsdecrpt.fr
# Chercher: Cache-Control: public, max-age=0, must-revalidate
```

### Test 3: Vérifier Headers Cloudinary
```bash
curl -I https://res.cloudinary.com/dbouijio-1/image/upload/v1767949247/gj-camp/logo/raujk6jdnoioiqgjop2f.jpg
# Chercher: Cache-Control: public, max-age=31536000
```

### Test 4: Vérifier Headers API Backend
```bash
curl -I https://gj-camp-backend.onrender.com/api/health
# Chercher: Cache-Control: no-store, no-cache
```

### Test 5: Simuler Nouvelle Version
```bash
# 1. Changer version
nano frontend/package.json  # 0.1.0 → 0.1.1

# 2. Build
npm run build

# 3. Vérifier nouveau cache
cat public/service-worker.js | head -n 10
# Doit contenir: v0.1.1-2026-01-16

# 4. Deploy et tester
git push
# Attendre 5 min
# Ouvrir https://gjsdecrpt.fr
# F12 → caches.keys() → Vérifier nouveau cache
```

---

## 📊 RÉSUMÉ DU SYSTÈME

### Flux Complet d'une Requête Utilisateur

```
Utilisateur tape https://gjsdecrpt.fr
    ↓
1️⃣ DNS résout → Vercel Edge (Paris)
    ↓
2️⃣ Vercel Edge vérifie cache CDN
    ✅ Hit: Sert index.html (no-cache)
    ❌ Miss: Récupère depuis origin
    ↓
3️⃣ Navigateur charge index.html
    ↓
4️⃣ Service Worker s'installe/active
    ↓
5️⃣ Service Worker vérifie CACHE_VERSION
    Si différente:
        ❌ Supprime ancien cache
        ✅ Installe nouveau cache
    ↓
6️⃣ Chargement fichiers JS/CSS
    URL: /static/js/main.js?v=v0.1.0-2026-01-16
    ↓
    Service Worker intercepte
    ↓
    Stratégie Network First:
        Essaie fetch → Vercel CDN
        Si succès: ✅ Sert + cache localement
        Si échec: ↩️ Sert depuis cache local
    ↓
7️⃣ Chargement images Cloudinary
    URL: https://res.cloudinary.com/.../logo.jpg
    ↓
    Navigateur vérifie cache local
    ✅ Hit: Sert depuis cache (1 an)
    ❌ Miss: Télécharge depuis Cloudinary CDN
    ↓
8️⃣ Appels API Backend
    URL: https://gj-camp-backend.onrender.com/api/activities
    ↓
    Stratégie Network First:
        Essaie fetch → Render
        Si succès: ✅ Sert (pas de cache long)
        Si échec: ↩️ Sert depuis cache SW (fallback)
    ↓
9️⃣ Render Backend
    Vérifie cache mémoire (5-10 min)
    ✅ Hit: Réponse instantanée
    ❌ Miss: Requête MongoDB Atlas
```

### Durées de Cache par Composant

| Composant | Cache | Durée | Invalidation |
|-----------|-------|-------|--------------|
| **Frontend Vercel CDN** | Edge | Jusqu'à deploy | Automatique deploy |
| **Service Worker** | Local | Jusqu'à nouvelle version | CACHE_VERSION change |
| **Cloudinary Images** | CDN + Local | 1 an | Nouveau timestamp URL |
| **Backend API** | ❌ Aucun | - | Temps réel |
| **Backend Mémoire** | Mémoire | 5-30 min | Modification données |
| **MongoDB** | Connexion | Persistante | - |

---

## ⚡ OPTIMISATIONS

### A. Minimiser les Requêtes

**Frontend:**
- ✅ Bundle splitting React (chunks automatiques)
- ✅ Lazy loading des pages (`React.lazy()`)
- ✅ Compression gzip/brotli (Vercel automatique)

**Backend:**
- ✅ Cache mémoire pour données statiques
- ✅ Connexion MongoDB persistante
- ✅ Compression JSON responses

**Images:**
- ✅ WebP/AVIF automatique (Cloudinary)
- ✅ Responsive images (srcset automatique)
- ✅ Lazy loading images

### B. Réduire la Latence

**Vercel:**
- ✅ Edge Network (40+ locations)
- ✅ HTTP/2 (multiplexing)
- ✅ Brotli compression

**Cloudinary:**
- ✅ CDN global (300+ locations)
- ✅ Compression automatique
- ✅ Cache navigateur long (1 an)

**Render:**
- ⚠️ Un seul serveur (Oregon, USA)
- ✅ Connexion WebSocket persistante
- ✅ Cache mémoire

---

## 🐛 DÉPANNAGE

### Problème 1: Utilisateur voit ancienne version
**Diagnostic:**
```javascript
// Console navigateur
caches.keys()
// Si ancien cache présent: ["gj-camp-v0.1.0-2026-01-15"]
```

**Solution:**
```javascript
// Forcer suppression cache
caches.keys().then(keys => 
  Promise.all(keys.map(key => caches.delete(key)))
).then(() => location.reload(true));
```

### Problème 2: Images Cloudinary ne chargent pas
**Diagnostic:**
```bash
curl -I https://res.cloudinary.com/dbouijio-1/image/upload/...
# Vérifier status code: 200 OK
```

**Solution:**
- Vérifier URL complète dans le code
- Vérifier credentials Cloudinary backend
- Tester upload manuel

### Problème 3: API lente
**Diagnostic:**
```javascript
// Console navigateur
console.time('API');
await fetch('/api/activities');
console.timeEnd('API');
// Si >2000ms: problème
```

**Solution:**
- Vérifier cache backend actif
- Vérifier connexion MongoDB
- Vérifier logs Render

---

## 📞 RESSOURCES

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **Cloudinary Dashboard:** https://cloudinary.com/console
- **MongoDB Atlas:** https://cloud.mongodb.com

---

**Dernière mise à jour:** 16 janvier 2026  
**Auteur:** Équipe GJ Camp
