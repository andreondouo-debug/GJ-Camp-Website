---
title: "Cahier de Recettage - Site GJ Camp"
author: "Génération Josué"
date: "2 décembre 2025"
subject: "Documentation de test"
keywords: [recettage, test, validation, GJ Camp]
---

<style>
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
}
h1 {
    color: #a01e1e;
    border-bottom: 3px solid #d4af37;
    padding-bottom: 10px;
    page-break-before: always;
}
h2 {
    color: #001a4d;
    border-left: 5px solid #d4af37;
    padding-left: 15px;
    margin-top: 30px;
    background: linear-gradient(90deg, rgba(212,175,55,0.1) 0%, transparent 100%);
    padding: 10px 15px;
}
h3 {
    color: #3b5998;
    margin-top: 20px;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
th {
    background: linear-gradient(135deg, #a01e1e 0%, #d4283c 100%);
    color: white;
    padding: 12px 8px;
    text-align: left;
    font-weight: 600;
}
td {
    padding: 10px 8px;
    border-bottom: 1px solid #e0e0e0;
}
tr:nth-child(even) {
    background-color: #f8f9fa;
}
tr:hover {
    background-color: #fff3cd;
}
.status-ok { color: #28a745; font-weight: bold; }
.status-ko { color: #dc3545; font-weight: bold; }
.status-partial { color: #ffc107; font-weight: bold; }
.page-break { page-break-after: always; }
blockquote {
    border-left: 4px solid #d4af37;
    padding-left: 20px;
    margin: 20px 0;
    background: #fffaf0;
    padding: 15px 20px;
}
code {
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    color: #a01e1e;
}
</style>

# 📋 Cahier de Recettage - Site GJ Camp

## 🎯 Objectif
Ce document sert à valider l'ensemble des fonctionnalités du site Génération Josué (GJ Camp) avant mise en production.

---

## 📊 Légende des statuts
- ✅ **OK** : Fonctionnalité testée et validée
- ❌ **KO** : Fonctionnalité en erreur
- ⚠️ **Partiel** : Fonctionnalité partiellement fonctionnelle
- 🔄 **En cours** : Test en cours
- ⏸️ **Non testé** : Test non effectué

---

## 1️⃣ AUTHENTIFICATION & GESTION DES COMPTES

### 1.1 Inscription utilisateur
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 1.1.1 | Inscription avec email valide | Email: test@example.com<br>Prénom: Jean<br>Nom: Dupont<br>Password: Test123! | Compte créé, email de vérification envoyé | ⏸️ | |
| 1.1.2 | Inscription avec email déjà utilisé | Email existant | Message d'erreur "Cet email est déjà utilisé" | ⏸️ | |
| 1.1.3 | Inscription avec mot de passe faible | Password: 123 | Message d'erreur validation mot de passe | ⏸️ | |
| 1.1.4 | Inscription avec champs manquants | Champs vides | Messages d'erreur pour champs obligatoires | ⏸️ | |
| 1.1.5 | Inscription avec email invalide | Email: test@invalid | Message d'erreur format email | ⏸️ | |

### 1.2 Vérification email
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 1.2.1 | Clic sur lien de vérification valide | Token valide (<24h) | Email vérifié, redirection vers login | ⏸️ | |
| 1.2.2 | Clic sur lien de vérification expiré | Token >24h | Message d'erreur "Token expiré" | ⏸️ | |
| 1.2.3 | Clic sur lien de vérification invalide | Token incorrect | Message d'erreur "Token invalide" | ⏸️ | |
| 1.2.4 | Admin confirme email manuellement | Admin → Gestion Utilisateurs → Confirmer email | Email marqué comme vérifié | ⏸️ | |

### 1.3 Connexion
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 1.3.1 | Connexion avec identifiants valides | Email + password corrects | Connexion réussie, redirection tableau de bord | ⏸️ | |
| 1.3.2 | Connexion avec email non vérifié | Email non vérifié | Message "Veuillez vérifier votre email" | ⏸️ | |
| 1.3.3 | Connexion avec mauvais mot de passe | Password incorrect | Message "Identifiants incorrects" | ⏸️ | |
| 1.3.4 | Connexion avec email inexistant | Email non enregistré | Message "Identifiants incorrects" | ⏸️ | |
| 1.3.5 | Connexion avec compte désactivé | Compte isActive=false | Message d'erreur approprié | ⏸️ | |

### 1.4 Gestion du profil
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 1.4.1 | Complétion profil utilisateur | Téléphone, adresse, date naissance | Profil mis à jour | ⏸️ | |
| 1.4.2 | Upload photo de profil | Image <2MB | Photo uploadée et affichée | ⏸️ | |
| 1.4.3 | Upload photo trop grande | Image >2MB | Message d'erreur taille maximale | ⏸️ | |
| 1.4.4 | Modification informations personnelles | Changement prénom/nom | Informations mises à jour | ⏸️ | |
| 1.4.5 | Changement mot de passe | Ancien + nouveau password | Mot de passe changé | ⏸️ | |

### 1.5 Déconnexion
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 1.5.1 | Clic sur bouton déconnexion | - | Déconnexion, redirection page d'accueil | ⏸️ | |
| 1.5.2 | Token JWT expiré | Token >7 jours | Déconnexion automatique | ⏸️ | |

---

## 2️⃣ GESTION DES RÔLES & PERMISSIONS

### 2.1 Rôles utilisateur
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 2.1.1 | Utilisateur standard voit menu limité | Role: utilisateur | Menus: Accueil, Programme, Activités, Newsletter, Messages, Tableau de bord | ⏸️ | |
| 2.1.2 | Référent voit menu étendu | Role: referent | Menus + Gestion (Profil, Inscriptions, Activités) | ⏸️ | |
| 2.1.3 | Responsable voit menu complet | Role: responsable | Tous menus + Suivi Activités, Utilisateurs, Messages, Redistributions | ⏸️ | |
| 2.1.4 | Admin voit menu complet | Role: admin | Tous menus + toutes fonctions admin | ⏸️ | |

### 2.2 Modification des rôles
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 2.2.1 | Admin change rôle utilisateur → referent | Admin → Gestion Utilisateurs | Rôle modifié, audit créé | ⏸️ | |
| 2.2.2 | Responsable change rôle utilisateur → admin | Responsable (non super admin) | Erreur "Permission refusée" | ⏸️ | |
| 2.2.3 | Super Admin change rôle responsable → admin | Super admin | Rôle modifié, audit créé | ⏸️ | |
| 2.2.4 | Consultation historique changements rôles | Admin → Audits | Liste complète des changements de rôles | ⏸️ | |

---

## 3️⃣ INSCRIPTION AU CAMP

### 3.1 Inscription participant
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 3.1.1 | Inscription avec paiement complet (120€) | Montant: 120€ | Inscription validée, statut "confirmed" | ⏸️ | |
| 3.1.2 | Inscription avec paiement partiel (50€) | Montant: 50€ | Inscription validée, reste dû affiché | ⏸️ | |
| 3.1.3 | Inscription avec paiement minimum (20€) | Montant: 20€ | Inscription validée, reste dû 100€ | ⏸️ | |
| 3.1.4 | Inscription avec montant < minimum | Montant: 15€ | Erreur "Montant minimum 20€" | ⏸️ | |
| 3.1.5 | Inscription sans email vérifié | Email non vérifié | Erreur "Veuillez vérifier votre email" | ⏸️ | |
| 3.1.6 | Inscription sans profil complété | Profil incomplet | Erreur "Veuillez compléter votre profil" | ⏸️ | |

### 3.2 Inscription invité (Guest)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 3.2.1 | Inscription invité par utilisateur connecté | Infos invité + paiement | Inscription invité créée et liée à l'utilisateur | ⏸️ | |
| 3.2.2 | Inscription invité avec paiement | Montant ≥20€ | Inscription validée | ⏸️ | |
| 3.2.3 | Liste des invités par utilisateur | Tableau de bord | Tous les invités de l'utilisateur affichés | ⏸️ | |

### 3.3 Paiement PayPal
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 3.3.1 | Paiement PayPal réussi | Sandbox PayPal | Order créé, payment capturé, inscription validée | ⏸️ | |
| 3.3.2 | Paiement PayPal annulé | Annulation pendant paiement | Inscription non validée, message approprié | ⏸️ | |
| 3.3.3 | Paiement PayPal échoué | Erreur PayPal | Message d'erreur, inscription non validée | ⏸️ | |
| 3.3.4 | Vérification sécurité PayPal | orderID + payerID | Validation côté serveur avant confirmation | ⏸️ | |
| 3.3.5 | Log des transactions PayPal | Toute transaction | TransactionLog créé avec tous les détails | ⏸️ | |

### 3.4 Suivi des inscriptions (Responsable)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 3.4.1 | Liste toutes les inscriptions | Responsable → Suivi Inscriptions | Toutes inscriptions affichées avec filtres | ⏸️ | |
| 3.4.2 | Filtrage par statut | Filtre: confirmed | Seulement inscriptions confirmées | ⏸️ | |
| 3.4.3 | Recherche par nom | Nom: Dupont | Résultats contenant "Dupont" | ⏸️ | |
| 3.4.4 | Export Excel inscriptions | Clic export | Fichier .xlsx téléchargé avec toutes données | ⏸️ | |
| 3.4.5 | Modification statut inscription | Change pending → confirmed | Statut mis à jour | ⏸️ | |
| 3.4.6 | Enregistrement paiement manuel | Responsable → Enregistrer paiement | Paiement ajouté, reste dû recalculé | ⏸️ | |

---

## 4️⃣ GESTION DES ACTIVITÉS

### 4.1 Création d'activités (Responsable)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 4.1.1 | Création activité simple | Titre, description, lieu, horaire | Activité créée | ⏸️ | |
| 4.1.2 | Création avec image | Upload image <5MB | Image uploadée et affichée | ⏸️ | |
| 4.1.3 | Création avec campus spécifique | Campus: Paris | Activité liée au campus | ⏸️ | |
| 4.1.4 | Création avec nombre max participants | maxParticipants: 50 | Limite enregistrée | ⏸️ | |
| 4.1.5 | Upload image trop grande | Image >5MB | Erreur taille maximale | ⏸️ | |

### 4.2 Modification d'activités
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 4.2.1 | Modification titre/description | Nouvelles données | Activité mise à jour | ⏸️ | |
| 4.2.2 | Changement image | Nouvelle image | Ancienne supprimée, nouvelle affichée | ⏸️ | |
| 4.2.3 | Modification horaires | Nouveaux horaires | Horaires mis à jour | ⏸️ | |

### 4.3 Suppression d'activités
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 4.3.1 | Suppression activité sans participants | Activité vide | Activité supprimée | ⏸️ | |
| 4.3.2 | Suppression activité avec participants | Activité avec inscrits | Confirmation demandée, puis suppression | ⏸️ | |

### 4.4 Suivi des participants
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 4.4.1 | Marquer participant présent | Clic sur checkbox présence | Statut "present" enregistré | ⏸️ | |
| 4.4.2 | Marquer participant absent | Décoche présence | Statut "absent" enregistré | ⏸️ | |
| 4.4.3 | Voir liste participants par activité | Responsable → Activité → Participants | Liste complète avec statuts | ⏸️ | |
| 4.4.4 | Export participants | Export Excel | Fichier avec tous participants et statuts | ⏸️ | |
| 4.4.5 | Statistiques temps réel | Vue Suivi Activités | Graphiques présences/absences/taux participation | ⏸️ | |

### 4.5 Consultation activités (Utilisateur)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 4.5.1 | Liste des activités disponibles | Page Activités | Toutes activités affichées | ⏸️ | |
| 4.5.2 | Filtrage par campus | Sélection campus | Activités filtrées | ⏸️ | |
| 4.5.3 | Filtrage par jour | Sélection jour | Activités du jour affichées | ⏸️ | |
| 4.5.4 | Inscription à une activité | Clic "S'inscrire" | Inscription enregistrée | ⏸️ | |
| 4.5.5 | Désinscription d'une activité | Clic "Se désinscrire" | Désinscription enregistrée | ⏸️ | |
| 4.5.6 | Activité complète | maxParticipants atteint | Bouton "Complet" affiché, inscription impossible | ⏸️ | |

---

## 5️⃣ SYSTÈME DE MESSAGERIE

### 5.1 Envoi de messages (Utilisateur)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 5.1.1 | Envoi message à tous responsables | Type: all-responsables | Message reçu par tous responsables/admin/referents | ⏸️ | |
| 5.1.2 | Envoi message à responsable spécifique | Sélection 1 responsable | Message reçu par ce responsable uniquement | ⏸️ | |
| 5.1.3 | Envoi message à plusieurs responsables | Sélection multiple | Message reçu par tous sélectionnés | ⏸️ | |
| 5.1.4 | Sélection globale responsables | Bouton "Tout sélectionner" | Tous responsables cochés | ⏸️ | |
| 5.1.5 | Déselection globale | Bouton "Tout désélectionner" | Tous responsables décochés | ⏸️ | |
| 5.1.6 | Envoi message anonyme | Checkbox anonyme cochée | Message envoyé sans identité expéditeur | ⏸️ | |
| 5.1.7 | Envoi avec priorité élevée | Priorité: high | Badge priorité affiché | ⏸️ | |
| 5.1.8 | Envoi avec priorité urgente | Priorité: urgent | Badge urgent + emoji 🚨 | ⏸️ | |
| 5.1.9 | Validation champs obligatoires | Sujet ou contenu vide | Erreur validation | ⏸️ | |

### 5.2 Réception et lecture messages
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 5.2.1 | Badge messages non lus dans Header | Nouveaux messages | Badge rouge avec chiffre exact | ⏸️ | |
| 5.2.2 | Icône message dans menu | Menu principal | Icône enveloppe affichée | ⏸️ | |
| 5.2.3 | Mise à jour badge en temps réel | Consultation inbox | Badge disparaît après lecture | ⏸️ | |
| 5.2.4 | Actualisation automatique | Attendre 30s | Badge se met à jour automatiquement | ⏸️ | |
| 5.2.5 | Boîte de réception | Onglet Inbox | Messages reçus affichés | ⏸️ | |
| 5.2.6 | Messages envoyés | Onglet Sent | Messages envoyés affichés | ⏸️ | |
| 5.2.7 | Détail message | Clic sur message | Détails complets affichés | ⏸️ | |
| 5.2.8 | Marquage comme lu | Ouverture message | Status passe à "read" | ⏸️ | |

### 5.3 Gestion messages (Responsable)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 5.3.1 | Voir tous les messages | Gestion → Messages | Tous messages affichés | ⏸️ | |
| 5.3.2 | Filtrage messages non lus | Filtre: unread | Seulement messages non lus | ⏸️ | |
| 5.3.3 | Filtrage messages prioritaires | Filtre: priority | Seulement urgent + high | ⏸️ | |
| 5.3.4 | Filtrage messages répondus | Filtre: replied | Seulement avec réponses | ⏸️ | |
| 5.3.5 | Statistiques messages | Vue statistiques | Nombre non lus, prioritaires, total | ⏸️ | |
| 5.3.6 | Répondre en privé | Type: private | Réponse visible par expéditeur uniquement | ⏸️ | |
| 5.3.7 | Répondre à tous utilisateurs | Type: all-users | Réponse visible par tous utilisateurs | ⏸️ | |
| 5.3.8 | Répondre à tous responsables | Type: all-responsables | Réponse visible par tous responsables | ⏸️ | |
| 5.3.9 | Archiver message | Clic "Archiver" | Message archivé | ⏸️ | |
| 5.3.10 | Badge dans dropdown Gestion | Dropdown GESTION | Badge rouge sur "Messages" si non lus | ⏸️ | |

---

## 6️⃣ SYSTÈME DE POSTS & NEWSLETTER

### 6.1 Création de posts (Responsable)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 6.1.1 | Création post texte simple | Titre + contenu | Post créé | ⏸️ | |
| 6.1.2 | Création post avec image | Image <5MB | Post avec image affiché | ⏸️ | |
| 6.1.3 | Création post avec sondage | Question + options | Sondage créé et affiché | ⏸️ | |
| 6.1.4 | Création sondage multi-options | 5 options | Toutes options affichées | ⏸️ | |

### 6.2 Interaction avec posts (Utilisateur)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 6.2.1 | Like d'un post | Clic ❤️ | Like ajouté, compteur +1 | ⏸️ | |
| 6.2.2 | Unlike d'un post | Re-clic ❤️ | Like retiré, compteur -1 | ⏸️ | |
| 6.2.3 | Commentaire sur post | Texte commentaire | Commentaire ajouté et affiché | ⏸️ | |
| 6.2.4 | Vote sondage | Sélection option + vote | Vote enregistré, résultats mis à jour | ⏸️ | |
| 6.2.5 | Voir résultats sondage | Après vote | Pourcentages affichés | ⏸️ | |
| 6.2.6 | Vote unique | Re-vote sur même sondage | Erreur "Déjà voté" | ⏸️ | |
| 6.2.7 | Sondage reste affiché après vote | Après vote | Sondage toujours visible avec résultats | ⏸️ | |

### 6.3 Gestion posts (Responsable)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 6.3.1 | Modification post | Changement contenu | Post mis à jour | ⏸️ | |
| 6.3.2 | Suppression post | Clic supprimer | Post supprimé | ⏸️ | |
| 6.3.3 | Suppression commentaire inapproprié | Responsable → Supprimer commentaire | Commentaire supprimé | ⏸️ | |

---

## 7️⃣ SYSTÈME DE REDISTRIBUTIONS (PAYOUTS)

### 7.1 Demande de payout (Utilisateur)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 7.1.1 | Demande payout avec montant valide | Montant ≥5€ | Demande créée, statut "pending" | ⏸️ | |
| 7.1.2 | Demande payout montant < minimum | Montant: 3€ | Erreur "Montant minimum 5€" | ⏸️ | |
| 7.1.3 | Demande payout sans email PayPal | Email vide | Erreur "Email PayPal requis" | ⏸️ | |
| 7.1.4 | Consultation statut demande | Tableau de bord | Statut affiché (pending/processing/completed/failed) | ⏸️ | |

### 7.2 Gestion payouts (Responsable)
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 7.2.1 | Liste toutes demandes | Gestion → Redistributions | Toutes demandes affichées | ⏸️ | |
| 7.2.2 | Filtrage par statut | Filtre: pending | Seulement demandes en attente | ⏸️ | |
| 7.2.3 | Traitement payout | Responsable → Traiter | Payout envoyé via PayPal | ⏸️ | |
| 7.2.4 | Payout réussi | Sandbox PayPal | Statut "completed", batch ID enregistré | ⏸️ | |
| 7.2.5 | Payout échoué | Erreur PayPal | Statut "failed", message d'erreur | ⏸️ | |
| 7.2.6 | Vérification statut payout | Clic "Vérifier statut" | Statut actualisé depuis PayPal | ⏸️ | |
| 7.2.7 | Log transactions payout | TransactionLog | Toutes transactions enregistrées | ⏸️ | |

---

## 8️⃣ GESTION DES UTILISATEURS (ADMIN)

### 8.1 Liste et recherche
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 8.1.1 | Liste tous utilisateurs | Gestion → Utilisateurs | Tous utilisateurs affichés | ⏸️ | |
| 8.1.2 | Recherche par nom | Nom: Dupont | Résultats filtrés | ⏸️ | |
| 8.1.3 | Recherche par email | Email partiel | Résultats correspondants | ⏸️ | |
| 8.1.4 | Filtrage par rôle | Rôle: responsable | Seulement responsables | ⏸️ | |
| 8.1.5 | Filtrage par statut email | Email vérifié: oui | Seulement emails vérifiés | ⏸️ | |
| 8.1.6 | Tri par date inscription | Tri croissant/décroissant | Liste triée correctement | ⏸️ | |

### 8.2 Modification utilisateurs
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 8.2.1 | Modification profil utilisateur | Admin → Edit user | Profil mis à jour | ⏸️ | |
| 8.2.2 | Désactivation compte | isActive → false | Compte désactivé, connexion impossible | ⏸️ | |
| 8.2.3 | Réactivation compte | isActive → true | Compte réactivé | ⏸️ | |
| 8.2.4 | Modification permissions | Ajout/retrait permissions | Permissions mises à jour | ⏸️ | |

### 8.3 Audit et traçabilité
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 8.3.1 | Historique changements rôles | Admin → Audits | Liste complète avec dates, auteurs, changements | ⏸️ | |
| 8.3.2 | Filtrage audits par utilisateur | UserID spécifique | Audits de cet utilisateur uniquement | ⏸️ | |
| 8.3.3 | Filtrage audits par admin | AdminID spécifique | Audits effectués par cet admin | ⏸️ | |

---

## 9️⃣ INTERFACE & NAVIGATION

### 9.1 Page d'accueil
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 9.1.1 | Carrousel images | 3+ images | Défilement automatique avec effets | ⏸️ | |
| 9.1.2 | Effets transitions carrousel | Navigation prev/next | Effet balayage + zoom + luminosité | ⏸️ | |
| 9.1.3 | Indicateurs carrousel | Dots en bas | Couleur or (#d4af37) | ⏸️ | |
| 9.1.4 | Timer compte à rebours | Avant date camp | Jours/heures/minutes/secondes | ⏸️ | |
| 9.1.5 | Section À Propos | Scroll vers #apropos | Section visible | ⏸️ | |
| 9.1.6 | Footer | Bas de page | Coordonnées + réseaux sociaux | ⏸️ | |

### 9.2 Navigation & Menu
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 9.2.1 | Menu responsive | Mobile | Menu hamburger affiché | ⏸️ | |
| 9.2.2 | Dropdown Gestion | Hover/clic GESTION | Sous-menu déroulé | ⏸️ | |
| 9.2.3 | Dropdown selon rôle | Différents rôles | Options adaptées au rôle | ⏸️ | |
| 9.2.4 | Badge messages dans menu | Messages non lus | Badge rouge animé | ⏸️ | |
| 9.2.5 | Icône messages | Menu principal | Icône enveloppe blanche | ⏸️ | |

### 9.3 Tableau de bord
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 9.3.1 | Vue utilisateur standard | Role: utilisateur | Infos profil + inscriptions + invités | ⏸️ | |
| 9.3.2 | Vue responsable | Role: responsable | Stats supplémentaires + raccourcis gestion | ⏸️ | |
| 9.3.3 | Widgets personnalisés | Selon rôle | Widgets adaptés | ⏸️ | |

### 9.4 Design & Styles
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 9.4.1 | Couleurs éclaircies | Toutes pages | Bleu #3b5998, Rouge #e74c3c au lieu de couleurs sombres | ⏸️ | |
| 9.4.2 | Animations fluides | Toutes transitions | Animations sans saccades | ⏸️ | |
| 9.4.3 | Responsive design | Mobile/Tablet/Desktop | Affichage adapté | ⏸️ | |
| 9.4.4 | Accessibilité | Navigation clavier | Tous éléments accessibles | ⏸️ | |

---

## 🔟 SÉCURITÉ & PERFORMANCE

### 10.1 Sécurité
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 10.1.1 | Routes protégées sans token | Accès direct API sans auth | Erreur 401 Unauthorized | ⏸️ | |
| 10.1.2 | CORS configuration | Requête depuis autre domaine | Bloquée si non autorisée | ⏸️ | |
| 10.1.3 | Validation données backend | Injection SQL/XSS | Données nettoyées/rejetées | ⏸️ | |
| 10.1.4 | Hash mots de passe | BDD | Passwords jamais en clair | ⏸️ | |
| 10.1.5 | Token JWT expiration | Token >7 jours | Déconnexion automatique | ⏸️ | |
| 10.1.6 | Upload fichiers | Fichiers malveillants | Validation type + taille | ⏸️ | |
| 10.1.7 | PayPal security checks | Validation côté serveur | orderID + payerID vérifiés | ⏸️ | |

### 10.2 Performance
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 10.2.1 | Temps chargement page accueil | - | <3 secondes | ⏸️ | |
| 10.2.2 | Optimisation images | Images lourdes | Compression automatique | ⏸️ | |
| 10.2.3 | Pagination longues listes | >100 items | Pagination fonctionnelle | ⏸️ | |
| 10.2.4 | Cache navigateur | Fichiers statiques | Cache efficace | ⏸️ | |

### 10.3 Gestion des erreurs
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 10.3.1 | Erreur serveur 500 | Backend down | Message utilisateur clair | ⏸️ | |
| 10.3.2 | Erreur réseau | Perte connexion | Message "Problème de connexion" | ⏸️ | |
| 10.3.3 | Erreurs validation | Formulaires | Messages d'erreur en français | ⏸️ | |
| 10.3.4 | Logs erreurs serveur | Console backend | Erreurs loggées avec emoji 🚨/❌ | ⏸️ | |

---

## 1️⃣1️⃣ NOTIFICATIONS & EMAILS

### 11.1 Emails transactionnels
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 11.1.1 | Email vérification compte | Après inscription | Email reçu avec lien valide | ⏸️ | |
| 11.1.2 | Email confirmation inscription | Après paiement | Email de confirmation reçu | ⏸️ | |
| 11.1.3 | Email modification statut | Changement statut inscription | Email notification | ⏸️ | |
| 11.1.4 | Email en français | Tous emails | Contenu en français | ⏸️ | |

### 11.2 Système de notifications
| # | Scénario de test | Données de test | Résultat attendu | Statut | Commentaires |
|---|------------------|-----------------|------------------|--------|--------------|
| 11.2.1 | Notification nouveau message | Message reçu | Notification affichée | ⏸️ | |
| 11.2.2 | Notification inscription activité | Nouvel inscrit | Responsable notifié | ⏸️ | |
| 11.2.3 | Badge notifications | Multiple notifications | Compteur exact affiché | ⏸️ | |

---

## 🎓 SCÉNARIOS COMPLETS (End-to-End)

### Scénario 1: Parcours utilisateur complet
```
1. Inscription nouveau compte
2. Vérification email
3. Connexion
4. Complétion profil
5. Inscription au camp avec paiement
6. Inscription à une activité
7. Envoi message à responsable
8. Consultation réponse
9. Vote sur sondage newsletter
```

**Résultat attendu**: Parcours complet fonctionnel sans erreur | **Statut**: ⏸️

### Scénario 2: Parcours responsable complet
```
1. Connexion responsable
2. Consultation nouvelles inscriptions
3. Validation inscription
4. Création nouvelle activité
5. Consultation participants activité
6. Marquage présences
7. Réponse à message utilisateur
8. Création post newsletter avec sondage
9. Traitement demande payout
```

**Résultat attendu**: Parcours complet fonctionnel sans erreur | **Statut**: ⏸️

### Scénario 3: Parcours admin complet
```
1. Connexion admin
2. Création nouveau responsable
3. Changement rôle utilisateur
4. Validation email manuellement
5. Consultation audits
6. Modification profil utilisateur
7. Export données inscriptions
8. Vérification logs transactions PayPal
```

**Résultat attendu**: Parcours complet fonctionnel sans erreur | **Statut**: ⏸️

---

## 📝 NOTES & OBSERVATIONS

### Bugs identifiés
| Date | Composant | Description | Priorité | Statut |
|------|-----------|-------------|----------|--------|
| | | | | |

### Améliorations suggérées
| Date | Composant | Description | Priorité | Statut |
|------|-----------|-------------|----------|--------|
| | | | | |

---

## ✅ VALIDATION FINALE

### Checklist pré-production
- [ ] Tous tests critiques validés (✅)
- [ ] Aucun bug bloquant
- [ ] Performance acceptable (<3s chargement)
- [ ] Sécurité validée
- [ ] Responsive testé (Mobile/Tablet/Desktop)
- [ ] Emails fonctionnels
- [ ] PayPal production configuré
- [ ] Backup BDD effectué
- [ ] Documentation à jour
- [ ] Formation responsables effectuée

### Environnements testés
- [ ] Développement (localhost)
- [ ] Staging/Recette
- [ ] Production

### Navigateurs testés
- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (dernière version)
- [ ] Edge (dernière version)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 📞 CONTACTS & RESPONSABILITÉS

| Rôle | Nom | Email | Responsabilités |
|------|-----|-------|-----------------|
| Chef de projet | | | Validation globale |
| Développeur | | | Tests techniques |
| Testeur fonctionnel | | | Tests utilisateurs |
| Responsable GJ | | | Validation métier |

---

**Date de création**: 2 décembre 2025  
**Dernière mise à jour**: 2 décembre 2025  
**Version**: 1.0  
**Statut global**: 🔄 En cours de recettage
