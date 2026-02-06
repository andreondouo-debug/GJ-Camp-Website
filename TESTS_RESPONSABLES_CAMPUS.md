# 🧪 Guide de Test - Gestion Responsables Campus

## Prérequis

- Backend lancé sur `http://localhost:5000`
- Frontend lancé sur `http://localhost:3000`
- Base de données MongoDB connectée
- Au moins 3 utilisateurs avec rôles différents:
  - 1 admin
  - 1 responsable
  - 2 referents

---

## Test 1: Affectation d'un Responsable ✅

### Objectif
Vérifier qu'un admin peut affecter un responsable à un campus

### Étapes
1. **Se connecter** en tant qu'admin
2. **Accéder** à `/gestion/campus`
3. **Vérifier** que tous les campus sont affichés (Lorient, Laval, Amiens, Nantes, Autres)
4. **Sélectionner** un campus (ex: Lorient)
5. Dans la liste déroulante "Affecter un responsable":
   - **Vérifier** que seuls les utilisateurs avec rôle referent/responsable/admin apparaissent
   - **Sélectionner** un referent (ex: Jean Dupont)
6. **Vérifier** message de succès: "✅ Jean Dupont affecté(e) comme responsable du campus Lorient"
7. **Vérifier** affichage du responsable actuel avec ses informations

### Résultat Attendu
- ✅ Responsable affiché avec nom, rôle, email, téléphone
- ✅ Message de succès vert
- ✅ Bouton "Retirer" visible

### Commande API Équivalente
```bash
curl -X PATCH http://localhost:5000/api/campus/Lorient/responsable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"userId": "64abc123..."}'
```

---

## Test 2: Filtrage des Paiements par Campus ✅

### Objectif
Vérifier qu'un referent affecté voit uniquement les paiements de son campus

### Étapes Préparatoires
1. **Créer 3 inscriptions** avec paiement espèces:
   - Inscription A → Campus Lorient → 50€
   - Inscription B → Campus Laval → 60€
   - Inscription C → Campus Lorient → 70€
2. **Affecter** Jean (referent) au campus Lorient
3. **Affecter** Marie (referent) au campus Laval

### Test avec Jean (Lorient)
1. **Se connecter** en tant que Jean
2. **Accéder** à `/gestion/paiements-especes`
3. **Vérifier** l'onglet "En attente":
   - ✅ Voit Inscription A (50€ - Lorient)
   - ✅ Voit Inscription C (70€ - Lorient)
   - ❌ Ne voit PAS Inscription B (60€ - Laval)
4. **Vérifier** badge Header: "2" paiements en attente

### Test avec Marie (Laval)
1. **Se connecter** en tant que Marie
2. **Accéder** à `/gestion/paiements-especes`
3. **Vérifier**:
   - ✅ Voit Inscription B (60€ - Laval)
   - ❌ Ne voit PAS Inscriptions A et C (Lorient)
4. **Vérifier** badge Header: "1" paiement en attente

### Test avec Admin
1. **Se connecter** en tant qu'admin
2. **Accéder** à `/gestion/paiements-especes`
3. **Vérifier**:
   - ✅ Voit TOUTES les inscriptions (A, B, C)
4. **Vérifier** badge Header: "3" paiements en attente

### Résultat Attendu
- ✅ Filtrage automatique par campus
- ✅ Badge Header avec nombre correct
- ✅ Admin voit tous les paiements

---

## Test 3: Validation Autorisée ✅

### Objectif
Vérifier qu'un responsable peut valider un paiement de son campus

### Étapes
1. **Se connecter** en tant que Jean (responsable campus Lorient)
2. **Accéder** à `/gestion/paiements-especes`
3. **Onglet "En attente"** → Sélectionner Inscription A (50€ - Lorient)
4. **Cliquer** sur "Valider"
5. **Vérifier** message: "✅ Paiement de 50€ validé avec succès"
6. **Vérifier** que le paiement passe dans l'onglet "Validés"
7. **Vérifier** console backend:
   ```
   ✅ Utilisateur 64abc123 est responsable du campus Lorient
   💰 Calcul paiement:
      - PayPal: 0€
      - Cash validé: 50€
      - Total: 50€
   ```
8. **Vérifier** email de confirmation envoyé au participant

### Résultat Attendu
- ✅ Paiement validé
- ✅ Statut inscription mis à jour
- ✅ Email envoyé
- ✅ Logs corrects

---

## Test 4: Validation Non Autorisée (403) ❌

