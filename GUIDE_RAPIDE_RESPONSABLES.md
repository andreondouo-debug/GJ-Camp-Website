# 🚀 Guide Rapide - Gestion des Responsables de Campus

## Pour les Administrateurs

### 1️⃣ Affecter un Responsable à un Campus

1. **Connectez-vous** avec un compte admin
2. **Accédez au menu**: Gestion → **Campus & Responsables**
3. **Sélectionnez le campus** (ex: Lorient, Laval, Amiens, Nantes, Autres)
4. Dans la section "Responsable des Paiements en Espèces":
   - **Sélectionnez un utilisateur** dans la liste déroulante
   - Seuls les utilisateurs avec rôle `referent`, `responsable` ou `admin` apparaissent
5. **Validation automatique** - Le responsable est immédiatement affecté
6. **Confirmation** - Message vert de succès apparaît

### 2️⃣ Retirer un Responsable

1. Accédez à `/gestion/campus`
2. Trouvez le campus avec le responsable à retirer
3. Cliquez sur le bouton **"❌ Retirer"**
4. Le responsable perd immédiatement l'accès aux validations de ce campus

### 3️⃣ Vérifier les Affectations

**Informations affichées pour chaque campus**:
- 👤 Nom et rôle du responsable actuel
- 📧 Email de contact
- 📱 Numéro de téléphone (si renseigné)
- ✅/❌ Statut du campus (Actif/Inactif)
- 💰 Pourcentage de redistribution
- 📧 Email PayPal et IBAN

## Pour les Responsables de Campus (Referents)

### Accès aux Paiements en Espèces

**Avant affectation**:
- ❌ Pas d'accès à `/gestion/paiements-especes`
- Message d'erreur: "Vous devez être responsable d'un campus..."

**Après affectation**:
- ✅ Accès à `/gestion/paiements-especes`
- 🎯 **Vue filtrée** - Vous voyez UNIQUEMENT les paiements de votre campus
- 🔔 Badge de notification dans le Header avec nombre de paiements en attente

### Valider un Paiement en Espèces

1. **Menu**: Gestion → **Paiements espèces**
2. **Onglet "En attente"** - Liste des paiements non traités de votre campus
3. **Vérifier les informations**:
   - Nom du participant
   - Email
   - Campus (refuge)
   - Montant déclaré
4. **Actions possibles**:
   - ✅ **Valider** → Confirme le paiement, met à jour l'inscription
   - ❌ **Rejeter** → Refuse le paiement (indiquer raison)
   - ✏️ **Modifier montant** → Ajuster avant validation si nécessaire
5. **Confirmation** → Email automatique envoyé au participant

### Restrictions

⚠️ Vous ne pouvez valider **QUE** les paiements de votre/vos campus affecté(s)

**Exemple**:
- Vous êtes responsable de **Lorient**
- Tentative de validation d'un paiement **Nantes**
- ❌ Erreur 403: "Vous n'êtes pas autorisé..."

## Questions Fréquentes (FAQ)

### Q: Un utilisateur peut-il être responsable de plusieurs campus ?
**R**: ✅ Oui ! Un referent peut être affecté à plusieurs campus simultanément.

### Q: Que se passe-t-il si aucun responsable n'est affecté à un campus ?
**R**: Seuls les utilisateurs avec rôle `responsable` ou `admin` peuvent valider les paiements de ce campus.

### Q: Un responsable peut-il valider ses propres paiements ?
**R**: ✅ Oui, si son inscription est sur le campus dont il est responsable.

### Q: Comment savoir si je suis responsable d'un campus ?
**R**: 
- Accédez à `/gestion/campus` (si vous avez le rôle approprié)
- Ou tentez d'accéder à `/gestion/paiements-especes`
- Vérifiez les paiements affichés (filtrés par vos campus)

