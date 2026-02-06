# 🏛️ Gestion des Responsables de Campus pour Paiements en Espèces

## 📋 Résumé

Système de validation des paiements en espèces par responsables de campus. Chaque campus peut avoir un responsable affecté qui gère uniquement les paiements de son campus.

## 🎯 Fonctionnalités Implémentées

### 1. Modèle Campus Modifié
- **Nouveau champ**: `responsable` (référence vers User)
- Permet d'affecter un utilisateur avec rôle de gestion (referent, responsable, admin) à un campus

### 2. Middleware de Vérification
**Fichier**: `backend/src/middleware/checkCampusResponsable.js`

- Vérifie automatiquement si l'utilisateur peut valider un paiement
- **Admins/Responsables**: Accès à tous les campus
- **Referents**: Accès uniquement au campus dont ils sont responsables
- Rejette l'accès si l'utilisateur n'est pas le responsable du campus

### 3. Routes API pour Affectation des Responsables

#### **PATCH /api/campus/:name/responsable**
Affecter ou retirer un responsable d'un campus (Admin uniquement)

**Requête**:
```json
{
  "userId": "64abc123..." // ou null pour retirer
}
```

**Réponse**:
```json
{
  "message": "✅ Jean Dupont affecté(e) comme responsable du campus Lorient",
  "campus": {
    "_id": "...",
    "name": "Lorient",
    "responsable": {
      "_id": "64abc123...",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@example.com",
      "role": "referent"
    }
  }
}
```

**Validations**:
- Campus doit exister
- Utilisateur doit exister
- Utilisateur doit avoir rôle `referent`, `responsable` ou `admin`

#### **GET /api/campus/:name/responsable**
Obtenir le responsable d'un campus (Authentifié)

**Réponse**:
```json
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

### 4. Validation des Paiements Filtrée

#### Routes Modifiées
```javascript
// Utilise checkCampusResponsable au lieu de authorize
router.patch('/:registrationId/cash-payment/:paymentId/validate',
  auth,
  requireVerifiedEmail,
  checkCampusResponsable, // 🆕 Vérifie responsable du campus
  registrationController.validateCashPayment
);

router.patch('/:registrationId/cash-payment/:paymentId/reject',
  auth,
  requireVerifiedEmail,
  checkCampusResponsable, // 🆕 Vérifie responsable du campus
  registrationController.rejectCashPayment
);
```

#### Statistiques Filtrées par Campus
**GET /api/registrations/cash/stats** - Modifié pour filtrer automatiquement

- **Admins**: Voient tous les campus
- **Responsables affectés**: Voient uniquement leurs campus
- **Non-affectés**: Reçoivent erreur 403

### 5. Page d'Administration Frontend

**Route**: `/gestion/campus`  
**Fichier**: `frontend/src/pages/CampusManagement.js`

#### Fonctionnalités
✅ Liste de tous les campus avec leurs informations  
✅ Affichage du responsable actuel (si affecté)  
✅ Sélection d'un utilisateur pour affectation  
✅ Retrait du responsable  
✅ Filtrage automatique des utilisateurs (roles de gestion uniquement)

#### Accès
- Réservé aux rôles: `responsable`, `admin`
- Lien ajouté dans le menu Header "Gestion" → "Campus & Responsables"

## 📊 Flux de Validation des Paiements en Espèces

```
1. Utilisateur soumet inscription avec paiement espèces
   └─> Registration créée avec cashPayments[0].status = 'pending'

2. Responsable du campus reçoit notification
   └─> Badge dans Header avec nombre de paiements en attente

3. Responsable accède à "/gestion/paiements-especes"
   └─> Voit UNIQUEMENT les paiements de son/ses campus
   └─> Admins voient TOUS les campus

4. Responsable valide ou rejette le paiement
   ├─> Middleware checkCampusResponsable vérifie l'autorisation
   ├─> Si OK: Paiement validé, statut inscription mis à jour
   └─> Si KO: Erreur 403 "Vous n'êtes pas autorisé..."

5. Email de confirmation envoyé à l'utilisateur
   └─> Notification push envoyée si activée
```

## 🔐 Contrôles de Sécurité

### Niveaux d'Accès

| Rôle | Affectation Campus | Validation Paiements | Vue Statistiques |
|------|-------------------|---------------------|------------------|
| **admin** | ✅ Tous campus | ✅ Tous campus | ✅ Tous campus |
| **responsable** | ❌ | ✅ Tous campus | ✅ Tous campus |
| **referent** (affecté) | ❌ | ✅ Son campus uniquement | ✅ Son campus uniquement |
| **referent** (non affecté) | ❌ | ❌ | ❌ |
| **utilisateur** | ❌ | ❌ | ❌ |

### Middlewares de Protection

```javascript
// Route d'affectation (admin uniquement)
router.patch('/:name/responsable', auth, requireAdminRole, ...)

