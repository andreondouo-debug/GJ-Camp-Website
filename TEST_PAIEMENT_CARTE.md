# 💳 Guide de Test des Paiements par Carte Bancaire

## 🎯 Configuration Actuelle
✅ Mode: **SANDBOX** (test)  
✅ Client ID configuré  
✅ Composant PayPal prêt

## 📋 Étapes de Test

### 1. Démarrer l'Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 2. Accéder à la Page d'Inscription

1. Ouvrez http://localhost:3000
2. Connectez-vous avec un compte utilisateur
3. Allez sur **Inscription au Camp**
4. Remplissez le formulaire d'inscription

### 3. Tester le Paiement

#### Option A: Avec un Compte PayPal Sandbox

1. Cliquez sur le bouton PayPal
2. Une fenêtre popup PayPal s'ouvre
3. Connectez-vous avec un compte sandbox:
   - Email: Créé sur https://developer.paypal.com/dashboard
   - Password: Défini dans le dashboard
4. Validez le paiement

#### Option B: Avec une Carte de Test (Sans Compte PayPal)

1. Cliquez sur le bouton PayPal
2. Dans la popup, cliquez sur **"Payer par carte de crédit ou débit"**
3. Utilisez une de ces cartes de test:

**Visa (Paiement Réussi)** :
- Numéro: `4032039847809776`
- CVV: `123`
- Date d'expiration: `12/2028` (ou n'importe quelle date future)
- Nom: Votre nom
- Adresse de facturation: N'importe quelle adresse

**Mastercard (Paiement Réussi)** :
- Numéro: `5425233430109903`
- CVV: `123`
- Date d'expiration: `12/2028`

**American Express (Paiement Réussi)** :
- Numéro: `378282246310005`
- CVV: `1234` (4 chiffres pour Amex)
- Date d'expiration: `12/2028`

4. Validez le paiement

## 🔍 Vérifications Post-Paiement

### Dans les Logs du Backend

```bash
✅ Paiement réussi: { id: 'PAYID-...', status: 'COMPLETED', ... }
```

### Dans la Base de Données

```javascript
// La registration doit être mise à jour:
{
  status: 'partial' ou 'completed',
  amountPaid: 20 (ou montant payé),
  paymentMethod: 'paypal',
  paypalTransactionId: 'PAYID-...'
}
```

### Dans l'Interface

- Message de succès affiché
- Redirection vers le dashboard
- Inscription visible dans "Mes Inscriptions"

## 🧪 Scénarios de Test

### Test 1: Paiement Minimum (20€)
```
Montant: 20€
Résultat attendu: Registration créée avec status 'partial'
```

### Test 2: Paiement Complet (120€)
```
Montant: 120€
Résultat attendu: Registration créée avec status 'completed'
```

### Test 3: Paiement Partiel (60€)
```
Montant: 60€
Résultat attendu: Registration créée avec status 'partial'
Montant restant: 60€
```

### Test 4: Annulation du Paiement
```
Action: Cliquer sur "Annuler" dans la popup PayPal
Résultat attendu: Message d'annulation, formulaire reste disponible
```

## 🚨 Dépannage

### Problème: Boutons PayPal ne s'affichent pas

**Solution** :
1. Vérifiez que `REACT_APP_PAYPAL_CLIENT_ID` est dans `frontend/.env`
2. Redémarrez le serveur frontend
3. Videz le cache du navigateur (Cmd+Shift+R sur Mac)

### Problème: Erreur "Client ID non configuré"

**Solution** :
Créez `frontend/.env` avec:
```env
REACT_APP_PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
```

### Problème: Paiement non enregistré en BDD

**Vérifications** :
1. Vérifiez les logs backend pour les erreurs
2. Vérifiez que MongoDB est démarré
3. Vérifiez le endpoint `POST /api/registrations/confirm-payment`

## 📊 Cartes de Test Complètes

| Type | Numéro | CVV | Résultat |
|------|--------|-----|----------|
| Visa | 4032039847809776 | 123 | ✅ Succès |
| Visa | 4111111111111111 | 123 | ✅ Succès |
| Mastercard | 5425233430109903 | 123 | ✅ Succès |
| Mastercard | 5555555555554444 | 123 | ✅ Succès |
| Amex | 378282246310005 | 1234 | ✅ Succès |
| Visa | 4000000000000002 | 123 | ❌ Refusé |

## 🔗 Ressources

- Documentation PayPal Sandbox: https://developer.paypal.com/docs/api-basics/sandbox/
- Dashboard PayPal Developer: https://developer.paypal.com/dashboard
- Comptes de test: https://developer.paypal.com/dashboard/accounts

## ⚠️ Important

🔴 **Ces cartes ne fonctionnent QU'EN MODE SANDBOX**  
🔴 **En production, utilisez de vraies cartes ou PayPal**  
🔴 **Ne partagez JAMAIS vos vraies clés PayPal de production**
