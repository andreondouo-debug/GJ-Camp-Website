# 🌐 Guide Complet: Configuration Domaine Personnalisé

## 📌 Vue d'ensemble

Ce guide vous aide à configurer votre domaine personnalisé pour:
- **Frontend**: Accessible via `www.votredomaine.com` et `votredomaine.com`
- **Backend API**: Accessible via `api.votredomaine.com`

---

## 🎯 Prérequis

✅ Domaine acheté (ex: chez OVH, Namecheap, GoDaddy, etc.)
✅ Accès au tableau de bord DNS de votre registrar
✅ Comptes Vercel et Render configurés

---

## 📝 ÉTAPE 1: Configuration DNS

### 1.1 Connectez-vous chez votre registrar
Exemple: Si domaine acheté chez **OVH**, allez sur https://www.ovh.com/manager/

### 1.2 Accédez à la zone DNS
- Trouvez votre domaine dans la liste
- Cliquez sur **Zone DNS** ou **DNS Management**

### 1.3 Ajoutez les enregistrements DNS

#### Pour le Frontend (Vercel)

**Enregistrement CNAME pour www:**
```
Type: CNAME
Sous-domaine: www
Cible: cname.vercel-dns.com
TTL: 3600 (ou Auto)
```

**Enregistrement A pour le domaine racine:**
```
Type: A
Sous-domaine: @ (ou vide)
Valeur: 76.76.21.21
TTL: 3600
```

#### Pour le Backend (Render)

**Enregistrement CNAME pour api:**
```
Type: CNAME
Sous-domaine: api
Cible: gj-camp-website-1.onrender.com
TTL: 3600
```

### 1.4 Sauvegardez
Cliquez sur **Sauvegarder** ou **Apply Changes**

> ⏱️ **Note**: La propagation DNS prend 5 minutes à 48 heures

---

## 🎨 ÉTAPE 2: Configuration Vercel (Frontend)

### 2.1 Accédez à Vercel
1. Allez sur https://vercel.com/dashboard
2. Cliquez sur votre projet: **gj-camp-website-3fuu**

### 2.2 Ajoutez votre domaine
1. Allez dans **Settings** (menu à gauche)
2. Cliquez sur **Domains**
3. Cliquez sur **Add** ou **Add Domain**
4. Entrez: `www.votredomaine.com`
5. Cliquez sur **Add**
6. Vercel vérifiera automatiquement

### 2.3 Ajoutez le domaine racine
1. Cliquez à nouveau sur **Add**
2. Entrez: `votredomaine.com`
3. Cliquez sur **Add**

### 2.4 Vérification
Vercel affichera un ✅ vert quand les DNS sont correctement configurés.

### 2.5 Configurez la redirection
Vercel configurera automatiquement:
- `votredomaine.com` → redirige vers `www.votredomaine.com`
- HTTPS automatiquement activé

---

## 🔧 ÉTAPE 3: Configuration Render (Backend)

### 3.1 Accédez à Render
1. Allez sur https://dashboard.render.com
2. Cliquez sur votre service: **gj-camp-website-1**

### 3.2 Ajoutez le domaine personnalisé
1. Allez dans **Settings** (menu à gauche)
2. Trouvez la section **Custom Domain**
3. Cliquez sur **Add Custom Domain**
4. Entrez: `api.votredomaine.com`
5. Cliquez sur **Save**

### 3.3 Activez HTTPS
1. Render génère automatiquement un certificat SSL Let's Encrypt
2. Attendez quelques minutes (max 10 min)
3. Vous verrez un ✅ vert quand c'est prêt

---

## 🔄 ÉTAPE 4: Variables d'environnement

### 4.1 Backend (Render)

1. Sur Render, service **gj-camp-website-1**
2. Allez dans **Environment**
3. Trouvez `FRONTEND_URL`
4. Cliquez sur **Edit**
5. Remplacez par:
   ```
   https://www.votredomaine.com,https://votredomaine.com
   ```
6. Cliquez **Save Changes**

> ⚠️ **Important**: Gardez les deux URLs (avec et sans www) séparées par une virgule

### 4.2 Frontend (Vercel)

1. Sur Vercel, projet **gj-camp-website-3fuu**
2. Allez dans **Settings** → **Environment Variables**
3. Trouvez `REACT_APP_API_URL`
4. Cliquez sur **Edit**
5. Remplacez par:
   ```
   https://api.votredomaine.com
   ```
