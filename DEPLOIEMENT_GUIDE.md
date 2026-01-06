# 🚀 Guide de Déploiement - GJ Camp Website

## ✅ Prérequis
- Compte GitHub (gratuit)
- Compte MongoDB Atlas (gratuit)
- Compte Vercel (gratuit)
- Compte Render (gratuit)

---

## 📦 ÉTAPE 1 : MongoDB Atlas (Base de données)

### 1.1 Créer un compte MongoDB Atlas
1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Créez un compte gratuit
3. Créez un nouveau cluster (choisir **FREE tier M0**)
4. Région : Choisir la plus proche (ex: Paris/Frankfurt)

### 1.2 Configurer la sécurité
1. Dans **Database Access** :
   - Cliquez "Add New Database User"
   - Username : `gjcamp-admin`
   - Password : Générer un mot de passe fort (NOTEZ-LE !)
   - Rôle : "Atlas Admin"

2. Dans **Network Access** :
   - Cliquez "Add IP Address"
   - Choisir **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ Pour la production, limitez aux IPs de Render

### 1.3 Obtenir l'URL de connexion
1. Cliquez sur **"Connect"** sur votre cluster
2. Choisir **"Connect your application"**
3. Copier l'URL (format : `mongodb+srv://<username>:<password>@cluster...`)
4. Remplacer `<password>` par votre mot de passe

**Format final :**
```
mongodb+srv://gjcamp-admin:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/gj-camp-prod?retryWrites=true&w=majority
```

---

## 🔧 ÉTAPE 2 : Préparer le Backend pour la production

### 2.1 Créer un fichier de variables d'environnement

Créez `.env.production` dans `/backend/` :

```env
# MongoDB
MONGODB_URI=mongodb+srv://gjcamp-admin:VOTRE_MDP@cluster0.xxxxx.mongodb.net/gj-camp-prod?retryWrites=true&w=majority

# JWT
JWT_SECRET=VOTRE_SECRET_SUPER_LONG_ET_COMPLEXE_ICI_123456789

# URLs
FRONTEND_URL=https://votre-site.vercel.app
PORT=5000

# Email (Gmail recommandé pour la production)
EMAIL_SERVICE=gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-app-password-gmail

# PayPal (Production)
PAYPAL_CLIENT_ID=votre-client-id-production
PAYPAL_CLIENT_SECRET=votre-secret-production
PAYPAL_MODE=live

# Cloudinary (si vous l'utilisez)
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### 2.2 Vérifier le package.json du backend

Assurez-vous que `/backend/package.json` contient :

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "echo 'No build required for Node.js'"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 🌐 ÉTAPE 3 : Déployer le Backend sur Render

### 3.1 Créer un compte Render
1. Allez sur https://render.com
2. Inscrivez-vous avec GitHub

### 3.2 Connecter votre dépôt GitHub
1. Poussez votre code sur GitHub :
   ```bash
   cd "/Users/odounga/Applications/site web/GJ-Camp-Website"
   git add .
   git commit -m "Prêt pour déploiement"
   git push origin main
   ```

### 3.3 Créer un Web Service sur Render
1. Dans Render Dashboard, cliquez **"New +"** → **"Web Service"**
2. Connectez votre repo GitHub `GJ-Camp-Website`
3. Configuration :
   - **Name** : `gj-camp-backend`
   - **Region** : Frankfurt (Europe)
   - **Branch** : `main`
   - **Root Directory** : `backend`
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : **Free**

### 3.4 Ajouter les variables d'environnement
Dans l'onglet **"Environment"**, ajoutez toutes les variables de `.env.production` :

```
MONGODB_URI = mongodb+srv://gjcamp-admin:...
JWT_SECRET = votre-secret...
FRONTEND_URL = https://votre-site.vercel.app
EMAIL_SERVICE = gmail
EMAIL_USER = ...
EMAIL_PASSWORD = ...
```

### 3.5 Déployer
1. Cliquez **"Create Web Service"**
2. Attendez 5-10 minutes
3. Notez l'URL : `https://gj-camp-backend.onrender.com`

⚠️ **Important** : Le service gratuit dort après 15 min d'inactivité. Le premier chargement peut prendre 30 secondes.

---

## 🎨 ÉTAPE 4 : Déployer le Frontend sur Vercel

### 4.1 Préparer le frontend

#### A. Créer `.env.production` dans `/frontend/` :

```env
REACT_APP_API_URL=https://gj-camp-backend.onrender.com
REACT_APP_PAYPAL_CLIENT_ID=votre-client-id-production
```

