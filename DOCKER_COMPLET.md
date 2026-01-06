# 🐳 Guide Complet Docker - GJ Camp Website

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Démarrage](#démarrage)
4. [Architecture](#architecture)
5. [Configuration](#configuration)
6. [Commandes utiles](#commandes-utiles)
7. [Dépannage](#dépannage)
8. [Déploiement en production](#déploiement-en-production)

---

## 🔧 Prérequis

- **Docker** >= 20.10
- **Docker Compose** >= 1.29
- **macOS**, **Linux** ou **Windows** avec WSL2

### Vérifier l'installation
```bash
docker --version
docker-compose --version
```

---

## 📥 Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd GJ-Camp-Website
```

### 2. Préparer le fichier d'environnement
```bash
cp .env.docker.example .env.docker
```

### 3. Éditer `.env.docker` avec vos paramètres
```bash
nano .env.docker  # ou votre éditeur préféré
```

**Variables essentielles à configurer:**
```env
# JWT Secret (générez une clé sécurisée)
JWT_SECRET=votre_secret_jwt_complexe_ici

# Email (optionnel en dev)
EMAIL_SERVICE=ethereal
EMAIL_USER=votre_email
EMAIL_PASSWORD=votre_mot_de_passe

# Frontend API URL
REACT_APP_API_URL=http://localhost:5000
```

### 4. Rendre les scripts exécutables
```bash
chmod +x docker-start.sh docker-stop.sh docker-clean.sh
```

---

## 🚀 Démarrage

### Mode développement
```bash
./docker-start.sh dev
```

### Mode production
```bash
./docker-start.sh prod
```

### Reconstruction des images
```bash
./docker-start.sh dev --rebuild
```

### Arrêter les services
```bash
./docker-stop.sh
```

### Logs en temps réel
```bash
docker-compose logs -f
```

---

## 🏗️ Architecture

### Services

```
┌─────────────────────────────────────────────┐
│           GJ Camp Website                   │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (React + Nginx)                   │
│  - Port: 80, 443                           │
│  - Image: Custom (multi-stage build)       │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Backend (Node.js + Express)               │
│  - Port: 5000                              │
│  - Image: node:18-alpine                   │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  MongoDB                                    │
│  - Port: 27017 (interne)                   │
│  - Image: mongo:7.0                        │
│  - Volumes: mongodb_data                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Volumes

- **mongodb_data**: Persistance de la base de données
- **./backend/uploads**: Fichiers uploadés
- **./backend/logs**: Logs du serveur

### Réseaux

- **gj-camp-network**: Réseau bridge pour la communication inter-conteneurs

---

## ⚙️ Configuration

### Variables d'environnement

#### Backend (`docker-compose.yml`)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:PASSWORD@mongodb:27017/gj-camp?authSource=admin
JWT_SECRET=votre_secret
FRONTEND_URL=http://localhost
EMAIL_SERVICE=ethereal
SENDGRID_API_KEY=optional
DPO_EMAIL=dpo@gj-camp.fr
CONTACT_EMAIL=contact@gj-camp.fr
```

#### Frontend (`Dockerfile.frontend`)
```env
REACT_APP_API_URL=http://localhost:5000
```

### Fichiers de configuration

- **docker-compose.yml**: Orchestration des services
- **Dockerfile.backend**: Image du backend
- **Dockerfile.frontend**: Image du frontend (multi-stage)
- **nginx.conf**: Configuration Nginx (proxy, cache, sécurité)
- **.dockerignore**: Fichiers ignorés lors du build

---

## 🛠️ Commandes utiles

### Gestion des services
```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Reconstruire les images
docker-compose build --no-cache

# Voir le statut
docker-compose ps
```

### Logs
```bash
# Tous les logs (suivi en temps réel)
docker-compose logs -f

# Logs du backend
docker-compose logs -f backend

# Logs du frontend
docker-compose logs -f frontend

# Logs de MongoDB
docker-compose logs -f mongodb

# Afficher les 100 dernières lignes
docker-compose logs --tail=100
```

### Accès aux conteneurs
```bash
# Shell du backend
docker-compose exec backend sh

# Shell du frontend
docker-compose exec frontend sh

# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p GjCamp2025Mongo

# Exécuter une commande
docker-compose exec backend npm list
```

### Données
```bash
# Sauvegarder la base de données
docker-compose exec mongodb mongosh -u admin -p GjCamp2025Mongo \
  --authenticationDatabase admin \
  --eval "db.getSiblingDB('gj-camp').getCollectionNames()"

# Nettoyer les données
docker volume rm gj-camp-website_mongodb_data

# Voir les volumes
docker volume ls | grep gj-camp
```

### Nettoyage
```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer aussi les volumes
docker-compose down -v

# Script de nettoyage complet
./docker-clean.sh

# Supprimer les images inutilisées
docker image prune -f
```

---

## 🔍 Dépannage

### Le conteneur backend ne démarre pas

1. **Vérifier les logs:**
   ```bash
   docker-compose logs backend
   ```

2. **Vérifier MongoDB est prêt:**
   ```bash
   docker-compose logs mongodb
   ```

3. **Redémarrer:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

### Port déjà utilisé

```bash
# Trouver quel processus utilise le port 5000
lsof -i :5000
kill -9 <PID>

# ou changer le port dans docker-compose.yml
```

### MongoDB ne répond pas

```bash
# Vérifier la connexion
docker-compose exec mongodb mongosh -u admin -p GjCamp2025Mongo

# Redémarrer MongoDB
docker-compose restart mongodb
```

### Frontend affiche un écran blanc

1. **Vérifier les logs Nginx:**
   ```bash
   docker-compose logs frontend
   ```

2. **Vérifier que le backend est accessible:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Reconstruire le frontend:**
   ```bash
   docker-compose down
   docker-compose up -d --build frontend
   ```

### Espace disque insuffisant

```bash
# Voir l'utilisation de Docker
docker system df

# Nettoyer les ressources non utilisées
docker system prune -a
```

---

## 🌍 Déploiement en production

### 1. Préparer le serveur

```bash
# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
```

### 2. Cloner le projet

```bash
git clone <votre-repo> /opt/gj-camp-website
cd /opt/gj-camp-website
```

### 3. Configurer l'environnement production

```bash
# Créer le fichier .env.docker avec les paramètres de production
nano .env.docker

# Paramètres essentiels pour la production:
FRONTEND_URL=https://votre-domaine.fr
REACT_APP_API_URL=https://api.votre-domaine.fr
JWT_SECRET=<valeur_très_sécurisée>
NODE_ENV=production
```

### 4. Démarrer en production

```bash
./docker-start.sh prod
```

### 5. Configurer SSL/TLS avec Let's Encrypt

```bash
# Utiliser Certbot avec Docker
docker run --rm -it -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/log/letsencrypt:/var/log/letsencrypt \
  certbot/certbot certonly --standalone -d votre-domaine.fr
```

### 6. Mettre à jour nginx.conf pour HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.fr;
    
    ssl_certificate /etc/letsencrypt/live/votre-domaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.fr/privkey.pem;
    
    # ... reste de la configuration
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.fr;
    return 301 https://$server_name$request_uri;
}
```

### 7. Sauvegardes automatiques

```bash
# Créer un script de sauvegarde MongoDB
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

docker-compose exec -T mongodb mongosh -u admin -p $MONGO_PASSWORD \
  --authenticationDatabase admin \
  --eval "db.getSiblingDB('gj-camp').archive()"

# Ajouter à crontab pour une sauvegarde quotidienne
0 2 * * * /opt/gj-camp-website/backup.sh
```

### 8. Monitoring

```bash
# Utiliser les health checks Docker
docker-compose ps

# Ou installer un outil de monitoring
docker run -d --name cadvisor \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --publish=8080:8080 \
  gcr.io/cadvisor/cadvisor:latest
```

---

## 📚 Documentation supplémentaire

- [Documentation officielle Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Bonnes pratiques Docker](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js avec Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

## 👥 Support

Pour des problèmes spécifiques au projet, consultez:
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- [QUICKSTART_DOCKER.md](./QUICKSTART_DOCKER.md)
- [Issues GitHub](https://github.com/votre-repo/issues)

---

**Dernière mise à jour:** 2 janvier 2026
