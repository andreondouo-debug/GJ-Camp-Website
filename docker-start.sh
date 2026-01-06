#!/bin/bash

# Script de démarrage complet du projet avec Docker
# Usage: ./docker-start.sh [dev|prod] [--rebuild]

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
MODE=${1:-dev}
REBUILD=${2:-}
ENV_FILE=".env.docker"

# Vérifie si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

# Vérifie si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Démarrage du GJ Camp Website en mode $MODE${NC}\n"

# Vérifie le fichier .env.docker
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Fichier $ENV_FILE non trouvé${NC}"
    echo -e "${YELLOW}Création de $ENV_FILE à partir de .env.docker.example${NC}"
    cp .env.docker.example $ENV_FILE
    echo -e "${YELLOW}✏️  Veuillez éditer $ENV_FILE avec vos paramètres${NC}"
    exit 1
fi

# Mode développement
if [ "$MODE" = "dev" ]; then
    echo -e "${GREEN}📦 Mode développement${NC}"
    export NODE_ENV=development
    
    # Arrête les conteneurs existants
    echo "Arrêt des conteneurs existants..."
    docker-compose down || true
    
    # Rebuild si demandé
    if [ "$REBUILD" = "--rebuild" ]; then
        echo "Reconstruction des images..."
        docker-compose build --no-cache
    fi
    
    # Démarre les services
    echo -e "${GREEN}Démarrage des services...${NC}"
    docker-compose up -d
    
    echo -e "${GREEN}✅ Services démarrés en mode développement${NC}\n"
    echo "📍 URLs:"
    echo "   - Frontend: http://localhost"
    echo "   - Backend:  http://localhost:5000"
    echo "   - API Docs: http://localhost:5000/api-docs"
    
# Mode production
elif [ "$MODE" = "prod" ]; then
    echo -e "${GREEN}🏭 Mode production${NC}"
    export NODE_ENV=production
    
    # Arrête les conteneurs existants
    echo "Arrêt des conteneurs existants..."
    docker-compose down || true
    
    # Rebuild (obligatoire en prod)
    echo "Reconstruction des images pour la production..."
    docker-compose build --no-cache
    
    # Démarre les services
    echo -e "${GREEN}Démarrage des services...${NC}"
    docker-compose up -d
    
    echo -e "${GREEN}✅ Services démarrés en mode production${NC}\n"
    echo "📍 URLs:"
    echo "   - Frontend: http://localhost"
    echo "   - Backend:  http://localhost:5000"
    
else
    echo -e "${RED}❌ Mode invalide: $MODE${NC}"
    echo "Usage: ./docker-start.sh [dev|prod] [--rebuild]"
    exit 1
fi

# Affiche le statut des services
echo -e "\n${YELLOW}Statut des services:${NC}"
sleep 3
docker-compose ps

echo -e "\n${GREEN}💡 Commandes utiles:${NC}"
echo "   - Logs:        docker-compose logs -f"
echo "   - Logs backend: docker-compose logs -f backend"
echo "   - Logs frontend: docker-compose logs -f frontend"
echo "   - Shell backend: docker-compose exec backend sh"
echo "   - Arrêter:     docker-compose down"
echo "   - Redémarrer:  docker-compose restart"
