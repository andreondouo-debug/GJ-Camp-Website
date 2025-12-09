# 🚀 Démarrage Rapide - Docker

## ⚡ Lancer le site en 3 minutes

### Étape 1️⃣ : Installer Docker Desktop

**Windows :**
1. Télécharger : https://www.docker.com/products/docker-desktop/
2. Installer et redémarrer
3. Vérifier :
```powershell
docker --version
```

### Étape 2️⃣ : Configuration

1. **Copier le fichier de configuration**
```powershell
cp .env.docker .env
```

2. **Générer un secret JWT sécurisé**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

3. **Modifier `.env`** :
   - Remplacer `JWT_SECRET=CHANGEZ...` par le secret généré
   - Sauvegarder

### Étape 3️⃣ : Lancer l'application

```powershell
docker-compose up -d --build
```

**Attendez 2-3 minutes...**

### Étape 4️⃣ : Créer un compte Admin

```powershell
docker exec -it gj-camp-backend node -e "const mongoose = require('mongoose'); const bcrypt = require('bcryptjs'); mongoose.connect('mongodb://admin:GjCamp2025Mongo@mongodb:27017/gj-camp?authSource=admin').then(async () => { const User = require('./src/models/User'); const hashedPassword = await bcrypt.hash('Admin2025!', 10); await User.create({ firstName: 'Admin', lastName: 'GJ', email: 'admin@gj-camp.fr', password: hashedPassword, role: 'admin', isEmailVerified: true, profileComplete: true }); console.log('✅ Admin créé'); process.exit(0); });"
```

### Étape 5️⃣ : Accéder au site

🌐 **Frontend** : http://localhost  
🔧 **Backend API** : http://localhost:5000/api/health  
👤 **Se connecter** : admin@gj-camp.fr / Admin2025!

---

## 🛑 Arrêter l'application

```powershell
docker-compose down
```

## 🔄 Redémarrer après modification du code

```powershell
docker-compose up -d --build
```

---

## 📚 Documentation Complète

- **Guide Docker détaillé** : `DOCKER_GUIDE.md`
- **Déploiement Railway** : `RAILWAY_DEPLOY.md`
- **Déploiement général** : `DEPLOIEMENT.md`

---

## 🆘 Problèmes ?

### Le site ne s'affiche pas
```powershell
# Vérifier que tout est démarré
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Port déjà utilisé (80 ou 5000)
```powershell
# Windows - Trouver le processus
netstat -ano | findstr :80
netstat -ano | findstr :5000

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

### Rebuild complet
```powershell
docker-compose down -v
docker-compose up -d --build
```

---

✅ **C'est tout !** Votre site GJ Camp tourne maintenant en local avec Docker.
