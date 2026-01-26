# 🔐 Gestion Sandbox vs Live - Guide Complet

## 📋 Vue d'ensemble

Le système gère maintenant **automatiquement** la distinction entre les paiements de **test** (Sandbox) et les paiements **réels** (Live).

### 🎯 Objectif

- **Sandbox** : Pour tester le système sans argent réel
- **Live** : Pour accepter de vrais paiements PayPal
- **Cash** : Pour les paiements en espèces hors-ligne

---

## 🔍 Comment fonctionne le système ?

### 1️⃣ **Enregistrement du mode à l'inscription**

Quand un utilisateur s'inscrit au camp :

```javascript
// Backend enregistre automatiquement le mode PayPal actuel
const settings = await Settings.findOne();
const paypalMode = settings?.settings?.paypalMode || 'sandbox';

// Création de l'inscription avec le mode
const registration = new Registration({
  // ... autres champs
  paypalMode: paypalMode, // 'sandbox', 'live', ou 'cash'
  paymentDetails: {
    orderID: verification.orderID,
    isDevelopmentMode: verification.isDevelopmentMode
  }
});
```

### 2️⃣ **Champs enregistrés dans MongoDB**

Chaque inscription contient maintenant :

| Champ | Valeurs possibles | Description |
|-------|-------------------|-------------|
| `paypalMode` | `sandbox` | Paiement test PayPal |
| | `live` | Paiement réel PayPal |
| | `cash` | Paiement en espèces |
| `paymentDetails.isDevelopmentMode` | `true/false` | Vérification PayPal |
| `amountPaid` | `0-120€` | Montant réellement payé |

### 3️⃣ **Filtrage dans le Dashboard Admin**

Dans `/tableau-de-bord-inscriptions`, les responsables peuvent :

✅ **Filtrer par mode de paiement** :
- 🧪 **Sandbox (Test)** : Toutes les inscriptions avec paiements fictifs
- 🔴 **Live (Réel)** : Toutes les inscriptions avec argent réel
- 💵 **Espèces** : Paiements en liquide

✅ **Identifier visuellement** :
- Badge bleu `🧪 Test` pour sandbox
- Badge rouge `🔴 Réel` pour live
- Badge vert `💵 Espèces` pour cash

---

## 🛠️ Scénarios d'utilisation

### 🧪 **SCENARIO 1 : Phase de TEST (avant lancement)**

**Situation** : Vous voulez tester le système sans argent réel.

#### Étapes :

1. **Vérifier le mode actuel** :
   - Aller sur `/parametres`
   - Section "💳 Paiements"
   - Vérifier que **SANDBOX** est actif

2. **Faire des inscriptions de test** :
   - Utiliser la carte de test : `4032039847809776`
   - Toutes ces inscriptions auront `paypalMode: 'sandbox'`

3. **Vérifier dans le dashboard** :
   ```
   /tableau-de-bord-inscriptions
   → Filtre "💳 Mode Paiement" → "🧪 Sandbox (Test)"
   ```

4. **Résultat** :
   - ✅ Aucun argent réel n'est débité
   - ✅ Les inscriptions sont clairement identifiées comme "Test"
   - ✅ Vous pouvez supprimer ces inscriptions sans impact

---

### 🔴 **SCENARIO 2 : Passage en PRODUCTION**

**Situation** : Vous êtes prêt à accepter de vrais paiements.

#### Étapes :

1. **Activer le mode LIVE** :
   - Aller sur `/parametres`
   - Section "💳 Paiements"
   - Cliquer sur le bouton **🔴 LIVE**
   - Cliquer sur "Enregistrer les paramètres"

2. **Vérifier l'alerte** :
   ```
   ⚠️ ATTENTION: Mode PRODUCTION
   Les vrais paiements seront effectués !
   Les paiements seront débités des comptes des utilisateurs.
   ```

3. **Nouvelles inscriptions** :
   - Toutes les inscriptions créées **après activation** auront `paypalMode: 'live'`
   - Les anciennes inscriptions en sandbox **restent** identifiées comme test

4. **Filtrer les vraies inscriptions** :
   ```
   /tableau-de-bord-inscriptions
   → Filtre "💳 Mode Paiement" → "🔴 Live (Réel)"
   ```

---

### 💵 **SCENARIO 3 : Paiements en ESPÈCES**

**Situation** : Un utilisateur veut payer en liquide.

#### Fonctionnement :

1. **Lors de l'inscription** :
   - L'utilisateur choisit "💵 Espèces" comme mode de paiement
   - Le système enregistre automatiquement `paypalMode: 'cash'`

2. **Badge affiché** :
   - Badge vert `💵 Espèces` dans le dashboard

3. **Validation par responsable** :
   - Le responsable valide le paiement cash dans `/gestion-paiements-especes`
   - L'inscription reste identifiée comme "cash"

---

## 📊 **Analyse des inscriptions**

### ✅ **Identifier les vraies inscriptions payées**

Pour calculer le **revenu réel** :

```javascript
// Dans le dashboard, filtrer :
Mode Paiement : 🔴 Live (Réel)
Statut : Payées

// Exemple :
Total inscriptions Live payées : 50
Montant total encaissé : 50 × 120€ = 6 000€
```

### ⚠️ **Nettoyer les inscriptions de test**

