# Guide Deploiement Render.com - 100% GRATUIT

## Etape 1 : Creer compte Render

1. Aller sur : https://render.com
2. Cliquer "Get Started"
3. "Sign up with GitHub"
4. Autoriser Render a acceder a vos repos

## Etape 2 : Deployer le Backend

### A. Creer le Web Service

1. Dashboard Render → "New +"
2. "Web Service"
3. Connecter votre repo GitHub : GJ-Camp-Website
4. Configurer :

**Settings :**
```
Name: gj-camp-backend
Region: Frankfurt (Europe)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: node src/server.js
```

**Plan :** Free (0$/mois)

### B. Variables d'environnement

Cliquer sur "Environment" → "Add Environment Variable"

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=4a2ec1fef92c89656214efb594e10e7bb4b0ae307993a3ea75db5b0c682c7b41153664026fcebe5ee7027ba8cc9617b95518b21466222b9f84c87131ba66bea7
FRONTEND_URL=https://gj-camp-frontend.onrender.com

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

### C. Ajouter MongoDB Atlas (GRATUIT)

**IMPORTANT :** Render ne fournit pas MongoDB gratuit, on utilise MongoDB Atlas

1. Aller sur : https://www.mongodb.com/cloud/atlas/register
2. Creer compte gratuit
3. Creer cluster (M0 Sandbox - FREE)
4. Database Access → Add User (username + password)
5. Network Access → Add IP Address → "0.0.0.0/0" (Allow from anywhere)
6. Copier la connection string

**Ajouter dans Render Backend → Environment :**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gj-camp?retryWrites=true&w=majority
```

### D. Deployer

Cliquer "Create Web Service" → Render build automatiquement (~5 min)

URL Backend : https://gj-camp-backend.onrender.com

## Etape 3 : Deployer le Frontend

### A. Creer le Static Site

1. Dashboard → "New +" → "Static Site"
2. Repo : GJ-Camp-Website
3. Configurer :

```
Name: gj-camp-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: build
```

**Plan :** Free

### B. Variables d'environnement

```env
REACT_APP_API_URL=https://gj-camp-backend.onrender.com
REACT_APP_PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
```

### C. Deployer

Cliquer "Create Static Site" → Build (~3 min)

URL Frontend : https://gj-camp-frontend.onrender.com

## Etape 4 : Mettre a jour CORS Backend

1. Retourner dans Backend → Environment
2. Modifier FRONTEND_URL :
```env
FRONTEND_URL=https://gj-camp-frontend.onrender.com
```
3. Sauvegarder → Render redeploy automatiquement

## Etape 5 : Creer compte Admin

1. Backend → "Shell" (onglet)
2. Executer :

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
  
  console.log('Admin cree');
  process.exit(0);
});
"
```

## Verification

### Backend
https://gj-camp-backend.onrender.com/api/health
Resultat : { "message": "Backend fonctionnel" }

### Frontend
https://gj-camp-frontend.onrender.com
Resultat : Page d'accueil du site

### Se connecter
Email : admin@gj-camp.fr
Mot de passe : Admin2025!

## Limitations Plan Gratuit

- Backend s'arrete apres 15 min d'inactivite
- Redemarrage ~30 secondes a la prochaine visite
- 750h/mois (suffisant pour 1 site)
- Parfait pour test et petit trafic

## Upgrade vers Plan Payant (optionnel)

Si besoin de services toujours actifs :
- Backend : $7/mois (Starter)
- Frontend reste gratuit
- MongoDB Atlas reste gratuit (512MB)

Total : $7/mois pour backend toujours actif

## Domaine personnalise (optionnel)

1. Acheter domaine (ex: gj-camp.fr)
2. Render → Frontend → Settings → Custom Domain
3. Ajouter gj-camp.fr
4. Configurer DNS chez registrar :
```
Type: CNAME
Name: @
Value: gj-camp-frontend.onrender.com
```

HTTPS automatique avec Let's Encrypt !

## Redéploiement

Automatique via Git :
```bash
git add .
git commit -m "Mise a jour"
git push origin main
```

Render detecte et redeploy automatiquement (~3-5 min)

---

SIMPLE, GRATUIT, FONCTIONNEL !
