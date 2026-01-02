# 🚀 Configuration Production - Vercel + Render + MongoDB

## 📋 Objectif
Faire fonctionner le site en production (gjsdecrpt.fr) avec MongoDB **sans démarrer les serveurs localement**.

---

## ✅ CONFIGURATION ACTUELLE

### Backend (Render)
- URL: `https://gj-camp-backend.onrender.com`
- MongoDB: Atlas Cloud (déjà configuré)
- Status: ✅ Doit être actif

### Frontend (Vercel)
- URL: `https://gjsdecrpt.fr`
- Configuration: Variables d'environnement Vercel
- Status: ⚠️ À configurer

---

## 🔧 ÉTAPES DE CONFIGURATION

### Étape 1: Vérifier Backend Render

1. **Aller sur:** https://dashboard.render.com
2. **Sélectionner:** `gj-camp-backend`
3. **Vérifier:**
   - Status: ✅ Active (pas "Suspended")
   - Environment Variables contiennent:
     - `MONGODB_URI` = mongodb+srv://GJ-Camp_Website:JeunesseCrptGj@cluster0.juxp1sw.mongodb.net/gj-camp
     - `JWT_SECRET` = (votre clé secrète)
     - `FRONTEND_URL` = https://gjsdecrpt.fr
     - `EMAIL_*` = (configuration Gmail)

4. **Tester le backend:**
   ```powershell
   Invoke-WebRequest https://gj-camp-backend.onrender.com/api/health
   ```
   Doit retourner: `{"message":"✅ Backend fonctionnel"}`

⚠️ **Note:** Si le backend est "Suspended", le réactiver prend ~2 minutes.

### Étape 2: Configurer Variables Vercel

1. **Aller sur:** https://vercel.com/dashboard
2. **Sélectionner votre projet** (GJ-Camp-Website ou similaire)
3. **Aller dans:** `Settings` → `Environment Variables`

4. **Ajouter/Modifier ces variables:**

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `REACT_APP_API_URL` | `https://gj-camp-backend.onrender.com` | Production |
   | `REACT_APP_PAYPAL_CLIENT_ID` | `AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb` | Production |

5. **Sélectionner uniquement:** ✅ Production (pas Development)

6. **Cliquer:** `Save`

### Étape 3: Redéployer Frontend

Vous avez **2 options:**

#### Option A: Redéploiement Automatique (Recommandé)

1. **Commit et push les changements:**
   ```powershell
   cd c:\Users\Moi\GJ-Camp-Website
   git add frontend/.env frontend/.env.production frontend/.env.development
   git commit -m "🔧 Config: Séparer envs local/production"
   git push origin main
   ```

2. **Vercel détectera automatiquement:**
   - Nouveau commit sur GitHub
   - Lance le build automatiquement
   - Déploie en ~2-3 minutes

3. **Suivre le déploiement:**
   - Aller sur Vercel Dashboard
   - Voir "Deployments" → Status du build

#### Option B: Redéploiement Manuel

1. **Dans Vercel Dashboard:**
   - Aller dans "Deployments"
   - Cliquer sur le dernier déploiement
   - Cliquer sur le menu `...` → `Redeploy`
   - Confirmer

2. **Attendre:** 2-3 minutes pour le build

### Étape 4: Vérifier que Ça Marche

1. **Ouvrir:** https://gjsdecrpt.fr

2. **Tester:**
   - ✅ Page d'accueil charge
   - ✅ Aller sur "Programme" → Activités s'affichent
   - ✅ Se connecter → Dashboard fonctionne
   - ✅ Mot de passe oublié → Demande envoyée

3. **En cas de problème:**
   - Ouvrir Console du navigateur (F12)
   - Vérifier erreurs réseau
   - Vérifier que les appels API vont vers `gj-camp-backend.onrender.com` (pas localhost)

---

## 🎯 DIFFÉRENCES LOCAL VS PRODUCTION

### Développement Local

```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000
MongoDB:   Atlas Cloud (via backend local)

Pour utiliser:
1. Démarrer backend: cd backend && npm run dev
2. Démarrer frontend: cd frontend && npm start
3. Ouvrir: http://localhost:3000

Utilise: frontend/.env.development
```

### Production

```
Frontend:  https://gjsdecrpt.fr (Vercel)
Backend:   https://gj-camp-backend.onrender.com (Render)
MongoDB:   Atlas Cloud (via backend Render)

Pour utiliser:
1. Rien à démarrer localement! ✅
2. Ouvrir: https://gjsdecrpt.fr
3. Tout est hébergé dans le cloud

Utilise: Variables Vercel + frontend/.env.production
```

