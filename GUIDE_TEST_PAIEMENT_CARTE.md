# 💳 Guide de Test - Paiement par Carte Bancaire (Mode Sandbox)

## 🎯 Objectif

Tester les paiements par **carte bancaire** (sans compte PayPal) en mode **Sandbox** (test).

---

## ✅ Étape 1 : Vérifier que le mode Sandbox est activé

1. Aller sur https://gjsdecrpt.fr/parametres
2. Cliquer sur l'onglet **"💳 Paiements"**
3. Vérifier que **🧪 SANDBOX** est sélectionné
4. Si ce n'est pas le cas, cliquer sur "Sandbox" puis "Enregistrer"
5. **La page se recharge automatiquement**

---

## 💳 Étape 2 : Cartes de test PayPal Sandbox

PayPal fournit des **cartes de test** qui fonctionnent uniquement en mode Sandbox.

### 🔵 Cartes Visa (Test)

| Numéro de carte | Date d'expiration | CVV | Résultat attendu |
|-----------------|-------------------|-----|------------------|
| **4032031916506424** | 01/2028 | 123 | ✅ Paiement réussi (RECOMMANDÉ) |
| **4111111111111111** | 01/2028 | 123 | ✅ Paiement réussi |
| **4005519200000004** | 01/2028 | 123 | ✅ Paiement réussi |
| **4000056655665556** | 01/2028 | 123 | ⚠️ 3D Secure requis |

### 🟢 Cartes Mastercard (Test)

| Numéro de carte | Date d'expiration | CVV | Résultat attendu |
|-----------------|-------------------|-----|------------------|
| **5555555555554444** | 01/2028 | 123 | ✅ Paiement réussi (RECOMMANDÉ) |
| **5105105105105100** | 01/2028 | 123 | ✅ Paiement réussi |
| **2223000048410010** | 01/2028 | 123 | ✅ Paiement réussi |

### 🔴 Cartes pour tester les ERREURS

| Numéro de carte | Date d'expiration | CVV | Résultat attendu |
|-----------------|-------------------|-----|------------------|
| **4000000000000002** | 01/2028 | 123 | ❌ Carte refusée (fonds insuffisants) |
| **4000000000000010** | 01/2028 | 123 | ❌ CVV invalide |
| **4000000000000028** | 01/2028 | 123 | ❌ Carte expirée |

---

## 🧪 Étape 3 : Procédure de test complète

### 1️⃣ Démarrer une inscription

1. Se connecter sur https://gjsdecrpt.fr
2. Aller sur https://gjsdecrpt.fr/inscription
3. Remplir le formulaire d'inscription
4. Sélectionner un montant (par exemple **20€** ou **120€**)
5. Cliquer sur **"✅ Valider mon inscription"**

### 2️⃣ Interface PayPal s'affiche

Vous devriez voir :

```
╔═══════════════════════════════════════════════════╗
║ 🧪 Mode TEST (Sandbox)                            ║
║    Aucun argent réel ne sera débité               ║
╚═══════════════════════════════════════════════════╝
```

**Deux boutons** apparaissent :
- **Bouton bleu "PayPal"** → Pour payer avec un compte PayPal test
- **Bouton gris "Carte de crédit ou de débit"** → **CLIQUEZ ICI** pour payer par carte

### 3️⃣ Remplir le formulaire de carte

Une popup PayPal s'ouvre avec le formulaire de carte :

**Informations à remplir** :

```
┌─────────────────────────────────────────────────┐
│ Numéro de carte                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 4032031916506424                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Date d'expiration                    CVV        │
│ ┌──────────┐ ┌──────────┐   ┌──────────────┐   │
│ │ 01       │ │ 2028     │   │ 123          │   │
│ └──────────┘ └──────────┘   └──────────────┘   │
│                                                  │
│ Nom sur la carte                                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Jean Dupont                                 │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Adresse de facturation                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 123 Rue de Test                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ Ville                    Code postal            │
│ ┌──────────┐            ┌──────────────┐       │
│ │ Paris    │            │ 75001        │       │
│ └──────────┘            └──────────────┘       │
│                                                  │
│        [ Payer maintenant ]                     │
└─────────────────────────────────────────────────┘
```

