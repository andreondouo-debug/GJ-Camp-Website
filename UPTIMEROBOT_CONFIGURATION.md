# 🤖 Configuration UptimeRobot pour gjsdecrpt.fr

## 📌 Vue d'ensemble

UptimeRobot va surveiller votre site et vous alerter en cas de problème.

**Objectif**: Être notifié immédiatement si le site ou l'API tombe.

---

## 🎯 MONITORS À CRÉER (3 monitors)

### Monitor #1: Frontend - Page d'accueil
**Pour surveiller que le site est accessible**

```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp - Frontend (www)
URL: https://www.gjsdecrpt.fr
Monitoring Interval: Every 5 minutes
Monitor Timeout: 30 seconds
```

**Advanced Settings:**
```
Keyword Monitoring: Enabled
  - Keyword Type: Exists
  - Keyword: Génération Josué
  (ou tout texte présent sur votre page d'accueil)
```

---

### Monitor #2: Backend - Health Check
**Pour surveiller que l'API backend fonctionne**

```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp - Backend API
URL: https://api.gjsdecrpt.fr/api/health
Monitoring Interval: Every 5 minutes
Monitor Timeout: 30 seconds
```

**Advanced Settings:**
```
Keyword Monitoring: Enabled
  - Keyword Type: Exists
  - Keyword: Backend fonctionnel
  (le texte retourné par votre endpoint health)
```

---

### Monitor #3: Backend - Activities Endpoint
**Pour surveiller un endpoint critique de l'API**

```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp - API Activities
URL: https://api.gjsdecrpt.fr/api/activities
Monitoring Interval: Every 10 minutes
Monitor Timeout: 30 seconds
```

**Advanced Settings:**
```
Keyword Monitoring: Enabled
  - Keyword Type: Exists
  - Keyword: success
  (ou "activities" si votre API retourne ce mot)
```

---

## 📧 CONFIGURATION DES ALERTES

### Étape 1: Ajouter vos contacts

1. Allez dans **My Settings** → **Alert Contacts**
2. Cliquez **Add Alert Contact**
3. Ajoutez:

**Email:**
```
Alert Contact Type: E-mail
Friendly Name: Votre Nom
E-mail Address: votre-email@example.com
```

**SMS (optionnel, si vous avez un compte Pro):**
```
Alert Contact Type: SMS
Phone Number: +33612345678
```

**Telegram (recommandé, gratuit):**
```
Alert Contact Type: Telegram
```
Suivez les instructions pour connecter votre compte Telegram

---

### Étape 2: Configurer les alertes pour chaque monitor

Pour **CHAQUE monitor** créé:

1. Cliquez sur le monitor
2. **Edit** → **Alert Contacts to Notify**
3. Sélectionnez vos contacts (email, SMS, Telegram)
4. **Threshold**: `1 time` (alerte dès la première panne)
5. **Save**

---

## 🔧 GUIDE PAS À PAS - Création d'un Monitor

### Étape 1: Connexion à UptimeRobot

1. Allez sur: https://uptimerobot.com
2. Connectez-vous (ou créez un compte gratuit)
3. Cliquez sur **Dashboard**

---

### Étape 2: Créer le premier monitor (Frontend)

1. Cliquez sur **+ Add New Monitor** (bouton orange en haut)

2. **Monitor Type**: Sélectionnez **HTTP(s)**

3. **Friendly Name**: 
   ```
   GJ Camp - Frontend (www)
   ```

4. **URL (or IP)**: 
   ```
   https://www.gjsdecrpt.fr
   ```

5. **Monitoring Interval**: 
   - Sélectionnez **5 minutes** (gratuit)
   - Plan Pro permet 1 minute

6. **Monitor Timeout**:
   ```
   30 seconds
   ```

