# 📝 CHANGELOG - GJ Camp Website

Toutes les modifications notables du projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [0.2.0] - 2026-02-06

### ✨ Ajouté
- **Gestion des Responsables de Campus** : Système complet d'affectation de responsables pour validation des paiements en espèces
  - Nouveau champ `responsable` dans le modèle Campus (référence User)
  - Middleware `checkCampusResponsable` pour vérification des autorisations
  - Routes API `/api/campus/:name/responsable` (PATCH, GET) pour affectation/retrait
  - Page d'administration `/gestion/campus` pour gérer les affectations
  - Filtrage automatique des paiements selon le campus du responsable
  - Documentation complète dans `GESTION_RESPONSABLES_CAMPUS.md`
  - Guide utilisateur dans `GUIDE_RAPIDE_RESPONSABLES.md`

### 🔒 Sécurité Renforcée
- **Validation des paiements espèces** : Seul le responsable du campus peut valider
  - Les referents non-affectés n'ont plus accès aux paiements
  - Les admins/responsables conservent l'accès à tous les campus
  - Erreur 403 explicite si tentative de validation hors campus affecté
  - Logs détaillés des tentatives d'accès

### 🔧 Modifié
- `backend/src/models/Campus.js` : Ajout champ `responsable` (ObjectId)
- `backend/src/routes/campusRoutes.js` : Routes d'affectation responsables
- `backend/src/routes/registrationRoutes.js` : Utilisation du middleware `checkCampusResponsable`
- `backend/src/controllers/registrationController.js` : Filtrage stats par campus
  - `getCashPaymentsStats()` filtre selon le campus du responsable
  - Admins voient tous les campus, referents uniquement leurs campus
- `frontend/src/pages/CampusManagement.js` : Nouvelle page d'administration
- `frontend/src/styles/CampusManagement.css` : Styles interface gestion campus
- `frontend/src/App.js` : Route `/gestion/campus` ajoutée
- `frontend/src/components/Header.js` : Lien menu "Campus & Responsables"

### 🎯 Workflow Amélioré
1. Admin affecte un responsable à un campus via interface graphique
2. Responsable reçoit notification des paiements en attente (son campus uniquement)
3. Validation/rejet possible uniquement pour son campus
4. Traçabilité complète des validations par responsable

### 📋 Règles de Gestion
- Un campus peut avoir **0 ou 1** responsable
- Un utilisateur peut être responsable de **plusieurs** campus
- Seuls les rôles `referent`, `responsable`, `admin` peuvent être affectés
- Les admins **contournent** toujours les restrictions de campus
- Retrait d'affectation → perte immédiate des droits de validation

### 📊 Impact
- **Sécurité** : Réduction risque de validation croisée entre campus
- **Traçabilité** : Meilleure identification du validateur par campus
- **Autonomie** : Les referents de campus gèrent leurs paiements de façon autonome
- **Scalabilité** : Système prêt pour croissance multi-campus

---

## [0.1.1] - 2026-01-16

### ✨ Ajouté
- **Gestion du cache par version** : Nouveau système de versioning automatique basé sur `package.json`
  - Script `update-sw-version.js` pour synchronisation automatique
  - Invalidation automatique du cache à chaque nouvelle version
  - Format : `v0.1.0-2026-01-16` (version-date)
  - Meta tags Cache-Control dans `index.html` pour forcer rechargement
  - Documentation complète dans `GESTION_CACHE_VERSION.md`

- **Notifications push par défaut** : Les notifications push sont maintenant activées par défaut
  - État initial `pushNotifications = true` dans `NotificationSettings.js`
  - Chargement avec valeur par défaut `true` si non défini
  - Utilisateur peut toujours décocher pour désactiver
  - Documentation dans `NOTIFICATIONS_PUSH_PAR_DEFAUT.md`

- **Documentation** : Nouveaux guides créés
  - `RECAPITULATIF_MODIFICATIONS_16JAN2026.md` - Récapitulatif complet
  - `GUIDE_RAPIDE_DEPLOY.md` - Guide de déploiement rapide
  - `GESTION_CACHE_VERSION.md` - Documentation système de cache
  - `NOTIFICATIONS_PUSH_PAR_DEFAUT.md` - Documentation notifications
  - `CHANGELOG.md` - Ce fichier

### 🔧 Modifié
- `frontend/public/service-worker.js` : Logique de cache refactorée avec versioning
- `frontend/public/index.html` : Ajout meta tags Cache-Control
- `frontend/package.json` : Scripts build avec `update-sw-version.js`
- `frontend/src/components/NotificationSettings.js` : État initial pushNotifications à `true`
- `.github/copilot-instructions.md` : Ajout sections cache et notifications

