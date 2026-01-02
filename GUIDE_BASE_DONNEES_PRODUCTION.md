# 📊 CONFIGURATION - Base de Données en Production

## ✅ Base de Données DÉJÀ Connectée!

### Infrastructure Actuelle

```
Frontend (Vercel)
    ↓ HTTP/HTTPS
Backend (Render) 
    ↓ Connection String
MongoDB Atlas (Cloud)
    ↓ Collections
    ├── activities (22 documents)
    ├── settings (1 document)
    ├── users (0 documents - À REMPLIR)
    ├── registrations
    ├── posts
    └── ...autres collections
```

### Connection Details

| Composant | Localisation | Statut |
|-----------|--------------|--------|
| **MongoDB URI** | `mongodb+srv://GJ-Camp_Website:***@cluster0.juxp1sw.mongodb.net/gj-camp` | ✅ Connecté |
| **Base de données** | `gj-camp` | ✅ Accessible |
| **Collections** | 10+ collections | ✅ Présentes |
| **Données** | 22 activités + settings | ✅ Disponibles |
| **Utilisateurs** | Collection vide | ⏳ À créer |

---

## 🎯 Problème Actuel

**La base existe et est connectée, MAIS la collection `users` est vide.**

C'est pourquoi `/api/users` retourne 0 résultats.

---

## ✅ Solutions pour Peupler la Base

### Solution 1: Créer un Utilisateur via Signup (Frontend) ✅ RECOMMANDÉ

**Sur https://www.gjsdecrpt.fr:**

1. Cliquer "Inscription"
2. Remplir le formulaire:
   ```
   Prénom: Admin
   Nom: Test
   Email: admin@gjcamp.fr
   Mot de passe: Admin@12345
   ```
3. L'utilisateur est automatiquement créé en MongoDB
4. Connexion → Token JWT obtenu
5. Accès à `/api/users` confirmé

**Résultat**: Utilisateur créé dans MongoDB collection `users`

---

### Solution 2: Créer un Utilisateur via Script (Backdoor)

Utiliser un script Node.js pour insérer directement:

```javascript
// backend/seed-users.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash('Admin@12345', 10);
  
  const admin = new User({
    firstName: 'Admin',
    lastName: 'Test',
    email: 'admin@gjcamp.fr',
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
    profileComplete: true
  });
  
  await admin.save();
  console.log('✅ Admin créé:', admin.email);
  process.exit(0);
};

createAdminUser().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
```

Exécuter:
```bash
cd backend
node seed-users.js
```

---

### Solution 3: Insérer Directement dans MongoDB Atlas

**Via MongoDB Atlas Interface:**

1. Ouvrir: https://cloud.mongodb.com
2. Sélectionner cluster: `cluster0`
3. Base: `gj-camp` → Collections → `users`
4. Insert Document:

```json
{
  "firstName": "Admin",
  "lastName": "Test",
  "email": "admin@gjcamp.fr",
  "password": "$2a$10$...", // bcrypt hash
  "role": "admin",
  "isEmailVerified": true,
  "profileComplete": true,
  "createdAt": {"$date": "2026-01-02T00:00:00Z"},
  "updatedAt": {"$date": "2026-01-02T00:00:00Z"}
}
```

⚠️ **Important**: Le mot de passe DOIT être hashé avec bcrypt!

---

## 🔄 Synchroniser les Données

### Cas 1: Migrer depuis Base Locale vers Production

Si vous avez une base **locale** (ex: MongoDB local) et voulez la synchroniser:

```bash
# Exporter depuis local
mongodump --uri "mongodb://localhost:27017/gj-camp" --out ./dump

# Restaurer en production
mongorestore --uri "mongodb+srv://GJ-Camp_Website:***@cluster0.juxp1sw.mongodb.net/gj-camp" ./dump/gj-camp

# Ou utiliser MongoDB Compass pour copier les données
```

### Cas 2: Synchroniser depuis Production vers Local

```bash
# Exporter depuis production
mongodump --uri "mongodb+srv://GJ-Camp_Website:***@cluster0.juxp1sw.mongodb.net/gj-camp" --out ./dump

# Restaurer localement
mongorestore --uri "mongodb://localhost:27017/gj-camp" ./dump/gj-camp
```

---

## ✅ Vérifier les Données en Production

### Via Terminal

```bash
# Health check
curl https://gj-camp-backend.onrender.com/api/health

# Activités
curl https://gj-camp-backend.onrender.com/api/activities | jq '.[] | .titre'

# Settings
curl https://gj-camp-backend.onrender.com/api/settings | jq '.settings'

# Utilisateurs (avec token)
curl -H "Authorization: Bearer {token}" \
     https://gj-camp-backend.onrender.com/api/users
```

### Via MongoDB Atlas

1. Ouvrir: https://cloud.mongodb.com
2. Cluster: `cluster0` → Collections
3. Voir toutes les collections et leurs documents

---

## 📊 Collections Actuelles

| Collection | Documents | Status |
|-----------|-----------|--------|
| `activities` | 22 | ✅ Remplie |
| `settings` | 1 | ✅ Remplie |
| `users` | 0 | ⏳ Vide |
| `registrations` | ? | ✅ Prête |
| `posts` | ? | ✅ Prête |
| `messages` | ? | ✅ Prête |
| `campuses` | ? | ✅ Prête |

---

## 🎯 Prochaines Étapes

### 1️⃣ Créer un Utilisateur Admin (Immédiat)

**Option A - Frontend (Plus simple):**
```
Aller sur https://www.gjsdecrpt.fr/inscription
S'inscrire → Compte créé en MongoDB
```

**Option B - Script Node.js (Plus rapide):**
```bash
cd backend
node seed-users.js
```

### 2️⃣ Tester l'Accès Utilisateurs

```bash
# Se connecter
curl -X POST https://gj-camp-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gjcamp.fr","password":"Admin@12345"}'

# Récupérer la liste des utilisateurs avec le token
curl -H "Authorization: Bearer {token}" \
     https://gj-camp-backend.onrender.com/api/users
```

### 3️⃣ Configurer les Rôles

- `admin` → Accès complet
- `responsable` → Gestion activités
- `user` → Utilisation basique

---

## ⚠️ Points Importants

- ✅ La base MongoDB **EST** connectée à la production
- ✅ Les données **EXISTENT** (activités, settings)
- ⏳ Les utilisateurs **N'EXISTENT** pas encore
- ⏳ Pas de données d'inscription/paiement pour le moment

---

## 🎉 Résumé

**OUI, la base de données existe et est connectée en production!**

Vous pouvez dès maintenant:
1. ✅ Voir les 22 activités
2. ✅ Accéder aux paramètres du site
3. ⏳ Créer des utilisateurs (via signup ou script)
4. ⏳ Gérer les inscriptions et paiements

**Prochaine action**: Créer un utilisateur admin pour accéder aux fonctionnalités complètes!

---

**Date**: 2 janvier 2026  
**Statut**: ✅ Base de données CONNECTÉE et OPÉRATIONNELLE
