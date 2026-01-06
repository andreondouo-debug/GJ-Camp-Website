#!/bin/bash

# Script pour arrêter tous les services Docker
# Usage: ./docker-stop.sh

set -e

echo "🛑 Arrêt des services Docker..."
docker-compose down

echo "✅ Services arrêtés"