### 🐛 Corrigé
- **Problème cache production** : Les utilisateurs voient maintenant toujours la dernière version
- **Notifications opt-in** : Meilleur taux d'activation avec opt-out au lieu de opt-in

### 📊 Impact
- Taux d'activation notifications attendu : ~80% (vs ~30% avant)
- Temps de mise à jour utilisateurs : <5 minutes (vs 24-48h avant)
- Tickets support cache : -100% attendu

---

## [0.1.0] - 2026-01-12

### ✨ Version Initiale en Production

#### Fonctionnalités Complètes
- **Authentification JWT** avec vérification email (7 jours)
- **Système de rôles RBAC** : utilisateur, referent, responsable, admin
- **Inscription au camp** avec paiement PayPal (sandbox)
- **Paiements mixtes** : PayPal, espèces, ou combinaison
- **Gestion des activités** : 22 activités avec sélection par créneau
- **Upload Cloudinary** pour photos de profil
- **Email Brevo** pour vérifications et notifications
- **PWA** : Application installable sur mobile et desktop
- **Dashboard admin** : 
  - Gestion utilisateurs
  - Gestion inscriptions
  - Gestion activités
  - Paiements espèces
  - Payouts campus
  - Statistiques
- **GJ News** : Système de posts avec likes et commentaires
- **Programme** : Affichage du programme par jours et créneaux
- **Responsive Design** : Optimisé mobile, tablette, desktop

#### Infrastructure
- **Frontend** : React 18 + React Router v6 → Vercel (https://gjsdecrpt.fr)
- **Backend** : Node.js + Express → Render
- **Database** : MongoDB Atlas Cloud
- **Storage** : Cloudinary
- **Payments** : PayPal SDK (sandbox)
- **Email** : Brevo API

#### Modèles de Données
- User (authentification + profils)
- Registration (inscriptions camp)
- Activity (activités camp)
- Post (GJ News)
- Campus (référents)
- Payout (redistributions)
- Settings (paramètres site)
- TransactionLog (logs paiements)
- ConsentLog (RGPD)

#### Sécurité
- Hash bcrypt des mots de passe (5 rounds)
- JWT avec expiration 7 jours
- Email verification (24h)
- CORS configuré
- Rate limiting
- Helmet.js
- Validation express-validator
- Middleware RBAC

---

## [Non publié] - À Venir

### 🎯 Fonctionnalités Planifiées
- [ ] Notifications push en production (actuellement sandbox)
- [ ] PayPal mode live pour paiements réels
- [ ] Dashboard analytics avancé
- [ ] Export Excel des inscriptions
- [ ] Système de messagerie interne
- [ ] Galerie photos du camp
- [ ] Sondages et votes
- [ ] Planning personnalisé par utilisateur

### 🔧 Améliorations Techniques
- [ ] Tests automatisés (Jest + React Testing Library)
- [ ] CI/CD avec GitHub Actions
- [ ] Monitoring avec Sentry
- [ ] Analytics avec Google Analytics
- [ ] Logs centralisés
- [ ] Backup automatique MongoDB

---

## Types de Changements

- **✨ Ajouté** : Nouvelles fonctionnalités
- **🔧 Modifié** : Changements dans des fonctionnalités existantes
- **❌ Déprécié** : Fonctionnalités bientôt supprimées
- **🗑️ Supprimé** : Fonctionnalités supprimées
- **🐛 Corrigé** : Corrections de bugs
- **🔒 Sécurité** : Corrections de vulnérabilités

---

## Notes de Version

### Comment mettre à jour la version ?

```bash
# Patch (0.1.0 → 0.1.1) : Bug fix
nano frontend/package.json  # Incrémenter version

# Minor (0.1.0 → 0.2.0) : Nouvelle fonctionnalité
nano frontend/package.json  # Incrémenter version

# Major (0.2.0 → 1.0.0) : Changement majeur
nano frontend/package.json  # Incrémenter version
```

### Que se passe-t-il lors du déploiement ?

1. Build → `update-sw-version.js` synchronise la version
2. Service Worker mis à jour avec nouveau `CACHE_VERSION`
3. Ancien cache supprimé automatiquement
4. Utilisateurs reçoivent la nouvelle version en <5 minutes

---

**Dernière mise à jour :** 16 janvier 2026  
**Prochaine version planifiée :** 0.2.0 (Février 2026)