**Valeurs de test recommandées** :
- **Carte** : `4032031916506424` (Visa) ou `5555555555554444` (Mastercard)
- **Expiration** : `01/2028`
- **CVV** : `123`
- **Nom** : `Jean Test`
- **Adresse** : `123 Rue Test`
- **Ville** : `Paris`
- **Code postal** : `75001`
- **Pays** : France

### 4️⃣ Valider le paiement

Cliquer sur **"Payer maintenant"** ou **"Pay Now"**

**Résultat attendu** :
```
✅ Paiement réussi !
Inscription au camp enregistrée avec succès !
```

### 5️⃣ Vérifier dans le dashboard

1. Aller sur https://gjsdecrpt.fr/tableau-de-bord
2. Vérifier que l'inscription apparaît
3. Vérifier que le badge **🧪 Test** est présent dans la colonne "💳 Mode"
4. Graphique camembert doit afficher la répartition

---

## 🔍 Vérification dans le dashboard admin

1. Aller sur https://gjsdecrpt.fr/tableau-de-bord-inscriptions
2. Trouver votre inscription
3. Vérifier :
   - ✅ Statut : **Payé** (si 120€) ou **Partiel** (si moins)
   - ✅ Mode : Badge **🧪 Test**
   - ✅ Montant payé : Le montant que vous avez saisi
   - ✅ Reste à payer : 120€ - montant payé

---

## 🚫 Tester un refus de paiement

Pour tester que le système gère bien les erreurs :

1. Utiliser la carte **4000000000000002** (fonds insuffisants)
2. Remplir le formulaire
3. Cliquer sur "Payer"

**Résultat attendu** :
```
❌ Erreur lors du paiement
La carte a été refusée par votre banque
```

L'inscription **ne doit PAS être créée** si le paiement échoue.

---

## 💡 Notes importantes

### ⚠️ Ces cartes ne fonctionnent QU'EN MODE SANDBOX

- **En mode Live** (production), ces cartes seront refusées
- Elles sont uniquement pour les tests
- Aucun argent réel n'est débité ou transféré

### 🔒 Sécurité

- Les cartes de test ne peuvent pas être utilisées sur de vrais sites
- Les données sont fictives
- PayPal Sandbox est complètement isolé de l'environnement de production

### 📊 Traçabilité

Chaque paiement test est enregistré avec :
- `paypalMode: 'sandbox'`
- Badge **🧪 Test** visible dans les dashboards
- TransactionLog avec `isDevelopmentMode: true`

---

## 🎯 Checklist de test complète

- [ ] Mode Sandbox activé dans `/parametres`
- [ ] Badge "🧪 Mode TEST" visible sur la page d'inscription
- [ ] Bouton "Carte de crédit ou de débit" cliquable
- [ ] Formulaire de carte s'affiche dans popup PayPal
- [ ] Carte test acceptée (4032031916506424 ou 5555555555554444)
- [ ] Paiement validé avec message de succès
- [ ] Inscription visible dans dashboard utilisateur
- [ ] Badge 🧪 Test visible dans dashboard admin
- [ ] Graphique camembert s'affiche correctement
- [ ] Carte refusée testée (4000 0000 0000 0002)
- [ ] Inscription non créée si paiement échoué

---

## 🆘 Dépannage

### Le bouton "Carte" n'apparaît pas

**Solution** : Vider le cache navigateur (Ctrl+Shift+Delete) et recharger la page

### Erreur "Invalid credentials"

**Solution** : Vérifier que le mode Sandbox est bien activé dans `/parametres`

### La carte de test est refusée

**Vérifications** :
1. Numéro de carte exact : `4032031916506424` ou `5555555555554444` (SANS espaces)
2. Date d'expiration future : `01/2028`
3. CVV : `123`
4. Mode Sandbox activé

### L'inscription n'apparaît pas dans le dashboard

**Vérifications** :
1. Regarder dans la console navigateur (F12) pour les erreurs
2. Vérifier que le paiement a bien été validé
3. Recharger la page du dashboard (F5)

---

## 📚 Ressources PayPal

- **Documentation officielle** : https://developer.paypal.com/tools/sandbox/card-testing/
- **Tableau de bord Sandbox** : https://www.sandbox.paypal.com
- **Créer compte test** : https://developer.paypal.com/dashboard/accounts

---

**Créé le** : 26 janvier 2026  
**Mis à jour** : 26 janvier 2026  
**Version** : 1.0
