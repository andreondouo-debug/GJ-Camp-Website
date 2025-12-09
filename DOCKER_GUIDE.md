# 🐳 Guide Docker - GJ Camp

## 📋 Prérequis

### Installation Docker Desktop (Windows)
1. Télécharger Docker Desktop : https://www.docker.com/products/docker-desktop/
2. Installer et redémarrer Windows
3. Vérifier l'installation :
```powershell
docker --version
docker-compose --version
```

## 🚀 Déploiement Local avec Docker

### Étape 1 : Configuration

1. **Copier le fichier de configuration**
```powershell
cp .env.docker .env
```

2. **Modifier `.env`** avec vos vraies valeurs :
```env
# Générer un JWT secret sécurisé
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copier le résultat dans .env
JWT_SECRET=le_secret_genere_ici
```

### Étape 2 : Lancer l'application

```powershell
# Construire et démarrer tous les services
docker-compose up --build

# Ou en arrière-plan (détaché)
docker-compose up -d --build
```

**Résultat attendu :**
```
✅ MongoDB démarré sur mongodb:27017
✅ Backend démarré sur http://localhost:5000
✅ Frontend démarré sur http://localhost:80
```

### Étape 3 : Accéder à l'application

- **Site web** : http://localhost
- **API Backend** : http://localhost:5000/api/health
- **MongoDB** : mongodb://admin:GjCamp2025Mongo@localhost:27017/gj-camp

### Étape 4 : Créer un compte Admin

```powershell
# Accéder au container backend
docker exec -it gj-camp-backend sh

# Créer l'admin
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://admin:GjCamp2025Mongo@mongodb:27017/gj-camp?authSource=admin').then(async () => {
  const User = require('./src/models/User');
  const hashedPassword = await bcrypt.hash('Admin2025!', 10);
  
  await User.create({
    firstName: 'Admin',
    lastName: 'GJ',
    email: 'admin@gj-camp.fr',
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
    profileComplete: true
  });
  
  console.log('✅ Admin créé : admin@gj-camp.fr / Admin2025!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
"

# Quitter le container
exit
```

## 🔧 Commandes Utiles

### Gestion des containers

```powershell
# Voir les containers actifs
docker-compose ps

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
```

### Rebuild après modification du code

```powershell
# Rebuild le backend uniquement
docker-compose up -d --build backend

# Rebuild le frontend uniquement
docker-compose up -d --build frontend

# Rebuild tout
docker-compose up -d --build
```

### Accéder aux containers

```powershell
# Backend
docker exec -it gj-camp-backend sh

# MongoDB
docker exec -it gj-camp-mongodb mongosh -u admin -p GjCamp2025Mongo

# Frontend (Nginx)
docker exec -it gj-camp-frontend sh
```

### Nettoyer Docker

```powershell
# Supprimer les images non utilisées
docker image prune -a

# Supprimer tous les containers arrêtés
docker container prune

# Nettoyer tout (images, containers, volumes, networks)
docker system prune -a --volumes
```

## 📊 Structure des Services

```
┌─────────────────────────────────────────┐
│  Frontend (Nginx + React)               │
│  Port: 80                               │
│  URL: http://localhost                  │
└──────────────┬──────────────────────────┘
               │
               │ /api/* → Proxy
               │
┌──────────────▼──────────────────────────┐
│  Backend (Node.js + Express)            │
│  Port: 5000                             │
│  URL: http://localhost:5000             │
└──────────────┬──────────────────────────┘
               │
               │ Mongoose
               │
┌──────────────▼──────────────────────────┐
│  MongoDB                                │
│  Port: 27017                            │
│  DB: gj-camp                            │
└─────────────────────────────────────────┘
```

## 🌍 Déploiement en Production

### Option 1 : Railway (Recommandé)

1. **Créer compte Railway** : https://railway.app
2. **Connecter GitHub**
3. **Nouveau projet** → Deploy from GitHub
4. **Sélectionner** GJ-Camp-Website

