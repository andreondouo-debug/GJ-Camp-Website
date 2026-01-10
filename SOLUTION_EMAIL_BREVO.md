# 🚨 SOLUTION TROUVÉE - Problème Connection Timeout Gmail

## ❌ PROBLÈME IDENTIFIÉ

**Erreur**: `Connection timeout` (ETIMEDOUT) lors de la connexion à Gmail SMTP

**Cause**: Render.com bloque les connexions SMTP sortantes sur les ports 587/465 pour les services gratuits

## ✅ SOLUTION: Utiliser Brevo (ex-Sendinblue)

Brevo est compatible avec Render et offre 300 emails gratuits/jour

### Étape 1: Créer un compte Brevo (5 minutes)

1. Allez sur: https://www.brevo.com
2. Cliquez sur "Sign up free"
3. Remplissez le formulaire d'inscription
4. Confirmez votre email

### Étape 2: Obtenir les identifiants SMTP

1. Connectez-vous à Brevo
2. Allez dans le menu → **SMTP & API**
3. Cliquez sur l'onglet **SMTP**
4. Vous verrez:
   - **Serveur SMTP**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: Votre email Brevo
   - **Mot de passe SMTP**: Cliquez sur "Créer une nouvelle clé SMTP"

5. Donnez un nom à la clé: "GJ Camp Website"
6. **COPIEZ** le mot de passe généré (vous ne le reverrez plus!)

### Étape 3: Configurer sur Render.com

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service **backend**
3. Allez dans **Environment**
4. **MODIFIEZ** ces variables:

```env
EMAIL_SERVICE=
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre-email@brevo.com
EMAIL_PASSWORD=votre-cle-smtp-brevo-generee
EMAIL_FROM=gjcontactgj0@gmail.com
```

⚠️ **IMPORTANT:**
- Supprimez complètement `EMAIL_SERVICE` (laissez vide ou supprimez la variable)
- Ou définissez `EMAIL_SERVICE=` (vide)
- Le système utilisera alors `EMAIL_HOST` pour la configuration SMTP

5. **Save Changes**
6. **Redémarrez** le service (Manual Deploy → Clear build cache & deploy)

### Étape 4: Tester

1. Attendez 2-3 minutes que le service redémarre
2. Testez avec:
   ```bash
   curl "https://gj-camp-website-1.onrender.com/api/test/email-config"
   ```

3. Si succès, vous verrez:
   ```json
   {
     "success": true,
     "message": "Configuration email fonctionnelle"
   }
   ```

4. Vérifiez votre boîte email Brevo, vous devriez recevoir l'email de test

### Étape 5: Tester l'inscription

1. Allez sur: https://gj-camp-website-3fuu.vercel.app/signup
2. Créez un compte avec votre email
3. Vous devriez recevoir l'email de vérification!

## 📋 Configuration finale sur Render

```env
# MongoDB
MONGODB_URI=mongodb+srv://GJ-Camp_Website:JeunesseCrptGj@cluster0.juxp1sw.mongodb.net/gj-camp?retryWrites=true&w=majority

# JWT
JWT_SECRET=4a2ec1fef92c89656214efb594e10e7bb4b0ae307993a3ea75db5b0c682c7b41153664026fcebe5ee7027ba8cc9617b95518b21466222b9f84c87131ba66bea7

# Frontend
FRONTEND_URL=https://gj-camp-website-3fuu.vercel.app,http://localhost:3000

# Email Brevo (au lieu de Gmail)
EMAIL_SERVICE=
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre-email-brevo@gmail.com
EMAIL_PASSWORD=votre-cle-smtp-brevo
EMAIL_FROM=gjcontactgj0@gmail.com

# PayPal
PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
PAYPAL_CLIENT_SECRET=EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV
PAYPAL_MODE=sandbox

# Cloudinary
CLOUDINARY_CLOUD_NAME=dbouijio-1
CLOUDINARY_API_KEY=761916752995798
CLOUDINARY_API_SECRET=bX-m3vu9HSWprWpm-jfY_wbvd2s

# RGPD
DPO_EMAIL=dpo@gj-camp.fr
CONTACT_EMAIL=contact@gj-camp.fr

# Node
NODE_ENV=production
PORT=10000
```

## 🎯 Pourquoi Brevo au lieu de Gmail?

1. ✅ **Compatible Render** - Pas de blocage de ports
2. ✅ **Gratuit** - 300 emails/jour
3. ✅ **Fiable** - Service professionnel
4. ✅ **Stats incluses** - Voir les emails envoyés
5. ✅ **Facile** - Configuration simple

## 🔍 Alternative: SendGrid

Si Brevo ne fonctionne pas, vous pouvez essayer SendGrid:

1. Créez un compte sur https://sendgrid.com (100 emails/jour gratuits)
2. Créez une API Key
3. Sur Render:
   ```env
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASSWORD=votre-api-key-sendgrid
   ```

## ✅ CHECKLIST

- [ ] Compte Brevo créé
- [ ] Clé SMTP Brevo obtenue
- [ ] Variables Render mises à jour
- [ ] Service redémarré
- [ ] Endpoint `/api/test/email-config` testé
- [ ] Inscription testée
- [ ] Email reçu ✅

---

**Date**: 10 janvier 2026
**Problème**: Gmail SMTP bloqué par Render (Connection timeout)
**Solution**: Brevo SMTP relay
