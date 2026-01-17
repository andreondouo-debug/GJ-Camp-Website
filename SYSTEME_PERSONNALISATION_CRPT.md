# 🎨 Système de Personnalisation Complète de la Page CRPT

## 📅 Date de création
17 janvier 2026

## 🎯 Objectif
Permettre aux administrateurs de personnaliser **TOUS** les éléments de la page GJ CRPT depuis le panneau d'administration : textes, couleurs, images, polices, animations, effets.

---

## ✅ Fichiers Créés

### Backend
1. **`backend/src/config/crptPageDefaults.js`** (5437 bytes)
   - Configuration par défaut complète
   - ~80 paramètres personnalisables
   - Sections : hero, mission, values, refuges, styles

2. **`backend/src/routes/crptSettingsRoutes.js`** (3286 bytes)
   - Routes API pour CRPT settings
   - GET `/api/settings/crpt` (public)
   - PUT `/api/settings/crpt` (admin)
   - POST `/api/settings/crpt/reset` (admin)

### Frontend
1. **`frontend/src/pages/CRPTSettingsPage.js`** (23049 bytes)
   - Interface d'administration complète
   - 5 onglets : Hero, Mission, Valeurs, Refuges, Styles Globaux
   - Formulaires pour tous les paramètres
   - Prévisualisation en temps réel

2. **`frontend/src/styles/CRPTSettingsPage.css`** (7078 bytes)
   - Styles modernes avec dégradés
   - Design responsive
   - Animations et transitions

3. **`frontend/src/pages/GJCRPTPage.js`** (nouvelle version dynamique)
   - Consomme les settings depuis l'API
   - Rendu dynamique de tous les éléments
   - Génération CSS à la volée
   - Animations conditionnelles

4. **`frontend/src/config/crptPageDefaults.js`** (copié du backend)
   - Valeurs par défaut côté frontend
   - Fallback si API indisponible

---

## 📝 Modifications de Fichiers Existants

### 1. `backend/src/server.js`
```javascript
// Ajout de l'import
const crptSettingsRoutes = require('./routes/crptSettingsRoutes');

// Ajout de la route
app.use('/api/settings', crptSettingsRoutes);
```

### 2. `frontend/src/App.js`
```javascript
// Ajout de l'import
import CRPTSettingsPage from './pages/CRPTSettingsPage';

// Ajout de la route
<Route
  path="/parametres/crpt"
  element={
    <GuardedRoute
      element={<CRPTSettingsPage />}
      roles={['admin']}
    />
  }
/>
```

---

## 🎨 Paramètres Personnalisables

### Section Hero (17 paramètres)
- ✅ Image de fond (URL)
- ✅ Opacité de l'overlay (0-100%)
- ✅ Logo URL
- ✅ Titre principal (texte, taille, couleur, animation)
- ✅ Sous-titre (texte, taille, couleur)
- ✅ Statistiques (3 items : icône, nombre, label)
- ✅ Couleur des statistiques
- ✅ Animation des statistiques

### Section Mission (11 paramètres)
- ✅ Badge (texte, couleur)
- ✅ Titre (texte, taille, couleur)
- ✅ Texte principal (contenu, couleur, taille)
- ✅ Texte secondaire
- ✅ Carte flottante (icône, titre, description)
- ✅ Couleur de fond de la carte
- ✅ Animation de la carte

### Section Valeurs (12+ paramètres)
- ✅ Badge et titre
- ✅ Liste de valeurs (extensible) :
  - Icône
  - Titre
  - Description
  - Couleur de l'icône
- ✅ Couleur de fond des cartes
- ✅ Effet au survol (lift/glow/none)
- ✅ Nombre de colonnes de la grille

### Section Refuges (12+ paramètres)
- ✅ Badge, titre et sous-titre
- ✅ Liste de refuges (extensible) :
  - Nom
  - Région
  - Description
  - Icône
  - Couleur de l'icône
- ✅ Couleur de fond des cartes
- ✅ Effet au survol
- ✅ Nombre de colonnes de la grille

### Styles Globaux (14 paramètres)
- ✅ Couleurs (primaire, secondaire, accent, fond, texte)
- ✅ Typographie (police principale, police des titres)
- ✅ Border radius
- ✅ Ombre des cartes
- ✅ Activer/désactiver animations
- ✅ Durée des animations
- ✅ Activer effets au survol
- ✅ Activer glassmorphism
- ✅ Activer parallax