---

## 📁 FICHIERS CRÉÉS

```
frontend/
  ├── .env                    ← PRODUCTION (par défaut)
  ├── .env.production         ← PRODUCTION (utilisé par Vercel)
  └── .env.development        ← LOCAL (utilisé quand npm start)
```

### Contenu .env.production

```env
REACT_APP_API_URL=https://gj-camp-backend.onrender.com
REACT_APP_PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
```

### Contenu .env.development

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
```

---

## ⚡ COMMANDES RAPIDES

### Tester Backend Render

```powershell
# Health check
Invoke-WebRequest https://gj-camp-backend.onrender.com/api/health

# Activités
Invoke-WebRequest https://gj-camp-backend.onrender.com/api/activities
```

### Déployer Frontend

```powershell
cd c:\Users\Moi\GJ-Camp-Website
git add .
git commit -m "🚀 Deploy: Configuration production"
git push origin main
```

### Développement Local

```powershell
# Terminal 1
cd c:\Users\Moi\GJ-Camp-Website\backend
npm run dev

# Terminal 2
cd c:\Users\Moi\GJ-Camp-Website\frontend
npm start
```

---

## 🐛 RÉSOLUTION PROBLÈMES

### Site ne charge pas (Production)

**Symptôme:** gjsdecrpt.fr ne charge pas

**Solutions:**
1. Vérifier Vercel Dashboard → Deployment status
2. Vérifier Console navigateur (F12) pour erreurs
3. Vérifier `REACT_APP_API_URL` dans Vercel Variables

### API ne répond pas

**Symptôme:** "Failed to fetch" ou erreurs 500

**Solutions:**
1. Backend Render peut être en veille (premier appel lent ~1 min)
2. Tester: `Invoke-WebRequest https://gj-camp-backend.onrender.com/api/health`
3. Vérifier Render Dashboard → Backend status "Active"

### MongoDB pas connecté

**Symptôme:** Pas d'activités/utilisateurs

**Solutions:**
1. Vérifier Render → Environment Variables → `MONGODB_URI` présent
2. Vérifier MongoDB Atlas → Network Access autorise Render (0.0.0.0/0)
3. Vérifier Render Logs pour erreurs connexion

### Erreurs CORS

**Symptôme:** "CORS policy" dans console

**Solutions:**
1. Vérifier Render → `FRONTEND_URL=https://gjsdecrpt.fr`
2. Redémarrer backend Render
3. Vérifier backend/src/server.js configuration CORS

---

## ✅ CHECKLIST FINALE

Avant de considérer la configuration terminée:

- [ ] Backend Render actif et répond à `/api/health`
- [ ] MongoDB connecté (tester `/api/activities`)
- [ ] Variables Vercel configurées (`REACT_APP_API_URL`)
- [ ] Frontend redéployé sur Vercel
- [ ] Site gjsdecrpt.fr accessible
- [ ] Activités s'affichent sur le site
- [ ] Connexion utilisateur fonctionne
- [ ] Mot de passe oublié fonctionne

---

## 📝 NOTES IMPORTANTES

### UptimeRobot

⚠️ **Backend Render en Free Tier = Suspend après 15 min inactivité**

**Solution:** UptimeRobot ping toutes les 5 minutes
- URL monitored: https://gj-camp-backend.onrender.com/api/health
- Garde backend actif 24/7

### PayPal

⚠️ **Actuellement en SANDBOX (test)**

Pour passer en production:
1. Créer app Live sur PayPal Developer
2. Obtenir Live Client ID
3. Modifier `REACT_APP_PAYPAL_CLIENT_ID` dans Vercel
4. Redéployer

### Emails

✅ Gmail configuré pour:
- Vérification email
- Mot de passe oublié
- Notifications

Compte: gjcontactgj0@gmail.com

---

## 🎉 RÉSULTAT

Après configuration:

```
✅ Site accessible: https://gjsdecrpt.fr
✅ Backend: Render + MongoDB Atlas
✅ Pas besoin de démarrer localement
✅ Tout fonctionne dans le cloud
✅ Développement local possible avec npm start
```

**Temps de configuration:** ~10-15 minutes
**Coût:** Gratuit (Free tiers Vercel + Render + MongoDB)

---

**Besoin d'aide?** Consultez les logs:
- Vercel: Dashboard → Deployments → Function Logs
- Render: Dashboard → Logs
- MongoDB: Atlas → Monitoring
