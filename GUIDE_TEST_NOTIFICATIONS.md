# 🧪 Guide de Test des Notifications Push

## 📋 Tests Automatiques (Backend)

### 1️⃣ Test Local Automatique

```bash
# Installer dotenv si pas déjà fait
npm install dotenv

# Lancer le script de test
node test-notifications-local.js
```

**Ce script teste :**
- ✅ Connexion backend
- ✅ Présence des clés VAPID
- ✅ Authentification utilisateur
- ✅ Récupération du statut notifications
- ✅ Envoi d'une notification test

---

## 🌐 Tests Manuels (Frontend)

### 2️⃣ Test en Local (http://localhost:3000)

#### Prérequis :
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# → Doit tourner sur http://localhost:5000

# Terminal 2 - Frontend  
cd frontend
npm start
# → Doit ouvrir http://localhost:3000
```

#### Étapes de test :

**A. Vérifier la console navigateur (F12)**
```javascript
// Ouvrir la console et taper :
console.log('VAPID Key:', process.env.REACT_APP_VAPID_PUBLIC_KEY);
// Doit afficher: undefined (normal en local, pas configuré)

// Vérifier Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
});
// Doit afficher: 1
```

**B. Test profil utilisateur**
1. Se connecter : http://localhost:3000/login
2. Aller dans **Mon Profil** : http://localhost:3000/profile
3. Descendre jusqu'à la section **"🔔 Notifications"**
4. Vérifier qu'il y a :
   - ✅ Toggle "Notifications Email"
   - ✅ Toggle "Notifications Push"
   - ❌ PAS de bouton "Activer OneSignal" (ancien système)

**C. Activer les notifications**
1. Cliquer sur le toggle **"Notifications Push"**
2. Une popup du navigateur doit apparaître : **"Autoriser les notifications ?"**
3. Cliquer **"Autoriser"**
4. Vérifier que le toggle est coché ✅
5. Un badge **"✅ Abonné"** doit apparaître

**D. Envoyer notification test**
1. Cliquer sur le bouton **"🧪 Envoyer une notification test"**
2. Vous devriez voir un message : **"Notification test envoyée !"**
3. **Vérifier les logs backend** (Terminal 1) :
   ```
   🔔 Envoi notification test à: user@example.com
   ✅ Notification envoyée avec succès
   ```

**E. Recevoir la notification**
- Une notification devrait apparaître en haut à droite :
  ```
  🎉 GJ Camp
  Salut [Prénom] ! Les notifications fonctionnent parfaitement.
  ```

---

### 3️⃣ Test en Production (https://www.gjsdecrpt.fr)

⚠️ **IMPORTANT** : Les notifications push ne fonctionnent que sur **HTTPS** !

#### Prérequis Production :

**Backend (Render) :**
- ✅ Variables VAPID configurées :
  ```
  VAPID_PUBLIC_KEY=BKUW6rJDpbTGTbPZY6y0ldcjf3OwpzqOeLIh8DQyZ49EUkYnjHuWKRxoLhHRLyG6vM-aCKuNq2fArvZasobHU6I
  VAPID_PRIVATE_KEY=BpNAPhsFbOHMvGjcTI3-6om-jmYpx8bjD0PUwa152sk
  VAPID_EMAIL=mailto:contact@gjsdecrpt.fr
  ```

**Frontend (Vercel) :**
- ✅ Variable VAPID configurée :
  ```
  REACT_APP_VAPID_PUBLIC_KEY=BKUW6rJDpbTGTbPZY6y0ldcjf3OwpzqOeLIh8DQyZ49EUkYnjHuWKRxoLhHRLyG6vM-aCKuNq2fArvZasobHU6I
  ```

#### Étapes de test :

1. **Ouvrir** : https://www.gjsdecrpt.fr
2. **Se connecter** avec votre compte
3. **Aller dans Profil** : Menu → Mon Profil
4. **Descendre** jusqu'à "🔔 Notifications"
5. **Activer** le toggle "Notifications Push"
6. **Accepter** les permissions navigateur
7. **Cliquer** sur "🧪 Envoyer notification test"
8. **Vérifier** que vous recevez la notification

---

## 🐛 Résolution de Problèmes

### Erreur : "Clé VAPID manquante"

**Symptôme :**
```
⚠️ Les notifications push ne sont pas configurées. Contactez l'administrateur.
```

**Solution :**
1. **Vercel** → Settings → Environment Variables
2. Ajouter `REACT_APP_VAPID_PUBLIC_KEY`
3. Redéployer le frontend

---

### Erreur : "Service Worker non enregistré"

**Symptôme :**
```javascript
navigator.serviceWorker.getRegistrations() // → []
```

**Solution :**
1. Vérifier que `service-worker.js` existe dans `frontend/public/`
2. Recharger la page avec **Ctrl + Shift + R** (hard reload)
3. Vérifier dans la console :
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     console.log('SW ready:', reg);
   });
   ```

---

### Erreur : Permission refusée

**Symptôme :**
```javascript
Notification.permission // → "denied"
```

**Solution :**
1. **Chrome** : Settings → Privacy → Site Settings → Notifications
2. Trouver `localhost:3000` ou `gjsdecrpt.fr`
3. Passer de "Blocked" à "Allow"
4. Recharger la page

---

### Erreur : Backend ne reçoit pas l'abonnement

**Symptôme :**
```
❌ Erreur communication backend
```

**Solution Backend :**
1. Vérifier que le backend tourne
2. Vérifier les logs backend :
   ```bash
   # Render
   Logs → Filter: "notification"
   ```
3. Vérifier la route :
   ```bash
   curl -X POST https://gj-camp-backend.onrender.com/api/notifications/subscribe \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"subscription": {}}'
   ```

**Solution Frontend :**
1. Ouvrir la console (F12)
2. Vérifier l'erreur réseau (onglet Network)
3. Vérifier que l'URL backend est correcte :
   ```javascript
   console.log(process.env.REACT_APP_API_URL);
   ```

---

## ✅ Checklist Complète

### Backend
- [ ] Backend tourne localement sur :5000
- [ ] Route `/api/health` accessible
- [ ] Variables VAPID dans `.env`
- [ ] Route `/api/notifications/test` fonctionne
- [ ] Logs affichent : `✅ Web Push configuré`

### Frontend
- [ ] Frontend tourne localement sur :3000
- [ ] Service Worker enregistré
- [ ] Composant `NotificationSettings` visible dans `/profile`
- [ ] Pas d'erreur "OneSignal" dans la console
- [ ] Toggle notifications fonctionne

### Production
- [ ] Variables VAPID dans Render
- [ ] Variable VAPID dans Vercel
- [ ] Site accessible en HTTPS
- [ ] Permission notifications accordée
- [ ] Notification test reçue

---

## 📊 Résultats Attendus

### ✅ Test Réussi :
```
1. ✅ Connexion réussie
2. ✅ Toggle activé sans erreur
3. ✅ Permission accordée
4. ✅ Badge "Abonné" affiché
5. ✅ Notification test envoyée
6. ✅ Notification reçue dans le navigateur
```

### ❌ Test Échoué :
Si une étape échoue, vérifiez :
- Les logs backend
- La console navigateur (F12)
- Les variables d'environnement
- Les permissions navigateur

---

## 📞 Support

Si aucune solution ne fonctionne :
1. Vérifier les fichiers de documentation :
   - `NOTIFICATIONS_PUSH_CONFIG.md`
   - `CONFIGURATION_NOTIFICATIONS_PRODUCTION.md`
2. Vérifier les logs backend/frontend
3. Tester avec le script automatique : `node test-notifications-local.js`
