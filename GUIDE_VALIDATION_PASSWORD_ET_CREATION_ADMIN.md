# 🔒 Guide - Validation Mot de Passe Fort & Création Inscription Admin

## 📅 Date : 31 janvier 2026

---

## 🎯 Objectifs

1. **Empêcher les mots de passe faibles** lors de l'inscription au camp
2. **Permettre aux admins de créer des inscriptions** sans paiement immédiat (paiement ultérieur)

---

## 🔒 PARTIE 1 : Validation Mot de Passe Fort

### Règles de sécurité appliquées

Un mot de passe valide DOIT contenir :

| Critère | Description | Exemples ✅ / ❌ |
|---------|-------------|------------------|
| **Longueur** | Minimum 8 caractères | ✅ `Password1!` / ❌ `Pass1!` |
| **Majuscule** | Au moins 1 lettre majuscule (A-Z) | ✅ `Password1!` / ❌ `password1!` |
| **Minuscule** | Au moins 1 lettre minuscule (a-z) | ✅ `Password1!` / ❌ `PASSWORD1!` |
| **Chiffre** | Au moins 1 chiffre (0-9) | ✅ `Password1!` / ❌ `Password!` |
| **Spécial** | Au moins 1 caractère spécial | ✅ `Password1!` / ❌ `Password1` |

**Caractères spéciaux acceptés** : `! @ # $ % ^ & * ( ) , . ? " : { } | < > _ - + =`

### Exemples de mots de passe

#### ❌ Mots de passe REFUSÉS

```
123456          → Trop court, pas de majuscule, pas de spécial
password        → Pas de majuscule, pas de chiffre, pas de spécial
Password        → Pas de chiffre, pas de spécial
Password1       → Pas de caractère spécial
Password!       → Pas de chiffre
password1!      → Pas de majuscule
Pass1!          → Trop court (6 caractères)
```

#### ✅ Mots de passe ACCEPTÉS

```
Password1!      → Parfait ✅
MonMotDePasse2024!  → Très bon ✅
Camp@GJ2024     → Excellent ✅
Refuge#Lorient8 → Très fort ✅
Jeune$Generation5  → Parfait ✅
```

### Messages d'erreur détaillés

Si le mot de passe est faible, l'utilisateur voit :

```
🔒 Mot de passe trop faible ! Il doit contenir : 
- au moins 8 caractères
- une lettre majuscule
- un chiffre
- un caractère spécial (!@#$%&*...)
```

### Où est appliquée cette validation ?

1. **Page d'inscription au camp** (`/inscription`)
   - Frontend : `CampRegistrationPage.js` fonction `validatePasswordStrength()`
   - Backend : `campRegistrationWithAccount.js` validation serveur

2. **Page création inscription admin** (`/inscription/creer`)
   - Frontend : `CreateRegistrationPage.js` fonction `validatePasswordStrength()`
   - Backend : `registrationController.js` → `createRegistrationWithoutPayment`

### Code de validation (réutilisable)

```javascript
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('une lettre majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('une lettre minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('un chiffre');
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
    errors.push('un caractère spécial (!@#$%&*...)');
  }
  
  return errors; // Tableau vide = mot de passe valide
};
```

---

## 👤 PARTIE 2 : Création Inscription Admin Sans Paiement

### Cas d'usage

**Problème** : Un responsable de jeunesse veut inscrire quelqu'un au camp mais la personne ne peut pas payer immédiatement.

**Solution** : L'admin crée l'inscription avec statut `pending` (en attente). L'utilisateur pourra payer plus tard via son espace personnel.

### Accès à la fonctionnalité

**Qui peut créer des inscriptions ?**
- ✅ **Responsables** (role: `responsable`)
- ✅ **Administrateurs** (role: `admin`)
- ❌ Utilisateurs normaux (role: `utilisateur`)
- ❌ Référents (role: `referent`)

**Où trouver le bouton ?**

1. Se connecter avec un compte **responsable** ou **admin**
2. Cliquer sur le menu **"👤 Admin"** dans le header
3. Cliquer sur **"➕ Créer inscription"**
4. URL directe : https://gjsdecrpt.fr/inscription/creer

### Fonctionnement étape par étape

