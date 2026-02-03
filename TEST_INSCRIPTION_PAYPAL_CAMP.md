# 🧪 Test de l'Inscription Camp avec PayPal

## ✅ Problème Résolu

**Avant** : La page d'inscription camp (`/inscription`) envoyait le formulaire **sans paiement PayPal**, ce qui causait l'erreur :
```
❌ Détails de paiement PayPal manquants
```

**Maintenant** : Workflow complet en 2 étapes :
1. ✅ Validation du formulaire (password strength, champs requis)
2. 💳 Affichage du bouton PayPal pour paiement
3. 📤 Envoi des données avec `paymentDetails.orderID` après paiement réussi

---

## 🎯 Workflow Utilisateur

### Étape 1 : Remplir le formulaire
1. Aller sur **https://gjsdecrpt.fr/inscription**
2. Remplir tous les champs obligatoires :
   - Nom, prénom, email
   - **Mot de passe** (8+ caractères, majuscule, minuscule, chiffre, spécial)
   - Sexe, date de naissance, téléphone, adresse
   - Refuge CRPT
   - Allergies (optionnel)
3. Sélectionner le montant à payer : **20€**, 60€, 80€ ou 120€
4. Cliquer sur **"✅ Valider mon inscription"**

### Étape 2 : Paiement PayPal
1. ✅ **Le formulaire est validé** → message de confirmation
2. 💳 **Bouton PayPal s'affiche** automatiquement en bas
3. Cliquer sur le bouton bleu **"PayPal"** ou **"Carte bancaire"**
4. Se connecter avec un **compte PayPal Sandbox** (mode test) :
   - Email : `sb-test@personal.example.com` (voir Dashboard PayPal)
   - Mot de passe : voir Dashboard
5. Confirmer le paiement dans la fenêtre PayPal

### Étape 3 : Confirmation
1. ✅ **Transaction capturée** → orderID retourné
2. 📤 **Données envoyées** au backend avec `paymentDetails.orderID`
3. 🔍 **Backend vérifie le paiement** auprès de PayPal API
4. 📝 **Inscription créée** en base de données
5. 🎉 **Redirection** vers le tableau de bord (`/tableau-de-bord`)

---

## 🧪 Tests à Effectuer

### Test 1 : Validation Password Faible ❌
1. Remplir le formulaire avec un mot de passe **"azerty"** (pas de majuscule, pas de chiffre)
2. Cliquer "Valider"
3. **Résultat attendu** : Message d'erreur rouge
   ```
   🔒 Mot de passe trop faible ! Il doit contenir : une lettre majuscule, un chiffre, un caractère spécial (!@#$%&*...).
   ```

### Test 2 : Validation Password Fort ✅
1. Remplir avec un mot de passe **"Azerty123!"** (8+ chars, A-Z, a-z, 0-9, spécial)
2. Cliquer "Valider"
3. **Résultat attendu** : 
   - ✅ Message vert : "✅ Formulaire validé ! Procédez au paiement ci-dessous."
   - 💳 Section PayPal apparaît en dessous

### Test 3 : Paiement PayPal Réussi 💳✅
1. Valider le formulaire
2. Cliquer sur le bouton PayPal bleu
3. Se connecter avec compte sandbox
4. Confirmer le paiement
5. **Résultat attendu** :
   - Console frontend : `✅ Paiement réussi, envoi inscription: {id: "..."}`
   - Backend : `🔍 Vérification PayPal pour orderID: ...`
   - Backend : `✅ Paiement vérifié`
   - Backend : `✅ Inscription créée avec succès`
   - Redirection vers `/tableau-de-bord`
   - Affichage de l'inscription avec montant payé

### Test 4 : Paiement Annulé ⚠️
1. Valider le formulaire
2. Cliquer sur PayPal
3. **Fermer la fenêtre PayPal** (annuler)
4. **Résultat attendu** :
   - Message jaune : "⚠️ Paiement annulé. Vous pouvez modifier votre inscription et réessayer."
   - Section PayPal disparaît
   - Formulaire toujours rempli → possibilité de modifier et réessayer

### Test 5 : Montants Différents 💰
Tester avec chaque montant :
- **20€** (minimum)
- **60€**
- **80€**
- **120€** (total)

Vérifier que :
- PayPal affiche le bon montant : "Montant à régler : **XX€**"
- Backend vérifie le montant correct
- Registration créée avec `amountPaid: XX` et `amountRemaining: 120 - XX`

---

## 🔍 Vérifications Backend

### Logs Attendus (Backend Render)
```
💳 PayPal Client - Mode: SANDBOX
🔍 Vérification PayPal pour orderID: 8AB123456C789D0EF
📋 Résultat vérification: { verified: true, amount: 20, ... }
✅ Paiement vérifié
✅ Inscription créée avec succès
```

