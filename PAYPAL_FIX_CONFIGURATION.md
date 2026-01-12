# 🔧 Configuration PayPal Production - Instructions

## ✅ Problème Identifié

Le paiement PayPal ne passait pas car les **credentials PayPal n'étaient pas configurés** :
- ❌ `PAYPAL_CLIENT_ID` manquant dans backend/.env
- ❌ `PAYPAL_CLIENT_SECRET` manquant dans backend/.env  
- ❌ `REACT_APP_PAYPAL_CLIENT_ID` manquant dans frontend/.env

## 📊 Tests Effectués

```bash
./test-paypal-complet.sh
```

**Résultats** : ✅ Tous les tests passent
- ✅ Variables backend configurées
- ✅ Variables frontend configurées
- ✅ Connexion PayPal API réussie (token obtenu)
- ✅ Code backend complet (verifyPayment)
- ✅ Code frontend complet (PayPalButton)

## 🚀 Configuration Production (URGENT)

### 1. Backend Render

Aller sur [Render Dashboard](https://dashboard.render.com) → Service **gj-camp-website-1** → **Environment**

**Ajouter ces variables** :

```env
PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
PAYPAL_CLIENT_SECRET=EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV
```

→ Cliquer sur **Save Changes** → Le backend va redémarrer automatiquement

### 2. Frontend Vercel

Aller sur [Vercel Dashboard](https://vercel.com/dashboard) → Projet **gj-camp-website** → **Settings** → **Environment Variables**

**Ajouter** :

```env
Name: REACT_APP_PAYPAL_CLIENT_ID
Value: AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
Environment: Production, Preview, Development (cocher les 3)
```

→ Cliquer sur **Save**
→ Aller dans l'onglet **Deployments**
→ Cliquer sur les 3 points (...) du dernier déploiement
→ **Redeploy**

## 🧪 Test Après Déploiement

1. Attendre 5 minutes (redéploiement)
2. Aller sur https://www.gjsdecrpt.fr
3. Se connecter avec ton compte
4. Aller sur "Inscription Camp"
5. Remplir le formulaire
6. Choisir montant (ex: 20€)
7. Cliquer "Valider mon inscription"
8. Le bouton PayPal doit apparaître
9. Cliquer sur le bouton PayPal
10. Connexion avec compte Sandbox PayPal

### Comptes Test Sandbox

Tu peux créer des comptes test sur [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)

Ou utiliser :
- Email : sb-xxxxx@personal.example.com (voir ton dashboard PayPal)
- Mot de passe : (défini dans PayPal Developer)

## 🔍 Debugging

### Si le bouton PayPal ne s'affiche pas

**Console navigateur (F12)** :
```
❌ Client ID PayPal non configuré
```
→ Vérifier que `REACT_APP_PAYPAL_CLIENT_ID` est bien sur Vercel

### Si erreur "Paiement non validé"

**Logs backend Render** :
```
❌ Paiement non vérifié: ...
```

Vérifier :
1. `PAYPAL_CLIENT_SECRET` est bien configuré sur Render
2. Le orderID est bien envoyé depuis le frontend
3. Les logs du backend montrent : `✅ Paiement PayPal vérifié`

### Si "Credentials manquants"

Backend renvoie :
```json
{
  "message": "❌ Détails de paiement PayPal manquants"
}
```

→ Vérifier que `handlePaymentSuccess` envoie bien :
```javascript
paymentDetails: {
  orderID: details.id,
  payerID: details.payer.payer_id,
  payerEmail: details.payer.email_address,
  status: details.status,
  amountPaid: form.amountPaid
}
```

## 📝 Workflow Complet Fonctionnel

### Frontend

1. Utilisateur clique "Valider mon inscription"
2. Formulaire validé → `setShowPayPal(true)`
3. `<PayPalButton>` s'affiche
4. PayPal SDK charge avec `REACT_APP_PAYPAL_CLIENT_ID`
5. `createOrder()` → Crée l'order PayPal (20-120€)
6. Utilisateur authentifie sur PayPal
7. `onApprove()` → `actions.order.capture()` → Récupère `details`
8. `handlePaymentSuccess(details)` appelé

### Backend

9. `POST /api/registration` reçoit :
   - Données formulaire
   - `paymentDetails.orderID`
10. `paypalService.verifyPayment(orderID)` :
    - Obtient token avec `clientId` + `clientSecret`
    - Appelle `GET /v2/checkout/orders/{orderID}`
    - Vérifie status = "COMPLETED"
    - Vérifie montant correspond
11. Si OK → Créer `Registration` avec `paymentStatus: 'partial'` ou `'paid'`
12. Logger dans `TransactionLog`
13. Envoyer email confirmation
14. Créer payout pour redistribution

## ✅ Solution au Problème

**Avant** :
```
❌ PAYPAL_CLIENT_SECRET manquant
→ Mode dégradé activé (isDevelopmentMode: true)
→ Paiement accepté sans vérification
→ "Formulaire validé mais paiement non validé"
```

**Après** :
```
✅ PAYPAL_CLIENT_ID configuré
✅ PAYPAL_CLIENT_SECRET configuré
→ Vérification réelle auprès de PayPal
→ Paiement vérifié et enregistré
→ "Paiement réussi ! Inscription enregistrée"
```

## 🎯 Prochaines Étapes

Après que les variables soient configurées sur Render et Vercel :

1. ✅ Tester paiement 20€ (minimum)
2. ✅ Tester paiement 120€ (total)
3. ✅ Vérifier email de confirmation reçu
4. ✅ Vérifier dans dashboard que l'inscription apparaît
5. ✅ Vérifier status `partial` ou `paid` correct

Une fois validé en Sandbox → Passer en **mode Production** :
- Obtenir Client ID Production sur PayPal
- Remplacer les credentials Sandbox par Production
- Tester avec vraie carte bancaire (1€ de test)
