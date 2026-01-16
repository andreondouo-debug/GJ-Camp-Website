# 🔔 Migration Notifications Push - Guide d'Utilisation

## 📋 Objectif

Activer les notifications push **par défaut** pour **TOUS** les utilisateurs (existants et nouveaux).

## ✅ Système Complet Implémenté

### Backend
1. **Modèle User** : `pushNotifications: { default: true }`
2. **authController.getMe()** : Retourne toujours `true` si `undefined`
3. **authController.updateNotificationSettings()** : `pushNotifications ?? true`

### Frontend
1. **NotificationSettingsPage.js** : `pushNotifications ?? true` au chargement
2. **NotificationSettings.js** : État initial `true`
3. **Sauvegarde automatique** : Chaque changement sauvegardé en DB immédiatement

## 🚀 Migration des Utilisateurs Existants

### Prérequis
- Accès au serveur backend (Render ou local)
- Connexion à MongoDB Atlas

### Étapes

#### 1. En Local
```bash
cd backend
node migrate-push-notifications.js
```

#### 2. Sur Render (Production)
```bash
# Se connecter au shell Render
cd backend
node migrate-push-notifications.js
```

#### 3. Vérification
Le script affichera :
```
✅ Migration terminée!
   📝 Utilisateurs mis à jour: X
   🔔 pushNotifications activé par défaut pour tous
   ✓ Total utilisateurs: Y
   ✓ Avec pushNotifications=true: Y
```

## 🎯 Comportement Final

### Nouveaux Utilisateurs
- ✅ `pushNotifications: true` automatiquement à la création
- ✅ Toggle activé dans `/profile`
- ✅ Peut désactiver s'il le souhaite

### Utilisateurs Existants (après migration)
- ✅ `pushNotifications: true` pour tous
- ✅ Toggle activé dans `/profile`
- ✅ Peut désactiver s'il le souhaite

### Persistance
- ✅ État sauvegardé automatiquement au changement
- ✅ Persiste après rafraîchissement (F5)
- ✅ Persiste après navigation entre pages
- ✅ Persiste après déconnexion/reconnexion

## 🔧 Rollback (Si Nécessaire)

Pour désactiver pour tous :
```bash
cd backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.updateMany({}, { pushNotifications: false });
  console.log('✅ Désactivé pour tous');
  process.exit(0);
});
"
```

## 📊 Statistiques

Pour voir l'état actuel :
```bash
cd backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const total = await User.countDocuments();
  const enabled = await User.countDocuments({ pushNotifications: true });
  const disabled = await User.countDocuments({ pushNotifications: false });
  console.log('📊 Statistiques:');
  console.log('   Total:', total);
  console.log('   Activés:', enabled);
  console.log('   Désactivés:', disabled);
  process.exit(0);
});
"
```

## ⚠️ Notes Importantes

1. **Migration une seule fois** : Exécuter la migration une seule fois en production
2. **Backup DB** : Faire un backup MongoDB avant migration (recommandé)
3. **Respect du choix** : Si un utilisateur a explicitement désactivé, ne pas forcer l'activation
4. **Production** : Exécuter pendant une période de faible trafic

## 🔗 Fichiers Modifiés

- ✅ `backend/src/models/User.js`
- ✅ `backend/src/controllers/authController.js`
- ✅ `frontend/src/pages/NotificationSettingsPage.js`
- ✅ `frontend/src/components/NotificationSettings.js`
- ✅ `backend/migrate-push-notifications.js` (nouveau)

---

**Date de création** : 16 janvier 2026  
**Version** : 0.1.0  
**Status** : ✅ Prêt pour production
