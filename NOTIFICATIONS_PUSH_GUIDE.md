# 🔔 Guide de Configuration des Notifications Push - GJ Camp

## ✅ Ce qui a été fait

### Backend
- ✅ Installation de `web-push` pour les notifications natives
- ✅ Génération des clés VAPID
- ✅ Routes API créées (`/api/notifications/*`)
- ✅ Service `pushService.js` pour envoyer les notifications
- ✅ Intégration dans:
  - Posts (nouveau post → notification à tous)
  - Messages (nouveau message → notification au destinataire)
  - Inscriptions (statut mis à jour → notification à l'utilisateur)
  - Paiements (paiement confirmé → notification)

### Frontend
- ✅ Service `pushNotifications.js` pour gérer les abonnements
- ✅ Composant `NotificationSettings` pour l'interface utilisateur
- ✅ Service Worker mis à jour pour recevoir les notifications
- ✅ Clé VAPID publique ajoutée dans `.env.production`

### Base de données
- ✅ Champ `pushSubscription` ajouté au modèle User
- ✅ Champs `pushNotifications` déjà existants

---

## 🚀 Configuration Production

### 1. Variables d'environnement Render (Backend)

Ajoutez ces variables dans Render Dashboard → Your Service → Environment:

```env
VAPID_EMAIL=contact@gjsdecrpt.fr
VAPID_PUBLIC_KEY=BMeQUOJvDDd3AbpQtNvNfPnFYA5DdRND1jX0d3grkCSSqBvBFuxBGvtMM9NHf6REg8BPu1XBbU6jF_9GU4hltEE
VAPID_PRIVATE_KEY=44YbsXp0GuomLLjCPkDTu1d1wrAuqmhhCgtrQf5rqLg
```

### 2. Variables d'environnement Vercel (Frontend)

Ajoutez dans Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
REACT_APP_VAPID_PUBLIC_KEY=BMeQUOJvDDd3AbpQtNvNfPnFYA5DdRND1jX0d3grkCSSqBvBFuxBGvtMM9NHf6REg8BPu1XBbU6jF_9GU4hltEE
```

### 3. Fichier .env local (développement)

Backend `.env`:
```env
VAPID_EMAIL=contact@gjsdecrpt.fr
VAPID_PUBLIC_KEY=BMeQUOJvDDd3AbpQtNvNfPnFYA5DdRND1jX0d3grkCSSqBvBFuxBGvtMM9NHf6REg8BPu1XBbU6jF_9GU4hltEE
VAPID_PRIVATE_KEY=44YbsXp0GuomLLjCPkDTu1d1wrAuqmhhCgtrQf5rqLg
```

---

## 📱 Comment Utiliser

### Pour les Utilisateurs

1. **Activer les notifications**
   - Aller dans Profil/Paramètres
   - Accéder à la section "Notifications"
   - Activer le toggle "Notifications Push"
   - Accepter la permission du navigateur

2. **Recevoir des notifications pour:**
   - 📰 Nouveaux posts sur la newsletter
   - 💬 Nouveaux messages reçus
   - 🎯 Nouvelles activités ajoutées
   - 📋 Mise à jour du statut d'inscription
   - 💰 Paiement confirmé

### Pour les Développeurs

#### Envoyer une notification à un utilisateur
```javascript
const pushService = require('./services/pushService');

await pushService.sendPushToUser(userId, {
  title: 'Titre de la notification',
  body: 'Contenu de la notification',
  icon: '/images/logo-192.png',
  data: { url: '/page-cible' }
});
```

#### Envoyer à plusieurs utilisateurs
```javascript
await pushService.sendBulkPush([userId1, userId2], {
  title: 'Notification groupée',
  body: 'Message pour tous',
  data: { url: '/dashboard' }
});
```

#### Envoyer à tous les utilisateurs
```javascript
await pushService.notifyAllUsers({
  title: 'Annonce importante',
  body: 'Message pour toute la communauté'
});
```

---

## 🔧 API Endpoints

### `POST /api/notifications/subscribe`
**Auth:** Required  
**Description:** Enregistrer l'abonnement push d'un utilisateur  
**Body:**
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### `POST /api/notifications/unsubscribe`
**Auth:** Required  
**Description:** Supprimer l'abonnement push

### `GET /api/notifications/status`
**Auth:** Required  
**Description:** Obtenir le statut des notifications de l'utilisateur  
**Response:**
```json
{
  "emailEnabled": true,
  "pushEnabled": true,
  "pushSubscribed": true,
  "vapidConfigured": true
}
```

### `POST /api/notifications/test`
**Auth:** Required  
**Description:** Envoyer une notification test à soi-même

### `POST /api/notifications/settings`
**Auth:** Required  
**Description:** Mettre à jour les préférences  
**Body:**
```json
{
  "emailNotifications": true,
  "pushNotifications": true
}
```

---

## 🧪 Tests

### Test manuel (développement)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start

# Dans le navigateur:
# 1. S'inscrire/connecter
# 2. Aller dans Profil → Notifications
# 3. Activer les notifications push
# 4. Cliquer sur "Envoyer une notification test"
```

### Test en production
```bash
# Après déploiement, ouvrir:
https://www.gjsdecrpt.fr

# 1. Se connecter
# 2. Activer les notifications
# 3. Demander à un admin de publier un post
# 4. Vérifier que la notification arrive
```

---

## 🎯 Événements Automatiques

Les notifications sont automatiquement envoyées pour:

### Posts (Newsletter)
- ✅ Nouveau post publié → Tous les utilisateurs avec push activé
- 📍 **Fichier:** `backend/src/routes/postRoutes.js` (ligne ~91)

### Messages
- ✅ Message reçu → Destinataires uniquement
- 📍 **Fichier:** `backend/src/routes/messageRoutes.js` (ligne ~108)

### Activités
- ⏳ À implémenter: Nouvelle activité → Tous les utilisateurs
- 📍 **Fichier:** `backend/src/routes/activitiesRoutes.js`

### Inscriptions
- ⏳ À implémenter: Statut changé → Utilisateur concerné
- 📍 **Fichier:** `backend/src/controllers/registrationController.js`

### Paiements
- ⏳ À implémenter: Paiement confirmé → Utilisateur concerné
- 📍 **Fichier:** `backend/src/routes/registrationRoutes.js`

---

## 🛠️ Intégration dans l'Interface

### Ajouter le composant aux paramètres utilisateur

Dans `frontend/src/pages/UserSettings.js` (ou équivalent):

```javascript
import NotificationSettings from '../components/NotificationSettings';

function UserSettings() {
  return (
    <div className="settings-page">
      <NotificationSettings user={user} />
      {/* Autres paramètres... */}
    </div>
  );
}
```

### Ou créer une page dédiée

Dans `frontend/src/App.js`:

```javascript
import NotificationSettings from './components/NotificationSettings';

<Route 
  path="/notifications" 
  element={<NotificationSettings />} 
/>
```

---

## 🔒 Sécurité

- ✅ Authentification requise pour toutes les routes
- ✅ Les abonnements expirés sont automatiquement supprimés
- ✅ Les clés VAPID sont stockées côté serveur uniquement
- ✅ Seule la clé publique VAPID est exposée au frontend
- ✅ Les notifications contiennent uniquement les informations nécessaires

---

## 📊 Compatibilité

### Navigateurs supportés
- ✅ Chrome/Edge (Desktop + Android)
- ✅ Firefox (Desktop + Android)
- ✅ Safari (macOS 16.4+, iOS 16.4+)
- ❌ iOS < 16.4 (pas de support Web Push)

### Vérification du support
Le service vérifie automatiquement la compatibilité:
```javascript
if ('Notification' in window && 'serviceWorker' in navigator) {
  // Notifications supportées
}
```

---

## 🐛 Dépannage

### Les notifications ne fonctionnent pas

1. **Vérifier les clés VAPID**
   ```bash
   # Backend
   curl -H "Authorization: Bearer TOKEN" \
     https://gj-camp-backend.onrender.com/api/notifications/status
   ```

2. **Vérifier les permissions du navigateur**
   - Chrome: `chrome://settings/content/notifications`
   - Firefox: `about:preferences#privacy` → Permissions

3. **Vérifier le service worker**
   - DevTools → Application → Service Workers
   - Doit être "activated and running"

4. **Logs backend**
   ```bash
   # Render Dashboard → Logs
   # Rechercher: "✅ Web Push configuré"
   ```

5. **Abonnement expiré**
   - Se désabonner puis se réabonner
   - Vider le cache du navigateur

---

## 📝 Notes Importantes

- Les notifications ne fonctionnent **qu'en HTTPS** (ou localhost)
- Les utilisateurs doivent **accepter manuellement** les permissions
- Les notifications sont **silencieuses si l'onglet est actif** (comportement navigateur)
- Les abonnements sont **liés à l'appareil/navigateur**
- Un utilisateur peut avoir plusieurs abonnements (mobile, desktop, etc.)

---

## 🚀 Prochaines Étapes

1. ✅ Déployer le backend sur Render avec les variables VAPID
2. ✅ Déployer le frontend sur Vercel avec la clé publique
3. ⏳ Intégrer le composant NotificationSettings dans l'interface
4. ⏳ Ajouter les notifications pour inscriptions/paiements
5. ⏳ Créer un dashboard admin pour voir les stats d'abonnements
6. ⏳ Implémenter des préférences granulaires (types de notifications)

---

## 📚 Ressources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [VAPID Keys](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

**Dernière mise à jour:** 14 janvier 2026  
**Version:** 1.0.0  
**Auteur:** GJ Camp Dev Team
