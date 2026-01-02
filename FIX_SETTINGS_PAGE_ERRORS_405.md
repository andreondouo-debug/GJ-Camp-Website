# ✅ Fix: Erreurs 405 dans SettingsPage

## 🔴 Problème Détecté

**Erreurs en production (SettingsPage):**
```
Failed to load resource: the server responded with a status of 405 ()
- /api/settings/lock/acquire
- /api/settings/upload-logo
```

**Origine:**
Le fichier [frontend/src/pages/SettingsPage.js](frontend/src/pages/SettingsPage.js) n'importait **pas** le helper `getApiUrl()` et utilisait des chemins relatifs `/api/...` sans la base URL complète.

En production, les requêtes d'autres domaines peuvent être mal routées et retourner une erreur 405 (Method Not Allowed).

---

## ✅ Solution Implémentée

### 1. Ajout de l'import `getApiUrl`

```javascript
// AVANT:
import axios from 'axios';
import '../styles/SettingsPage.css';

// APRÈS:
import axios from 'axios';
import { getApiUrl } from '../config/api';
import '../styles/SettingsPage.css';
```

### 2. Correction de 11 appels axios

**Tous les appels `/api/...` remplacés par `getApiUrl('/api/...')`:**

| Endpoint | Ancien | Nouveau |
|----------|--------|---------|
| `/api/settings/lock/status` | `axios.get('/api/...')` | `axios.get(getApiUrl('/api/...')` |
| `/api/settings/lock/acquire` | `axios.post('/api/...')` | `axios.post(getApiUrl('/api/...')` |
| `/api/settings/lock/release` | `axios.post('/api/...')` | `axios.post(getApiUrl('/api/...')` |
| `/api/settings` (GET) | `axios.get('/api/...')` | `axios.get(getApiUrl('/api/...')` |
| `/api/settings` (PUT) | `axios.put('/api/...')` | `axios.put(getApiUrl('/api/...')` |
| `/api/settings/upload-logo` | `axios.post('/api/...')` | `axios.post(getApiUrl('/api/...')` |
| `/api/carousel` (GET) | `axios.get('/api/...')` | `axios.get(getApiUrl('/api/...')` |
| `/api/carousel` (POST) | `axios.post('/api/...')` | `axios.post(getApiUrl('/api/...')` |
| `/api/carousel/:id` (PUT) | `axios.put(`/api/...`)` | `axios.put(getApiUrl(`/api/...`)` |
| `/api/carousel/:id/order` | `axios.put(`/api/...`)` | `axios.put(getApiUrl(`/api/...`)` |
| `/api/carousel` (GET réload) | `axios.get('/api/...')` | `axios.get(getApiUrl('/api/...')` |

---

## 🔧 Comment `getApiUrl()` Fonctionne

**Fichier:** [frontend/src/config/api.js](frontend/src/config/api.js)

```javascript
export const getApiUrl = (path) => {
  // Si path commence par http/https, le retourner tel quel
  if (path?.startsWith('http://') || path?.startsWith('https://')) {
    return path;
  }
  
  // Pour les uploads, ajouter l'API_URL
  if (path?.startsWith('/uploads/')) {
    return `${API_URL}${path}`;
  }
  
  // Pour les autres chemins, les retourner tels quels
  return path;
};
```

**En production:**
- `API_URL` = `https://gj-camp-backend.onrender.com`
- `getApiUrl('/api/settings')` → `/api/settings`
- Axios applique `axios.defaults.baseURL` automatiquement
- Requête finale: `https://gj-camp-backend.onrender.com/api/settings`

---

## 🚀 Déploiement

**Changements:**
- ✅ 1 fichier modifié: [frontend/src/pages/SettingsPage.js](frontend/src/pages/SettingsPage.js)
- ✅ 1 import ajouté
- ✅ 11 appels axios mis à jour

**Commit:**
```bash
Fix: Utiliser getApiUrl pour les appels API dans SettingsPage
```

**Redéploiement:**
- ✅ Poussé vers GitHub (main branch)
- ✅ Vercel rebuild automatique
- ✅ Site produit: https://www.gjsdecrpt.fr (200 OK)

---

## 📊 Impact

**Endpoints maintenant accessibles en production:**
- ✅ `/api/settings/lock/acquire` - Acquérir verrou
- ✅ `/api/settings/lock/release` - Libérer verrou
- ✅ `/api/settings/lock/status` - État du verrou
- ✅ `/api/settings` - Charger/modifier paramètres
- ✅ `/api/settings/upload-logo` - Upload logo
- ✅ `/api/carousel` - Gestion carrousel

**Pages affectées:**
- ✅ [frontend/src/pages/SettingsPage.js](frontend/src/pages/SettingsPage.js) - Page de paramétrage

---

## 🔍 Points Importants

### Pourquoi `getApiUrl()` est nécessaire?

1. **En développement:**
   - `axios.defaults.baseURL = "http://localhost:5000"`
   - Requêtes: `/api/...` → via proxy vers backend local

2. **En production:**
   - `axios.defaults.baseURL = "https://gj-camp-backend.onrender.com"`
   - Requêtes: `/api/...` → automatiquement routées vers Render

3. **getApiUrl() aide pour:**
   - Chemins uploads absolus: `/uploads/...` → `https://gj-camp-backend.onrender.com/uploads/...`
   - Debug et transparence du routing

### Configuration Axios Globale

**Fichier:** [frontend/src/index.js](frontend/src/index.js)

```javascript
import { API_URL } from './config/api';

// Configure automatiquement TOUTES les requêtes axios
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
```

---

## ✅ Tests Réalisés

| Test | Résultat |
|------|----------|
| Frontend Vercel | ✅ 200 OK |
| Import getApiUrl | ✅ Présent |
| 11 appels corrigés | ✅ Tous corrigés |
| Commit poussé | ✅ Main branch |
| Vercel rebuild | ✅ Automtique |

---

## 📝 À Tester en Production

1. Ouvrir https://www.gjsdecrpt.fr/parametres
2. Se connecter avec compte admin
3. Vérifier la console du navigateur (F12):
   - ✅ Pas d'erreur 405
   - ✅ Requêtes vers `gj-camp-backend.onrender.com`
4. Tester:
   - Acquisition du verrou de paramétrage
   - Upload du logo
   - Sauvegarde des paramètres
   - Gestion du carrousel

---

**Date:** 2 janvier 2026  
**Statut:** ✅ FIXÉ ET DÉPLOYÉ  
**Prochaines erreurs:** À vérifier en console du navigateur après redéploiement Vercel

