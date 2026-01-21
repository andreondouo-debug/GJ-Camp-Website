# Synchronisation Automatique Redistributions ↔️ Inscriptions

## Vue d'ensemble
Système de synchronisation automatique garantissant que les redistributions (payouts) restent cohérentes avec les inscriptions au camp.

---

## 🔄 Synchronisation Automatique

### 1. Suppression d'Inscription

**Déclencheur**: `DELETE /api/registrations/:id`  
**Fichier**: `backend/src/controllers/registrationController.js` - `deleteRegistration()`

#### Logique de Synchronisation

```javascript
// Quand une inscription est supprimée:
1. Recherche tous les payouts associés à cette inscription
2. Applique une action selon le statut du payout:

   - Status "pending" ou "failed" → SUPPRESSION COMPLÈTE
     Raison: Payout pas encore traité, inutile de le garder
   
   - Status "success" → MARQUÉ COMME "cancelled"
     Raison: Argent déjà envoyé, garder trace pour comptabilité
     Message: "Inscription supprimée - payout annulé"
   
   - Status "processing" → MARQUÉ COMME "cancelled"  
     Raison: Traitement en cours PayPal, besoin de suivre
     Message: "Inscription supprimée pendant le traitement"

3. Log détaillé dans console
4. Retourne nombre de payouts affectés dans réponse
```

#### Exemple de Logs
```
🔄 2 payout(s) associé(s) trouvé(s)
🗑️ Payout supprimé: 65a7f3b2c... (pending)
⚠️ Payout réussi marqué comme annulé: 65a7f3c4d... (success)
✅ Inscription supprimée: Jean Dupont (ID: 65a7f3a1b...)
```

#### Réponse API
```json
{
  "message": "Inscription supprimée avec succès",
  "deletedRegistration": {
    "id": "65a7f3a1b...",
    "name": "Jean Dupont"
  },
  "payoutsAffected": 2
}
```

---

### 2. Modification de Paiement (Paiement Additionnel)

**Déclencheur**: `PUT /api/registrations/:id/additional-payment`  
**Fichier**: `backend/src/controllers/registrationController.js` - `addAdditionalPayment()`

#### Logique de Synchronisation

```javascript
// Quand un paiement additionnel est enregistré:
1. Vérifie le paiement PayPal (sécurité)
2. Met à jour l'inscription:
   - amountPaid += nouveauMontant
   - amountRemaining = 120 - amountPaid
   - paymentStatus = (remaining === 0) ? 'paid' : 'partial'

3. APPEL AUTOMATIQUE à payoutService.createPayoutForRegistration()
   - Si payout existe → Met à jour le montant
   - Si payout n'existe pas → Crée un nouveau payout
   
4. Recalcul automatique du montant à redistribuer:
   montantRedistribue = amountPaid * (redistributionPercentage / 100)
```

#### Service Payout (backend/src/services/payoutService.js)

**Méthode**: `createPayoutForRegistration(registrationId, processedBy)`

```javascript
Étapes:
1. Charge l'inscription depuis la BD
2. Récupère config du campus (ou crée si n'existe pas)
3. Calcule montant redistribution:
   amount = (amountPaid * redistributionPercentage) / 100

4. Cherche payout existant pour cette inscription
   
   SI EXISTE:
   - Met à jour amount, originalAmount, percentage
   - Met à jour recipientEmail si modifié
   - Met à jour note avec nouveau montant
   - Sauvegarde avec updatedAt = now
   - Log: "🔄 Payout mis à jour: X€ pour Campus"
   
   SI N'EXISTE PAS:
   - Crée nouveau Payout avec status 'pending'
   - Log: "✅ Payout créé: X€ pour Campus"

5. Retourne le payout (créé ou mis à jour)
```

#### Exemple de Logs
```
🔍 Tentative création payout pour registration._id: 65a7f3a1b...
🔄 Payout mis à jour: 80€ pour Lorient (80€ payés)
✅ Payout créé/mis à jour automatiquement pour redistribution
```

---

## 📊 Impact sur les Statistiques

### Calculs Automatiques

Les statistiques de la page redistribution sont recalculées en temps réel:

1. **Vue d'ensemble**
   - Total Redistribué = Somme de tous les payouts (tous statuts)
   - Succès = Payouts avec status 'success'
   - En attente = Payouts avec status 'pending'

2. **Par Campus**
   - Montant Total = Somme payouts du campus
   - Nombre Inscriptions = Count registrations avec ce refuge
   - Taux Redistribution = (Montant payé / Montant total) * 100

3. **Par Statut**
   - Groupement automatique par status
   - Count et somme pour chaque groupe

### Statistiques Toujours Cohérentes

✅ **Suppression inscription** → Stats recalculées (payout annulé exclu ou inclus selon statut)  
✅ **Paiement additionnel** → Montant redistribution augmente automatiquement  
✅ **Modification campus** → Percentage appliqué aux futurs payouts  

---

## 🔒 Garanties du Système

### 1. Intégrité des Données
- ✅ Pas de payout orphelin (sans inscription)
- ✅ Montants toujours cohérents avec amountPaid
- ✅ Historique préservé (previousOrderID dans paymentDetails)

