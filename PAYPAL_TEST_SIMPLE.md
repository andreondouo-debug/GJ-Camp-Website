# 🎯 Alternative Simple - Compte PayPal Sandbox

## Problème Actuel
Le formulaire de carte bancaire PayPal est trop long à remplir pour les tests.

## ✅ Solution Recommandée : Compte PayPal Sandbox

### Étape 1 : Créer un Compte Acheteur Sandbox

1. Allez sur : https://developer.paypal.com/dashboard/accounts
2. Connectez-vous avec votre compte PayPal principal
3. Cliquez sur **"Create Account"**
4. Sélectionnez :
   - Type : **Personal** (acheteur)
   - Country : France
   - Email : Généré automatiquement (ex: `sb-test123@personal.example.com`)
   - Password : Créez un mot de passe simple (ex: `Test1234`)

5. Cliquez sur **"Create"**

### Étape 2 : Tester avec ce Compte

1. Sur votre site, cliquez sur le bouton PayPal
2. Dans la popup, **connectez-vous avec le compte sandbox** :
   - Email : `sb-xxxxx@personal.example.com` (celui créé)
   - Password : `Test1234` (votre mot de passe)
3. Cliquez sur **"Continuer"**
4. Validez le paiement en **1 clic** ✅

**Avantage** : Pas de formulaire à remplir !

---

## 🔧 Alternative 2 : Mode "Guest Checkout" Simplifié

Si vous voulez vraiment tester avec carte, voici le **strict minimum** accepté :

### Carte
```
4032039847809776
123
12/2028
```

### Données Minimales
```
Prénom: Test
Nom: User
Email: test@test.com
Adresse: 1 rue
Ville: Paris
CP: 75001
Téléphone: 0000000000
```

**Astuce** : Tapez `Tab` entre chaque champ pour aller plus vite.

---

## 🎯 Quelle Solution Préférez-vous ?

1. **Créer un compte sandbox** (1 fois, puis tests rapides)
2. **Garder la carte** (remplir à chaque fois)
3. **Créer une page de test ultra-simplifiée** (je peux la faire)

Dites-moi ce qui vous convient le mieux !