**TOTAL : ~80 paramètres personnalisables**

---

## 🚀 Utilisation

### Pour l'administrateur

1. **Accéder à la page de paramètres CRPT :**
   ```
   https://gjsdecrpt.fr/parametres/crpt
   ```
   (Nécessite rôle admin)

2. **Naviguer entre les onglets :**
   - 🎯 Hero : Section d'accueil
   - 📋 Mission : Présentation de la mission
   - ⭐ Valeurs : Liste des valeurs
   - 🏛️ Refuges : Liste des refuges
   - 🎨 Styles Globaux : Design et effets

3. **Modifier les paramètres :**
   - Textes : Modifier directement dans les inputs
   - Couleurs : Utiliser le color picker
   - Images : Entrer l'URL de l'image
   - Animations : Choisir dans le menu déroulant
   - Listes : Ajouter/supprimer avec les boutons ➕/🗑️

4. **Enregistrer :**
   - Cliquer sur "💾 Enregistrer tous les paramètres"
   - Confirmation : "✅ Paramètres CRPT sauvegardés avec succès !"

5. **Voir les modifications :**
   - Aller sur https://gjsdecrpt.fr/gj-crpt
   - La page utilise automatiquement les nouveaux paramètres

### Pour les visiteurs

La page CRPT (`/gj-crpt`) s'affiche automatiquement avec les paramètres personnalisés par l'admin.

---

## 🔧 API Endpoints

### GET `/api/settings/crpt`
**Accès :** Public  
**Description :** Récupère les paramètres CRPT actuels  
**Réponse :**
```json
{
  "crptSettings": {
    "hero": { ... },
    "mission": { ... },
    "values": { ... },
    "refuges": { ... },
    "styles": { ... }
  }
}
```

### PUT `/api/settings/crpt`
**Accès :** Admin uniquement  
**Description :** Met à jour les paramètres CRPT  
**Body :**
```json
{
  "crptSettings": { ... }
}
```
**Réponse :**
```json
{
  "message": "✅ Paramètres CRPT enregistrés avec succès !",
  "crptSettings": { ... }
}
```

### POST `/api/settings/crpt/reset`
**Accès :** Admin uniquement  
**Description :** Réinitialise aux valeurs par défaut  
**Réponse :**
```json
{
  "message": "🔄 Paramètres CRPT réinitialisés avec succès !",
  "crptSettings": { ... }
}
```

---

## 🎨 Animations Disponibles

### Animations de titre
- `none` : Aucune animation
- `fade-in` : Apparition progressive
- `slide-up` : Glisse vers le haut
- `zoom-in` : Zoom depuis le centre

### Animations de cartes
- `none` : Aucune animation
- `float` : Flottement vertical
- `pulse` : Pulsation

### Effets au survol
- `none` : Aucun effet
- `lift` : Élévation de la carte
- `glow` : Ombre lumineuse

---

## 📦 Structure de Données

### Exemple complet de `crptSettings`
```javascript
{
  hero: {
    backgroundImage: "/images/crpt-hero-bg.jpg",
    overlayOpacity: 40,
    logoUrl: "/images/crpt-logo.png",
    title: "Christ Refuge Pour Tous",
    titleFontSize: "3.5rem",
    titleColor: "#ffffff",
    titleAnimation: "fade-in",
    subtitle: "Une famille d'églises au service de Dieu...",
    subtitleFontSize: "1.2rem",
    subtitleColor: "#f0f0f0",
    stats: [
      { icon: "🏛️", number: "5+", label: "Refuges" },
      { icon: "👥", number: "1000+", label: "Membres" },
      { icon: "📅", number: "15+", label: "Années" }
    ],
    statsColor: "#ffffff",
    statsAnimation: "pulse"
  },
  mission: {
    badge: "Notre Mission",
    badgeColor: "#a01e1e",
    title: "Qui sommes-nous ?",
    titleFontSize: "2.5rem",
    titleColor: "#001a4d",
    leadText: "Christ Refuge Pour Tous est...",
    leadTextColor: "#333333",
    leadTextSize: "1.2rem",
    bodyText: "Fondée sur les valeurs...",
    cardIcon: "🏛️",
    cardTitle: "Un Refuge pour Tous",
    cardDescription: "Un lieu d'accueil...",
    cardBackgroundColor: "#ffffff",
    cardAnimation: "float"
  },
  values: {
    badge: "Nos Valeurs",
    title: "Ce qui nous anime",
    items: [
      {
        icon: "📖",
        title: "La Parole de Dieu",
        description: "La Bible est notre fondement...",
        iconColor: "#a01e1e"
      }
      // ... 5 autres valeurs
    ],
    cardBackgroundColor: "#f8f9fa",
    cardHoverEffect: "lift",
    gridColumns: 3
  },
  refuges: {
    badge: "Nos Refuges",
    title: "Où nous trouver",
    subtitle: "Nos refuges en France",
    items: [
      {
        name: "Paris",
        region: "Île-de-France",
        description: "Notre refuge principal...",
        icon: "🏛️",
        iconColor: "#a01e1e"
      }
      // ... 4 autres refuges
    ],
    cardBackgroundColor: "#ffffff",
    cardHoverEffect: "lift",
    gridColumns: 3
  },
  styles: {
    primaryColor: "#a01e1e",
    secondaryColor: "#d4af37",
    accentColor: "#667eea",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    fontFamily: "'Inter', sans-serif",
    headingFontFamily: "'Playfair Display', serif",
    borderRadius: "12px",
    cardShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    enableAnimations: true,
    animationDuration: "0.6s",
    enableHoverEffects: true,
    enableGlassmorphism: false,
    enableParallax: false
  }
}
```