#### 1️⃣ Remplir le formulaire

Le formulaire demande :

**📋 Informations personnelles**
- Prénom *
- Nom *
- Email *
- Mot de passe * (avec validation forte)
- Sexe * (Homme/Femme)
- Date de naissance *

**📍 Coordonnées**
- Adresse complète *
- Téléphone *

**⛪ Refuge CRPT**
- Sélectionner le refuge (Lorient, Laval, Amiens, Nantes, Autres) *

**🏥 Informations médicales**
- ☑️ Allergies ou besoins médicaux particuliers
- Détails des allergies (si cochée)

#### 2️⃣ Validation des données

Le système vérifie :

- ✅ **Email unique** : Pas d'inscription existante pour cet email
- ✅ **Mot de passe fort** : Respecte les règles de sécurité
- ✅ **Refuge valide** : Dans la liste CRPT
- ✅ **Sexe valide** : M ou F
- ✅ **Format email** : Valide (xxx@xxx.xxx)

#### 3️⃣ Création automatique

Quand vous cliquez sur **"✅ Créer l'inscription"** :

1. **Compte utilisateur créé automatiquement** :
   - Rôle : `utilisateur`
   - Email vérifié automatiquement : ✅ `isEmailVerified: true`
   - Mot de passe hashé (bcrypt)
   - Pas besoin de cliquer sur lien de vérification email

2. **Inscription créée avec** :
   - Statut : `pending` (en attente)
   - Montant payé : `0€`
   - Montant restant : `120€` (montant total camp)
   - Méthode paiement : `pending`

3. **Notifications envoyées** :
   - ✉️ **Email de confirmation** à l'utilisateur
   - 🔔 **Notification push** (si activée)

4. **Message de succès** :
   ```
   ✅ Inscription créée avec succès ! 
   L'utilisateur peut maintenant payer via son espace personnel.
   ```

#### 4️⃣ Que peut faire l'utilisateur ensuite ?

L'utilisateur créé reçoit un email et peut :

1. **Se connecter** sur https://gjsdecrpt.fr/login
   - Email : celui que vous avez saisi
   - Mot de passe : celui que vous avez défini

2. **Aller dans son tableau de bord** (`/tableau-de-bord`)
   - Voir son inscription avec statut **🟡 En attente**
   - Voir le montant restant à payer : **120€**

3. **Effectuer un paiement** :
   - Via PayPal (carte bancaire ou compte PayPal)
   - Via paiement en espèces (demande validation admin)
   - Paiement partiel possible (ex: 20€ minimum)

### Vue dans les dashboards

#### Dashboard utilisateur (`/tableau-de-bord`)

L'utilisateur voit :

```
╔══════════════════════════════════════════╗
║ 📋 MES INSCRIPTIONS                      ║
╠══════════════════════════════════════════╣
║ Camp GJ 2026                             ║
║ Statut : 🟡 En attente                   ║
║ Montant payé : 0€ / 120€                 ║
║ Reste à payer : 120€                     ║
║                                          ║
║ [💳 Payer maintenant]                    ║
╚══════════════════════════════════════════╝
```

#### Dashboard admin (`/tableau-de-bord-inscriptions`)

L'admin voit l'inscription avec :

- **Badge** : 🟡 **En attente**
- **Montant payé** : 0€
- **Reste à payer** : 120€
- **Mode paiement** : Pending
- **Créé le** : Date de création par admin

### Avantages de cette méthode

✅ **Flexibilité** : Inscrire des personnes avant qu'elles ne puissent payer
✅ **Sécurité** : Validation mot de passe forte dès la création
✅ **Traçabilité** : Inscription liée à un compte utilisateur réel
✅ **Autonomie** : L'utilisateur gère son paiement lui-même
✅ **Notifications** : Utilisateur informé par email + push
✅ **Pas de blocage** : Email auto-vérifié, connexion immédiate

---

## 🔍 Cas particuliers

### Que se passe-t-il si l'email existe déjà ?

#### Cas 1 : Email existe AVEC inscription existante

```
❌ Cet utilisateur a déjà une inscription (completed/pending/partial)
```

**Action** : Ne pas créer de doublon. Vérifier le statut de l'inscription existante.

#### Cas 2 : Email existe SANS inscription

