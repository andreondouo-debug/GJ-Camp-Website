# Configuration Notifications Push - Production

## ✅ Clés VAPID Générées

Les clés suivantes ont été générées le 19 janvier 2026 et doivent être configurées dans Render (backend) et Vercel (frontend).

### Backend (Render) - Variables d'environnement

Ajoutez ces variables dans le dashboard Render :

```
VAPID_PUBLIC_KEY=BKUW6rJDpbTGTbPZY6y0ldcjf3OwpzqOeLIh8DQyZ49EUkYnjHuWKRxoLhHRLyG6vM-aCKuNq2fArvZasobHU6I
VAPID_PRIVATE_KEY=BpNAPhsFbOHMvGjcTI3-6om-jmYpx8bjD0PUwa152sk
VAPID_EMAIL=mailto:contact@gjsdecrpt.fr
```

### Frontend (Vercel) - Variables d'environnement

Ajoutez cette variable dans le dashboard Vercel :

```
REACT_APP_VAPID_PUBLIC_KEY=BKUW6rJDpbTGTbPZY6y0ldcjf3OwpzqOeLIh8DQyZ49EUkYnjHuWKRxoLhHRLyG6vM-aCKuNq2fArvZasobHU6I
```

## 🧪 Test des Notifications

### En local (http://localhost:3000)

1. Connectez-vous avec un compte utilisateur
2. Allez sur la page Profil (`/profile`)
3. Section "Notifications Push" :
   - Cliquez sur le toggle pour activer les notifications
   - Autoriser les permissions du navigateur
   - Une notification de test devrait apparaître automatiquement

4. OU allez sur User Management (`/admin/users`) :
   - Section "Test Notifications"
   - Cliquez sur "Envoyer notification test"
   - La notification devrait être reçue

### En production (https://gjsdecrpt.fr)

**IMPORTANT** : Les notifications push ne fonctionnent que sur **HTTPS**. Assurez-vous que :
- Vercel et Render utilisent HTTPS
- Le service worker est correctement enregistré
- Les permissions sont accordées par l'utilisateur

## 📝 Vérification du Statut

### Backend (Render)

Vérifiez les logs de démarrage dans Render Dashboard :
- ✅ Devrait afficher : `✅ Web Push configuré`
- ❌ Si affiche : `⚠️ VAPID keys manquantes` → Variables non configurées

### Frontend (Vercel)

Dans la console du navigateur (F12) :
```javascript
console.log(process.env.REACT_APP_VAPID_PUBLIC_KEY);
// Devrait afficher la clé publique
```

## 🔧 Déploiement

1. **Backend (Render)** :
   - Dashboard Render → Votre service backend
   - Environment → Add Environment Variables
   - Ajouter les 3 variables VAPID
   - Manual Deploy → Clear build cache & deploy

2. **Frontend (Vercel)** :
   - Dashboard Vercel → Votre projet
   - Settings → Environment Variables
   - Ajouter REACT_APP_VAPID_PUBLIC_KEY
   - Deployments → Redeploy

## 🐛 Débogage

Si les notifications ne marchent pas :

1. **Vérifier les permissions** :
   ```javascript
   console.log('Permission:', Notification.permission);
   ```

2. **Vérifier le service worker** :
   ```javascript
   navigator.serviceWorker.getRegistrations().then(regs => {
     console.log('Service Workers:', regs.length);
   });
   ```

3. **Vérifier l'abonnement** :
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('Subscription:', sub);
     });
   });
   ```

4. **Logs backend** : Vérifier dans Render les logs de l'endpoint `/api/notifications/test`

## 🔐 Sécurité

- **NE JAMAIS** commiter les clés VAPID dans Git
- Garder `VAPID_PRIVATE_KEY` secret (backend uniquement)
- `VAPID_PUBLIC_KEY` peut être publique (frontend)
- Utiliser des variables d'environnement

## 🆘 Régénération des Clés

Si besoin de régénérer les clés VAPID :

```bash
cd backend
npx web-push generate-vapid-keys --json
```

Puis remplacer les valeurs dans Render et Vercel.
