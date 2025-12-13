# 🚀 GUIDE - Fixer les Problèmes Critiques de Configuration

**Date:** 13 décembre 2025
**Durée estimée:** 20 minutes
**Criticité:** 🔴 BLOCKER

---

## ✅ Checklist d'Actions

### Étape 1: Configurer Frontend sur Vercel (5 min)

1. **Aller sur Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Sélectionner le projet "gj-camp-website"**

3. **Aller dans Settings → Environment Variables**

4. **Chercher "REACT_APP_API_URL"** et modifier:
   ```
   Ancien: http://localhost:5000
   Nouveau: https://gj-camp-backend.onrender.com
   ```

5. **Sauvegarder et attendre le redeploy automatique (2-3 min)**

6. **Vérifier le déploiement:**
   ```
   Deployments → Voir le dernier build status
   Doit être: ✅ Ready
   ```

---

### Étape 2: Configurer Backend sur Render (5 min)

1. **Aller sur Render Dashboard**
   ```
   https://dashboard.render.com
   ```

2. **Sélectionner le service "gj-camp-backend"**

3. **Aller dans "Environment"**

4. **Modifier FRONTEND_URL:**
   ```
   Ancien: http://localhost:3000
   Nouveau: https://gjsdecrpt.fr,https://www.gjsdecrpt.fr
   ```

5. **Modifier JWT_SECRET** (générer un secret fort):
   ```
   Ouverture PowerShell:
   $secret = [Convert]::ToBase64String([byte[]](0..31 | ForEach-Object {[byte](Get-Random -Min 0 -Max 256)}))
   $secret
   
   Copier la sortie et coller dans Render > JWT_SECRET
   ```

6. **Sauvegarder (redeploy auto, ~5 min)**

7. **Vérifier dans "Logs":**
   ```
   Render > gj-camp-backend > Logs
   Doit afficher: ✅ Serveur démarré sur le port 5000
   ```

---

### Étape 3: Tester la Connexion (5 min)

#### Test 1: Frontend → Backend API
```
1. Ouvrir https://gjsdecrpt.fr
2. Appuyer F12 pour ouvrir DevTools
3. Aller dans "Network"
4. Faire une action (clic sur "Programme", "Activités", etc.)
5. Chercher l'appel API dans Network:
   - URL doit être: https://gj-camp-backend.onrender.com/api/...
   - Status doit être: 200 OK (pas 401/403)
```

#### Test 2: Direct Backend Health Check
```
Ouvrir URL: https://gj-camp-backend.onrender.com/api/health

Doit retourner:
{
  "message": "✅ Backend fonctionnel"
}
```

#### Test 3: CORS Vérification
```
Si vous voyez l'erreur en F12:
"Access to XMLHttpRequest blocked by CORS policy"

Aller vérifier Render > Environment > FRONTEND_URL
Doit contenir: https://gjsdecrpt.fr
```

---

## 🔍 Dépannage

### ❌ Problème: "API unreachable" ou "Cannot reach server"

**Cause:** REACT_APP_API_URL mal configuré
**Solution:**
```
1. Vercel Dashboard > gj-camp-website > Settings > Environment Variables
2. Vérifier REACT_APP_API_URL = https://gj-camp-backend.onrender.com
3. Redéployer (Deployments > Redeploy)
4. Attendre 3 min et rafraîchir la page
```

### ❌ Problème: "CORS error" en F12

**Cause:** FRONTEND_URL mal configuré sur Render
**Solution:**
```
1. Render Dashboard > gj-camp-backend > Environment
2. Vérifier FRONTEND_URL = https://gjsdecrpt.fr,https://www.gjsdecrpt.fr
3. Sauvegarder (redeploy auto)
4. Attendre 5 min
```

### ❌ Problème: "401 Unauthorized" sur les API calls

**Cause:** Token JWT invalide
**Solution:**
```
1. Vous reconnecter (Logout puis Login)
2. DevTools F12 > Application > LocalStorage
3. Vérifier que 'token' est présent
4. Si toujours problème, vérifier JWT_SECRET sur Render
```

### ❌ Problème: Backend "Application Error" sur Render

**Cause:** Variables d'environnement manquantes ou invalides
**Solution:**
```
1. Render Dashboard > gj-camp-backend > Logs
2. Chercher les erreurs (rouges)
3. Vérifier MongoDB connexion: MONGODB_URI
4. Vérifier JWT_SECRET présent et valide
```

---

## ✨ Vérifications Post-Configuration

Après avoir appliqué les modifications, vérifier:

### Frontend (gjsdecrpt.fr)
- [ ] Page accueil charge sans erreur
- [ ] F12 Console → pas d'erreur rouge
- [ ] F12 Network → appels API utilisent `https://gj-camp-backend.onrender.com`
- [ ] Programme page charge les jours
- [ ] Activités page charge les activités
- [ ] Inscription formulaire affiche

### Backend (gj-camp-backend.onrender.com)
- [ ] `/api/health` retourne "Backend fonctionnel"
- [ ] Logs ne montrent pas d'erreur
- [ ] FRONTEND_URL correctement configuré
- [ ] MongoDB connexion OK

### Paiements
- [ ] Bouton PayPal visible sur inscription
- [ ] Sandbox test montant (20€) fonctionne
- [ ] Inscription enregistrée après paiement

---

## 🎯 Prochaines Étapes Après Configuration

1. **Configurer UptimeRobot** (5 min)
   - https://uptimerobot.com
   - Ajouter monitor: `https://gj-camp-backend.onrender.com/api/health`

2. **Tester Complet** (1h)
   - Inscription + Paiement PayPal
   - Toutes les pages du dashboard
   - Mobile responsiveness

3. **Passer PayPal en LIVE** (1h30)
   - Obtenir Client ID LIVE
   - Mettre à jour Vercel + Render
   - Tester transactions réelles

---

## 📞 Support / Doutes

Si vous avez un doute:

1. **Backend error?** → Render > gj-camp-backend > Logs
2. **Frontend blank page?** → F12 Console pour erreurs
3. **API not connecting?** → Vérifier REACT_APP_API_URL et FRONTEND_URL
4. **PayPal error?** → F12 Console pour details, vérifier credentials

---

**Durée totale:** 20 minutes
**Résultat:** Site entièrement fonctionnel en production ✅

À faire avant: 24 décembre 2025 ⏰