✅ Le système utilise le compte existant et crée uniquement l'inscription.

**Exemple** :
- Jean a créé un compte sur le site mais n'a jamais fait d'inscription
- Admin crée une inscription pour jean@example.com
- → Compte Jean réutilisé, inscription ajoutée

### Que se passe-t-il si l'utilisateur perd son mot de passe ?

L'utilisateur peut utiliser **"Mot de passe oublié"** :

1. Aller sur https://gjsdecrpt.fr/forgot-password
2. Saisir son email
3. Recevoir un lien de réinitialisation
4. Définir un nouveau mot de passe (avec validation forte)

### Peut-on modifier une inscription "en attente" ?

Oui, l'admin peut :

1. **Marquer comme payé en espèces** → Dashboard admin, section "Paiements espèces"
2. **Annuler l'inscription** → Changer statut en "cancelled"
3. **Ajouter un paiement partiel** → Via paiement PayPal ou espèces

---

## 📊 Statistiques et suivi

### Dashboard admin - Inscriptions

Les inscriptions créées sans paiement apparaissent :

- **Graphique camembert** : Tranche 🟡 "En attente"
- **Liste des inscriptions** : Filtre par statut `pending`
- **Badge couleur** : 🟡 Jaune/Orange pour "En attente"
- **Montant total** : Calcul du chiffre d'affaires potentiel

### Requête MongoDB pour voir les inscriptions en attente

```javascript
db.registrations.find({
  status: 'pending',
  amountPaid: 0
}).sort({ createdAt: -1 })
```

---

## 🛡️ Sécurité

### Validation côté backend

**TOUJOURS valider côté serveur** même si frontend valide :

- ✅ Format email
- ✅ Force du mot de passe
- ✅ Refuge dans liste valide
- ✅ Sexe M ou F uniquement
- ✅ Pas de doublon inscription
- ✅ Permissions admin (middleware `authorize`)

### Hashage des mots de passe

```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
```

**Coût** : 10 rounds de hashage (bon compromis sécurité/performance)

### Protection des routes

```javascript
router.post('/create-without-payment', 
  auth,                                    // 1. Vérifier token JWT
  requireVerifiedEmail,                    // 2. Email vérifié
  authorize('responsable', 'admin'),       // 3. Rôle autorisé
  registrationController.createRegistrationWithoutPayment
);
```

---

## 🧪 Tests recommandés

### Test 1 : Mot de passe faible rejeté

1. Aller sur `/inscription/creer`
2. Remplir le formulaire avec mot de passe : `password`
3. ❌ Erreur : "🔒 Mot de passe trop faible ! Il doit contenir : une lettre majuscule, un chiffre, un caractère spécial"

### Test 2 : Mot de passe fort accepté

1. Mot de passe : `MonCamp2024!`
2. ✅ Formulaire accepté
3. ✅ Inscription créée

### Test 3 : Email dupliqué rejeté

1. Créer inscription pour `jean@test.com`
2. Essayer de créer une 2ème inscription pour `jean@test.com`
3. ❌ Erreur : "❌ Cet utilisateur a déjà une inscription (pending)"

### Test 4 : Utilisateur peut se connecter

1. Admin crée inscription pour `marie@test.com` avec mot de passe `Marie2024!`
2. Marie va sur `/login`
3. Entre : `marie@test.com` / `Marie2024!`
4. ✅ Connexion réussie

### Test 5 : Utilisateur peut payer plus tard

1. Marie se connecte
2. Va sur `/tableau-de-bord`
3. Voit son inscription **🟡 En attente**
4. Clique sur **💳 Payer maintenant**
5. Effectue un paiement PayPal de 20€
6. ✅ Inscription passe en **🟡 Partiel** (20€/120€)

---

## 📝 Checklist d'utilisation

### Pour créer une inscription sans paiement :

- [ ] Se connecter avec compte **responsable** ou **admin**
- [ ] Aller sur **👤 Admin** → **➕ Créer inscription**
- [ ] Remplir **toutes les informations** obligatoires (*)
- [ ] Définir un **mot de passe fort** (8+ car, maj, min, chiffre, spécial)
- [ ] Vérifier l'**email** (pas de faute de frappe)
- [ ] Sélectionner le **refuge CRPT** correct
- [ ] Cliquer sur **✅ Créer l'inscription**
- [ ] Vérifier le **message de succès**
- [ ] **Informer l'utilisateur** de ses identifiants de connexion
- [ ] Vérifier dans **Dashboard admin** que l'inscription apparaît

