# 📱 Guide d'Upload du Logo PWA

## 🎯 Objectif

Cette fonctionnalité permet aux administrateurs de mettre à jour facilement le logo de l'application PWA (Progressive Web App) qui s'affiche lorsque les utilisateurs installent l'application sur leur appareil.

## ✨ Fonctionnalités

### 📤 Upload Automatique
- Upload direct vers Cloudinary avec redimensionnement automatique
- Génération automatique de 2 tailles : 192x192 et 512x512 pixels
- Mise à jour automatique du `manifest.json`
- Suppression de l'ancien logo de Cloudinary

### 🖼️ Aperçu en Temps Réel
- Prévisualisation du logo dans les 2 tailles (192x192 et 512x512)
- Affichage sur fond dégradé similaire au style de l'app
- Aperçu avec coins arrondis comme sur un vrai appareil

## 🚀 Comment Utiliser

### 1. Accéder aux Paramètres
1. Connectez-vous en tant qu'administrateur
2. Allez sur la page **Paramètres** (`/settings`)
3. Cliquez sur l'onglet **Logo**
4. Scrollez jusqu'à la section **📱 Logo PWA (Application Installée)**

### 2. Uploader un Logo
1. Cliquez sur **📤 Upload du logo PWA**
2. Sélectionnez votre image (formats acceptés : PNG, JPG, GIF, SVG, WebP)
3. Un aperçu s'affiche automatiquement en 2 tailles
4. Cliquez sur **💾 Enregistrer le logo PWA**

### 3. Vérifier l'Installation
Après upload, le logo sera automatiquement utilisé lors de la prochaine installation :
- Sur mobile : Menu → "Ajouter à l'écran d'accueil"
- Sur Chrome desktop : Barre d'adresse → Icône d'installation
- Sur Edge : Menu → "Applications" → "Installer ce site en tant qu'app"

## 📋 Spécifications Techniques

### Format Recommandé
- **Type** : PNG avec fond transparent ou couleur unie
- **Dimensions minimales** : 512x512 pixels
- **Format** : Carré (1:1)
- **Poids** : Maximum 50 MB (mais idéalement < 500 KB)

### Redimensionnement Automatique
Le système génère automatiquement :
- **192x192** : Pour écrans normaux et liste d'applications
- **512x512** : Pour écrans haute résolution et splash screen

### Stockage
- **Service** : Cloudinary
- **Dossier** : `gj-camp/pwa-logos`
- **Nommage** : `pwa-logo-[timestamp]` et `pwa-logo-[timestamp]-192`
- **Suppression** : L'ancien logo est automatiquement supprimé

## 🔧 Backend API

### Endpoint
```
POST /api/settings/upload-pwa-logo
```

### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Body
```
FormData {
  pwaLogo: <file>
}
```

### Response Success
```json
{
  "success": true,
  "message": "Logo PWA uploadé avec succès",
  "pwaLogoUrl": "https://res.cloudinary.com/.../512.png",
  "pwaLogo192Url": "https://res.cloudinary.com/.../192.png",
  "publicId": "gj-camp/pwa-logos/pwa-logo-1234567890"
}
```

## 📝 Modèle de Données

### Settings Schema
```javascript
{
  pwaLogoUrl: String,        // URL Cloudinary du logo 512x512
  pwaLogoPublicId: String,   // ID Cloudinary pour suppression
}
```

### Manifest.json (Généré Automatiquement)
```json
{
  "icons": [
    {
      "src": "https://res.cloudinary.com/.../192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "https://res.cloudinary.com/.../512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 🎨 Interface Utilisateur

### Section Logo PWA
```
📱 Logo PWA (Application Installée)
Ce logo s'affichera lorsque les utilisateurs installent l'application 
sur leur appareil (téléphone, tablette, ordinateur).

[📤 Upload du logo PWA]
Format recommandé : PNG carré (512x512px minimum)
Sera automatiquement redimensionné en 192x192 et 512x512

👁️ Aperçu du logo PWA
┌─────────────────────────────────┐
│   [96x96]      [128x128]        │
│   192x192      512x512          │
│                                 │
│ 💡 Ce logo apparaîtra sur       │
│ l'écran d'accueil après install │
└─────────────────────────────────┘

[💾 Enregistrer le logo PWA]
```

## ⚠️ Points d'Attention

### Cache Navigateur
Les utilisateurs ayant déjà installé l'app devront :
1. Désinstaller l'ancienne version
2. Vider le cache du navigateur
3. Réinstaller l'application pour voir le nouveau logo

### Test de l'Upload
Pour tester l'upload :
1. Préparez une image carrée (512x512 recommandé)
2. Uploadez via l'interface admin
3. Vérifiez dans Cloudinary que 2 versions sont créées
4. Consultez `frontend/public/manifest.json` (doit être mis à jour)
5. Testez l'installation sur mobile/desktop

### Permissions
- **Rôle requis** : `admin`
- **Middleware** : `auth`, `requireAdmin`, `acquireSettingsLock`
- **Accès frontend** : Uniquement via `/settings` pour les admins

## 🔄 Workflow Complet

```
1. Admin sélectionne image
   ↓
2. Prévisualisation client-side
   ↓
3. Click "Enregistrer"
   ↓
4. Upload vers backend
   ↓
5. Multer reçoit fichier
   ↓
6. Upload vers Cloudinary (512x512)
   ↓
7. Upload vers Cloudinary (192x192)
   ↓
8. Suppression ancien logo
   ↓
9. Sauvegarde dans Settings
   ↓
10. Mise à jour manifest.json
    ↓
11. Réponse au frontend
    ↓
12. Confirmation utilisateur
```

## 🐛 Troubleshooting

### Logo ne s'affiche pas après upload
- Vérifiez les logs backend : `✅ Logo PWA uploadé avec succès`
- Vérifiez `manifest.json` : doit contenir les URLs Cloudinary
- Vérifiez dans Cloudinary : 2 images doivent exister
- Testez l'URL directement dans le navigateur

### Erreur lors de l'upload
- Vérifiez la configuration Cloudinary (`.env`)
- Vérifiez la taille du fichier (< 50 MB)
- Vérifiez le format (PNG, JPG recommandés)
- Consultez les logs backend pour détails

### Ancien logo toujours visible
- Désinstallez l'app PWA
- Videz le cache du navigateur
- Réinstallez l'application
- Le Service Worker doit être mis à jour

## 📚 Fichiers Modifiés

### Backend
- ✅ `backend/src/models/Settings.js` - Ajout champs `pwaLogoUrl` et `pwaLogoPublicId`
- ✅ `backend/src/controllers/settingsController.js` - Méthode `uploadPwaLogo()`
- ✅ `backend/src/routes/settingsRoutes.js` - Route `POST /api/settings/upload-pwa-logo`

### Frontend
- ✅ `frontend/src/pages/SettingsPage.js` - Section PWA avec upload et preview
- ✅ `frontend/public/manifest.json` - Mis à jour automatiquement par le backend

## 🎉 Résultat Final

Une fois le logo uploadé :
- ✅ Logo visible dans l'aperçu admin
- ✅ Logo enregistré sur Cloudinary (2 tailles)
- ✅ `manifest.json` mis à jour automatiquement
- ✅ Prochaine installation utilisera le nouveau logo
- ✅ Ancien logo supprimé de Cloudinary (économie d'espace)

---

**Date de création** : 16 janvier 2026  
**Version** : 0.1.0  
**Auteur** : GJ Camp Development Team  
**Status** : ✅ Prêt pour production