---

## 🔐 Sécurité

- ✅ Routes admin protégées par middleware `auth` + `authorize(...ADMIN_ROLES)`
- ✅ Validation des données côté backend
- ✅ Route GET publique (lecture seule pour affichage page)
- ✅ Routes PUT/POST/DELETE réservées aux admins

---

## 🧪 Tests

### Test local
1. **Démarrer backend :**
   ```bash
   cd backend && npm run dev
   ```

2. **Démarrer frontend :**
   ```bash
   cd frontend && npm start
   ```

3. **Se connecter en tant qu'admin**

4. **Accéder à `/parametres/crpt`**

5. **Modifier des paramètres et sauvegarder**

6. **Vérifier sur `/gj-crpt`**

### Test API
```bash
# Récupérer les paramètres
curl http://localhost:5000/api/settings/crpt

# Mettre à jour (avec token admin)
curl -X PUT http://localhost:5000/api/settings/crpt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"crptSettings": {...}}'
```

---

## 📋 Backup de l'Ancienne Version

L'ancienne version statique de GJCRPTPage.js a été sauvegardée :
```
frontend/src/pages/GJCRPTPage_OLD_BACKUP.js
```

Pour restaurer l'ancienne version :
```bash
cd frontend/src/pages
mv GJCRPTPage.js GJCRPTPage_NEW.js
mv GJCRPTPage_OLD_BACKUP.js GJCRPTPage.js
```

---

## 🚀 Déploiement

### 1. Commit et push
```bash
git add .
git commit -m "✨ Feat: Système de personnalisation complète page CRPT

- Ajout interface admin pour paramètres CRPT
- Page CRPT entièrement dynamique
- 80+ paramètres personnalisables
- API routes pour CRUD settings
- Animations et effets configurables"

git push origin main
```

### 2. Vérification production
- Vercel déploie automatiquement le frontend
- Render déploie automatiquement le backend
- Tester sur https://gjsdecrpt.fr/parametres/crpt
- Vérifier que la page https://gjsdecrpt.fr/gj-crpt fonctionne

---

## 📞 Support

En cas de problème :
1. Vérifier les logs backend : `heroku logs --tail` ou Render logs
2. Vérifier la console frontend : F12 > Console
3. Tester l'endpoint API directement : `/api/settings/crpt`
4. Restaurer les valeurs par défaut : POST `/api/settings/crpt/reset`

---

## 🎉 Résultat

✅ **Système complet de personnalisation de la page CRPT**  
✅ **Interface admin intuitive avec 5 onglets**  
✅ **~80 paramètres personnalisables**  
✅ **Rendu dynamique en temps réel**  
✅ **Animations et effets configurables**  
✅ **API sécurisée (admin uniquement pour modifications)**  
✅ **Responsive et moderne**  
✅ **Prêt pour la production**

---

**Date de finalisation :** 17 janvier 2026  
**Développé par :** AI Assistant avec autonomie complète  
**Durée :** ~45 minutes  
**Status :** ✅ Terminé et testé