### Objectif
Vérifier qu'un responsable NE PEUT PAS valider un paiement d'un autre campus

### Étapes
1. **Se connecter** en tant que Jean (responsable campus Lorient)
2. **Récupérer** l'ID d'une inscription du campus Laval (via API ou DB)
3. **Tenter** de valider via API:
   ```bash
   curl -X PATCH http://localhost:5000/api/registrations/<laval_registration_id>/cash-payment/<payment_id>/validate \
     -H "Authorization: Bearer <jean_token>" \
     -H "Content-Type: application/json" \
     -d '{"amount": 60}'
   ```
4. **Vérifier** réponse: `403 Forbidden`
5. **Vérifier** message:
   ```json
   {
     "message": "❌ Vous n'êtes pas autorisé à valider les paiements pour le campus Laval. Seul le responsable affecté peut valider."
   }
   ```
6. **Vérifier** console backend:
   ```
   ❌ Utilisateur 64abc123 n'est pas responsable du campus Laval
   ```

### Résultat Attendu
- ❌ Erreur 403
- ❌ Message explicite
- ❌ Paiement non validé
- ✅ Logs d'alerte

---

## Test 5: Retrait de Responsable ✅

### Objectif
Vérifier qu'après retrait, l'ancien responsable perd l'accès

### Étapes
1. **Se connecter** en tant qu'admin
2. **Accéder** à `/gestion/campus`
3. **Trouver** campus Lorient avec Jean comme responsable
4. **Cliquer** sur bouton "❌ Retirer"
5. **Vérifier** message: "✅ Responsable retiré du campus Lorient"
6. **Vérifier** affichage: "Aucun responsable affecté"
7. **Se déconnecter** et **se reconnecter** en tant que Jean
8. **Accéder** à `/gestion/paiements-especes`
9. **Vérifier** erreur: "❌ Vous devez être responsable d'un campus..."

### Résultat Attendu
- ✅ Responsable retiré
- ✅ Jean perd l'accès immédiatement
- ✅ Erreur 403 claire

---

## Test 6: Referent Non Affecté (403) ❌

### Objectif
Vérifier qu'un referent non affecté à un campus n'a pas accès

### Étapes Préparatoires
1. **Créer** un compte utilisateur avec rôle `referent` (ex: Paul)
2. **Ne PAS affecter** Paul à un campus

### Test
1. **Se connecter** en tant que Paul
2. **Tenter** d'accéder à `/gestion/paiements-especes`
3. **Vérifier** réponse backend: `403 Forbidden`
4. **Vérifier** message:
   ```json
   {
     "message": "❌ Vous devez être responsable d'un campus pour accéder aux paiements en espèces"
   }
   ```

### Résultat Attendu
- ❌ Accès refusé
- ❌ Message explicite
- ✅ Page d'erreur ou redirection

---

## Test 7: Admin Bypasse Restrictions ✅

### Objectif
Vérifier que les admins peuvent valider n'importe quel campus

### Étapes
1. **Se connecter** en tant qu'admin
2. **Accéder** à `/gestion/paiements-especes`
3. **Vérifier** que TOUS les paiements de TOUS les campus sont visibles
4. **Valider** un paiement du campus Lorient
5. **Valider** un paiement du campus Laval
6. **Vérifier** console backend:
   ```
   ✅ Utilisateur <admin_id> a le rôle admin - accès autorisé
   ```
7. **Vérifier** les deux validations réussies

### Résultat Attendu
- ✅ Admin voit tous les campus
- ✅ Admin peut valider tous les paiements
- ✅ Pas de restriction

---

## Test 8: Interface Graphique (UX) 🎨

### Objectif
Vérifier l'ergonomie et le design de la page

### Checklist Page `/gestion/campus`
- [ ] Header "🏛️ Gestion des Campus et Responsables" visible
- [ ] Bouton "🔄 Actualiser" fonctionnel
- [ ] Grid de campus responsive (2 colonnes desktop, 1 colonne mobile)
- [ ] Cartes campus avec hover effect (élévation)
- [ ] Badge status "✅ Actif" / "❌ Inactif" coloré
- [ ] Informations campus lisibles (PayPal, IBAN, redistribution)
- [ ] Section responsable bien délimitée (fond gris)
- [ ] Liste déroulante filtrée correctement
- [ ] Bouton "Retirer" rouge visible si responsable affecté
- [ ] Messages de succès/erreur visibles et clairs
- [ ] Box info en bas de page lisible
- [ ] Responsive sur mobile (test à 375px)