### Vérifier en Base de Données (MongoDB Atlas)
Collection `registrations` :
- `user` : ObjectId du nouvel utilisateur
- `amountPaid` : 20, 60, 80 ou 120
- `amountRemaining` : 120 - amountPaid
- `paymentMethod` : "paypal"
- `paypalTransactionId` : "8AB123456C789D0EF"
- `status` : "partial" (si <120€) ou "completed" (si 120€)

Collection `users` :
- `firstName`, `lastName`, `email`
- `password` : haché avec bcrypt
- `isEmailVerified` : `true` (auto-vérifié)
- `role` : "utilisateur"

Collection `consentlogs` :
- `user` : ObjectId
- `type` : "inscription"
- `given` : `true`
- `metadata.registrationId` : ObjectId de l'inscription
- `metadata.paypalMode` : "sandbox"
- `metadata.consentVersion` : "1.1"

---

## 📱 Mode PayPal

### Sandbox (Développement) 🧪
- Mode par défaut
- Aucun argent réel débité
- Comptes de test PayPal
- Badge bleu : **"🧪 Mode TEST (Sandbox) - Aucun argent réel ne sera débité"**

### Live (Production) 🔴
**⚠️ ATTENTION** : Si le mode est activé en production :
- Badge rouge : **"🔴 MODE PRODUCTION (Live) - PAIEMENTS RÉELS EN COURS"**
- Argent réel débité
- Ne pas utiliser de compte sandbox

Pour changer de mode :
```bash
# Vérifier le mode actuel
curl https://gj-camp-backend.onrender.com/api/settings | jq '.settings.paypalMode'

# Changer en production (ADMIN uniquement)
# → Aller sur /parametres-gj → Section PayPal → Sélectionner "Live"
```

---

## 🐛 Dépannage

### Problème : PayPal ne s'affiche pas
**Cause** : `REACT_APP_PAYPAL_CLIENT_ID` manquant
**Solution** :
```bash
# Vérifier frontend/.env
cat frontend/.env | grep PAYPAL
# Doit afficher : REACT_APP_PAYPAL_CLIENT_ID=AdT-LwZ...
```

### Problème : Erreur "Paiement non vérifié"
**Cause** : Backend ne peut pas contacter PayPal API
**Solution** :
1. Vérifier les credentials backend sur Render :
   - `PAYPAL_SANDBOX_CLIENT_ID`
   - `PAYPAL_SANDBOX_CLIENT_SECRET`
2. Vérifier les logs backend :
   ```
   curl https://gj-camp-backend.onrender.com/api/health
   ```

### Problème : "Montant incohérent"
**Cause** : Montant envoyé frontend ≠ montant vérifié PayPal
**Debug** :
1. Console frontend : vérifier `form.amountPaid`
2. Logs backend : comparer `claimed` vs `actual`

### Problème : Formulaire validé mais rien ne se passe
**Cause** : State `showPayPal` pas mis à jour
**Debug** :
1. Console frontend : vérifier `✅ Formulaire validé, affichage PayPal`
2. React DevTools : vérifier `showPayPal: true`

---

## 📊 Statistiques Attendues

Après plusieurs inscriptions de test :
- **Dashboard Admin** (`/dashboard/inscriptions`) : Liste des inscriptions avec montants
- **Gestion Paiements** (`/paiements/especes`) : Onglet "En ligne" → transactions PayPal
- **Statistiques** : Montant total collecté, moyenne par inscription

---

## 🎉 Résultat Final

✅ **Page d'inscription camp fonctionnelle** avec :
- Validation password strength
- Workflow 2 étapes (formulaire → PayPal)
- Paiement sécurisé via PayPal/Carte
- Vérification transaction backend
- Création inscription + compte automatique
- Redirection tableau de bord

🔥 **Bug critique résolu** :
- Avant : "route non trouvée" (backend attendait `paymentDetails.orderID`)
- Après : Paiement PayPal → orderID envoyé → inscription créée ✅

---

## 📝 Notes Importantes

1. **Mode Sandbox par défaut** : Aucun argent réel débité pendant les tests
2. **Comptes sandbox** : Créer sur https://developer.paypal.com/dashboard/accounts
3. **Credentials** : Ne JAMAIS commit les secrets PayPal dans Git
4. **Production** : Changer en mode "Live" uniquement quand prêt à accepter vrais paiements
5. **RGPD** : ConsentLog enregistre chaque inscription (Article 30)

---

**Date de création** : 3 février 2026  
**Version** : 0.1.1  
**Auteur** : GitHub Copilot  
**Status** : ✅ DÉPLOYÉ EN PRODUCTION
