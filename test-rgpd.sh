#!/bin/bash

# Script de tests RGPD - GJ Camp Website
# Date: 12 Janvier 2026

BACKEND_URL="https://gj-camp-website-1.onrender.com"
FRONTEND_URL="https://www.gjsdecrpt.fr"

echo "🔐 TESTS RGPD - GJ CAMP WEBSITE"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
MANUAL=0

# TEST 1: Export données utilisateur
echo "📋 Test 1: Export données utilisateur"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/my-data")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Endpoint export données existe (nécessite authentification)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Endpoint export données: $RESPONSE${NC}"
    ((FAILED++))
fi
echo ""


# TEST 2: Suppression/anonymisation compte
echo "📋 Test 2: Suppression compte"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/delete-account")
if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✅ Endpoint suppression compte existe (protégé)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Endpoint suppression compte: $RESPONSE${NC}"
    ((FAILED++))
fi
echo ""

# TEST 3: Politique de confidentialité
echo "📋 Test 3: Politique de confidentialité accessible"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Site accessible${NC}"
    echo -e "${YELLOW}  ℹ️  Vérification manuelle: lien politique confidentialité dans footer${NC}"
    ((PASSED++))
    ((MANUAL++))
else
    echo -e "${RED}❌ Site non accessible${NC}"
    ((FAILED++))
fi
echo ""

# TEST 4: Bannière cookies
echo "📋 Test 4: Bannière cookies"
HTML=$(curl -s "$FRONTEND_URL")
if [[ "$HTML" == *"cookie"* ]] || [[ "$HTML" == *"consentement"* ]]; then
    echo -e "${GREEN}✅ Mention cookies détectée dans le HTML${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Bannière cookies à vérifier manuellement${NC}"
    ((MANUAL++))
fi
echo ""

# TEST 5: Consentements dans le modèle User
echo "📋 Test 5: Système de consentements"
echo -e "${YELLOW}  ℹ️  Vérification du modèle User (backend/src/models/User.js)${NC}"
if [ -f "backend/src/models/User.js" ]; then
    if grep -q "consent" "backend/src/models/User.js"; then
        echo -e "${GREEN}✅ Champs consentement présents dans le modèle User${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ Champs consentement manquants${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ Fichier User.js non trouvé${NC}"
    ((FAILED++))
fi
echo ""


# TEST 6: Notifications configurables
echo "📋 Test 6: Paramètres notifications"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/notification-settings")
if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✅ Endpoint paramètres notifications existe (protégé)${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Endpoint notifications: $RESPONSE${NC}"
    ((FAILED++))
fi
echo ""

# TEST 7: Logs de consentement
echo "📋 Test 7: Logs de consentement"
if [ -f "backend/src/models/User.js" ]; then
    if grep -q "consentDate" "backend/src/models/User.js" || grep -q "consentTimestamp" "backend/src/models/User.js"; then
        echo -e "${GREEN}✅ Tracking dates de consentement implémenté${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  Dates de consentement à vérifier${NC}"
        ((MANUAL++))
    fi
else
    echo -e "${RED}❌ Impossible de vérifier les logs${NC}"
    ((FAILED++))
fi
echo ""

# Vérifications manuelles nécessaires
echo "========================================"
echo "🔍 VÉRIFICATIONS MANUELLES REQUISES"
echo "========================================"
echo ""
echo -e "${YELLOW}Les points suivants nécessitent une vérification manuelle :${NC}"
echo ""
echo "1. 🔹 Bannière cookies visible au premier chargement"
echo "   → Tester sur: $FRONTEND_URL"
echo ""
echo "2. 🔹 Lien 'Politique de confidentialité' dans le footer"
echo "   → Vérifier navigation footer"
echo ""
echo "3. 🔹 Bouton 'Retrait consentement marketing' dans les paramètres"
echo "   → Dashboard utilisateur → Paramètres"
echo ""
echo "4. 🔹 Export données fonctionne après connexion"
echo "   → Dashboard → Télécharger mes données"
echo ""
echo "5. 🔹 Suppression compte avec confirmation"
echo "   → Dashboard → Paramètres → Supprimer mon compte"
echo ""
echo "6. 🔹 Consentements obligatoires à l'inscription"
echo "   → Formulaire d'inscription"
echo ""

# RÉSUMÉ
echo "========================================"
echo "📊 RÉSUMÉ DES TESTS RGPD"
echo "========================================"
echo -e "✅ Tests automatiques réussis: ${GREEN}$PASSED${NC}"
echo -e "❌ Tests échoués: ${RED}$FAILED${NC}"
echo -e "🔍 Vérifications manuelles: ${YELLOW}$MANUAL${NC}"
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL))
    echo -e "📈 Score automatique: ${PERCENTAGE}%"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Tests automatiques RGPD passés !${NC}"
    echo -e "${YELLOW}⚠️  Compléter avec les vérifications manuelles${NC}"
    exit 0
else
    echo -e "${RED}❌ Certains tests RGPD ont échoué${NC}"
    exit 1
fi