Avant le lancement officiel :

1. Aller sur `/tableau-de-bord-inscriptions`
2. Filtre "💳 Mode Paiement" → "🧪 Sandbox (Test)"
3. Supprimer toutes les inscriptions test
4. Activer le mode **LIVE**
5. Communiquer le lancement officiel

---

## 🔄 **Migration d'inscriptions existantes**

### Problème :
Les inscriptions créées **avant** l'ajout du champ `paypalMode` n'ont pas cette information.

### Solution :
Elles afficheront `⚠️ N/A` dans le dashboard.

### Script de migration (optionnel) :

```javascript
// Exécuter dans MongoDB Atlas ou local
db.registrations.updateMany(
  { paypalMode: { $exists: false } },
  { $set: { paypalMode: 'sandbox' } } // Marquer anciennes inscriptions comme test
);
```

---

## 📌 **Checklist de lancement en production**

### ✅ **Avant d'activer LIVE** :

- [ ] Credentials PayPal Live configurés sur Vercel (frontend)
- [ ] Credentials PayPal Live configurés sur Render (backend)
- [ ] Mode Sandbox testé avec succès (carte test)
- [ ] Dashboard affiche correctement les inscriptions test
- [ ] Email de confirmation fonctionne
- [ ] Toutes les inscriptions de test supprimées ou clairement identifiées

### ✅ **Activation du mode LIVE** :

- [ ] Aller sur `/parametres` (connexion admin)
- [ ] Section "💳 Paiements"
- [ ] Cliquer sur **🔴 LIVE**
- [ ] Enregistrer les paramètres
- [ ] Vérifier que le badge "🔴 Mode PRODUCTION" s'affiche sur la page d'inscription

### ✅ **Test de paiement réel** :

- [ ] Faire UNE inscription test avec une vraie carte (montant minimum : 20€)
- [ ] Vérifier que PayPal débite bien le compte
- [ ] Vérifier que l'inscription apparaît avec badge `🔴 Réel` dans le dashboard
- [ ] Vérifier l'email de confirmation
- [ ] Rembourser l'inscription test si nécessaire

### ✅ **Monitoring après lancement** :

- [ ] Vérifier quotidiennement le dashboard (filtrer sur "Live")
- [ ] Surveiller les erreurs dans les logs backend
- [ ] Vérifier la cohérence entre PayPal Dashboard et MongoDB
- [ ] Répondre rapidement aux emails des utilisateurs

---

## 🚨 **Problèmes courants et solutions**

### ❌ **"Toutes mes inscriptions sont en sandbox alors que j'ai activé Live"**

**Cause** : Le mode Live n'était pas activé **au moment de l'inscription**.

**Solution** :
- Vérifier dans `/parametres` que le mode **LIVE** est bien actif
- Les inscriptions déjà créées gardent le mode du moment de création
- Seules les **nouvelles** inscriptions auront le mode actuel

---

### ❌ **"Je veux changer le mode d'une inscription"**

**Problème** : Une inscription a été créée en sandbox alors qu'elle devrait être en live.

**Solution manuelle** (via MongoDB) :

```javascript
db.registrations.updateOne(
  { _id: ObjectId("ID_INSCRIPTION") },
  { $set: { paypalMode: 'live' } }
);
```

⚠️ **Attention** : Cela ne change pas le fait que l'argent n'a pas été réellement débité !

---

### ❌ **"Badge N/A affiché pour anciennes inscriptions"**

**Cause** : Inscriptions créées avant l'ajout du champ `paypalMode`.

**Solution** :
- Option 1 : Laisser tel quel (inscriptions anciennes identifiables)
- Option 2 : Exécuter le script de migration ci-dessus
- Option 3 : Supprimer ces anciennes inscriptions si elles sont de test

---

## 📈 **Statistiques recommandées**

### Dashboard personnalisé (à créer) :

```javascript
// Exemple de requêtes utiles :

// 1. Nombre d'inscriptions Live payées
db.registrations.countDocuments({ 
  paypalMode: 'live', 
  paymentStatus: 'paid' 
});

// 2. Revenu réel total
db.registrations.aggregate([
  { $match: { paypalMode: 'live' } },
  { $group: { _id: null, total: { $sum: '$amountPaid' } } }
]);

// 3. Inscriptions en espèces en attente
db.registrations.countDocuments({
  paypalMode: 'cash',
  'cashPayments.status': 'pending'
});
```

---

## 🎓 **Résumé rapide**

| Mode | Usage | Badge | Argent réel ? |
|------|-------|-------|---------------|
| 🧪 **Sandbox** | Phase de test | Badge bleu `🧪 Test` | ❌ Non (fictif) |
| 🔴 **Live** | Production | Badge rouge `🔴 Réel` | ✅ Oui (PayPal) |
| 💵 **Cash** | Espèces | Badge vert `💵 Espèces` | ✅ Oui (liquide) |

---

## 📞 **Support**

En cas de problème :

1. Vérifier les logs backend sur Render
2. Vérifier le dashboard PayPal (https://www.paypal.com)
3. Consulter les inscriptions dans `/tableau-de-bord-inscriptions`
4. Filtrer par mode pour identifier les problèmes

---

**✅ Le système est maintenant prêt à gérer de vrais paiements en toute sécurité !**