#### B. Mettre à jour `/frontend/src/config/api.js` :

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export { API_URL };
export default API_URL;
```

#### C. Vérifier `package.json` du frontend :

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### 4.2 Créer un compte Vercel
1. Allez sur https://vercel.com
2. Inscrivez-vous avec GitHub

### 4.3 Importer le projet
1. Cliquez **"Add New..."** → **"Project"**
2. Sélectionnez votre repo GitHub `GJ-Camp-Website`
3. Configuration :
   - **Framework Preset** : Create React App
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `build`

### 4.4 Ajouter les variables d'environnement
Dans **"Environment Variables"** :

```
REACT_APP_API_URL = https://gj-camp-backend.onrender.com
REACT_APP_PAYPAL_CLIENT_ID = votre-client-id
```

### 4.5 Déployer
1. Cliquez **"Deploy"**
2. Attendez 2-5 minutes
3. Votre site est en ligne ! 🎉
4. URL : `https://gj-camp-website.vercel.app`

---

## 🔄 ÉTAPE 5 : Mettre à jour les URLs croisées

### 5.1 Mettre à jour le Backend
1. Retournez sur Render Dashboard
2. Allez dans votre service backend
3. Onglet **"Environment"**
4. Modifiez `FRONTEND_URL` :
   ```
   FRONTEND_URL = https://gj-camp-website.vercel.app
   ```
5. Sauvegardez → Le backend redémarre automatiquement

### 5.2 Configurer CORS
Vérifiez que `/backend/src/server.js` contient :

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

---

## ✅ ÉTAPE 6 : Tests post-déploiement

### 6.1 Tests à effectuer
- [ ] Page d'accueil charge correctement
- [ ] Inscription d'un nouvel utilisateur
- [ ] Connexion
- [ ] Vérification email (vérifier votre boîte mail)
- [ ] Carrousel affiche les images
- [ ] Inscription au camp fonctionne
- [ ] Dashboard admin accessible

### 6.2 Résolution des problèmes courants

#### Frontend ne se connecte pas au backend
- Vérifiez `REACT_APP_API_URL` dans Vercel
- Vérifiez CORS dans le backend
- Ouvrez la console du navigateur (F12)

#### Backend ne démarre pas
- Vérifiez les logs dans Render Dashboard
- Vérifiez `MONGODB_URI` (format correct ?)
- Vérifiez que toutes les variables d'env sont définies

#### Images ne s'affichent pas
- Si utilisation locale : migrer vers Cloudinary
- Vérifier les variables Cloudinary

---

## 🔒 ÉTAPE 7 : Sécurité & Optimisations

### 7.1 Sécurité
1. **Secrets forts** : Générez des JWT_SECRET de 64+ caractères
2. **MongoDB** : Limitez les IPs autorisées dans Network Access
3. **Variables d'environnement** : Ne jamais commit `.env` files
4. **HTTPS** : Vercel et Render fournissent HTTPS automatiquement

### 7.2 Performance
1. **Render Free Tier** : Service dort après 15 min → ajoutez un "pinger" :
   - UptimeRobot : https://uptimerobot.com (gratuit)
   - Ping votre backend toutes les 5 minutes

2. **Cloudinary** : Pour les images/uploads (plan gratuit 25GB)

3. **CDN** : Vercel inclut un CDN global automatiquement

---

## 📱 ÉTAPE 8 : Nom de domaine personnalisé (Optionnel)

### Si vous avez un domaine (ex: gjcamp.fr)

#### Pour le frontend (Vercel) :
1. Vercel Dashboard → Votre projet → **"Settings"** → **"Domains"**
2. Ajoutez votre domaine
3. Configurez les DNS chez votre registrar :
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

#### Pour le backend (Render) :
1. Render Dashboard → Votre service → **"Settings"** → **"Custom Domains"**
2. Ajoutez un sous-domaine (ex: api.gjcamp.fr)
3. Configurez les DNS :
   ```
   Type: CNAME
   Name: api
   Value: gj-camp-backend.onrender.com
   ```

---

## 🔄 Mises à jour futures

Pour déployer des modifications :

```bash
# 1. Faire vos modifications localement
# 2. Commit et push
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main

# 3. Vercel et Render redéploient AUTOMATIQUEMENT ! 🎉
```

---

## 📞 Support

### Liens utiles
- Vercel Docs : https://vercel.com/docs
- Render Docs : https://render.com/docs
- MongoDB Atlas : https://docs.atlas.mongodb.com

### Communauté
- Discord Vercel
- Render Community Forum
- Stack Overflow

---

## 💰 Coûts

**Tout est GRATUIT ! 🎉**

- **Vercel** : 100GB bande passante/mois
- **Render** : 750h/mois (suffisant pour 1 service)
- **MongoDB Atlas** : 512MB stockage

### Limites gratuites
- Render : Service dort après 15 min d'inactivité
- Vercel : 100GB bande passante (largement suffisant)
- MongoDB : 512MB (≈ 50,000 utilisateurs)

---

## 🎯 Checklist finale

- [ ] MongoDB Atlas configuré
- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Vercel
- [ ] URLs croisées mises à jour
- [ ] Tests de fonctionnement effectués
- [ ] Email de vérification fonctionne
- [ ] PayPal en mode production (si activé)
- [ ] UptimeRobot configuré (optionnel mais recommandé)
- [ ] Nom de domaine configuré (optionnel)

**Félicitations ! Votre site est en ligne ! 🚀**