### Q: Puis-je voir les statistiques de tous les campus ?
**R**: 
- **Admin/Responsable**: ✅ Oui, tous les campus
- **Referent affecté**: ❌ Non, uniquement vos campus

### Q: Que se passe-t-il si je suis retiré d'un campus ?
**R**: Vous perdez immédiatement l'accès aux paiements de ce campus. Vos validations passées restent enregistrées.

## Rôles et Permissions

| Action | Utilisateur | Referent (non affecté) | Referent (affecté) | Responsable | Admin |
|--------|-------------|------------------------|-------------------|-------------|-------|
| Voir paiements espèces | ❌ | ❌ | ✅ (son campus) | ✅ (tous) | ✅ (tous) |
| Valider paiement | ❌ | ❌ | ✅ (son campus) | ✅ (tous) | ✅ (tous) |
| Rejeter paiement | ❌ | ❌ | ✅ (son campus) | ✅ (tous) | ✅ (tous) |
| Affecter responsable | ❌ | ❌ | ❌ | ❌ | ✅ |
| Retirer responsable | ❌ | ❌ | ❌ | ❌ | ✅ |
| Voir tous les campus | ❌ | ❌ | ❌ | ✅ | ✅ |

## Exemples Pratiques

### Scénario 1: Premier Déploiement

**Étape 1** - Admin configure les responsables:
```
Campus Lorient → Jean Dupont (referent)
Campus Laval → Marie Martin (referent)
Campus Amiens → Pierre Durand (referent)
Campus Nantes → Sophie Lefebvre (referent)
Campus Autres → Admin (par défaut)
```

**Étape 2** - Jean (Lorient) se connecte:
- Voit 3 paiements en attente dans le badge Header
- Accède à `/gestion/paiements-especes`
- Ne voit QUE les paiements du campus Lorient
- Valide 2 paiements, rejette 1

**Étape 3** - Admin vérifie:
- Accède à `/gestion/paiements-especes`
- Voit TOUS les paiements de TOUS les campus
- Peut intervenir si nécessaire

### Scénario 2: Changement de Responsable

**Situation**: Jean part en vacances, besoin de remplaçant

1. **Admin** retire Jean du campus Lorient
2. **Admin** affecte Thomas au campus Lorient
3. **Jean** perd l'accès aux paiements Lorient
4. **Thomas** peut maintenant valider les paiements Lorient
5. Les validations passées de Jean restent enregistrées

### Scénario 3: Campus Sans Responsable

**Situation**: Campus "Autres" n'a pas de responsable affecté

1. **Paiement soumis** pour campus "Autres"
2. **Seuls les admins/responsables** peuvent valider
3. **Referents non-affectés** reçoivent erreur 403
4. **Solution**: Admin affecte un responsable au campus "Autres"

## Support et Dépannage

### Message d'Erreur: "Vous devez être responsable d'un campus..."
**Cause**: Vous êtes referent mais non affecté à un campus  
**Solution**: Contactez un administrateur pour vous affecter à un campus

### Message d'Erreur: "Vous n'êtes pas autorisé à valider les paiements pour le campus X"
**Cause**: Tentative de validation d'un paiement hors de votre campus  
**Solution**: Contactez le responsable du campus X ou un admin

### Je ne vois aucun paiement dans "/gestion/paiements-especes"
**Causes possibles**:
1. Aucun paiement en attente pour votre campus
2. Vous n'êtes pas affecté à un campus (referent)
3. Problème de connexion à la base de données

**Solutions**:
1. Vérifiez l'onglet "Validés" et "Rejetés"
2. Contactez admin pour vérification affectation
3. Actualisez la page (bouton 🔄)

## Contact

**Pour les problèmes techniques**:
- Administrateur système: admin@gjsdecrpt.fr

**Pour les questions d'affectation**:
- Contactez un administrateur de la plateforme

---

**Version**: 1.0  
**Date**: 6 février 2026  
**Dernière mise à jour**: 6 février 2026
