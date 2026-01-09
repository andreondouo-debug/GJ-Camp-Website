# 🚀 Guide de Déploiement Backend sur Render

## Étape 1 : Préparation

Vous avez déjà :
- ✅ Backend prêt dans le dossier `/backend`
- ✅ MongoDB Atlas configuré (cluster0.zkcdnex.mongodb.net)
- ✅ Fichier `render.yaml` pour configuration automatique
- ✅ Variables d'environnement dans `render-backend-env.txt`

## Étape 2 : Créer un compte Render

1. Aller sur : **https://render.com**
2. Cliquer sur **"Get Started"**
3. Se connecter avec **GitHub**
4. Autoriser Render à accéder à votre dépôt **GJ-Camp-Website**

## Étape 3 : Déployer le Backend

### Option A : Déploiement Automatique (recommandé)

1. Dans le dashboard Render, cliquer **"New +"** → **"Blueprint"**
2. Connecter votre repo **GJ-Camp-Website**
3. Render détectera automatiquement le fichier `backend/render.yaml`
4. Cliquer **"Apply"**

### Option B : Déploiement Manuel

1. Dashboard → **"New +"** → **"Web Service"**
2. Connecter le repo **GJ-Camp-Website**
3. Configurer :
   - **Name**: `gj-camp-backend`
   - **Region**: Frankfurt (Europe)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: Free

## Étape 4 : Configurer les Variables d'Environnement

Dans Render Dashboard → Backend Service → **"Environment"** → **"Add Environment Variable"**

**Copier-coller ces variables** (depuis `render-backend-env.txt`) :

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://andreondouo_db_user:7PZsQpBFJnlt5yGI@cluster0.zkcdnex.mongodb.net/gj-camp-prod?retryWrites=true&w=majority
JWT_SECRET=4a2ec1fef92c89656214efb594e10e7bb4b0ae307993a3ea75db5b0c682c7b41153664026fcebe5ee7027ba8cc9617b95518b21466222b9f84c87131ba66bea7
FRONTEND_URL=https://gj-camp-website-3fuu.vercel.app
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
CLOUDINARY_CLOUD_NAME=dbouijio-1
CLOUDINARY_API_KEY=761916752995798
CLOUDINARY_API_SECRET=bX-m3vu9HSWprWpm-jfY_wbvd2s
DPO_EMAIL=dpo@gj-camp.fr
CONTACT_EMAIL=contact@gj-camp.fr
```

**⚠️ IMPORTANT :** Cliquer **"Save Changes"** après avoir ajouté toutes les variables

## Étape 5 : Lancer le Déploiement

1. Cliquer sur **"Manual Deploy"** → **"Deploy latest commit"**
2. Attendre ~5-10 minutes (première fois plus longue)
3. Surveiller les logs en temps réel

### Logs à surveiller

Vous devriez voir :
```
🚀 Serveur démarré sur le port 10000
✅ MongoDB connecté
📧 Service email configuré (Gmail)
```

## Étape 6 : Récupérer l'URL du Backend

Une fois le déploiement réussi :
1. L'URL sera affichée en haut de la page : `https://gj-camp-backend.onrender.com`
2. **Copier cette URL** - vous en aurez besoin pour le frontend

## Étape 7 : Tester le Backend

Ouvrir dans le navigateur :
```
https://gj-camp-backend.onrender.com/api/health
```

Résultat attendu :
```json
{
  "message": "✅ Backend fonctionnel"
}
```

## Étape 8 : Configurer le Frontend Vercel

Maintenant que le backend est déployé, vous devez mettre à jour le frontend sur Vercel :

1. Aller sur **https://vercel.com** → Projet **gj-camp-website**
2. **Settings** → **Environment Variables**
3. Ajouter/Modifier :
   ```
   REACT_APP_API_URL=https://gj-camp-backend.onrender.com
   REACT_APP_PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
   ```
4. **Redéployer** le frontend : Deployments → ⋮ → **"Redeploy"**

## Étape 9 : Mettre à jour CORS Backend

Une fois l'URL backend connue, retourner dans Render → Backend → **Environment** :

Modifier `FRONTEND_URL` pour accepter les deux domaines :
```
FRONTEND_URL=https://gj-camp-website-3fuu.vercel.app,http://localhost:3000
```

Cliquer **"Save Changes"** → Le backend redémarrera automatiquement

## 🎯 Résultat Final

- **Frontend** : https://gj-camp-website-3fuu.vercel.app
- **Backend** : https://gj-camp-backend.onrender.com
- **MongoDB** : Atlas (cluster0.zkcdnex.mongodb.net/gj-camp-prod)

## 🔧 Dépannage

### ❌ Build Failed
- Vérifier que `Root Directory` = `backend`
- Vérifier que toutes les dépendances sont dans `package.json`

### ❌ MongoDB Connection Error
- Vérifier que l'IP `0.0.0.0/0` est autorisée dans MongoDB Atlas → Network Access
- Vérifier que le mot de passe dans `MONGODB_URI` est correct

### ❌ CORS Error
- Vérifier que `FRONTEND_URL` contient bien l'URL Vercel
- Attendre 1-2 minutes après modification (redémarrage du service)

### ⏰ Backend Slow/Cold Start
- Plan gratuit Render : le backend s'endort après 15 min d'inactivité
- Première requête après sommeil : ~30 secondes
- Solution : Configurer un "pinger" (UptimeRobot) pour garder le service actif

## 📝 Notes Importantes

1. **Plan Gratuit** : 
   - 750h/mois (suffisant pour 1 service 24/7)
   - Sommeil automatique après 15 min d'inactivité
   - Cold start ~30 secondes

2. **Déploiement Automatique** :
   - Render redéploie automatiquement à chaque push sur `main`
   - Pratique pour les mises à jour

3. **Logs** :
   - Accessibles dans Render Dashboard → Service → Logs
   - Utiles pour déboguer

## ✅ Checklist de Vérification

- [ ] Backend déployé et URL récupérée
- [ ] Endpoint `/api/health` accessible
- [ ] MongoDB Atlas connecté
- [ ] Variables d'environnement configurées
- [ ] Frontend Vercel mis à jour avec `REACT_APP_API_URL`
- [ ] CORS configuré avec URL Vercel
- [ ] Test complet : inscription/connexion fonctionnelle

---

🎉 **Félicitations !** Votre backend est maintenant en production sur Render !
