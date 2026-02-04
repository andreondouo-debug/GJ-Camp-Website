# 🔴 DIAGNOSTIC: Serveur Render DOWN

**Date:** 4 février 2026  
**Statut:** ❌ Serveur complètement inaccessible  
**URL testée:** https://gj-camp-backend.onrender.com

## 🔍 Symptômes

- **HTTP 404** sur toutes les routes (même `/api/health`)
- Header `x-render-routing: no-server` → Serveur pas démarré
- Pas de réponse même après 30 secondes (pas de cold start)
- Routes et login retournent 404

## ✅ Tests effectués

1. ✅ **Syntaxe JavaScript** - Aucune erreur
2. ✅ **Démarrage local** - Fonctionne parfaitement
3. ✅ **Variables env locales** - Toutes présentes
4. ✅ **Routes** - Chargement OK en local
5. ✅ **MongoDB** - Connexion OK en local

## 🎯 Cause probable

**Le serveur Render a crashé au démarrage** ou est en veille (plan gratuit).

## 🔧 SOLUTION: Actions à faire sur Render Dashboard

### Étape 1: Vérifier les logs
1. Aller sur https://dashboard.render.com
2. Sélectionner le service **gj-camp-backend**
3. Cliquer sur l'onglet **"Logs"**
4. Chercher les erreurs récentes:
   - `MongoDB connection failed`
   - `Missing environment variable`
   - `Module not found`
   - `Error:`
   - `FATAL ERROR`

### Étape 2: Vérifier les variables d'environnement
Dans **Environment**, vérifier que TOUTES ces variables existent:

#### ✅ Critiques (obligatoires)
- `MONGODB_URI` - Connexion MongoDB Atlas
- `JWT_SECRET` - Secret pour tokens (min 64 caractères)
- `FRONTEND_URL` - URL frontend (https://gjsdecrpt.fr)

#### 📧 Email (Brevo)
- `EMAIL_SERVICE=brevo`
- `BREVO_API_KEY` - Clé API Brevo

#### 💳 PayPal (optionnel en dev)
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE=sandbox`

#### ☁️ Cloudinary (optionnel)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

#### 🔔 Web Push (optionnel)
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

### Étape 3: Déclencher un redéploiement manuel

Si les variables sont OK mais le service est down:

1. Dans **Manual Deploy**, cliquer sur **"Deploy latest commit"**
2. OU dans **Settings** → **"Manual Deploy"** → **"Clear build cache & deploy"**
3. Attendre 2-3 minutes que le build termine
4. Vérifier les logs en temps réel pendant le déploiement

### Étape 4: Vérifier le plan Free

⚠️ **IMPORTANT:** Les services gratuits Render:
- Se mettent en veille après 15 minutes d'inactivité
- Prennent 30-60 secondes pour se réveiller au premier appel
- Redémarrent automatiquement après 15 jours max

**Si le service est en veille:**
- Premier appel: 404 + attente 30-60s
- Appels suivants: OK

## 🧪 Test après correction

Une fois le service redéployé, tester avec:

```bash
# Attendre 30 secondes (cold start)
sleep 30

# Test health
curl https://gj-camp-backend.onrender.com/api/health

# Test login
curl -X POST https://gj-camp-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Réponses attendues:**
- Health: `{"message":"✅ Backend fonctionnel"}` (HTTP 200)
- Login: `{"message":"..."}` (HTTP 400 ou 401, **pas 404**)

## 📝 Si le problème persiste

### Option A: Vérifier MongoDB Atlas
1. Aller sur https://cloud.mongodb.com
2. Vérifier que le cluster est actif
3. Vérifier les **IP Access List** → Autoriser 0.0.0.0/0 (all IPs)
4. Copier l'**URI de connexion** et vérifier qu'elle est dans Render

### Option B: Logs détaillés Render
Dans les logs Render, chercher:
```
node:events:###
      throw er; // Unhandled 'error' event
      ^

Error: ...
```

Cette erreur indique la vraie cause du crash.

### Option C: Variables d'env manquantes
Le serveur peut démarrer mais crasher immédiatement si:
- `JWT_SECRET` manquant
- `MONGODB_URI` invalide
- `FRONTEND_URL` malformé

## 🎯 Action immédiate recommandée

1. **Aller sur dashboard.render.com maintenant**
2. **Vérifier les logs** (onglet Logs)
3. **Redéployer manuellement** (bouton "Deploy latest commit")
4. **Attendre 60 secondes**
5. **Retester:** `curl https://gj-camp-backend.onrender.com/api/health`

---

## 📊 Dernier test effectué (4 fév 2026 16:44)

```
Status: 404 Not Found
Header: x-render-routing: no-server
Cold start: Échec après 30s
```

**Conclusion:** Service down, nécessite intervention manuelle sur Render Dashboard.