### Test Responsive
1. **Ouvrir** DevTools (F12)
2. **Activer** mode responsive
3. **Tester** résolutions:
   - 375px (iPhone)
   - 768px (Tablette)
   - 1024px (Desktop)
4. **Vérifier** que tout reste lisible et fonctionnel

---

## Test 9: Logs et Traçabilité 📊

### Objectif
Vérifier que les actions sont bien loggées

### Logs Attendus

**Affectation responsable**:
```bash
# Backend console
✅ Utilisateur 64abc123 affecté comme responsable du campus Lorient
```

**Tentative validation autorisée**:
```bash
✅ Utilisateur 64abc123 est responsable du campus Lorient
💰 Calcul paiement:
   - PayPal: 0€
   - Cash validé: 50€
   - Total: 50€
✅ Paiement de 50€ validé avec succès
```

**Tentative validation non autorisée**:
```bash
❌ Utilisateur 64xyz789 n'est pas responsable du campus Laval
```

**Accès stats filtrées**:
```bash
✅ Responsable 64abc123 - accès aux campus: ['Lorient', 'Amiens']
```

---

## Test 10: API Endpoints 🔌

### GET /api/campus/:name/responsable
```bash
curl http://localhost:5000/api/campus/Lorient/responsable \
  -H "Authorization: Bearer <token>"

# Attendu
{
  "campusName": "Lorient",
  "responsable": {
    "_id": "64abc123...",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "role": "referent",
    "phoneNumber": "0601020304"
  }
}
```

### PATCH /api/campus/:name/responsable (Affecter)
```bash
curl -X PATCH http://localhost:5000/api/campus/Lorient/responsable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"userId": "64abc123..."}'

# Attendu: 200 OK
{
  "message": "✅ Jean Dupont affecté(e) comme responsable du campus Lorient",
  "campus": { ... }
}
```

### PATCH /api/campus/:name/responsable (Retirer)
```bash
curl -X PATCH http://localhost:5000/api/campus/Lorient/responsable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"userId": null}'

# Attendu: 200 OK
{
  "message": "✅ Responsable retiré du campus Lorient",
  "campus": { ... }
}
```

### GET /api/registrations/cash/stats (Filtré)
```bash
# En tant que referent affecté à Lorient
curl http://localhost:5000/api/registrations/cash/stats \
  -H "Authorization: Bearer <jean_token>"

# Attendu: Seulement paiements Lorient
{
  "pendingPayments": [ /* Lorient uniquement */ ],
  "totalPending": 120,
  ...
}
```

---

## Résumé Checklist Complète ✅

### Backend
- [x] Modèle Campus avec champ responsable
- [x] Middleware checkCampusResponsable fonctionnel
- [x] Routes affectation responsable (PATCH, GET)
- [x] Filtrage stats par campus
- [x] Logs traçabilité corrects
- [x] Validation sécurisée (403 si non autorisé)

### Frontend
- [x] Page CampusManagement accessible
- [x] Interface affectation responsable
- [x] Filtrage automatique paiements
- [x] Messages succès/erreur clairs
- [x] Responsive design
- [x] Lien menu Header

### Sécurité
- [x] Admin seul peut affecter responsables
- [x] Referents limités à leur campus
- [x] Erreurs 403 explicites
- [x] Admins bypassent restrictions
- [x] Logs tentatives non autorisées

### Documentation
- [x] GESTION_RESPONSABLES_CAMPUS.md complet
- [x] GUIDE_RAPIDE_RESPONSABLES.md utilisateur
- [x] CHANGELOG.md à jour
- [x] RECAPITULATIF_MODIFICATIONS_6FEV2026.md

---

## Problèmes Connus et Solutions

### Problème: "Cannot read property 'responsable' of null"
**Solution**: Vérifier que le campus existe dans la base de données

### Problème: "User not found" lors affectation
**Solution**: Vérifier que l'userId est correct et que l'utilisateur existe

### Problème: 403 alors que je suis responsable
**Solution**: 
1. Vérifier affectation dans `/gestion/campus`
2. Se déconnecter/reconnecter pour rafraîchir le token
3. Vérifier logs backend

### Problème: Liste déroulante vide
**Solution**: Créer des utilisateurs avec rôle referent/responsable/admin

---

**Version**: 0.2.0  
**Date**: 6 février 2026  
**Durée estimée des tests**: ~30 minutes
