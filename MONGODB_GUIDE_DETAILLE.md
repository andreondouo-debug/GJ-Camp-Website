# 🔐 Guide MongoDB Atlas - Navigation Détaillée

## 📍 Étape 1 : Créer un Utilisateur de Base de Données

### Où cliquer ?

1. **Dans le menu de gauche**, cherchez la section **"Security"**
2. Cliquez sur **"Database Access"** (icône avec un cadenas 🔐)

### Que faire ensuite ?

1. Cliquez sur le bouton vert **"+ ADD NEW DATABASE USER"** (en haut à droite)

2. Dans le formulaire qui s'ouvre :
   - **Authentication Method** : Laissez "Password" sélectionné
   - **Username** : Tapez `gjcamp-admin`
   - **Password** : 
     - Option 1 : Cliquez "Autogenerate Secure Password" → COPIEZ-LE IMMÉDIATEMENT !
     - Option 2 : Tapez votre propre mot de passe (ex: `GjCamp2026!`)
   
   ⚠️ **TRÈS IMPORTANT** : Notez ce mot de passe dans un fichier texte !

3. **Database User Privileges** :
   - Sélectionnez **"Built-in Role"**
   - Choisissez **"Atlas admin"** dans la liste déroulante

4. Cliquez le bouton **"Add User"** (en bas à droite)

---

## 🌐 Étape 2 : Configurer l'Accès Réseau

### Où cliquer ?

1. **Dans le menu de gauche**, sous "Security"
2. Cliquez sur **"Network Access"** (icône avec un globe 🌍)

### Que faire ?

1. Cliquez sur le bouton vert **"+ ADD IP ADDRESS"** (en haut à droite)

2. Dans la popup qui apparaît :
   - Cliquez sur le bouton **"ALLOW ACCESS FROM ANYWHERE"**
   - Vous verrez `0.0.0.0/0` apparaître automatiquement
   - (Optionnel) Ajoutez un commentaire : "Accès production"

3. Cliquez **"Confirm"**

---

## 🔗 Étape 3 : Obtenir l'URL de Connexion

### Méthode complète :

1. **Dans le menu de gauche**, cliquez sur **"Database"** (icône cylindre 🗄️)

2. Vous verrez votre cluster (probablement nommé "Cluster0")

3. Cliquez sur le bouton **"Connect"** (à droite du nom du cluster)

4. Dans la popup, vous avez 3 options. Cliquez sur **"Drivers"** (celle du milieu)

5. Dans la nouvelle page :
   - **Step 1** : Choisissez "Node.js" et la dernière version
   - **Step 2** : Vous verrez une URL qui ressemble à :
   
   ```
   mongodb+srv://gjcamp-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Cliquez sur l'icône "Copy" à côté de l'URL**

7. **REMPLACEZ `<password>`** par le mot de passe que vous avez noté

---

## 📝 Format Final de l'URL

Votre URL finale doit ressembler à ceci :

```
mongodb+srv://gjcamp-admin:GjCamp2026!@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**Éléments importants :**
- `gjcamp-admin` = votre username
- `GjCamp2026!` = votre mot de passe (REMPLACEZ ici)
- `cluster0.abc123.mongodb.net` = votre serveur (unique pour vous)

---

## 🆘 Aide Visuelle - Menu de Gauche

Voici ce que vous devriez voir dans le menu de gauche de MongoDB Atlas :

```
📊 OVERVIEW

🗄️ DATA SERVICES
   ├── Database (← Étape 3 : pour voir vos clusters)
   ├── Charts
   └── Data API

🔐 SECURITY
   ├── Database Access (← Étape 1 : créer l'utilisateur)
   ├── Network Access (← Étape 2 : autoriser l'IP)
   └── Encryption

⚙️ DEPLOYMENT
   └── ...
```

---

## ❓ Vous ne trouvez toujours pas ?

### Alternative rapide :

1. Dans le menu de gauche, cliquez sur **"Overview"** ou **"Database"**
2. Vous verriez votre cluster avec un nom comme **"Cluster0"**
3. À droite du nom du cluster, il y a **3 boutons** :
   - **Connect** ← CLIQUEZ ICI
   - **Browse Collections**
   - **... (menu)**

---

## ✅ Une fois que vous avez l'URL MongoDB

**Dites-moi simplement :**
- "J'ai l'URL MongoDB"

Et je vous aiderai à déployer sur Render (backend) puis Vercel (frontend) !

---

## 🔍 Indices Visuels

- **Database Access** : Cherchez l'icône avec un **cadenas** 🔒
- **Network Access** : Cherchez l'icône avec un **globe terrestre** 🌍
- **Database** : Cherchez l'icône avec un **cylindre de base de données** 🗄️
- Boutons verts = Actions principales
- Le bouton **"Connect"** est souvent en bleu/vert

---

## 💡 Astuce

Si vous êtes bloqué, prenez une capture d'écran de votre interface MongoDB Atlas et je vous dirai exactement où cliquer !