### 2. Traçabilité
- ✅ Logs détaillés à chaque synchronisation
- ✅ ErrorMessage explique pourquoi payout annulé
- ✅ Notes dans payout indiquent inscription source

### 3. Sécurité
- ✅ Vérification PayPal obligatoire avant mise à jour
- ✅ Empêche réutilisation même orderID (duplicate check)
- ✅ TransactionLog créé pour chaque paiement

---

## 🎨 Affichage Responsive des Statistiques

### Améliorations CSS (PayoutManagement.css)

#### Grid Adaptatif
```css
/* Desktop: 3-4 colonnes selon contenu */
.stats-summary {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Tablette 1024px: 2 colonnes */
@media (max-width: 1024px) {
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile 768px: 1 colonne */
@media (max-width: 768px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }
}
```

#### Gestion du Débordement
```css
/* Empêche textes de dépasser */
.summary-value,
.stat-value-large,
.stat-label-small {
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Flex-wrap pour longs textes */
.stat-row {
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Tailles réduites sur tablette */
@media (max-width: 1024px) {
  .stat-count { font-size: 1.8rem; }  /* 2.5rem → 1.8rem */
  .stat-value-large { font-size: 1.1rem; }  /* 1.3rem → 1.1rem */
}
```

#### Problèmes Corrigés
- ❌ Montants qui dépassent les cartes → ✅ word-break automatique
- ❌ Grid qui casse sur tablette → ✅ 2 colonnes fixes
- ❌ Textes illisibles (trop petits) → ✅ Tailles adaptées
- ❌ Statistiques mal cadrées → ✅ Gap et padding cohérents

---

## 📋 Tests de Validation

### Scénario 1: Suppression Inscription
```bash
1. Créer inscription avec paiement 80€
2. Vérifier payout créé automatiquement (80€ * 100% = 80€)
3. Supprimer l'inscription
4. Vérifier:
   ✅ Inscription supprimée
   ✅ Payout marqué 'cancelled' (si was success) ou supprimé (si was pending)
   ✅ Response contient "payoutsAffected": 1
```

### Scénario 2: Paiement Additionnel
```bash
1. Créer inscription avec paiement 40€
2. Vérifier payout créé (40€ * 100% = 40€)
3. Ajouter paiement additionnel 40€
4. Vérifier:
   ✅ amountPaid = 80€
   ✅ Payout mis à jour (amount = 80€)
   ✅ Log "🔄 Payout mis à jour"
```

### Scénario 3: Campus Sans Email
```bash
1. Créer campus sans paypalEmail
2. Créer inscription pour ce campus
3. Vérifier:
   ✅ Payout créé avec recipientEmail vide
   ✅ Status reste 'pending'
   ✅ Lors de l'exécution → Status change en 'failed' avec message
```

### Scénario 4: Statistiques Responsive
```bash
1. Ouvrir page redistributions sur tablette (1024px)
2. Vérifier onglet "Statistiques":
   ✅ 2 colonnes sur grids
   ✅ Textes ne dépassent pas
   ✅ Montants lisibles
   ✅ Pas de scroll horizontal
```

---

## 🛠️ Maintenance

### Ajout d'un Nouveau Statut Payout

Si vous ajoutez un statut (ex: "refunded"):

1. **Modèle** (`backend/src/models/Payout.js`)
   ```javascript
   status: {
     enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded']
   }
   ```

2. **Synchronisation** (`registrationController.js - deleteRegistration`)
   ```javascript
   if (['pending', 'failed', 'cancelled', 'refunded'].includes(payout.status)) {
     await Payout.findByIdAndDelete(payout._id);
   }
   ```

3. **Frontend** (`PayoutManagementPage.js`)
   ```javascript
   const STATUS_LABELS = {
     // ... existants
     refunded: 'Remboursé'
   };
   ```

### Debug Synchronisation

Activer logs détaillés:
```javascript
// Dans payoutService.js
console.log('🔍 Payout check:', {
  registrationId,
  amountPaid: registration.amountPaid,
  percentage: campus.redistributionPercentage,
  calculatedAmount: amountToSend
});
```

---

## 📝 Changelog

### 2026-01-21 - Synchronisation Automatique
- ✅ Suppression inscription annule/supprime payouts
- ✅ Paiement additionnel met à jour payout
- ✅ Stats responsive avec word-break
- ✅ Documentation complète

---

## 🎯 Prochaines Améliorations

### Court terme
- [ ] Notification email admin quand payout annulé
- [ ] Dashboard avec graphiques évolution redistributions
- [ ] Export CSV des statistiques

### Moyen terme
- [ ] Webhook PayPal pour statut temps réel
- [ ] Réconciliation automatique mensuelle
- [ ] Rapport PDF téléchargeable

### Long terme
- [ ] Multi-devises (EUR, USD)
- [ ] Redistribution progressive (70% immédiat, 30% après camp)
- [ ] API publique pour campus (consulter leurs redistributions)

---

**Dernière mise à jour**: 21 janvier 2026  
**Version**: 1.0.0  
**Auteur**: GJ Camp Development Team
