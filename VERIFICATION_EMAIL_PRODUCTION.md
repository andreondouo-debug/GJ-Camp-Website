# GUIDE DE VÉRIFICATION EMAIL - RENDER.COM

## Problème identifié
Les emails ne sont pas reçus lors de l'inscription sur le site en production.

## Solution: Vérifier et corriger les variables d'environnement sur Render

### 1. Variables d'environnement requises sur Render.com

Connectez-vous à Render.com et allez dans votre service backend, puis dans "Environment".

**Vérifiez que ces variables sont EXACTEMENT définies comme suit:**

```env
EMAIL_SERVICE=gmail
EMAIL_USER=gjcontactgj0@gmail.com
EMAIL_PASSWORD=eofu vfga tjxe xibi
EMAIL_FROM=gjcontactgj0@gmail.com
FRONTEND_URL=https://gj-camp-website-3fuu.vercel.app
NODE_ENV=production
```

⚠️ **IMPORTANT:**
- Le mot de passe Gmail contient des ESPACES: `eofu vfga tjxe xibi`
- Ne mettez PAS de guillemets autour du mot de passe sur Render
- `EMAIL_SERVICE` doit être exactement `gmail` (pas `Gmail` ou `GMAIL`)

### 2. Vérification des logs

Après avoir mis à jour les variables:
1. Redémarrez votre service backend sur Render
2. Créez un nouveau compte de test
3. Allez dans "Logs" sur Render et cherchez:
   - `📧 Configuration email détectée:`
   - `✅ Utilisation de Gmail pour l'envoi d'emails`
   - `✅ Email envoyé avec succès!`
   
Si vous voyez des erreurs comme:
- `❌ Erreur lors de l'envoi de l'email`
- `Invalid login`
- `Authentication failed`

Cela signifie que le mot de passe Gmail n'est pas correctement configuré.

### 3. Vérification du mot de passe d'application Gmail

Le mot de passe utilisé (`eofu vfga tjxe xibi`) est un **mot de passe d'application Gmail**.

Pour vérifier ou créer un nouveau mot de passe d'application:

1. Connectez-vous à Gmail avec le compte `gjcontactgj0@gmail.com`
2. Allez sur https://myaccount.google.com/apppasswords
3. Si le mot de passe actuel ne fonctionne plus:
   - Créez un nouveau mot de passe d'application
   - Sélectionnez "Autre (nom personnalisé)" et tapez "GJ Camp Website"
   - Copiez le mot de passe généré (format: `xxxx xxxx xxxx xxxx`)
   - Mettez à jour `EMAIL_PASSWORD` sur Render avec ce nouveau mot de passe

### 4. Alternative: Utiliser Brevo (ex-Sendinblue)

Si Gmail continue de poser problème, vous pouvez utiliser Brevo:

1. Créez un compte sur https://www.brevo.com (gratuit jusqu'à 300 emails/jour)
2. Allez dans "SMTP & API" → "SMTP"
3. Créez une clé SMTP
4. Sur Render, modifiez les variables:

```env
EMAIL_SERVICE=
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre-email-brevo@gmail.com
EMAIL_PASSWORD=votre-cle-smtp-brevo
EMAIL_FROM=gjcontactgj0@gmail.com
```

### 5. Test rapide

Après avoir mis à jour les variables sur Render:

1. Redémarrez le service
2. Attendez 2-3 minutes
3. Inscrivez-vous avec un email de test
4. Vérifiez:
   - Votre boîte de réception
   - Le dossier SPAM/Courrier indésirable
   - Les logs Render pour voir si l'email a été envoyé

### 6. Commandes de vérification des logs

Sur Render, dans la console logs, cherchez:
```bash
# Rechercher les logs d'email
# Vous devriez voir ces messages lors d'une inscription:
📧 Configuration email détectée:
  - EMAIL_SERVICE: gmail
  - EMAIL_USER: gjcontactgj0@gmail.com
✅ Utilisation de Gmail pour l'envoi d'emails
📨 Tentative d'envoi d'email de vérification à: [email-utilisateur]
✅ Email envoyé avec succès!
```

### 7. Checklist de dépannage

- [ ] `EMAIL_SERVICE=gmail` est défini sur Render
- [ ] `EMAIL_PASSWORD` contient le bon mot de passe avec les espaces
- [ ] Le service backend a été redémarré après modification des variables
- [ ] Les logs montrent "✅ Utilisation de Gmail pour l'envoi d'emails"
- [ ] Vérifier le dossier SPAM de la boîte de réception

## Support

Si le problème persiste après ces vérifications:
1. Capturez les logs Render lors d'une inscription
2. Vérifiez que le compte Gmail `gjcontactgj0@gmail.com` n'est pas bloqué
3. Testez avec un autre service email (Brevo)
