# ✅ CHECKLIST FINALE - MISE EN PRODUCTION
**Date de création:** 12 janvier 2026  
**Statut actuel:** En phase de test finale  
**Objectif:** Valider tous les points avant lancement officiel

---

## 📋 TABLE DES MATIÈRES
1. [Tests Fonctionnels](#tests-fonctionnels)
2. [Tests de Sécurité](#tests-de-sécurité)
3. [Tests de Performance](#tests-de-performance)
4. [Changements Restants](#changements-restants)
5. [Configuration Production](#configuration-production)
6. [Validation Finale](#validation-finale)

---

## 🧪 TESTS FONCTIONNELS

### 1.1 Authentification & Comptes

#### Inscription utilisateur
- [ ] **Test 1.1.1** - Inscription avec email valide
  - Email: test@example.com, Prénom: Jean, Nom: Dupont, Password: Test123!
  - ✅ **Attendu:** Compte créé, email de vérification envoyé
  
- [ ] **Test 1.1.2** - Inscription avec email déjà utilisé
  - ✅ **Attendu:** Message "Cet email est déjà utilisé"
  
- [ ] **Test 1.1.3** - Inscription avec mot de passe faible
  - Password: 123
  - ✅ **Attendu:** Message d'erreur validation mot de passe
  
- [ ] **Test 1.1.4** - Inscription avec champs manquants
  - ✅ **Attendu:** Messages d'erreur pour champs obligatoires

#### Vérification email
- [ ] **Test 1.2.1** - Clic sur lien de vérification valide
  - ✅ **Attendu:** Email vérifié, redirection vers login
  
- [ ] **Test 1.2.2** - Clic sur lien de vérification expiré (>24h)
  - ✅ **Attendu:** Message "Token expiré"
  
- [ ] **Test 1.2.3** - Clic sur lien de vérification invalide
  - ✅ **Attendu:** Message "Token invalide"

#### Connexion
- [ ] **Test 1.3.1** - Connexion avec identifiants valides
  - ✅ **Attendu:** Connexion réussie, redirection tableau de bord
  
- [ ] **Test 1.3.2** - Connexion avec email non vérifié
  - ✅ **Attendu:** Message "Veuillez vérifier votre email"
  
- [ ] **Test 1.3.3** - Connexion avec mauvais mot de passe
  - ✅ **Attendu:** Message "Identifiants incorrects"
  
- [ ] **Test 1.3.4** - Persistance session après refresh
  - ✅ **Attendu:** Utilisateur reste connecté
  
- [ ] **Test 1.3.5** - Token JWT expiré (>7 jours)
  - ✅ **Attendu:** Déconnexion automatique

#### Mot de passe oublié
- [ ] **Test 1.4.1** - Demande de réinitialisation avec email valide
  - ✅ **Attendu:** Email avec lien de réinitialisation envoyé
  
- [ ] **Test 1.4.2** - Utilisation lien de réinitialisation valide
  - ✅ **Attendu:** Nouveau mot de passe accepté et fonctionnel
  
- [ ] **Test 1.4.3** - Utilisation lien de réinitialisation expiré
  - ✅ **Attendu:** Message "Lien expiré"

#### Gestion du profil
- [ ] **Test 1.5.1** - Modification informations personnelles
  - ✅ **Attendu:** Informations mises à jour
  
- [ ] **Test 1.5.2** - Changement mot de passe
  - ✅ **Attendu:** Nouveau mot de passe fonctionnel
  
- [ ] **Test 1.5.3** - Upload photo de profil (<2MB)
  - ✅ **Attendu:** Photo uploadée et affichée
  
- [ ] **Test 1.5.4** - Upload photo trop grande (>2MB)
  - ✅ **Attendu:** Message d'erreur taille maximale

---

### 1.2 Inscription au Camp (CRPT)

#### Formulaire d'inscription
- [ ] **Test 2.1.1** - Remplir formulaire complet
  - Tous les champs obligatoires remplis
  - ✅ **Attendu:** Formulaire validé, passage à l'étape paiement
  
- [ ] **Test 2.1.2** - Soumettre avec champs manquants
  - ✅ **Attendu:** Messages d'erreur pour champs obligatoires
  
- [ ] **Test 2.1.3** - Sélection refuge (Lorient, Laval, Amiens, Nantes, Autres)
  - ✅ **Attendu:** Refuge enregistré correctement
  
- [ ] **Test 2.1.4** - Déclaration allergies
  - ✅ **Attendu:** Champ allergies conditionnel affiché
  
- [ ] **Test 2.1.5** - Calcul automatique reste à payer
  - Total: 120€, Paiement: 20€
  - ✅ **Attendu:** Reste à payer = 100€

#### Paiement PayPal (Sandbox)
- [ ] **Test 2.2.1** - Paiement partiel 20€ (minimum)
  - ✅ **Attendu:** Transaction validée, inscription enregistrée
  
- [ ] **Test 2.2.2** - Paiement partiel 60€
  - ✅ **Attendu:** Transaction validée, reste à payer = 60€
  
- [ ] **Test 2.2.3** - Paiement complet 120€
  - ✅ **Attendu:** Transaction validée, inscription complète
  
- [ ] **Test 2.2.4** - Tentative paiement < 20€
  - ✅ **Attendu:** Erreur "Montant minimum 20€"
  
- [ ] **Test 2.2.5** - Tentative paiement > 120€
  - ✅ **Attendu:** Erreur "Montant maximum 120€"
  
- [ ] **Test 2.2.6** - Annulation paiement PayPal
  - ✅ **Attendu:** Retour formulaire, inscription non créée
  
- [ ] **Test 2.2.7** - Vérification transaction dans MongoDB
  - ✅ **Attendu:** TransactionLog créé avec orderId, payerId

#### Paiement en espèces
- [ ] **Test 2.3.1** - Sélection option "Paiement en espèces"
  - ✅ **Attendu:** Inscription créée avec paymentMethod: "cash"
  
- [ ] **Test 2.3.2** - Validation paiement espèces par admin
  - ✅ **Attendu:** Statut payé mis à jour

#### Email de confirmation
- [ ] **Test 2.4.1** - Réception email après inscription
  - ✅ **Attendu:** Email avec détails inscription + montant payé
  
- [ ] **Test 2.4.2** - Contenu email correct
  - ✅ **Attendu:** Nom, refuge, dates, montant affichés

---

### 1.3 Pages & Navigation

#### Page d'accueil
- [ ] **Test 3.1.1** - Affichage carousel
  - ✅ **Attendu:** Carousel avec 3+ slides, navigation fonctionnelle
  
- [ ] **Test 3.1.2** - Border-radius carousel (20px)
  - ✅ **Attendu:** Angles arrondis sur tous les coins
  
- [ ] **Test 3.1.3** - Images Cloudinary chargent
  - ✅ **Attendu:** Images optimisées, pas de 404
  
- [ ] **Test 3.1.4** - Section "Pourquoi rejoindre GJ Camp"
  - ✅ **Attendu:** Grille responsive, 3 colonnes desktop, 1 mobile
  
- [ ] **Test 3.1.5** - Bouton "S'inscrire" visible et cliquable
  - ✅ **Attendu:** Redirection vers /inscription

#### Header & Navigation
- [ ] **Test 3.2.1** - Logos GJ + CRPT affichés
  - ✅ **Attendu:** 2 logos visibles, taille 80px/75px mobile
  
- [ ] **Test 3.2.2** - Menu hamburger mobile
  - ✅ **Attendu:** Menu slide-in depuis la droite
  
- [ ] **Test 3.2.3** - Navigation desktop
  - ✅ **Attendu:** Tous les liens visibles, cliquables
  
- [ ] **Test 3.2.4** - Z-index hierarchy
  - ✅ **Attendu:** Hamburger > Menu > Contenu

#### Footer
- [ ] **Test 3.3.1** - Réseaux sociaux (Instagram, Facebook, YouTube)
  - ✅ **Attendu:** Liens fonctionnels, ouverture nouvel onglet
  
- [ ] **Test 3.3.2** - Liens CGU, Confidentialité, RGPD
  - ✅ **Attendu:** Pages affichées correctement
  
- [ ] **Test 3.3.3** - Copyright avec année dynamique
  - ✅ **Attendu:** Année actuelle (2026)

#### Page Programme/Activités
- [ ] **Test 3.4.1** - Chargement des activités
  - ✅ **Attendu:** 22 activités affichées (pas 0, pas HTML)
  
- [ ] **Test 3.4.2** - Groupement par jour
  - ✅ **Attendu:** Activités organisées par créneaux horaires
  
- [ ] **Test 3.4.3** - Images activités
  - ✅ **Attendu:** Images chargent correctement
  
- [ ] **Test 3.4.4** - Sélection activités par utilisateur
  - ✅ **Attendu:** Enregistrement choix en DB

#### GJ News (Newsletter)
- [ ] **Test 3.5.1** - Affichage posts chronologique
  - ✅ **Attendu:** Posts du plus récent au plus ancien
  
- [ ] **Test 3.5.2** - Système de likes
  - ✅ **Attendu:** Animation cœur rose, compteur mis à jour
  
- [ ] **Test 3.5.3** - Commentaires fonctionnels
  - ✅ **Attendu:** Commentaire ajouté, affiché immédiatement
  
- [ ] **Test 3.5.4** - Upload images via Cloudinary
  - ✅ **Attendu:** Image uploadée, URL HTTPS retournée
  
- [ ] **Test 3.5.5** - Intégration vidéos YouTube
  - ✅ **Attendu:** Thumbnail affiché, lecture vidéo

---

### 1.4 Dashboard Admin

#### Gestion utilisateurs
- [ ] **Test 4.1.1** - Liste des utilisateurs
  - ✅ **Attendu:** Tous les utilisateurs affichés avec filtres
  
- [ ] **Test 4.1.2** - Modification rôle utilisateur
  - ✅ **Attendu:** Rôle modifié, audit créé
  
- [ ] **Test 4.1.3** - Activation/Désactivation compte
  - ✅ **Attendu:** isActive modifié, utilisateur ne peut plus se connecter si désactivé
  
- [ ] **Test 4.1.4** - Confirmation email manuelle
  - ✅ **Attendu:** isEmailVerified = true

#### Gestion inscriptions
- [ ] **Test 4.2.1** - Liste des inscriptions
  - ✅ **Attendu:** Toutes les inscriptions avec détails paiement
  
- [ ] **Test 4.2.2** - Filtrage par statut paiement
  - ✅ **Attendu:** Filtres "Payé", "Partiel", "Non payé" fonctionnels
  
- [ ] **Test 4.2.3** - Export CSV inscriptions
  - ✅ **Attendu:** Fichier CSV téléchargé avec toutes les données
  
- [ ] **Test 4.2.4** - Validation paiement espèces
  - ✅ **Attendu:** Statut mis à jour, email confirmation envoyé

#### Gestion activités
- [ ] **Test 4.3.1** - Création activité
  - ✅ **Attendu:** Activité créée, visible sur page Programme
  
- [ ] **Test 4.3.2** - Modification activité
  - ✅ **Attendu:** Modifications enregistrées et affichées
  
- [ ] **Test 4.3.3** - Suppression activité
  - ✅ **Attendu:** Activité supprimée, non visible
  
- [ ] **Test 4.3.4** - Upload image activité
  - ✅ **Attendu:** Image uploadée via Cloudinary

#### Gestion paiements
- [ ] **Test 4.4.1** - Historique transactions PayPal
  - ✅ **Attendu:** Toutes les transactions avec détails
  
- [ ] **Test 4.4.2** - Statistiques paiements
  - ✅ **Attendu:** Total reçu, montant restant, moyennes
  
- [ ] **Test 4.4.3** - Système de remboursement (payout)
  - ✅ **Attendu:** Remboursement effectué, statut mis à jour

#### Suivi activités utilisateurs
- [ ] **Test 4.5.1** - Page ActivityTracking
  - ✅ **Attendu:** Statistiques connexions, inscriptions, paiements
  
- [ ] **Test 4.5.2** - Graphiques de données
  - ✅ **Attendu:** Graphiques affichés correctement

---

## 🔒 TESTS DE SÉCURITÉ

### 2.1 Protection des données

- [ ] **Test Sécu 1** - Tentative accès route protégée sans token
  - ✅ **Attendu:** Erreur 401 "Non autorisé"
  
- [ ] **Test Sécu 2** - Tentative accès route admin avec rôle utilisateur
  - ✅ **Attendu:** Erreur 403 "Permission refusée"
  
- [ ] **Test Sécu 3** - Injection SQL/NoSQL dans formulaires
  - ✅ **Attendu:** Données sanitizées, attaque bloquée
  
- [ ] **Test Sécu 4** - XSS (Cross-Site Scripting) dans commentaires
  - ✅ **Attendu:** Scripts échappés, non exécutés
  
- [ ] **Test Sécu 5** - CSRF (Cross-Site Request Forgery)
  - ✅ **Attendu:** Tokens CSRF validés
  
- [ ] **Test Sécu 6** - Vérification HTTPS en production
  - ✅ **Attendu:** Toutes les URLs en HTTPS
  
- [ ] **Test Sécu 7** - Headers sécurité (Helmet.js)
  - ✅ **Attendu:** Headers X-Frame-Options, CSP, etc. présents
  
- [ ] **Test Sécu 8** - Rate limiting API
  - ✅ **Attendu:** Limitation après N requêtes/minute
  
- [ ] **Test Sécu 9** - Validation fichiers uploadés
  - ✅ **Attendu:** Types MIME vérifiés, taille limitée
  
- [ ] **Test Sécu 10** - Exposition variables d'environnement
  - ✅ **Attendu:** .env dans .gitignore, secrets non exposés

### 2.2 RGPD

- [ ] **Test RGPD 1** - Consentements à l'inscription
  - ✅ **Attendu:** Checkboxes obligatoires pour CGU + traitement données
  
- [ ] **Test RGPD 2** - Export données personnelles
  - ✅ **Attendu:** Fichier JSON complet téléchargeable
  
- [ ] **Test RGPD 3** - Suppression compte utilisateur
  - ✅ **Attendu:** Données anonymisées, compte supprimé
  
- [ ] **Test RGPD 4** - Politique de confidentialité
  - ✅ **Attendu:** Page complète, accessible, claire
  
- [ ] **Test RGPD 5** - Gestion cookies
  - ✅ **Attendu:** Bannière cookies affichée au 1er accès
  
- [ ] **Test RGPD 6** - Retrait consentement marketing
  - ✅ **Attendu:** Consentement retiré, plus d'emails marketing
  
- [ ] **Test RGPD 7** - Logs de consentement (ConsentLog)
  - ✅ **Attendu:** Tous les consentements tracés avec IP, date, version

---

## ⚡ TESTS DE PERFORMANCE

### 3.1 Vitesse de chargement

- [ ] **Test Perf 1** - Page d'accueil < 3 secondes
  - ✅ **Attendu:** Chargement complet < 3s (4G)
  
- [ ] **Test Perf 2** - Images Cloudinary optimisées
  - ✅ **Attendu:** Images WebP, lazy loading
  
- [ ] **Test Perf 3** - Bundle JavaScript minifié
  - ✅ **Attendu:** Taille bundle < 500KB
  
- [ ] **Test Perf 4** - CSS minifié et combiné
  - ✅ **Attendu:** 1 fichier CSS principal
  
- [ ] **Test Perf 5** - Backend ne s'endort pas (UptimeRobot)
  - ✅ **Attendu:** Ping toutes les 5 min, pas de cold start

### 3.2 Responsive

- [ ] **Test Responsive 1** - Mobile (320px - 480px)
  - ✅ **Attendu:** Toutes les pages s'affichent correctement
  
- [ ] **Test Responsive 2** - Tablette (768px - 1024px)
  - ✅ **Attendu:** Layout adapté, navigation fluide
  
- [ ] **Test Responsive 3** - Desktop (1920px+)
  - ✅ **Attendu:** Utilisation espace optimal
  
- [ ] **Test Responsive 4** - Carousel dimensions
  - Desktop: 500-600px, Mobile: 350-450px
  - ✅ **Attendu:** Proportions correctes
  
- [ ] **Test Responsive 5** - Timer position
  - ✅ **Attendu:** Haut sur mobile, position optimale desktop
  
- [ ] **Test Responsive 6** - Formulaires tactiles
  - ✅ **Attendu:** Inputs min 48px hauteur pour touch
  
- [ ] **Test Responsive 7** - Menu mobile
  - ✅ **Attendu:** Hamburger fonctionne, swipe possible

### 3.3 Compatibilité navigateurs

- [ ] **Test Compat 1** - Chrome (dernière version)
  - ✅ **Attendu:** Toutes fonctionnalités OK
  
- [ ] **Test Compat 2** - Firefox (dernière version)
  - ✅ **Attendu:** Toutes fonctionnalités OK
  
- [ ] **Test Compat 3** - Safari (iOS + macOS)
  - ✅ **Attendu:** Toutes fonctionnalités OK
  
- [ ] **Test Compat 4** - Edge (dernière version)
  - ✅ **Attendu:** Toutes fonctionnalités OK
  
- [ ] **Test Compat 5** - Chrome Mobile (Android)
  - ✅ **Attendu:** Toutes fonctionnalités OK
  
- [ ] **Test Compat 6** - Safari Mobile (iOS)
  - ✅ **Attendu:** Toutes fonctionnalités OK

---

## 🔧 CHANGEMENTS RESTANTS À EFFECTUER

### 4.1 PayPal - Passage en Production (CRITIQUE)

**⚠️ IMPORTANT:** Actuellement en mode Sandbox (argent fictif)

#### Étapes à suivre :

1. **Prérequis (1h)**
   - [ ] Créer/configurer compte PayPal Business
   - [ ] Vérifier compte (pièce d'identité, adresse, RIB)
   - [ ] Lever les limites de paiement
   - [ ] Aller sur https://developer.paypal.com/dashboard
   - [ ] Basculer en mode "Live"

2. **Récupérer les identifiants Live (5 min)**
   - [ ] Copier **Client ID Live**
   - [ ] Copier **Client Secret Live**
   - [ ] Noter les identifiants dans un fichier sécurisé

3. **Configuration Frontend - Vercel (10 min)**
   - [ ] Aller sur https://vercel.com/dashboard
   - [ ] Sélectionner projet "gj-camp-website"
   - [ ] Settings → Environment Variables
   - [ ] Modifier `REACT_APP_PAYPAL_CLIENT_ID` :
     ```
     AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb
     →
     <VOTRE_CLIENT_ID_LIVE>
     ```
   - [ ] Sauvegarder
   - [ ] Attendre redeploy (2-3 min)

4. **Configuration Backend - Render (10 min)**
   - [ ] Aller sur https://dashboard.render.com
   - [ ] Sélectionner "gj-camp-backend"
   - [ ] Environment → Modifier :
     ```
     PAYPAL_CLIENT_ID → <VOTRE_CLIENT_ID_LIVE>
     PAYPAL_CLIENT_SECRET → <VOTRE_SECRET_LIVE>
     PAYPAL_MODE → sandbox → live
     ```
   - [ ] Sauvegarder
   - [ ] Attendre redeploy (5 min)

5. **Tests en Production (30 min)**
   - [ ] Faire un paiement test avec **petit montant réel (5€)**
   - [ ] Vérifier que le paiement arrive sur compte PayPal Business
   - [ ] Vérifier inscription créée dans MongoDB
   - [ ] Tester paiement 20€ (partiel)
   - [ ] Tester paiement 120€ (complet)
   - [ ] Vérifier emails de confirmation envoyés

6. **Validation Finale (20 min)**
   - [ ] Vérifier transactions dans Dashboard PayPal
   - [ ] Vérifier inscriptions en base de données
   - [ ] Tester depuis mobile
   - [ ] Documenter les identifiants Production

**📝 Note:** Garder les identifiants Sandbox pour tests futurs

---

### 4.2 UptimeRobot - Monitoring Backend (URGENT)

**⚠️ Problème:** Backend Render se met en sleep après 15 min d'inactivité

#### Configuration UptimeRobot (5 min) :

1. **Créer compte (gratuit)**
   - [ ] Aller sur https://uptimerobot.com
   - [ ] Sign up avec email

2. **Ajouter Monitor**
   - [ ] Cliquer "Add New Monitor"
   - [ ] Configurer :
     ```
     Monitor Type: HTTP(s)
     Friendly Name: GJ Camp Backend
     URL: https://gj-camp-backend.onrender.com/api/health
     Monitoring Interval: 5 minutes
     ```
   - [ ] Alert Contacts → Email principal
   - [ ] Sauvegarder

3. **Vérifier fonctionnement**
   - [ ] Attendre 5-10 min
   - [ ] Vérifier que le backend reste actif
   - [ ] Tester temps de réponse < 1s (pas de cold start)

**✅ Résultat:** Backend ne s'endormira plus

---

### 4.3 Configuration DNS (si pas déjà fait)

- [ ] **Vérifier gjsdecrpt.fr pointe vers Vercel**
  - Type A : `76.76.21.21`
  - Type CNAME : `cname.vercel-dns.com`
  
- [ ] **Vérifier www.gjsdecrpt.fr pointe vers Vercel**
  
- [ ] **Tester les deux URLs:**
  - https://gjsdecrpt.fr
  - https://www.gjsdecrpt.fr

---

### 4.4 Bannière Cookies RGPD (REQUIS)

**⚠️ Obligatoire légalement en France**

#### À implémenter :

1. **Créer composant CookieBanner.js**
   - [ ] Affichage lors de la 1ère visite
   - [ ] Boutons "Accepter tout" / "Refuser" / "Personnaliser"
   - [ ] Sauvegarde choix dans localStorage
   - [ ] Design conforme charte graphique

2. **Cookies utilisés à documenter**
   - [ ] JWT token (auth)
   - [ ] Préférences utilisateur
   - [ ] PayPal cookies (si applicable)

3. **Page Gestion Cookies**
   - [ ] Créer `/gestion-cookies`
   - [ ] Permettre modification consentement
   - [ ] Expliquer utilité de chaque cookie

**Temps estimé:** 2-3 heures

---

### 4.5 Export Données Utilisateur (RGPD)

**Statut:** Partiellement implémenté

#### À vérifier/compléter :

- [ ] Route `/api/user/data/export` fonctionnelle
- [ ] Export inclut toutes les données:
  - Profil utilisateur
  - Inscriptions
  - Transactions
  - Activités sélectionnées
  - Consentements (ConsentLog)
  - Commentaires/Likes (GJ News)
- [ ] Format JSON lisible
- [ ] Téléchargement sécurisé (token JWT requis)
- [ ] Logs d'export (audit trail)

**Temps estimé:** 1 heure

---

### 4.6 Nettoyage Automatique Données (RGPD)

**Statut:** Script créé, à automatiser

#### À faire :

1. **Script de nettoyage**
   - [ ] Vérifier `backend/scripts/dataRetentionCleanup.js` fonctionne
   - [ ] Tester en local

2. **Automatisation (Cron Job)**
   - [ ] Configurer sur Render : Settings → Cron Jobs
   - [ ] Fréquence : Tous les jours à 2h du matin
   - [ ] Commande : `node backend/scripts/dataRetentionCleanup.js`
   - [ ] Logs activés

3. **Règles de nettoyage**
   - [ ] Comptes non vérifiés > 30 jours → Suppression
   - [ ] Données de santé après camp → Suppression
   - [ ] Logs de consentement > 3 ans → Suppression
   - [ ] Inscriptions camp > 3 ans → Anonymisation

**Temps estimé:** 30 min

---

### 4.7 Email Production (À vérifier)

**Statut:** Configuré avec Gmail, à tester en production

#### À vérifier :

- [ ] Email production configuré : `gjcontactgj0@gmail.com`
- [ ] App Password Gmail fonctionnel
- [ ] Emails de vérification envoyés
- [ ] Emails de confirmation inscription envoyés
- [ ] Emails de réinitialisation mot de passe envoyés
- [ ] Templates HTML corrects
- [ ] Pas de spam (vérifier SPF, DKIM, DMARC si possible)

#### Alternative Brevo (si problèmes Gmail) :

- [ ] Créer compte Brevo (gratuit jusqu'à 300 emails/jour)
- [ ] Récupérer clé API
- [ ] Modifier `EMAIL_SERVICE=brevo` sur Render
- [ ] Tester envoi emails

**Temps estimé:** 15 min si OK, 1h si migration Brevo

---

### 4.8 Sauvegardes Base de Données

**⚠️ Critique pour la sécurité des données**

#### À configurer :

1. **MongoDB Atlas Backups**
   - [ ] Aller sur https://cloud.mongodb.com
   - [ ] Sélectionner cluster `Cluster0`
   - [ ] Backup → Configure
   - [ ] Activer "Cloud Backups" (gratuit sur M0)
   - [ ] Configurer fréquence : Quotidien
   - [ ] Retention : 7 jours

2. **Script de backup manuel**
   - [ ] Créer `backend/scripts/backup-db.js`
   - [ ] Exporter collections critiques en JSON
   - [ ] Sauvegarder sur service cloud (AWS S3, Google Drive, etc.)
   - [ ] Automatiser : Cron job hebdomadaire

**Temps estimé:** 1 heure

---

### 4.9 Documentation Utilisateur

#### À créer :

1. **Guide Utilisateur** (`/guide-utilisateur`)
   - [ ] Comment s'inscrire
   - [ ] Comment payer
   - [ ] Comment choisir activités
   - [ ] FAQ

2. **Guide Admin** (`/guide-admin` - protégé)
   - [ ] Gestion utilisateurs
   - [ ] Validation paiements espèces
   - [ ] Création activités
   - [ ] Export données

3. **Vidéos tutoriels** (optionnel)
   - [ ] Inscription étape par étape
   - [ ] Utilisation dashboard admin

**Temps estimé:** 3-4 heures

---

### 4.10 Tests Automatisés (Optionnel mais recommandé)

**Statut:** Tests Jest créés, à compléter

#### À faire :

- [ ] Compléter tests backend :
  - Tests auth (signup, login, verify email) ✅
  - Tests inscription CRPT ✅
  - Tests carousel ✅
  - Tests paiement PayPal (à créer)
  - Tests dashboard admin (à créer)
  
- [ ] Créer tests frontend :
  - Tests composants React (Jest + React Testing Library)
  - Tests intégration (Cypress ou Playwright)
  
- [ ] CI/CD avec GitHub Actions :
  - Lancer tests automatiquement sur chaque push
  - Bloquer merge si tests échouent

**Temps estimé:** 4-6 heures

---

## ✅ CONFIGURATION PRODUCTION

### 5.1 Variables d'Environnement - Checklist

#### Frontend (Vercel)

```env
✅ Vérifier configuration actuelle :
REACT_APP_API_URL=https://gj-camp-backend.onrender.com
REACT_APP_PAYPAL_CLIENT_ID=<ACTUELLEMENT_SANDBOX>

🔴 À CHANGER :
REACT_APP_PAYPAL_CLIENT_ID → <CLIENT_ID_LIVE>
```

#### Backend (Render)

```env
✅ Vérifier configuration actuelle :
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<CONFIGURÉ>
FRONTEND_URL=https://gjsdecrpt.fr,https://www.gjsdecrpt.fr
EMAIL_SERVICE=gmail
EMAIL_USER=gjcontactgj0@gmail.com
EMAIL_PASSWORD=<APP_PASSWORD>

🔴 À CHANGER :
PAYPAL_CLIENT_ID → <CLIENT_ID_LIVE>
PAYPAL_CLIENT_SECRET → <SECRET_LIVE>
PAYPAL_MODE=sandbox → live
```

---

### 5.2 Checklist Déploiement

#### Avant le lancement :

- [ ] **Backend Render**
  - Déployé et accessible
  - Variables d'environnement Production configurées
  - Logs sans erreurs
  - Health check OK (`/api/health`)
  
- [ ] **Frontend Vercel**
  - Déployé sur domaine principal
  - Variables d'environnement Production configurées
  - Build réussi
  - Accessible via https://gjsdecrpt.fr
  
- [ ] **MongoDB Atlas**
  - Cluster actif
  - IP Render whitelistée (ou 0.0.0.0/0)
  - Données de test présentes
  - Backups activés
  
- [ ] **PayPal**
  - Mode Live activé
  - Client ID Live configuré
  - Secret Live configuré
  - Compte Business vérifié
  
- [ ] **Email**
  - Service configuré (Gmail ou Brevo)
  - Tests d'envoi réussis
  - Templates HTML corrects
  
- [ ] **UptimeRobot**
  - Monitor configuré
  - Ping toutes les 5 min
  - Alertes activées

---

## 🎯 VALIDATION FINALE

### 6.1 Scénario Complet - Parcours Utilisateur

**Objectif:** Tester le parcours complet d'un utilisateur de A à Z

#### Étape 1 : Inscription compte
- [ ] Aller sur https://gjsdecrpt.fr
- [ ] Cliquer "S'inscrire"
- [ ] Remplir formulaire avec email réel
- [ ] ✅ Email de vérification reçu (vérifier boîte mail)
- [ ] Cliquer sur lien de vérification
- [ ] ✅ Redirection vers login

#### Étape 2 : Connexion
- [ ] Se connecter avec email + mot de passe
- [ ] ✅ Redirection vers tableau de bord
- [ ] ✅ Token JWT enregistré dans localStorage

#### Étape 3 : Compléter profil
- [ ] Aller dans "Mon Profil"
- [ ] Remplir informations (téléphone, adresse, date naissance)
- [ ] Upload photo de profil
- [ ] ✅ Informations enregistrées

#### Étape 4 : Consulter activités
- [ ] Aller sur "Programme"
- [ ] ✅ 22 activités affichées par jour
- [ ] Sélectionner 3 activités préférées
- [ ] ✅ Choix enregistrés

#### Étape 5 : Inscription au camp
- [ ] Aller sur "Inscription CRPT"
- [ ] Remplir formulaire complet :
  - Refuge : Lorient
  - Allergies : Non
  - Contact d'urgence
- [ ] ✅ Formulaire validé

#### Étape 6 : Paiement PayPal
- [ ] Choisir montant : 20€ (paiement partiel)
- [ ] Cliquer "Payer avec PayPal"
- [ ] ✅ Redirection PayPal
- [ ] Se connecter au compte PayPal Sandbox
- [ ] Valider paiement
- [ ] ✅ Redirection vers site
- [ ] ✅ Message "Inscription réussie !"

#### Étape 7 : Vérifications
- [ ] ✅ Email de confirmation reçu
- [ ] ✅ Inscription visible dans "Mon Dashboard"
- [ ] ✅ Reste à payer = 100€
- [ ] ✅ Transaction visible dans MongoDB (TransactionLog)

#### Étape 8 : Admin vérifie
- [ ] Se connecter en tant qu'admin
- [ ] Aller dans "Gestion Inscriptions"
- [ ] ✅ Nouvelle inscription visible
- [ ] ✅ Statut paiement : "Partiel"
- [ ] ✅ Détails utilisateur corrects

**✅ Si tous les tests passent → Site prêt pour production !**

---

### 6.2 Checklist Go-Live Finale

**Avant d'annoncer officiellement le site :**

#### Critique (Bloquant)
- [ ] PayPal en mode Live ✅
- [ ] UptimeRobot configuré ✅
- [ ] Toutes les pages chargent sans erreur ✅
- [ ] Paiements testés et fonctionnels ✅
- [ ] Emails envoyés et reçus ✅
- [ ] Dashboard admin accessible ✅
- [ ] Domaine gjsdecrpt.fr accessible ✅

#### Important
- [ ] Bannière cookies RGPD ✅
- [ ] Export données RGPD fonctionnel ✅
- [ ] Politique de confidentialité à jour ✅
- [ ] CGU à jour ✅
- [ ] Backups MongoDB configurés ✅
- [ ] Tests responsive OK (mobile + tablette) ✅

#### Optionnel (peut attendre)
- [ ] Tests automatisés complets
- [ ] Documentation utilisateur complète
- [ ] Vidéos tutoriels
- [ ] PWA (Progressive Web App)
- [ ] Mode hors ligne

---

## 📊 RÉSUMÉ - PRIORITÉS

### 🔴 URGENT (À FAIRE AUJOURD'HUI)

1. **PayPal Production** (30 min)
2. **UptimeRobot** (5 min)
3. **Tests parcours utilisateur complet** (30 min)

**Total : ~1h15**

---

### 🟡 IMPORTANT (CETTE SEMAINE)

1. **Bannière cookies RGPD** (2-3h)
2. **Vérification export données** (1h)
3. **Backups MongoDB** (1h)
4. **Nettoyage automatique données** (30 min)
5. **Tests sécurité** (2h)

**Total : ~7h**

---

### 🟢 OPTIONNEL (APRÈS LANCEMENT)

1. **Documentation utilisateur** (3-4h)
2. **Tests automatisés** (4-6h)
3. **Optimisations performance** (2-3h)

**Total : ~10-13h**

---

## � LIENS UTILES

### Production

| Service | URL | Description |
|---------|-----|-------------|
| **Site Principal** | https://gjsdecrpt.fr | Frontend production |
| **Site (www)** | https://www.gjsdecrpt.fr | Alias avec www |
| **Backend API** | https://gj-camp-backend.onrender.com | API Backend |
| **Health Check** | https://gj-camp-backend.onrender.com/api/health | Vérifier statut backend |

### Dashboards & Administration

| Service | URL | Login |
|---------|-----|-------|
| **Vercel** | https://vercel.com/dashboard | GitHub OAuth |
| **Render** | https://dashboard.render.com | render.com account |
| **MongoDB Atlas** | https://cloud.mongodb.com | MongoDB account |
| **Cloudinary** | https://cloudinary.com/console | Cloudinary account |

### PayPal

| Service | URL | Description |
|---------|-----|-------------|
| **PayPal Developer** | https://developer.paypal.com/dashboard | Gérer apps & credentials |
| **PayPal Business** | https://www.paypal.com/businessprofile | Compte business |
| **PayPal Sandbox** | https://sandbox.paypal.com | Tests avec argent fictif |

### Monitoring & Email

| Service | URL | Description |
|---------|-----|-------------|
| **UptimeRobot** | https://uptimerobot.com | Monitoring backend (à configurer) |
| **Brevo (alternative)** | https://app.brevo.com | Service email alternatif |
| **Gmail** | https://mail.google.com | Email actuel: gjcontactgj0@gmail.com |

### Développement

| Service | URL | Description |
|---------|-----|-------------|
| **GitHub Repository** | https://github.com/[votre-username]/GJ-Camp-Website | Code source |
| **GitHub Actions** | https://github.com/[votre-username]/GJ-Camp-Website/actions | CI/CD (si configuré) |
| **Vercel Deployments** | https://vercel.com/[username]/gj-camp-website/deployments | Historique déploiements |
| **Render Logs** | https://dashboard.render.com/web/[service-id]/logs | Logs backend en temps réel |

### Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Documentation principale projet |
| [RECAPITULATIF_COMPLET_9JAN.md](RECAPITULATIF_COMPLET_9JAN.md) | État du projet au 9 janvier |
| [PAYPAL_PRODUCTION.md](PAYPAL_PRODUCTION.md) | Guide passage PayPal Live |
| [RGPD.md](RGPD.md) | Conformité RGPD |
| [CAHIER_RECETTAGE.md](CAHIER_RECETTAGE.md) | Tests détaillés |

### Outils de Test

| Outil | URL | Usage |
|-------|-----|-------|
| **Postman** | https://www.postman.com | Tests API manuels |
| **PageSpeed Insights** | https://pagespeed.web.dev | Tester performance |
| **GTmetrix** | https://gtmetrix.com | Analyse vitesse chargement |
| **SSL Labs** | https://www.ssllabs.com/ssltest | Vérifier certificat SSL |
| **WAVE** | https://wave.webaim.org | Accessibilité |

### Réseaux Sociaux GJ Camp

| Plateforme | URL |
|------------|-----|
| **Instagram** | https://www.instagram.com/generationjosue |
| **Facebook** | https://www.facebook.com/generationjosue |
| **YouTube** | https://www.youtube.com/@generationjosue |

---

## 📝 NOTES IMPORTANTES

### Contacts & Accès Rapides

- **Domaine principal:** https://gjsdecrpt.fr
- **Backend API:** https://gj-camp-backend.onrender.com
- **Email support:** gjcontactgj0@gmail.com
- **MongoDB Cluster:** Cluster0 (gj-camp database)

### Support & Dépannage

- **Documentation projet:** Voir [README.md](README.md)
- **En cas de problème:** 
  1. Vérifier logs Render: https://dashboard.render.com
  2. Vérifier logs Vercel: https://vercel.com/dashboard
  3. Tester backend: https://gj-camp-backend.onrender.com/api/health
- **Tests API:** Utiliser Postman ou `curl`
- **Issues GitHub:** Créer une issue sur le repository

---

## ✅ CONCLUSION

Le site GJ Camp est **à 90% prêt pour la production**.

**Bloquants critiques restants :**
1. Passage PayPal en mode Live
2. Configuration UptimeRobot

**Une fois ces 2 points réglés (total 35 min), le site peut être officiellement lancé.**

Les autres points (RGPD, backups, documentation) sont importants mais non bloquants et peuvent être complétés dans les jours/semaines suivant le lancement.

---

**Date de dernière mise à jour:** 12 janvier 2026  
**Prochaine révision:** Après passage en production
