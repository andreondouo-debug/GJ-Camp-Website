# 🚀 Démarrage Rapide Docker - GJ Camp Website

**Durée estimée: 2-3 minutes** ⏱️

## Étape 1️⃣: Préparer l'environnement

```bash
# Copier le fichier de configuration
cp .env.docker.example .env.docker

# Éditer avec vos paramètres (optionnel en développement)
nano .env.docker
```

## Étape 2️⃣: Démarrer les services

```bash
# Mode développement
./docker-start.sh dev

# OU Mode production
./docker-start.sh prod
```

## Étape 3️⃣: Vérifier que tout fonctionne

```bash
# Test rapide
./docker-test.sh

# Ou voir le statut
docker-compose ps
```

## 📍 Accès aux applications

| Service | URL | Port |
|---------|-----|------|
| **Frontend** | http://localhost | 80 |
| **Backend API** | http://localhost:5000 | 5000 |
| **Health Check** | http://localhost:5000/api/health | 5000 |
| **MongoDB** | localhost:27017 | 27017 |

## 🛠️ Commandes essentielles

```bash
# Logs en temps réel
docker-compose logs -f

# Shell du backend
docker-compose exec backend sh

# Arrêter les services
./docker-stop.sh

# Nettoyer tout
./docker-clean.sh

# Utiliser Makefile (optionnel)
make help
make docker-dev
```

## 🎯 Cas d'usage courants

### Je veux modifier le code

1. Les fichiers se mettront à jour en temps réel en mode `dev`
2. Pour le frontend, les changements se reflètent automatiquement
3. Pour le backend, redémarrez le conteneur:
   ```bash
   docker-compose restart backend
   ```

### Je veux voir les logs du backend

```bash
docker-compose logs -f backend
```

### Je veux accéder à MongoDB

```bash
docker-compose exec mongodb mongosh -u admin -p GjCamp2025Mongo
```

### Je veux augmenter les ports

Éditer `docker-compose.yml`:
```yaml
backend:
  ports:
    - "5001:5000"  # Utiliser 5001 au lieu de 5000

frontend:
  ports:
    - "3000:80"    # Utiliser 3000 au lieu de 80
```

## ❓ Problèmes fréquents

### ❌ "Port already in use"
```bash
# macOS
lsof -i :5000
kill -9 <PID>

# OU changer le port dans docker-compose.yml
```

### ❌ "Cannot connect to backend"
```bash
# Vérifier que le backend est prêt
docker-compose logs backend

# Redémarrer
docker-compose restart backend
```

### ❌ "MongoDB connection failed"
```bash
# Vérifier MongoDB
docker-compose logs mongodb

# Redémarrer tous les services
docker-compose down
docker-compose up -d
```

---

## 📚 Plus d'informations

- **Guide complet**: Voir [DOCKER_COMPLET.md](./DOCKER_COMPLET.md)
- **Dockerfile backend**: [Dockerfile.backend](./Dockerfile.backend)
- **Dockerfile frontend**: [Dockerfile.frontend](./Dockerfile.frontend)
- **Configuration Nginx**: [nginx.conf](./nginx.conf)

---

**Besoin d'aide ?** Consultez le guide complet ou les logs Docker. 💪
