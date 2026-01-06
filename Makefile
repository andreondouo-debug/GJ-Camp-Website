# Makefile pour GJ Camp Website
# Usage: make help

.PHONY: help docker-up docker-down docker-logs docker-build docker-clean \
        backend-shell frontend-shell db-shell docker-prod docker-dev \
        docker-restart docker-status

# Variables
DOCKER_COMPOSE := docker-compose
SHELL_CMD := /bin/bash

help:
	@echo "🐳 GJ Camp Website - Commandes Docker"
	@echo ""
	@echo "Démarrage:"
	@echo "  make docker-dev       - Démarrer en mode développement"
	@echo "  make docker-prod      - Démarrer en mode production"
	@echo "  make docker-up        - Démarrer les services"
	@echo "  make docker-down      - Arrêter les services"
	@echo ""
	@echo "Gestion:"
	@echo "  make docker-restart   - Redémarrer les services"
	@echo "  make docker-status    - Voir le statut des services"
	@echo "  make docker-build     - Reconstruire les images"
	@echo "  make docker-clean     - Nettoyer les ressources non utilisées"
	@echo ""
	@echo "Logs et Shell:"
	@echo "  make docker-logs      - Afficher les logs en temps réel"
	@echo "  make backend-shell    - Accès shell au backend"
	@echo "  make frontend-shell   - Accès shell au frontend"
	@echo "  make db-shell         - Accès MongoDB shell"
	@echo ""

docker-dev:
	@echo "🚀 Démarrage en mode développement..."
	./docker-start.sh dev

docker-prod:
	@echo "🏭 Démarrage en mode production..."
	./docker-start.sh prod

docker-up:
	@echo "⬆️  Démarrage des services..."
	$(DOCKER_COMPOSE) up -d

docker-down:
	@echo "⬇️  Arrêt des services..."
	$(DOCKER_COMPOSE) down

docker-restart:
	@echo "🔄 Redémarrage des services..."
	$(DOCKER_COMPOSE) restart

docker-status:
	@echo "📊 Statut des services:"
	@$(DOCKER_COMPOSE) ps

docker-logs:
	@$(DOCKER_COMPOSE) logs -f

docker-build:
	@echo "🔨 Reconstruction des images..."
	$(DOCKER_COMPOSE) build --no-cache

docker-clean:
	@echo "🧹 Nettoyage des ressources..."
	./docker-clean.sh

backend-shell:
	@echo "🔵 Shell du backend:"
	$(DOCKER_COMPOSE) exec backend $(SHELL_CMD)

frontend-shell:
	@echo "🔴 Shell du frontend:"
	$(DOCKER_COMPOSE) exec frontend $(SHELL_CMD)

db-shell:
	@echo "🟢 MongoDB shell:"
	$(DOCKER_COMPOSE) exec mongodb mongosh -u admin -p GjCamp2025Mongo --authenticationDatabase admin

.DEFAULT_GOAL := help