7. **Déroulez "Advanced Settings"**:
   - **Keyword Monitoring**: Activez (toggle à droite)
   - **Keyword Type**: Sélectionnez **Exists**
   - **Keyword**: Tapez:
     ```
     Génération Josué
     ```
   (ou un texte unique présent sur votre page d'accueil)

8. **Alert Contacts to Notify**:
   - Sélectionnez votre email
   - **Threshold**: `1 time`

9. Cliquez **Create Monitor**

---

### Étape 3: Créer le deuxième monitor (Backend Health)

Répétez l'Étape 2 avec ces valeurs:

```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp - Backend API
URL: https://api.gjsdecrpt.fr/api/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds

Advanced Settings:
  Keyword Monitoring: Enabled
  Keyword Type: Exists
  Keyword: Backend fonctionnel
  
Alert Contacts: Votre email
Threshold: 1 time
```

Cliquez **Create Monitor**

---

### Étape 4: Créer le troisième monitor (Activities)

Répétez avec:

```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp - API Activities
URL: https://api.gjsdecrpt.fr/api/activities
Monitoring Interval: 10 minutes
Monitor Timeout: 30 seconds

Advanced Settings:
  Keyword Monitoring: Disabled (ou Enabled avec "success")
  
Alert Contacts: Votre email
Threshold: 1 time
```

Cliquez **Create Monitor**

---

## 📊 CONFIGURATION FINALE

Votre Dashboard UptimeRobot doit afficher:

```
✅ GJ Camp - Frontend (www)          | Up | 99.9%
✅ GJ Camp - Backend API              | Up | 99.9%
✅ GJ Camp - API Activities           | Up | 99.9%
```

---

## 🔔 TYPES D'ALERTES QUE VOUS RECEVREZ

### Alerte "Down"
Envoyée quand un monitor détecte un problème:

```
📧 Subject: [UptimeRobot Alert] GJ Camp - Frontend (www) is DOWN

Monitor: GJ Camp - Frontend (www)
Status: Down
Reason: HTTP 500 - Internal Server Error
Date: 13 Jan 2026 14:35:22 UTC
```

### Alerte "Up" 
Envoyée quand le site revient en ligne:

```
📧 Subject: [UptimeRobot Alert] GJ Camp - Frontend (www) is UP

Monitor: GJ Camp - Frontend (www)
Status: Up
Duration: 5 minutes down
Date: 13 Jan 2026 14:40:22 UTC
```

---

## ⚙️ PARAMÈTRES RECOMMANDÉS

### Plan Gratuit (50 monitors)
```
Monitoring Interval: 5 minutes
Alert Threshold: 1 time (immédiat)
Monitors actifs: 3
```

### Plan Pro (recommandé)
```
Monitoring Interval: 1 minute
Alert Threshold: 1 time
Monitors actifs: 3-5
SMS alerts: Activé
```

---

## 🎨 MONITORS OPTIONNELS (à ajouter si besoin)

### Monitor #4: Page Inscription
```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp - Page Inscription
URL: https://www.gjsdecrpt.fr/inscription
Monitoring Interval: 10 minutes
Keyword: S'inscrire
```

### Monitor #5: Connexion utilisateur
```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp - Page Login
URL: https://www.gjsdecrpt.fr/login
Monitoring Interval: 10 minutes
Keyword: Connexion
```

### Monitor #6: Vérifier Render Sleep
**Important si vous êtes sur le plan gratuit Render (sleep après 15 min d'inactivité)**

```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp - Keep Render Awake
URL: https://api.gjsdecrpt.fr/api/health
Monitoring Interval: 10 minutes
```

> ⚠️ **Note Render gratuit**: Render endort les services après 15 minutes d'inactivité. Ce monitor les réveillera toutes les 10 minutes (mais vous avez 750h/mois gratuit max).

---

## 📱 CONFIGURATION TELEGRAM (recommandé)

### Pourquoi Telegram?
- ✅ Gratuit
- ✅ Notifications instantanées
- ✅ Pas limité comme email
- ✅ Fonctionne sur mobile

### Configuration:

1. **Sur UptimeRobot**:
   - My Settings → Alert Contacts
   - Add Alert Contact → Telegram
   - Cliquez **Get My Telegram Chat ID**

2. **Sur Telegram** (app mobile ou web):
   - Cherchez le bot: `@uptimerobot_bot`
   - Démarrez une conversation: `/start`
   - Envoyez votre chat ID au bot

3. **Retour sur UptimeRobot**:
   - Collez votre Chat ID
   - Save

4. **Activez Telegram pour tous vos monitors**

---

## 🧪 TESTER VOS MONITORS

### Test 1: Vérifier qu'ils fonctionnent

1. Attendez 5 minutes après création
2. Les monitors doivent afficher **Up** avec un ✅ vert
3. Si **Down** en rouge:
   - Vérifiez l'URL (https://...)
   - Testez l'URL dans votre navigateur
   - Vérifiez que le keyword existe sur la page

---

### Test 2: Simuler une panne (optionnel)

**Méthode 1: Arrêter temporairement Render**
1. Sur Render, service gj-camp-website-1
2. Settings → **Suspend Service**
3. Attendez 5-10 minutes
4. Vous devriez recevoir une alerte
5. Cliquez **Resume Service**

**Méthode 2: Modifier le keyword**
1. Éditez un monitor
2. Changez le keyword pour un texte inexistant: `TEXTE_INEXISTANT_123`
3. Save
4. Attendez 5 minutes → Alerte "Down"
5. Remettez le bon keyword

---

## 📊 VOIR LES STATISTIQUES

### Uptime Percentage
UptimeRobot calcule automatiquement:
- **Dernières 24h**: 99.8%
- **Derniers 7 jours**: 99.9%
- **Derniers 30 jours**: 99.95%

### Logs
Cliquez sur un monitor → **Logs** pour voir:
- Tous les incidents
- Durée de chaque downtime
- Raison (HTTP 500, timeout, keyword not found, etc.)

---

## 🎯 CONFIGURATION FINALE RECOMMANDÉE

```
📊 MONITORS (3 essentiels)

✅ Monitor 1: GJ Camp - Frontend (www)
   URL: https://www.gjsdecrpt.fr
   Interval: 5 min
   Keyword: Génération Josué
   Alert: Email + Telegram

✅ Monitor 2: GJ Camp - Backend API
   URL: https://api.gjsdecrpt.fr/api/health
   Interval: 5 min
   Keyword: Backend fonctionnel
   Alert: Email + Telegram

✅ Monitor 3: GJ Camp - API Activities
   URL: https://api.gjsdecrpt.fr/api/activities
   Interval: 10 min
   Keyword: (none or "success")
   Alert: Email + Telegram

📧 ALERT CONTACTS

✅ Email: votre-email@example.com
✅ Telegram: @votre_username
✅ Threshold: 1 time (alerte immédiate)
```

---

## ✅ CHECKLIST FINALE

- [ ] Compte UptimeRobot créé
- [ ] Monitor Frontend créé et **Up** ✅
- [ ] Monitor Backend Health créé et **Up** ✅
- [ ] Monitor Activities créé et **Up** ✅
- [ ] Email alert contact ajouté
- [ ] (Optionnel) Telegram configuré
- [ ] Chaque monitor notifie les contacts
- [ ] Threshold = 1 time pour tous
- [ ] Test alerte effectué

---

## 🚨 ACTIONS EN CAS D'ALERTE

### Alerte "Frontend Down"
1. Vérifiez https://www.gjsdecrpt.fr dans votre navigateur
2. Si erreur, vérifiez Vercel: https://vercel.com/dashboard
3. Vérifiez les logs Vercel
4. Si DNS, vérifiez Hostinger DNS

### Alerte "Backend Down"
1. Vérifiez https://api.gjsdecrpt.fr/api/health dans votre navigateur
2. Vérifiez Render: https://dashboard.render.com
3. Vérifiez les logs Render (Logs tab)
4. Si service "sleeping", il redémarrera en 30 sec

### Alerte "Keyword Not Found"
1. Le site est accessible mais le contenu a changé
2. Vérifiez que le keyword existe toujours sur la page
3. Mettez à jour le keyword dans le monitor si nécessaire

---

**Date de création**: 13 janvier 2026
**Site**: gjsdecrpt.fr
**Service**: UptimeRobot