### Pour l'utilisateur créé :

- [ ] Recevoir ses identifiants (email + mot de passe)
- [ ] Se connecter sur https://gjsdecrpt.fr/login
- [ ] Consulter son **tableau de bord**
- [ ] Voir inscription **🟡 En attente**
- [ ] Effectuer un **paiement** (PayPal ou espèces)
- [ ] Vérifier changement de statut après paiement

---

## 🆘 Dépannage

### Erreur : "Mot de passe trop faible"

**Cause** : Le mot de passe ne respecte pas les critères de sécurité.

**Solution** : Utiliser un mot de passe avec :
- Au moins 8 caractères
- 1 majuscule (A-Z)
- 1 minuscule (a-z)
- 1 chiffre (0-9)
- 1 caractère spécial (!@#$%&*...)

**Exemple valide** : `MonCamp2024!`

### Erreur : "Cet utilisateur a déjà une inscription"

**Cause** : L'email saisi a déjà une inscription dans la base de données.

**Solution** :
1. Vérifier dans **Dashboard admin** (`/tableau-de-bord-inscriptions`)
2. Chercher l'inscription existante par email
3. Si statut `pending` → L'utilisateur peut juste se connecter et payer
4. Si statut `cancelled` → Admin peut réactiver l'inscription

### Erreur : "Email invalide"

**Cause** : Format email incorrect.

**Solution** : Vérifier le format : `prenom.nom@domaine.com`

### L'utilisateur ne reçoit pas l'email

**Vérifications** :
1. Email saisi correctement (pas de faute)
2. Vérifier les **spams/indésirables**
3. Backend logs : `console.log('✅ Email envoyé')`
4. Configuration Brevo API active

**Alternative** : L'utilisateur peut se connecter directement sans email (compte déjà créé).

---

## 📚 Ressources techniques

### Fichiers modifiés

**Frontend** :
- `src/pages/CreateRegistrationPage.js` (nouveau)
- `src/pages/CreateRegistrationPage.css` (nouveau)
- `src/pages/CampRegistrationPage.js` (validation ajoutée)
- `src/App.js` (route + import)
- `src/components/Header.js` (bouton menu)

**Backend** :
- `src/controllers/registrationController.js` (nouveau controller)
- `src/controllers/campRegistrationWithAccount.js` (validation renforcée)
- `src/routes/registrationRoutes.js` (nouvelle route)

### API Endpoint

```
POST /api/registrations/create-without-payment

Headers:
  Authorization: Bearer <JWT_TOKEN>

Body:
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "password": "MonCamp2024!",
  "sex": "M",
  "dateOfBirth": "2000-01-15",
  "address": "123 Rue Test, 75001 Paris",
  "phone": "0612345678",
  "refuge": "Lorient",
  "hasAllergies": false,
  "allergyDetails": ""
}

Response 201:
{
  "message": "✅ Inscription créée avec succès !",
  "registration": {
    "id": "67a...",
    "status": "pending",
    "amountRemaining": 120
  },
  "user": {
    "id": "67b...",
    "email": "jean@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

---

## ✅ Résumé

### Validation Mot de Passe Fort

✅ Empêche mots de passe faibles (`123456`, `password`)
✅ Validation frontend + backend (double sécurité)
✅ Messages d'erreur clairs et pédagogiques
✅ Appliqué partout (inscription camp, création admin)

### Création Inscription Admin

✅ Admins peuvent créer inscriptions sans paiement
✅ Utilisateur reçoit compte fonctionnel immédiatement
✅ Statut `pending` clair dans tous les dashboards
✅ Utilisateur paye plus tard de manière autonome
✅ Email + notification push automatiques
✅ Sécurité : validation forte + permissions strictes

---

**Version** : 1.0  
**Date** : 31 janvier 2026  
**Auteur** : AI Assistant  
**Testé** : ✅ Build réussi, déployé sur Vercel