// Routes de validation (responsable du campus ou admin)
router.patch('/:registrationId/cash-payment/:paymentId/validate',
  auth,
  requireVerifiedEmail,
  checkCampusResponsable, // Vérifie automatiquement
  ...
)
```

## 💡 Exemples d'Utilisation

### Scénario 1: Affecter un Responsable

```bash
# Admin affecte Jean (referent) au campus Lorient
PATCH /api/campus/Lorient/responsable
Authorization: Bearer <admin_token>
{
  "userId": "64abc123..."
}

# Réponse
{
  "message": "✅ Jean Dupont affecté(e) comme responsable du campus Lorient"
}
```

### Scénario 2: Tentative de Validation par Non-Responsable

```bash
# Pierre (referent de Nantes) tente de valider paiement de Lorient
PATCH /api/registrations/64xyz789.../cash-payment/64pmt456.../validate
Authorization: Bearer <pierre_token>

# Réponse: 403 Forbidden
{
  "message": "❌ Vous n'êtes pas autorisé à valider les paiements pour le campus Lorient. Seul le responsable affecté peut valider."
}
```

### Scénario 3: Admin Valide n'Importe Quel Campus

```bash
# Admin valide paiement de n'importe quel campus
PATCH /api/registrations/64xyz789.../cash-payment/64pmt456.../validate
Authorization: Bearer <admin_token>

# Réponse: 200 OK
{
  "message": "✅ Paiement de 50€ validé avec succès"
}
```

## 🧪 Tests Recommandés

### Test 1: Affectation Responsable
1. Connectez-vous en tant qu'admin
2. Accédez à `/gestion/campus`
3. Sélectionnez un utilisateur avec rôle `referent`
4. Vérifiez l'affichage du responsable

### Test 2: Validation Filtrée
1. Créez 2 inscriptions avec paiements espèces (campus différents)
2. Connectez-vous en tant que responsable d'un seul campus
3. Accédez à `/gestion/paiements-especes`
4. Vérifiez que seul le paiement du campus affecté est visible

### Test 3: Tentative d'Accès Non Autorisé
1. Connectez-vous en tant que `referent` non affecté
2. Tentez d'accéder à `/gestion/paiements-especes`
3. Devrait retourner erreur 403

### Test 4: Retrait de Responsable
1. Admin retire le responsable d'un campus
2. Ancien responsable ne peut plus valider les paiements de ce campus

## 📝 Notes Importantes

### Règles de Gestion
- Un campus peut avoir **0 ou 1** responsable
- Un utilisateur peut être responsable de **plusieurs** campus
- Seuls les utilisateurs avec rôle **referent/responsable/admin** peuvent être affectés
- Les admins **contournent** toujours les restrictions de campus

### Compatibilité Descendante
✅ Les paiements existants continuent de fonctionner  
✅ Les admins/responsables gardent l'accès total  
✅ Les referents non affectés perdent l'accès (nouveau comportement sécurisé)

### Points d'Attention
⚠️ Si aucun responsable n'est affecté à un campus, seuls les admins/responsables peuvent valider  
⚠️ Un referent peut perdre l'accès si retiré de son campus  
⚠️ Documenter les affectations dans les notes du campus

## 🚀 Déploiement

### Étapes de Migration

1. **Backend**: Redéployer avec nouveau code
   ```bash
   cd backend
   git pull
   npm install
   pm2 restart gj-camp-backend
   ```

2. **Frontend**: Redéployer Vercel
   ```bash
   cd frontend
   git pull
   vercel --prod
   ```

3. **Base de données**: Aucune migration nécessaire
   - Le champ `responsable` est optionnel
   - Compatible avec données existantes

4. **Configuration initiale**
   - Connectez-vous en admin
   - Accédez à `/gestion/campus`
   - Affectez les responsables à chaque campus

## 🔄 Évolutions Futures Possibles

- [ ] Notifications automatiques au responsable lors de nouveau paiement espèces
- [ ] Historique des affectations de responsables
- [ ] Rapport mensuel par responsable de campus
- [ ] Tableau de bord dédié pour les referents de campus
- [ ] Affectation multiple (responsable principal + suppléant)
- [ ] Gestion des permissions granulaires par campus

## 📚 Fichiers Modifiés

### Backend
- `backend/src/models/Campus.js` - Ajout champ `responsable`
- `backend/src/middleware/checkCampusResponsable.js` - Nouveau middleware
- `backend/src/routes/campusRoutes.js` - Routes d'affectation
- `backend/src/routes/registrationRoutes.js` - Utilisation du middleware
- `backend/src/controllers/registrationController.js` - Filtrage stats par campus

### Frontend
- `frontend/src/pages/CampusManagement.js` - Nouvelle page admin
- `frontend/src/styles/CampusManagement.css` - Styles page
- `frontend/src/App.js` - Route `/gestion/campus`
- `frontend/src/components/Header.js` - Lien menu "Campus & Responsables"

### Documentation
- `GESTION_RESPONSABLES_CAMPUS.md` - Ce document

---

**Date de création**: 6 février 2026  
**Version**: 1.0  
**Statut**: ✅ Implémenté et testé
