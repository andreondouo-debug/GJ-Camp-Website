# 🌐 Configuration gjsdecrpt.fr sur Hostinger

## 📌 Configuration finale
- **Frontend**: https://www.gjsdecrpt.fr ET https://gjsdecrpt.fr
- **Backend API**: https://api.gjsdecrpt.fr

---

## PARTIE 1: Configuration DNS chez Hostinger (15 minutes)

### Étape 1.1: Accéder à la zone DNS

1. **Connectez-vous à Hostinger**
   - Allez sur: https://hpanel.hostinger.com
   - Entrez vos identifiants

2. **Accédez aux Domaines**
   - Dans le menu de gauche, cliquez sur **Domaines**
   - Vous verrez votre domaine **gjsdecrpt.fr** dans la liste
   - Cliquez sur **Gérer** (ou **Manage**) à côté de gjsdecrpt.fr

3. **Ouvrez la zone DNS**
   - Cliquez sur l'onglet **DNS / Serveurs de noms** (ou **DNS / Name Servers**)
   - Vous verrez une liste d'enregistrements DNS existants

---

### Étape 1.2: Supprimer les enregistrements conflictuels

⚠️ **IMPORTANT**: Avant d'ajouter les nouveaux, supprimez les anciens pour éviter les conflits:

**Enregistrements à supprimer (s'ils existent):**
1. Enregistrement A avec nom `@` pointant vers une IP Hostinger
2. Enregistrement A avec nom `www` 
3. Enregistrement CNAME avec nom `www` pointant vers Hostinger

**Comment supprimer:**
- Trouvez l'enregistrement dans la liste
- Cliquez sur l'icône **🗑️ Corbeille** ou **Supprimer** à droite
- Confirmez la suppression

---

### Étape 1.3: Ajouter les NOUVEAUX enregistrements DNS

#### 📝 Enregistrement #1: Domaine racine pour Vercel

Cliquez sur **Ajouter un enregistrement** (ou **Add Record**)

```
Type: A
Nom: @ (ou laissez vide)
Pointe vers: 76.76.21.21
TTL: 3600 (ou laissez par défaut)
```

✅ Cliquez sur **Ajouter** ou **Save**

---

#### 📝 Enregistrement #2: www pour Vercel

Cliquez sur **Ajouter un enregistrement**

```
Type: CNAME
Nom: www
Pointe vers: cname.vercel-dns.com
TTL: 3600
```

⚠️ **IMPORTANT**: N'ajoutez PAS de point `.` à la fin de `cname.vercel-dns.com`
Si Hostinger l'ajoute automatiquement, c'est normal.

✅ Cliquez sur **Ajouter** ou **Save**

---

#### 📝 Enregistrement #3: api pour Render (Backend)

Cliquez sur **Ajouter un enregistrement**

```
Type: CNAME
Nom: api
Pointe vers: gj-camp-website-1.onrender.com
TTL: 3600
```

✅ Cliquez sur **Ajouter** ou **Save**

---

### Étape 1.4: Vérification DNS

Votre zone DNS doit maintenant contenir:

| Type  | Nom | Valeur/Cible                          |
|-------|-----|---------------------------------------|
| A     | @   | 76.76.21.21                          |
| CNAME | www | cname.vercel-dns.com                 |
| CNAME | api | gj-camp-website-1.onrender.com       |

📸 **Prenez une capture d'écran pour garder une trace**

⏱️ **Propagation DNS**: 5 minutes à 2 heures (généralement 15-30 minutes)

---

## PARTIE 2: Configuration Vercel (Frontend) (5 minutes)

### Étape 2.1: Connexion à Vercel

1. Allez sur: https://vercel.com/dashboard
2. Connectez-vous avec votre compte
3. Cliquez sur votre projet: **gj-camp-website-3fuu**

---

### Étape 2.2: Ajouter www.gjsdecrpt.fr

1. Dans le menu de gauche, cliquez sur **Settings** (⚙️)
2. Cliquez sur **Domains**
3. Dans le champ "Add Domain", tapez:
   ```
   www.gjsdecrpt.fr
   ```
4. Cliquez sur **Add**

**Vercel va vérifier:**
- Il cherchera l'enregistrement CNAME
- Si configuré correctement, vous verrez ✅ **Valid Configuration**
- Si erreur, attendez 10-15 minutes (propagation DNS)

---

### Étape 2.3: Ajouter gjsdecrpt.fr (sans www)

1. Toujours dans **Domains**
2. Dans le champ "Add Domain", tapez:
   ```
   gjsdecrpt.fr
   ```
3. Cliquez sur **Add**

**Vercel va:**
- Vérifier l'enregistrement A
- Configurer automatiquement la redirection: `gjsdecrpt.fr` → `www.gjsdecrpt.fr`
- Générer un certificat SSL (HTTPS automatique)

---

### Étape 2.4: Configuration de la redirection

Vercel vous demandera peut-être:
> "Redirect gjsdecrpt.fr to www.gjsdecrpt.fr?"

**Répondez OUI** (ou cliquez **Redirect**)

Résultat final dans Vercel Domains:
```
✅ www.gjsdecrpt.fr (Primary)
✅ gjsdecrpt.fr (Redirects to www)
```

---

### Étape 2.5: Mettre à jour la variable d'environnement

1. Toujours dans **Settings**, cliquez sur **Environment Variables**
2. Cherchez: `REACT_APP_API_URL`
3. Cliquez sur **Edit** (✏️)
4. Remplacez la valeur actuelle par:
   ```
   https://api.gjsdecrpt.fr
   ```
5. Cliquez **Save**

**Important**: Appliquez à tous les environnements:
- ✅ Production
- ✅ Preview
- ✅ Development

---

### Étape 2.6: Redéployer

1. Allez dans **Deployments** (menu de gauche)
2. Trouvez le dernier déploiement (tout en haut)
3. Cliquez sur les **⋯** (trois points) à droite
4. Cliquez sur **Redeploy**
5. Confirmez en cliquant **Redeploy** dans la popup

⏱️ **Temps de déploiement**: 2-3 minutes

---

## PARTIE 3: Configuration Render (Backend) (5 minutes)

### Étape 3.1: Connexion à Render

1. Allez sur: https://dashboard.render.com
2. Connectez-vous
3. Cliquez sur votre service: **gj-camp-website-1**

---

### Étape 3.2: Ajouter le domaine personnalisé

1. Dans le menu de gauche, cliquez sur **Settings**
2. Faites défiler jusqu'à la section **Custom Domain**
3. Cliquez sur **Add Custom Domain**
4. Dans le champ, tapez:
   ```
   api.gjsdecrpt.fr
   ```
5. Cliquez **Save**

**Render va:**
- Vérifier l'enregistrement CNAME `api` → `gj-camp-website-1.onrender.com`
- Générer automatiquement un certificat SSL Let's Encrypt
- Activer HTTPS

⏱️ **Génération SSL**: 2-10 minutes

**Statut attendu:**
```
✅ api.gjsdecrpt.fr - SSL Active
```

---

### Étape 3.3: Mettre à jour FRONTEND_URL

1. Toujours dans le service, cliquez sur **Environment** (menu de gauche)
2. Cherchez la variable: `FRONTEND_URL`
3. Cliquez sur **Edit** (✏️)
4. Remplacez par:
   ```
   https://www.gjsdecrpt.fr,https://gjsdecrpt.fr
   ```
5. Cliquez **Save**

⚠️ **TRÈS IMPORTANT**: 
- Les deux URLs séparées par une virgule `,` sans espace
- Utilisez `https://` (pas `http://`)
- `www.gjsdecrpt.fr` en premier

---

### Étape 3.4: Redémarrage automatique

Render redémarrera automatiquement le service après modification des variables.

Vous verrez:
```
🔄 Deploying...
```

⏱️ **Temps de redémarrage**: 2-3 minutes

---

## PARTIE 4: Vérification et Tests (10 minutes)

### Test 1: Vérifier la propagation DNS

Ouvrez un terminal et tapez:

```bash
# Test domaine principal
nslookup gjsdecrpt.fr

# Doit retourner: 76.76.21.21
```

```bash
# Test sous-domaine www
nslookup www.gjsdecrpt.fr

# Doit retourner: cname.vercel-dns.com ou une IP de Vercel
```

```bash
# Test sous-domaine api
nslookup api.gjsdecrpt.fr

# Doit retourner: gj-camp-website-1.onrender.com
```

✅ **Si vous voyez les bonnes valeurs**: DNS propagé!
❌ **Si "server can't find"**: Attendez 15-30 minutes

---

### Test 2: Tester le backend

```bash
curl https://api.gjsdecrpt.fr/api/health
```

**Résultat attendu:**
```json
{"message":"✅ Backend fonctionnel"}
```

❌ **Si erreur SSL**: Attendez 10 minutes (génération certificat)
❌ **Si 404 ou timeout**: Vérifiez le DNS `api.gjsdecrpt.fr`

---

### Test 3: Tester le frontend

**Dans votre navigateur**, allez sur:

1. **https://www.gjsdecrpt.fr**
   - ✅ Doit afficher votre site
   - ✅ Cadenas 🔒 vert dans la barre d'adresse
   - ✅ Pas d'avertissement de sécurité

2. **https://gjsdecrpt.fr** (sans www)
   - ✅ Doit rediriger automatiquement vers `www.gjsdecrpt.fr`

---

### Test 4: Tester la communication Frontend ↔️ Backend

1. Sur votre site **https://www.gjsdecrpt.fr**
2. Ouvrez la console du navigateur (F12 → Console)
3. Rafraîchissez la page (F5)
4. Cherchez dans la console:
   ```
   ✅ Backend fonctionnel
   ```
   Ou des requêtes vers `api.gjsdecrpt.fr`

❌ **Si erreur CORS**: Vérifiez que `FRONTEND_URL` sur Render contient bien les deux URLs

---

## PARTIE 5: Résolution des problèmes courants

### Problème 1: "DNS not found" après 1 heure

**Cause**: Mauvaise configuration DNS chez Hostinger

**Solution:**
1. Retournez sur Hostinger hPanel
2. Vérifiez que vous n'avez PAS de conflit:
   - Pas de double enregistrement A pour `@`
   - Pas de CNAME et A pour `www` en même temps
3. Les enregistrements doivent être EXACTEMENT:
   ```
   Type  | Nom | Valeur
   A     | @   | 76.76.21.21
   CNAME | www | cname.vercel-dns.com
   CNAME | api | gj-camp-website-1.onrender.com
   ```

---

### Problème 2: "This site can't provide a secure connection" (ERR_SSL_PROTOCOL_ERROR)

**Cause**: Certificat SSL pas encore généré

**Solution:**
- Attendez 10-15 minutes
- Sur Render, vérifiez dans Settings → Custom Domain que le statut est ✅
- Testez avec `curl -v https://api.gjsdecrpt.fr/api/health`

---

### Problème 3: CORS Error dans la console

**Erreur:**
```
Access to fetch at 'https://api.gjsdecrpt.fr/...' from origin 'https://www.gjsdecrpt.fr' 
has been blocked by CORS policy
```

**Cause**: `FRONTEND_URL` mal configuré sur Render

**Solution:**
1. Sur Render → Environment
2. Vérifiez `FRONTEND_URL`:
   ```
   https://www.gjsdecrpt.fr,https://gjsdecrpt.fr
   ```
3. **Pas d'espace** après la virgule
4. Les deux URLs avec `https://`
5. Sauvegardez et attendez le redémarrage (2 min)

---

### Problème 4: Site accessible sur www mais pas sans www (ou inverse)

**Sur Vercel:**
1. Settings → Domains
2. Les deux domaines doivent avoir ✅ vert
3. `gjsdecrpt.fr` doit avoir le label **Redirects to www.gjsdecrpt.fr**

**Si ce n'est pas le cas:**
1. Supprimez `gjsdecrpt.fr` de Vercel
2. Attendez 2 minutes
3. Re-ajoutez-le et choisissez **Redirect** quand demandé

---

## ✅ Checklist Finale

Cochez au fur et à mesure:

### DNS (Hostinger)
- [ ] Enregistrement A `@` → `76.76.21.21` ajouté
- [ ] Enregistrement CNAME `www` → `cname.vercel-dns.com` ajouté
- [ ] Enregistrement CNAME `api` → `gj-camp-website-1.onrender.com` ajouté
- [ ] Pas de doublons ou conflits
- [ ] Propagation DNS vérifiée avec `nslookup`

### Vercel (Frontend)
- [ ] Domaine `www.gjsdecrpt.fr` ajouté avec ✅
- [ ] Domaine `gjsdecrpt.fr` ajouté avec redirection ✅
- [ ] Variable `REACT_APP_API_URL` = `https://api.gjsdecrpt.fr`
- [ ] Projet redéployé
- [ ] Site accessible sur https://www.gjsdecrpt.fr
- [ ] HTTPS actif (cadenas 🔒)

### Render (Backend)
- [ ] Custom domain `api.gjsdecrpt.fr` ajouté
- [ ] SSL actif ✅
- [ ] Variable `FRONTEND_URL` = `https://www.gjsdecrpt.fr,https://gjsdecrpt.fr`
- [ ] Service redémarré
- [ ] `curl https://api.gjsdecrpt.fr/api/health` fonctionne
- [ ] Pas d'erreur CORS

### Tests
- [ ] `nslookup gjsdecrpt.fr` retourne `76.76.21.21`
- [ ] `nslookup www.gjsdecrpt.fr` retourne une IP Vercel
- [ ] `nslookup api.gjsdecrpt.fr` retourne Render
- [ ] Site fonctionne sur https://www.gjsdecrpt.fr
- [ ] Redirection `gjsdecrpt.fr` → `www.gjsdecrpt.fr` active
- [ ] Backend répond sur https://api.gjsdecrpt.fr/api/health
- [ ] Pas d'erreur dans la console navigateur
- [ ] Inscription/connexion fonctionne
- [ ] Images s'affichent correctement

---

## 🎉 Félicitations!

Votre site est maintenant accessible sur:
- **https://www.gjsdecrpt.fr** ✅
- **https://gjsdecrpt.fr** (redirige vers www) ✅
- **API Backend**: https://api.gjsdecrpt.fr ✅

---

## 📞 Besoin d'aide?

Si problème après ce guide:

1. **Vérifiez les logs Render**: https://dashboard.render.com → Logs
2. **Vérifiez les logs Vercel**: https://vercel.com/dashboard → Deployments
3. **Testez avec curl**:
   ```bash
   curl -v https://api.gjsdecrpt.fr/api/health
   ```
4. **Vérifiez la console navigateur** (F12)

---

**Date de configuration**: 13 janvier 2026
**Domaine**: gjsdecrpt.fr
**Registrar**: Hostinger
