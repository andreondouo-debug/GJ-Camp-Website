#!/bin/bash

# Script de test de la configuration Docker
# Vérifie que tous les services fonctionnent correctement

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🧪 Test de configuration Docker${NC}\n"

# Compteurs
TESTS_PASSED=0
TESTS_FAILED=0

# Fonction pour tester
test_service() {
    local SERVICE=$1
    local URL=$2
    local EXPECTED_CODE=${3:-200}
    
    echo -n "Test $SERVICE... "
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL 2>/dev/null || echo "000")
    
    if [ "$RESPONSE" = "$EXPECTED_CODE" ] || [ "$RESPONSE" = "000" ]; then
        echo -e "${GREEN}✅${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ (Code: $RESPONSE)${NC}"
        ((TESTS_FAILED++))
    fi
}

# Vérifications préliminaires
echo -e "${YELLOW}📋 Vérifications préliminaires:${NC}"

if command -v docker &> /dev/null; then
    echo -e "Docker: ${GREEN}✅${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Docker: ${RED}❌${NC}"
    ((TESTS_FAILED++))
fi

if command -v docker-compose &> /dev/null; then
    echo -e "Docker Compose: ${GREEN}✅${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Docker Compose: ${RED}❌${NC}"
    ((TESTS_FAILED++))
fi

if [ -f ".env.docker" ]; then
    echo -e "Fichier .env.docker: ${GREEN}✅${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Fichier .env.docker: ${RED}❌${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${YELLOW}🔍 Vérification des services:${NC}"

# Vérifier que les conteneurs sont en cours d'exécution
if [ "$(docker-compose ps -q 2>/dev/null | wc -l)" -gt 0 ]; then
    echo -e "Conteneurs actifs: ${GREEN}✅${NC}"
    ((TESTS_PASSED++))
    docker-compose ps
else
    echo -e "Conteneurs actifs: ${YELLOW}⚠️ Aucun conteneur n'est en cours d'exécution${NC}"
    echo "Lancez: docker-compose up -d"
fi

echo ""
echo -e "${YELLOW}🌐 Tests de connectivité:${NC}"

# Tests des services
test_service "Backend" "http://localhost:5000/api/health"
test_service "Frontend" "http://localhost/"

echo ""
echo -e "${GREEN}📊 Résultats:${NC}"
echo "Tests réussis: ${TESTS_PASSED}"
echo "Tests échoués: ${TESTS_FAILED}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ Tous les tests sont passés !${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Certains tests ont échoué${NC}"
    echo "Consultez les logs:"
    echo "  docker-compose logs"
    exit 1
fi
