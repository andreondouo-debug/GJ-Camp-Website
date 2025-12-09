# 🔧 Corrections URLs Hardcodées - Frontend

## ✅ Modifications Effectuées

### 1. Configuration API Centralisée

**Fichier créé :** `frontend/src/config/api.js`

```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const getApiUrl = (path) => { /* ... */ };
```

Cette configuration permet de :
- Utiliser `REACT_APP_API_URL` en production
- Fallback vers `http://localhost:5000` en développement
- Helper `getApiUrl()` pour construire les URLs complètes

### 2. Variables d'Environnement

**Fichiers créés/modifiés :**

- `frontend/.env` - Configuration développement (ajout `REACT_APP_API_URL`)
- `frontend/.env.example` - Template pour nouveaux développeurs
- `frontend/.env.production.example` - Template pour production

**Configuration développement :**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PAYPAL_CLIENT_ID=AdT-Lw...
```

**Configuration production :**
```env
REACT_APP_API_URL=https://votre-domaine-backend.com
REACT_APP_PAYPAL_CLIENT_ID=votre_id_production
```

### 3. Fichiers Corrigés (16 occurrences)

#### `frontend/src/pages/ProgrammePage.js`
- **Avant :** `href={\`http://localhost:5000${activity.fichierPdf}\`}`
- **Après :** `href={getApiUrl(activity.fichierPdf)}`

#### `frontend/src/pages/UserDashboard.js`
- **Avant :** `src={\`http://localhost:5000${activity.image}\`}`
- **Après :** `src={getApiUrl(activity.image)}`
- **Avant :** `href={\`http://localhost:5000${activity.fichierPdf}\`}`
- **Après :** `href={getApiUrl(activity.fichierPdf)}`

#### `frontend/src/pages/ActivitiesManagement.js`
- **Preview image :** `setImagePreview(activity.image ? getApiUrl(activity.image) : null)`
- **Liste :** `<img src={getApiUrl(activity.image)} />`
- **Détails :** `<img src={getApiUrl(detailActivity.image)} />`
- **PDF détails :** `href={getApiUrl(detailActivity.fichierPdf)}`

#### `frontend/src/components/PlanningCarousel.js`
- **Images :** `<img src={getApiUrl(act.image)} />`
- **PDFs :** `href={getApiUrl(act.fichierPdf)}`

## 📋 Déploiement en Production

### Étape 1 : Configurer les variables d'environnement

```bash
cd frontend
cp .env.production.example .env.production
```

Éditer `.env.production` :
```env
REACT_APP_API_URL=https://api.gj-camp.com
REACT_APP_PAYPAL_CLIENT_ID=votre_client_id_production
```

### Étape 2 : Build production

```bash
npm run build
```

Le build utilisera automatiquement `.env.production`.

### Étape 3 : Déployer

- **Netlify/Vercel :** Configurer les variables dans le dashboard
- **Serveur custom :** Servir le dossier `build/` avec nginx/apache

## 🧪 Tests Requis

### En développement

```bash
cd frontend
npm start
```

✅ Vérifier que les images et PDFs se chargent correctement :
- Page Programme (`/programme`)
- Dashboard Utilisateur (`/tableau-de-bord`)
- Gestion Activités (`/gestion-activites`)
- Page Activités (`/activites`)

### En production

1. Build avec `npm run build`
2. Servir localement : `npx serve -s build`
3. Vérifier que `REACT_APP_API_URL` pointe vers le bon backend
4. Tester toutes les pages avec images/PDFs

## 🔍 Comment ça Fonctionne ?

### En développement (localhost:3000)

1. **Proxy React** gère `/api/*` → `http://localhost:5000/api/*`
2. **Uploads** (`/uploads/*`) passent par `getApiUrl()` → `http://localhost:5000/uploads/*`

### En production

1. **Pas de proxy** - Requêtes API directes vers `REACT_APP_API_URL`
2. **Uploads** via `getApiUrl()` → `https://api.gj-camp.com/uploads/*`

### Fonction `getApiUrl()`

```javascript
export const getApiUrl = (path) => {
  // Si déjà une URL complète, retourner telle quelle
  if (path?.startsWith('http://') || path?.startsWith('https://')) {
    return path;
  }
  
  // Pour /uploads/*, ajouter API_URL
  if (path?.startsWith('/uploads/')) {
    return `${API_URL}${path}`;
  }
  
  // Autres chemins : proxy en dev, API directe en prod
  return path;
};
```

## ✨ Avantages

✅ **Flexible** - Change d'environnement sans modifier le code
✅ **Sécurisé** - Variables sensibles dans `.env` (gitignored)
✅ **Maintenable** - Configuration centralisée dans `config/api.js`
✅ **Production-ready** - Fonctionne avec n'importe quel domaine backend

## 🚨 Important

⚠️ **Ne jamais commit** les fichiers `.env` ou `.env.production` avec des vraies clés !

Les fichiers `.env.example` et `.env.production.example` sont des templates vides pour guider la configuration.

## 📚 Ressources

- [Create React App - Variables d'environnement](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [React Router - Proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/)