6. Cliquez **Save**

### 4.3 Redéployer

**Sur Vercel:**
1. Allez dans **Deployments**
2. Cliquez sur les **...** du dernier déploiement
3. Cliquez **Redeploy**

**Sur Render:**
Le service redémarrera automatiquement après changement des variables.

---

## 📍 ÉTAPE 5: Vérification et Tests

### 5.1 Vérifier la propagation DNS

Ouvrez un terminal et tapez:
```bash
# Vérifier le frontend
nslookup www.votredomaine.com
nslookup votredomaine.com

# Vérifier le backend
nslookup api.votredomaine.com
```

Vous devriez voir des adresses IP en réponse.

### 5.2 Tester le backend

```bash
# Test de santé
curl https://api.votredomaine.com/api/health

# Doit retourner: {"message":"✅ Backend fonctionnel"}
```

### 5.3 Tester le frontend

Ouvrez votre navigateur et allez sur:
- https://www.votredomaine.com
- https://votredomaine.com

Vous devriez voir votre site!

### 5.4 Tester HTTPS

Vérifiez que le cadenas 🔒 apparaît dans la barre d'adresse.

---

## ⚙️ ENDROITS À MODIFIER (Récapitulatif)

### 1. **DNS (chez votre registrar)**
- ✅ CNAME `www` → `cname.vercel-dns.com`
- ✅ A `@` → `76.76.21.21`
- ✅ CNAME `api` → `gj-camp-website-1.onrender.com`

### 2. **Vercel**
- ✅ Ajouter domaine `www.votredomaine.com`
- ✅ Ajouter domaine `votredomaine.com`
- ✅ Variable `REACT_APP_API_URL` = `https://api.votredomaine.com`
- ✅ Redéployer

### 3. **Render**
- ✅ Ajouter custom domain `api.votredomaine.com`
- ✅ Variable `FRONTEND_URL` = `https://www.votredomaine.com,https://votredomaine.com`

### 4. **Code (AUCUN CHANGEMENT nécessaire!)**
Le code utilise déjà les variables d'environnement, donc aucune modification de code n'est nécessaire.

---

## 🛠️ Script Automatisé

Utilisez le script fourni pour un guide interactif:

```bash
./configure-domain.sh votredomaine.com
```

Ce script vous guidera étape par étape et créera un fichier `DOMAIN_CONFIG.md` avec votre configuration.

---

## ❓ FAQ

### Combien de temps pour la propagation DNS?
- **Minimum**: 5-15 minutes
- **Moyen**: 1-2 heures
- **Maximum**: 24-48 heures

### Puis-je utiliser seulement `votredomaine.com` sans `www`?
Oui, mais gardez les deux pour la compatibilité. Vercel redirigera automatiquement.

### Mon domaine est chez OVH, comment faire?
1. https://www.ovh.com/manager/
2. Web Cloud → Noms de domaine → Votre domaine
3. Zone DNS → Ajouter une entrée

### Le backend ne fonctionne pas après configuration
1. Vérifiez que le DNS `api.votredomaine.com` pointe bien vers Render
2. Attendez 10 minutes pour le certificat SSL
3. Vérifiez que FRONTEND_URL est bien mis à jour sur Render

### Erreur CORS après migration
Vérifiez que `FRONTEND_URL` sur Render contient bien vos nouveaux domaines avec le bon format:
```
https://www.votredomaine.com,https://votredomaine.com
```

---

## 📞 Support

En cas de problème:
1. Vérifiez les logs Render: https://dashboard.render.com → Logs
2. Vérifiez les logs Vercel: https://vercel.com/dashboard → Deployments → View Function Logs
3. Testez avec `curl -v https://api.votredomaine.com/api/health`

---

## ✅ Checklist Finale

- [ ] DNS configurés chez le registrar
- [ ] Domaines ajoutés sur Vercel (www + racine)
- [ ] Domaine api configuré sur Render
- [ ] FRONTEND_URL mis à jour sur Render
- [ ] REACT_APP_API_URL mis à jour sur Vercel
- [ ] Vercel redéployé
- [ ] Test `curl https://api.votredomaine.com/api/health` ✅
- [ ] Site accessible sur https://www.votredomaine.com ✅
- [ ] HTTPS actif (cadenas 🔒) ✅

---

**Date de création**: $(date)
**Version**: 1.0
