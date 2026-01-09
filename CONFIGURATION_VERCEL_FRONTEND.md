# 🔧 Configuration Frontend Vercel - Connexion Backend Render

## ✅ État Actuel

- **Backend Render** : `https://gj-camp-website-1.onrender.com` ✅ FONCTIONNEL
- **Frontend Vercel** : `https://gj-camp-website-3fuu.vercel.app` ✅ DÉPLOYÉ
- **Problème** : Le frontend ne communique pas avec le backend

## 🎯 Solution : Mettre à jour les Variables d'Environnement Vercel

### Étape 1 : Aller sur Vercel

1. Ouvrir **https://vercel.com**
2. Se connecter avec GitHub
3. Cliquer sur le projet **gj-camp-website**

### Étape 2 : Accéder aux Variables d'Environnement

1. Cliquer sur **"Settings"** (en haut)
2. Dans le menu latéral, cliquer sur **"Environment Variables"**

### Étape 3 : Ajouter/Modifier les Variables

**Ajouter ces 2 variables** (ou les modifier si elles existent déjà) :

#### Variable 1 : API_URL

```
Name: REACT_APP_API_URL
Value: https://gj-camp-website-1.onrender.com
Environment: Production, Preview, Development (cocher les 3)
```

#### Variable 2 : PayPal Client ID

```
Name: REACT_APP_PAYPAL_CLIENT_ID
Value: AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
Environment: Production, Preview, Development (cocher les 3)
```

Cliquer sur **"Save"** après chaque variable

### Étape 4 : Redéployer le Frontend

**IMPORTANT** : Les variables d'environnement ne sont appliquées qu'au prochain déploiement !

1. Aller dans l'onglet **"Deployments"**
2. Trouver le dernier déploiement (le plus récent)
3. Cliquer sur les **3 points** (⋮) à droite
4. Cliquer sur **"Redeploy"**
5. Confirmer en cliquant sur **"Redeploy"** à nouveau

⏱️ **Attendre 2-3 minutes** que le build se termine

### Étape 5 : Mettre à jour le CORS Backend (Render)

Le backend doit autoriser le frontend Vercel :

1. Retourner sur **https://render.com**
2. Aller dans votre service **gj-camp-website-1**
3. **Environment** → Trouver la variable **FRONTEND_URL**
4. Modifier sa valeur pour :

```
https://gj-camp-website-3fuu.vercel.app,http://localhost:3000
```

5. Cliquer **"Save Changes"**
6. ⏱️ Attendre 1-2 minutes (le backend redémarre automatiquement)

### Étape 6 : Tester la Connexion

Une fois les deux redéploiements terminés :

1. Ouvrir **https://gj-camp-website-3fuu.vercel.app**
2. Ouvrir la **Console du navigateur** (F12 → Console)
3. Chercher le message : `🔗 API URL configurée: https://gj-camp-website-1.onrender.com`
4. Tester une action qui appelle le backend (inscription, connexion, etc.)

### Vérification Rapide

Tester manuellement :
```bash
# Backend
curl https://gj-camp-website-1.onrender.com/api/health

# Frontend
curl https://gj-camp-website-3fuu.vercel.app
```

## 🔍 Dépannage

### ❌ "Network Error" ou "Failed to fetch"

**Cause** : CORS mal configuré sur le backend

**Solution** :
1. Vérifier que `FRONTEND_URL` sur Render contient bien l'URL Vercel
2. Attendre 2 minutes après modification (redémarrage backend)
3. Vider le cache du navigateur (Ctrl+F5)

### ❌ "Cannot read properties of undefined"

**Cause** : Variables d'environnement non appliquées

**Solution** :
1. Vérifier dans Vercel → Settings → Environment Variables
2. S'assurer que les 3 environnements sont cochés (Production, Preview, Development)
3. **Redéployer obligatoirement** après ajout de variables

### ❌ Backend lent (30 secondes)

**Cause** : Plan gratuit Render - Cold start après 15 min d'inactivité

**Solution** :
- C'est normal sur le plan gratuit
- Après la première requête, tout redevient rapide
- Solution pro : Configurer un "pinger" (UptimeRobot)

### ❌ "Route non trouvée" à la racine

**Cause** : Normal - le backend n'a pas de route à `/`

**Solution** :
- Utiliser `/api/health` pour tester
- Les vraies routes sont : `/api/auth/login`, `/api/carousel`, etc.

## 📋 Checklist Complète

- [ ] Backend Render déployé et accessible
- [ ] `REACT_APP_API_URL` ajouté sur Vercel
- [ ] `REACT_APP_PAYPAL_CLIENT_ID` ajouté sur Vercel
- [ ] Frontend Vercel redéployé
- [ ] `FRONTEND_URL` mis à jour sur Render Backend
- [ ] Backend Render redémarré
- [ ] Test `/api/health` réussi
- [ ] Test connexion depuis le frontend réussi
- [ ] Console navigateur ne montre pas d'erreurs CORS

## 🎯 Résultat Attendu

Après configuration :
- Frontend peut appeler le backend
- Inscription/Connexion fonctionnent
- Images du carousel s'affichent
- PayPal fonctionne
- Emails sont envoyés

## 📝 Résumé des URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend Prod | https://gj-camp-website-3fuu.vercel.app | ✅ |
| Backend Prod | https://gj-camp-website-1.onrender.com | ✅ |
| MongoDB Atlas | cluster0.juxp1sw.mongodb.net | ✅ |
| Backend Dev | http://localhost:5000 | Local |
| Frontend Dev | http://localhost:3000 | Local |

---

🎉 **Une fois ces étapes complétées, votre application sera 100% fonctionnelle en production !**
