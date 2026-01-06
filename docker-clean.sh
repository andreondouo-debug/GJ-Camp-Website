#!/bin/bash

# Script pour nettoyer les conteneurs, images et volumes non utilisés
# Usage: ./docker-clean.sh

set -e

echo "🧹 Nettoyage des ressources Docker..."

echo "Arrêt des conteneurs..."
docker-compose down || true

echo "Suppression des images..."
docker-compose down -v || true

echo "Nettoyage des images non utilisées..."
docker image prune -f

echo "✅ Nettoyage terminé"
