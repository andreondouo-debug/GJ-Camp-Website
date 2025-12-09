# 🚂 Déploiement Railway - Guide Rapide

## 📋 Prérequis
- Compte GitHub avec le repo GJ-Camp-Website
- Compte Railway (gratuit) : https://railway.app

## 🚀 Étapes de Déploiement

### 1️⃣ Créer un Projet Railway

1. Aller sur https://railway.app
2. **Sign up with GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. Sélectionner `Jas185/GJ-Camp-Website`

### 2️⃣ Ajouter MongoDB

1. Dans le projet Railway → **New Service**
2. **Database** → **Add MongoDB**
3. Railway génère automatiquement :
   - `MONGO_URL` (ex: mongodb://mongo:xxxxx@...)
   - Notez cette URL pour l'étape suivante

### 3️⃣ Déployer le Backend

1. **New Service** → **GitHub Repo** → GJ-Camp-Website
2. **Root Directory** : Laisser vide (détection auto du Dockerfile)
3. **Variables** → Cliquer sur **RAW Editor** et coller :

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=${{MongoDB.MONGO_URL}}
JWT_SECRET=CHANGEZ_AVEC_SECRET_64_CARACTERES_GENERE
FRONTEND_URL=https://votre-frontend-railway.app

EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=gjcontactgj0@gmail.com
EMAIL_PASSWORD=eofu vfga tjxe xibi
EMAIL_FROM=gjcontactgj0@gmail.com

PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
PAYPAL_CLIENT_SECRET=EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV
PAYPAL_MODE=sandbox

DPO_EMAIL=dpo@gj-camp.fr
CONTACT_EMAIL=contact@gj-camp.fr
```

4. **Deploy**
5. Railway génère une URL : `https://gj-camp-backend-xxxx.up.railway.app`

### 4️⃣ Déployer le Frontend

1. **New Service** → **GitHub Repo** → GJ-Camp-Website
2. **Variables** → RAW Editor :

```env
REACT_APP_API_URL=https://gj-camp-backend-xxxx.up.railway.app
REACT_APP_PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
```

3. **Settings** → **Dockerfile Path** : `Dockerfile.frontend`
4. **Deploy**
5. Railway génère : `https://gj-camp-frontend-xxxx.up.railway.app`

### 5️⃣ Mettre à jour CORS

1. Retourner dans **Backend** → **Variables**
2. Modifier `FRONTEND_URL` avec l'URL du frontend :
```env
FRONTEND_URL=https://gj-camp-frontend-xxxx.up.railway.app
```
3. Redéployer le backend (cliquer sur **Deploy**)

### 6️⃣ Créer l'Admin Initial

1. Backend → **Terminal** (onglet)
2. Exécuter :

```bash
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  const hashedPassword = await bcrypt.hash('Admin2025!', 10);
  
  await User.create({
    firstName: 'Admin',
    lastName: 'GJ',
    email: 'admin@gj-camp.fr',
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
    profileComplete: true
  });
  
  console.log('✅ Admin créé');
  process.exit(0);
});
"
```

## ✅ Vérification

### Tester le Backend
```
https://gj-camp-backend-xxxx.up.railway.app/api/health
```
**Résultat attendu :** `{ "message": "✅ Backend fonctionnel" }`

### Tester le Frontend
```
https://gj-camp-frontend-xxxx.up.railway.app
```
**Résultat attendu :** Page d'accueil du site

### Se connecter en Admin
1. Aller sur le frontend
2. Se connecter avec :
   - Email : `admin@gj-camp.fr`
   - Mot de passe : `Admin2025!`

## 🔒 Sécurité Post-Déploiement

### 1. Générer un JWT_SECRET sécurisé
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copier le résultat dans Railway → Backend → Variables → `JWT_SECRET`

### 2. Activer PayPal Production (quand prêt)
```env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=votre_client_id_production
PAYPAL_CLIENT_SECRET=votre_client_secret_production
```

### 3. Configurer un domaine personnalisé
1. Railway → Frontend → **Settings** → **Domains**
2. **Custom Domain** → Ajouter `gj-camp.fr`
3. Configurer DNS chez votre registrar :
```
Type: CNAME
Name: @
Value: gj-camp-frontend-xxxx.up.railway.app
```

## 📊 Volumes Persistants (Uploads)

Railway n'a pas de système de fichiers persistant par défaut.

**Solutions :**

### Option A : Volume Railway (Beta)
```toml
# railway.toml
[[volumes]]
mountPath = "/app/uploads"
name = "uploads"
```

### Option B : Cloudinary (Recommandé)
1. Créer compte : https://cloudinary.com
2. Installer : `npm install cloudinary multer-storage-cloudinary`
3. Modifier `backend/src/middleware/upload.js`

## 🔄 Redéploiement

### Automatique (via Git)
```powershell
# Sur votre PC
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```
→ Railway détecte et redéploie automatiquement

### Manuel
Railway → Service → **Deploy** → **Trigger Deploy**

## 💰 Coûts Railway

**Plan Gratuit :**
- $5 de crédit gratuit par mois
- Suffisant pour tester
- Services s'arrêtent si crédit épuisé

**Plan Hobby (5$/mois) :**
- Services toujours actifs
- Recommandé pour production

**Optimiser les coûts :**
```toml
# railway.toml
[deploy]
restartPolicyType = "ON_FAILURE"
numReplicas = 1
```

## 🆘 Dépannage

### Erreur : Build failed
- Vérifier les logs : Railway → Service → **Build Logs**
- Vérifier Dockerfile path : Settings → Dockerfile

### Backend ne démarre pas
- Vérifier : Service → **Deploy Logs**
- Problème fréquent : `JWT_SECRET` manquant

### Frontend page blanche
- F12 → Console → Vérifier erreurs
- Vérifier `REACT_APP_API_URL` dans Variables
- Vérifier CORS backend

### MongoDB connection error
- Vérifier : `MONGODB_URI=${{MongoDB.MONGO_URL}}`
- Syntax exacte avec `${{` et `}}`

## 📈 Monitoring

Railway fournit automatiquement :
- **Metrics** : CPU, RAM, Network
- **Logs** : Temps réel et historique
- **Uptime** : Disponibilité du service

### Voir les logs
Railway → Service → **Logs** (onglet)

### Alertes
Settings → **Notifications** → Configurer webhooks Discord/Slack

## 🎯 Prochaines Étapes

1. ✅ Déployer sur Railway
2. ✅ Tester toutes les fonctionnalités
3. ⏳ Configurer domaine personnalisé
4. ⏳ Passer PayPal en mode `live`
5. ⏳ Configurer Cloudinary pour uploads
6. ⏳ Monitoring avec Sentry

---

**Besoin d'aide ?** Railway Discord : https://discord.gg/railway
