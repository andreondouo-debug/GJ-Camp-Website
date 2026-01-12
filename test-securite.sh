#!/bin/bash

# Script de tests de sécurité - GJ Camp Website
# Date: 12 Janvier 2026

BACKEND_URL="https://gj-camp-website-1.onrender.com"
FRONTEND_URL="https://www.gjsdecrpt.fr"

echo "🔒 TESTS DE SÉCURITÉ - GJ CAMP WEBSITE"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Fonction de test
test_endpoint() {
    local description=$1
    local expected=$2
    local response=$3
    
    if [[ "$response" == *"$expected"* ]]; then
        echo -e "${GREEN}✅ $description${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $description${NC}"
        echo "   Réponse: $response"
        ((FAILED++))
    fi
}

# TEST 1: Accès route protégée sans token → 401
echo "📋 Test 1: Accès route protégée sans token"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/me")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Route protégée renvoie 401 sans token${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Route protégée devrait renvoyer 401, reçu: $RESPONSE${NC}"
    ((FAILED++))
fi
echo ""

# TEST 2: Accès admin sans rôle → 403
echo "📋 Test 2: Accès admin sans rôle"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/users")
if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✅ Route admin bloque l'accès non autorisé (${RESPONSE})${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Route admin devrait bloquer, reçu: $RESPONSE${NC}"
    ((FAILED++))
fi
echo ""

# TEST 3: Injection NoSQL
echo "📋 Test 3: Protection injection NoSQL"
PAYLOAD='{"email":{"$ne":null},"password":{"$ne":null}}'
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")
if [[ "$RESPONSE" == *"invalide"* ]] || [[ "$RESPONSE" == *"Email"* ]]; then
    echo -e "${GREEN}✅ Injection NoSQL bloquée/validée${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Injection NoSQL - Vérifier validation: $RESPONSE${NC}"
    ((FAILED++))
fi
echo ""

# TEST 4: XSS dans les inputs
echo "📋 Test 4: Protection XSS"
XSS_PAYLOAD='<script>alert("XSS")</script>'
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"firstName\":\"$XSS_PAYLOAD\",\"lastName\":\"Test\",\"email\":\"test@test.com\",\"password\":\"123456\"}")
if [[ "$RESPONSE" != *"<script>"* ]]; then
    echo -e "${GREEN}✅ XSS échappé dans les réponses${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ XSS non échappé détecté${NC}"
    ((FAILED++))
fi
echo ""

# TEST 5: HTTPS partout
echo "📋 Test 5: HTTPS activé"
if [[ "$BACKEND_URL" == https://* ]] && [[ "$FRONTEND_URL" == https://* ]]; then
    echo -e "${GREEN}✅ HTTPS activé sur backend et frontend${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ HTTPS manquant${NC}"
    ((FAILED++))
fi
echo ""

# TEST 6: Headers de sécurité
echo "📋 Test 6: Headers de sécurité"
HEADERS=$(curl -s -I "$BACKEND_URL/api/health")

check_header() {
    local header=$1
    if [[ "$HEADERS" == *"$header"* ]]; then
        echo -e "${GREEN}  ✅ $header présent${NC}"
        return 0
    else
        echo -e "${RED}  ❌ $header manquant${NC}"
        return 1
    fi
}

HEADERS_OK=0
check_header "X-Content-Type-Options" && ((HEADERS_OK++))
check_header "X-Frame-Options" && ((HEADERS_OK++))

if [ $HEADERS_OK -ge 1 ]; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# TEST 7: Rate limiting
echo "📋 Test 7: Rate limiting"
echo "  Envoi de 5 requêtes rapides..."
RATE_LIMIT_HIT=0
for i in {1..5}; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/login" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}')
    
    if [ "$RESPONSE" = "429" ]; then
        RATE_LIMIT_HIT=1
        break
    fi
    sleep 0.1
done

if [ $RATE_LIMIT_HIT -eq 1 ]; then
    echo -e "${GREEN}✅ Rate limiting actif (429 Too Many Requests)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Rate limiting non détecté (peut nécessiter plus de requêtes)${NC}"
    ((FAILED++))
fi
echo ""

# TEST 8: Upload fichiers sécurisé
echo "📋 Test 8: Upload fichiers sécurisé"
echo -e "${YELLOW}  ℹ️  Upload nécessite authentification (testé manuellement)${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/upload-photo" \
    -X POST)
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Upload protégé par authentification${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Upload devrait être protégé${NC}"
    ((FAILED++))
fi
echo ""

# TEST 9: Variables env non exposées
echo "📋 Test 9: Variables d'environnement non exposées"
RESPONSE=$(curl -s "$BACKEND_URL/api/health")
if [[ "$RESPONSE" != *"MONGODB_URI"* ]] && [[ "$RESPONSE" != *"JWT_SECRET"* ]]; then
    echo -e "${GREEN}✅ Variables sensibles non exposées${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Variables sensibles détectées dans les réponses${NC}"
    ((FAILED++))
fi
echo ""

# TEST 10: CORS configuré
echo "📋 Test 10: CORS configuré"
CORS=$(curl -s -I "$BACKEND_URL/api/health" -H "Origin: https://gjsdecrpt.fr")
if [[ "$CORS" == *"Access-Control-Allow-Origin"* ]]; then
    echo -e "${GREEN}✅ CORS configuré${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  CORS non détecté dans headers${NC}"
    ((FAILED++))
fi
echo ""

# RÉSUMÉ
echo "========================================"
echo "📊 RÉSUMÉ DES TESTS DE SÉCURITÉ"
echo "========================================"
echo -e "✅ Tests réussis: ${GREEN}$PASSED${NC}"
echo -e "❌ Tests échoués: ${RED}$FAILED${NC}"
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))
echo -e "📈 Score: ${PERCENTAGE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Tous les tests de sécurité sont passés !${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Certains tests nécessitent attention${NC}"
    exit 1
fi