**Configuration Railway :**
```yaml
# railway.toml (créer à la racine)
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.backend"

[deploy]
startCommand = "node src/server.js"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

5. **Variables d'environnement** :
   - Copier toutes les variables de `.env.docker`
   - Changer `JWT_SECRET` (nouveau secret sécurisé)
   - Changer `FRONTEND_URL` (URL Railway du frontend)
   - Changer `PAYPAL_MODE=live` + credentials production

### Option 2 : Render

1. **Créer compte** : https://render.com
2. **New Web Service** → Connect GitHub
3. **Docker** comme environnement
4. **Variables d'environnement** : Copier `.env.docker`

### Option 3 : VPS (Digital Ocean, AWS, Azure)

```bash
# SSH sur le serveur
ssh root@votre-serveur.com

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cloner le repo
git clone https://github.com/Jas185/GJ-Camp-Website.git
cd GJ-Camp-Website

# Configurer .env
cp .env.docker .env
nano .env  # Modifier les valeurs

# Lancer avec Docker Compose
docker-compose up -d --build

# Installer Nginx reverse proxy + SSL (Let's Encrypt)
apt-get install nginx certbot python3-certbot-nginx
certbot --nginx -d votre-domaine.com
```

## 🛡️ Sécurité Production

### Checklist avant mise en ligne

- [ ] JWT_SECRET changé (64+ caractères aléatoires)
- [ ] PayPal en mode `live` avec credentials production
- [ ] FRONTEND_URL configuré avec le vrai domaine
- [ ] MongoDB avec mot de passe fort (pas celui par défaut)
- [ ] HTTPS activé (SSL/TLS)
- [ ] Variables .env JAMAIS commitées sur Git
- [ ] Backups MongoDB configurés
- [ ] Monitoring configuré (Sentry, LogRocket)

## 📦 Volumes & Persistence

Les données persistantes sont stockées dans des volumes Docker :

```yaml
volumes:
  - mongodb_data:/data/db          # Base de données MongoDB
  - ./backend/uploads:/app/uploads  # Fichiers uploadés (photos, etc.)
  - ./backend/logs:/app/logs        # Logs applicatifs
```

**⚠️ Attention** : Les volumes Docker sont locaux. En production sur Railway/Render :
- Utiliser MongoDB Atlas (cloud)
- Utiliser Cloudinary ou S3 pour les uploads

## 🔍 Monitoring

### Voir les métriques

```powershell
# Stats en temps réel
docker stats

# Espace disque utilisé
docker system df

# Inspecter un container
docker inspect gj-camp-backend
```

### Logs avancés

```powershell
# Logs avec timestamp
docker-compose logs -f --timestamps

# Dernières 100 lignes
docker-compose logs --tail=100

# Filtrer par service
docker-compose logs backend | grep ERROR
```

## 🆘 Troubleshooting

### Erreur : Port already in use

```powershell
# Windows - Trouver le processus sur le port 5000
netstat -ano | findstr :5000

# Tuer le processus (PID de la dernière colonne)
taskkill /PID <PID> /F
```

### Erreur : MongoDB connection refused

```powershell
# Vérifier que MongoDB est démarré
docker-compose ps mongodb

# Vérifier les logs MongoDB
docker-compose logs mongodb

# Redémarrer MongoDB
docker-compose restart mongodb
```

### Erreur : Build failed

```powershell
# Nettoyer le cache Docker
docker-compose build --no-cache

# Supprimer les images et rebuild
docker-compose down
docker image prune -a
docker-compose up --build
```

### Le frontend ne se connecte pas au backend

1. Vérifier `REACT_APP_API_URL` dans `.env`
2. Vérifier que le backend est accessible : http://localhost:5000/api/health
3. Vérifier les CORS dans `backend/src/server.js`
4. Rebuild le frontend : `docker-compose up -d --build frontend`

## 📚 Ressources

- Documentation Docker : https://docs.docker.com/
- Docker Compose : https://docs.docker.com/compose/
- Railway Docs : https://docs.railway.app/
- Render Docs : https://render.com/docs

---

**Prochaine étape** : Tester localement avec `docker-compose up --build` !
