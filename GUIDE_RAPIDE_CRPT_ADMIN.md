# 🚀 Guide Rapide : Personnaliser la Page GJ CRPT

## ⚡ Accès Rapide

**URL Admin :** https://gjsdecrpt.fr/parametres/crpt  
**Compte requis :** Admin uniquement

---

## 📋 Étapes Simples

### 1️⃣ Se connecter
- Aller sur https://gjsdecrpt.fr/login
- Se connecter avec compte admin

### 2️⃣ Accéder aux paramètres CRPT
- Cliquer sur **"Paramètres"** dans le menu
- Ou aller directement sur `/parametres/crpt`

### 3️⃣ Choisir une section à modifier

#### 🎯 **Hero** (En-tête)
- **Image de fond** : URL de l'image principale
- **Logo** : URL du logo CRPT
- **Titre et sous-titre** : Texte d'accueil
- **Statistiques** : 3 chiffres clés (icône + nombre + label)

#### 📋 **Mission** (Présentation)
- **Badge** : Petit texte coloré
- **Titre** : "Qui sommes-nous ?"
- **Texte principal** : Description de la mission
- **Carte flottante** : Encadré avec icône

#### ⭐ **Valeurs** (Ce qui nous anime)
- **Liste de valeurs** : Ajouter/supprimer avec ➕/🗑️
- **Pour chaque valeur** :
  - Icône emoji (📖, ❤️, etc.)
  - Titre
  - Description
  - Couleur de l'icône

#### 🏛️ **Refuges** (Nos implantations)
- **Liste de refuges** : Ajouter/supprimer avec ➕/🗑️
- **Pour chaque refuge** :
  - Nom (Paris, Lyon, etc.)
  - Région (Île-de-France, etc.)
  - Description
  - Icône et couleur

#### 🎨 **Styles Globaux**
- **Couleurs** : Primaire, secondaire, accent
- **Typographie** : Police de caractères
- **Effets** :
  - ✓ Activer les animations
  - ✓ Effets au survol
  - ✓ Glassmorphism
  - ✓ Parallax

### 4️⃣ Sauvegarder
- Cliquer sur **"💾 Enregistrer tous les paramètres"**
- Message de confirmation : **"✅ Paramètres CRPT sauvegardés avec succès !"**

### 5️⃣ Voir le résultat
- Aller sur https://gjsdecrpt.fr/gj-crpt
- La page affiche vos modifications immédiatement

---

## 💡 Astuces

### Couleurs
- Cliquer sur le carré de couleur pour ouvrir le sélecteur
- Ou entrer un code couleur (ex: #a01e1e)

### Images
- Entrer l'URL complète (ex: /images/mon-image.jpg)
- Ou utiliser une URL externe (ex: https://...)

### Icônes
- Utiliser des emojis : 📖 ❤️ 🤝 🌟 🏛️ 👥 📅
- Copier-coller depuis https://emojipedia.org

### Animations
- **fade-in** : Apparition progressive
- **slide-up** : Glisse vers le haut
- **zoom-in** : Zoom depuis le centre
- **float** : Flottement
- **pulse** : Pulsation
- **none** : Aucune animation

### Effets au survol
- **lift** : La carte s'élève
- **glow** : Ombre lumineuse
- **none** : Aucun effet

---

## ❓ FAQ

### Q: Puis-je ajouter plus de valeurs ?
**R:** Oui ! Cliquez sur **"➕ Ajouter une valeur"** en bas de la liste.

### Q: Puis-je supprimer un refuge ?
**R:** Oui ! Cliquez sur **"🗑️"** en haut à droite de la carte du refuge.

### Q: Comment choisir une bonne couleur ?
**R:** Utilisez des couleurs qui contrastent bien :
- Rouge CRPT : #a01e1e
- Doré : #d4af37
- Bleu foncé : #001a4d
- Violet : #667eea

### Q: Les modifications sont-elles visibles immédiatement ?
**R:** Oui ! Dès que vous sauvegardez, la page CRPT utilise les nouveaux paramètres.

### Q: Puis-je revenir en arrière ?
**R:** Le système garde l'historique dans MongoDB. En cas de problème, contactez le développeur pour restaurer une version précédente.

---

## 🛠️ Fonctionnalités Avancées

### Grille de cartes
- **gridColumns** : Nombre de colonnes (1-4)
- Exemple : 3 colonnes = affichage en 3 cartes par ligne

### Opacité de l'overlay
- **0%** : Image de fond visible à 100%
- **50%** : Image assombrie à 50%
- **100%** : Fond complètement noir

### Tailles de police
- **rem** : Unité responsive (1rem = 16px)
- Exemples :
  - Petit : 1rem
  - Moyen : 1.5rem
  - Grand : 2.5rem
  - Très grand : 3.5rem

---

## 📱 Responsive Design

Les paramètres s'adaptent automatiquement :
- **Desktop** : Grille 3 colonnes
- **Tablette** : Grille 2 colonnes
- **Mobile** : Grille 1 colonne

Pas besoin de configurer séparément !

---

## 🔧 Support Technique

### Problème : Je ne vois pas mes modifications
1. Vider le cache du navigateur (Ctrl+Shift+R)
2. Vérifier que vous avez bien sauvegardé
3. Recharger la page `/gj-crpt`

### Problème : L'image ne s'affiche pas
1. Vérifier que l'URL est correcte
2. Vérifier que l'image est accessible publiquement
3. Essayer avec une autre image

### Problème : Les couleurs ne s'appliquent pas
1. Vérifier le format couleur (#RRGGBB)
2. Sauvegarder et recharger la page
3. Vider le cache navigateur

---

## 🎉 Exemples de Personnalisation

### Thème Noël 🎄
- Couleur primaire : #c41e3a (rouge Noël)
- Couleur secondaire : #f0f0f0 (blanc neige)
- Ajout de valeurs : "Joie", "Partage", "Famille"
- Emojis : 🎄 🎁 ⛄ 🌟

### Thème Pâques 🐣
- Couleur primaire : #ffb74d (orange doux)
- Couleur secondaire : #81c784 (vert printemps)
- Valeurs : "Résurrection", "Nouvelle vie", "Espérance"
- Emojis : 🐣 🌸 ✝️ 🕊️

### Thème Été ☀️
- Couleur primaire : #ff9800 (orange soleil)
- Couleur secondaire : #29b6f6 (bleu ciel)
- Ajout d'un refuge : "Camp d'été" avec emoji ⛺

---

## 📞 Contact

En cas de difficulté, contacter l'équipe technique via :
- Email : [votre-email]
- Slack/Discord : [canal support]

**Version :** 0.1.1  
**Dernière mise à jour :** 17 janvier 2026
