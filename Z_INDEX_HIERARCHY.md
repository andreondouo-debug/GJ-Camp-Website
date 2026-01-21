# Hiérarchie Z-Index - GJ Camp Website

## Vue d'ensemble
Document de référence pour la gestion des z-index dans l'application.

## Hiérarchie Globale (du plus haut au plus bas)

### Niveau 5 - Modals & Overlays Critiques (z-index: 10000+)
**Priorité maximale - Au-dessus de tout**

| Élément | Z-Index | Fichier | Utilisation |
|---------|---------|---------|-------------|
| Cookie Consent Overlay | 10000 | CookieConsent.css | Bannière RGPD obligatoire |
| GJCRPT Photo Modal | 10000 | GJCRPTPage.css | Zoom photos pasteurs |
| Photo Modal Close Button | 10001 | GJCRPTPage.css | Bouton fermer modal |
| Settings Page Modals | 10000 | SettingsPage.css | Modals configuration |

**Raison**: Ces éléments nécessitent une interaction utilisateur obligatoire ou critique.

---

### Niveau 4 - Navigation (z-index: 99998-99999)
**Navigation principale - Au-dessus du contenu**

| Élément | Z-Index | Fichier | Utilisation |
|---------|---------|---------|-------------|
| Dropdown Menu (Desktop) | 99999 | App.css:1116 | Menu "Gestion" déroulant |
| Hamburger Button (Mobile) | 99999 | App.css:3615 | Bouton menu mobile |
| Nav Menu (Mobile) | 99999 | App.css:3745 | Menu mobile complet |
| Dropdown Parent | 99998 | App.css:1063 | Container dropdown |

**Raison**: Navigation doit être visible par-dessus le contenu mais sous les modals.

---

### Niveau 3 - Header & Logos (z-index: 1000-1100)
**Identité visuelle - Toujours visible**

| Élément | Z-Index | Fichier | Utilisation |
|---------|---------|---------|-------------|
| Logo Links | 1100 | App.css:928 | Logos GJ (gauche & droite) |
| Header Container | 1000 | App.css:896 | En-tête principal |

**Raison**: Logos doivent être visibles mais ne pas bloquer les menus dropdown.

---

### Niveau 2 - Éléments Interactifs (z-index: 10-20)
**Composants UI standards**

| Élément | Z-Index | Fichier | Utilisation |
|---------|---------|---------|-------------|
| PWA Install Prompt | 10 | PWAInstall.css:8 | Bannière installation app |
| Activity Cards | 10-20 | ActivitiesPage.css | Cartes activités |
| Carousel Controls | 10 | DynamicCarousel.css | Boutons carousel |
| Programme Tabs | 10 | ProgrammePage.css | Onglets programme |

**Raison**: Éléments interactifs visibles mais sans interférer avec navigation.

---

### Niveau 1 - Contenu Standard (z-index: 0-3)
**Contenu de page normal**

| Élément | Z-Index | Fichier | Utilisation |
|---------|---------|---------|-------------|
| Background Effects | 1-2 | App.css, GJCRPTPage.css | Effets visuels |
| Content Layers | 1-2 | Divers | Superposition contenu |
| Base Elements | 0 | Divers | Éléments de base |

**Raison**: Contenu normal sans besoin de priorité z-index.

---

## Règles de Gestion

### ✅ À Faire
1. **Utiliser les niveaux définis** - Ne pas créer de nouveaux z-index sans raison
2. **Respecter la hiérarchie** - Modals > Navigation > Header > Contenu
3. **Documenter les changements** - Mettre à jour ce fichier si modification
4. **Tester les interactions** - Vérifier qu'aucun élément ne cache un autre

### ❌ À Éviter
1. ❌ **Z-index extrêmes** - Éviter 999999 ou 1 (sauf cas justifié)
2. ❌ **Z-index arbitraires** - Ne pas utiliser 547, 1234, etc.
3. ❌ **Conflits de niveau** - Deux éléments du même niveau ne doivent pas se chevaucher
4. ❌ **Z-index inline** - Préférer CSS externe pour maintenabilité

---

## Tests de Validation

### Checklist de Non-Régression
- [ ] Cookie consent s'affiche au-dessus de tout
- [ ] Menu "Gestion" s'ouvre sans être caché
- [ ] Menu mobile fonctionne correctement
- [ ] Logos restent visibles en permanence
- [ ] Modals photos fonctionnent (zoom GJCRPT)
- [ ] Bannière PWA ne cache pas le contenu
- [ ] Header reste fixe sans chevaucher navigation

### Scénarios de Test
1. **Desktop**: Ouvrir menu Gestion → Vérifier visibilité complète
2. **Mobile**: Ouvrir hamburger → Menu doit couvrir le contenu
3. **Modal**: Ouvrir photo pasteur → Doit masquer tout le reste
4. **Cookie**: Afficher bannière RGPD → Priorité absolue

---

## Changelog

### 2026-01-21 - Fix Menu Gestion
- ✅ **Dropdown menu**: 9999 → 99999
- ✅ **Parent dropdown**: 9998 → 99998
- 🎯 **Résultat**: Menu Gestion visible au-dessus des popups

### État Précédent
- Dropdown menu: z-index 9999 (insuffisant)
- Causait masquage par popups notifications

---

## Contact & Support
En cas de conflit z-index:
1. Consulter ce document
2. Vérifier la hiérarchie
3. Tester l'interaction problématique
4. Documenter la solution appliquée

**Dernière mise à jour**: 21 janvier 2026
