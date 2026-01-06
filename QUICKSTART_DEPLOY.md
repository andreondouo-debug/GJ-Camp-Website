# 🚀 Guide Rapide de Déploiement

## Étape 1 : MongoDB Atlas (5 minutes)

1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Créez un compte gratuit
3. Créez un cluster FREE (M0)
4. Dans "Database Access" → Créer un utilisateur
5. Dans "Network Access" → Ajouter 0.0.0.0/0 (Allow from anywhere)
6. Cliquez "Connect" → "Connect your application" → Copiez l'URL

Format : `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gj-camp-prod`

## Étape 2 : Déployer le Backend sur Render (10 minutes)

1. Allez sur https://render.com → Inscription avec GitHub
2. New + → Web Service
3. Sélectionnez votre repo GitHub
4. Configuration :
   - Name: `gj-camp-backend`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - FREE tier
5. Variables d'environnement :
   ```
   MONGODB_URI = votre-url-mongodb
   JWT_SECRET = générez-une-chaine-longue
   FRONTEND_URL = https://votre-site.vercel.app
   EMAIL_SERVICE = gmail
   EMAIL_USER = votre-email@gmail.com
   EMAIL_PASSWORD = votre-app-password
   ```
6. Deploy → Notez l'URL : `https://gj-camp-backend.onrender.com`

## Étape 3 : Déployer le Frontend sur Vercel (5 minutes)

1. Allez sur https://vercel.com → Inscription avec GitHub
2. New Project → Sélectionnez votre repo
3. Configuration :
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build: `npm run build`
4. Variables d'environnement :
   ```
   REACT_APP_API_URL = https://gj-camp-backend.onrender.com
   ```
5. Deploy → Votre site est en ligne ! 🎉

## Étape 4 : Mettre à jour les URLs

1. Retournez sur Render
2. Modifiez `FRONTEND_URL` avec l'URL Vercel
3. Save → Redémarrage automatique

**C'est fait ! Votre site est en ligne !** 🚀
