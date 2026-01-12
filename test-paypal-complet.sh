#!/bin/bash

# Script de test complet PayPal - Diagnostic chaîne de paiement
# Date: 12 Janvier 2026

echo "🔍 DIAGNOSTIC PAYPAL - CHAÎNE DE PAIEMENT COMPLÈTE"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_LOCAL="http://localhost:5000"
BACKEND_PROD="https://gj-camp-website-1.onrender.com"

# Test 1: Variables d'environnement backend
echo -e "${BLUE}📋 Test 1: Variables Backend (.env)${NC}"
cd "$(dirname "$0")/backend"

if [ -f ".env" ]; then
    if grep -q "PAYPAL_CLIENT_ID=" .env && grep -q "PAYPAL_CLIENT_SECRET=" .env; then
        CLIENT_ID=$(grep "PAYPAL_CLIENT_ID=" .env | cut -d'=' -f2)
        CLIENT_SECRET=$(grep "PAYPAL_CLIENT_SECRET=" .env | cut -d'=' -f2)
        
        if [ ! -z "$CLIENT_ID" ] && [ ! -z "$CLIENT_SECRET" ]; then
            echo -e "${GREEN}✅ PAYPAL_CLIENT_ID: ${CLIENT_ID:0:20}...${NC}"
            echo -e "${GREEN}✅ PAYPAL_CLIENT_SECRET: ${CLIENT_SECRET:0:20}...${NC}"
        else
            echo -e "${RED}❌ Credentials vides${NC}"
        fi
    else
        echo -e "${RED}❌ Variables PAYPAL manquantes${NC}"
    fi
else
    echo -e "${RED}❌ Fichier .env manquant${NC}"
fi
echo ""

# Test 2: Variables frontend
echo -e "${BLUE}📋 Test 2: Variables Frontend (.env)${NC}"
cd ../frontend

if [ -f ".env" ]; then
    if grep -q "REACT_APP_PAYPAL_CLIENT_ID=" .env; then
        FRONTEND_CLIENT_ID=$(grep "REACT_APP_PAYPAL_CLIENT_ID=" .env | cut -d'=' -f2)
        echo -e "${GREEN}✅ REACT_APP_PAYPAL_CLIENT_ID: ${FRONTEND_CLIENT_ID:0:20}...${NC}"
    else
        echo -e "${RED}❌ REACT_APP_PAYPAL_CLIENT_ID manquant${NC}"
    fi
else
    echo -e "${RED}❌ Fichier .env frontend manquant${NC}"
fi
echo ""

# Test 3: Vérifier PayPal API (Token)
echo -e "${BLUE}📋 Test 3: Connexion PayPal API${NC}"
cd ../backend

if [ ! -z "$CLIENT_ID" ] && [ ! -z "$CLIENT_SECRET" ]; then
    AUTH=$(echo -n "$CLIENT_ID:$CLIENT_SECRET" | base64)
    
    echo "  🔄 Test avec Sandbox API..."
    TOKEN_RESPONSE=$(curl -s -X POST "https://api-m.sandbox.paypal.com/v1/oauth2/token" \
        -H "Authorization: Basic $AUTH" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=client_credentials" 2>&1)
    
    if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
        echo -e "${GREEN}✅ Connexion PayPal API réussie${NC}"
        TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        echo -e "  📝 Token obtenu: ${TOKEN:0:30}..."
    else
        echo -e "${RED}❌ Erreur connexion PayPal API${NC}"
        echo "  Réponse: $TOKEN_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Credentials manquants, test ignoré${NC}"
fi
echo ""

# Test 4: Structure code backend
echo -e "${BLUE}📋 Test 4: Code Backend (paypalService.js)${NC}"
if [ -f "src/services/paypalService.js" ]; then
    echo -e "${GREEN}✅ paypalService.js existe${NC}"
    
    if grep -q "verifyPayment" src/services/paypalService.js; then
        echo -e "${GREEN}✅ Méthode verifyPayment() présente${NC}"
    else
        echo -e "${RED}❌ Méthode verifyPayment() manquante${NC}"
    fi
    
    if grep -q "getAccessToken" src/services/paypalService.js; then
        echo -e "${GREEN}✅ Méthode getAccessToken() présente${NC}"
    else
        echo -e "${RED}❌ Méthode getAccessToken() manquante${NC}"
    fi
else
    echo -e "${RED}❌ paypalService.js manquant${NC}"
fi
echo ""

# Test 5: Controller registration
echo -e "${BLUE}📋 Test 5: Controller (registrationController.js)${NC}"
if [ -f "src/controllers/registrationController.js" ]; then
    echo -e "${GREEN}✅ registrationController.js existe${NC}"
    
    if grep -q "paypalService.verifyPayment" src/controllers/registrationController.js; then
        echo -e "${GREEN}✅ Appel verifyPayment() dans createRegistration${NC}"
    else
        echo -e "${RED}❌ Vérification PayPal manquante${NC}"
    fi
    
    if grep -q "paymentDetails" src/controllers/registrationController.js; then
        echo -e "${GREEN}✅ Gestion paymentDetails présente${NC}"
    else
        echo -e "${YELLOW}⚠️  paymentDetails non géré${NC}"
    fi
else
    echo -e "${RED}❌ registrationController.js manquant${NC}"
fi
echo ""

# Test 6: Composant PayPal frontend
echo -e "${BLUE}📋 Test 6: Composant Frontend (PayPalButton.js)${NC}"
cd ../frontend
if [ -f "src/components/PayPalButton.js" ]; then
    echo -e "${GREEN}✅ PayPalButton.js existe${NC}"
    
    if grep -q "createOrder" src/components/PayPalButton.js; then
        echo -e "${GREEN}✅ Méthode createOrder() présente${NC}"
    else
        echo -e "${RED}❌ createOrder() manquante${NC}"
    fi
    
    if grep -q "onApprove" src/components/PayPalButton.js; then
        echo -e "${GREEN}✅ Méthode onApprove() présente${NC}"
    else
        echo -e "${RED}❌ onApprove() manquante${NC}"
    fi
    
    if grep -q "capture" src/components/PayPalButton.js; then
        echo -e "${GREEN}✅ Capture du paiement présente${NC}"
    else
        echo -e "${RED}❌ Capture manquante${NC}"
    fi
else
    echo -e "${RED}❌ PayPalButton.js manquant${NC}"
fi
echo ""

# Test 7: Page d'inscription
echo -e "${BLUE}📋 Test 7: Page Inscription (CampRegistrationNewPage.js)${NC}"
if [ -f "src/pages/CampRegistrationNewPage.js" ]; then
    echo -e "${GREEN}✅ CampRegistrationNewPage.js existe${NC}"
    
    if grep -q "handlePaymentSuccess" src/pages/CampRegistrationNewPage.js; then
        echo -e "${GREEN}✅ Handler handlePaymentSuccess() présent${NC}"
    else
        echo -e "${RED}❌ handlePaymentSuccess() manquant${NC}"
    fi
    
    if grep -q "paymentDetails" src/pages/CampRegistrationNewPage.js; then
        echo -e "${GREEN}✅ Envoi paymentDetails au backend${NC}"
    else
        echo -e "${RED}❌ paymentDetails non envoyé${NC}"
    fi
else
    echo -e "${RED}❌ CampRegistrationNewPage.js manquant${NC}"
fi
echo ""

# Résumé
echo "=================================================="
echo -e "${BLUE}📊 DIAGNOSTIC COMPLET${NC}"
echo "=================================================="
echo ""
echo "🔧 ACTIONS À FAIRE:"
echo ""
echo "1. 🚀 Démarrer le backend:"
echo "   cd backend && npm run dev"
echo ""
echo "2. 🌐 Démarrer le frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3. 🧪 Tester un paiement:"
echo "   - Aller sur http://localhost:3000"
echo "   - S'inscrire au camp"
echo "   - Choisir montant (ex: 20€)"
echo "   - Cliquer sur bouton PayPal"
echo "   - Utiliser compte Sandbox: sb-buyer@personal.example.com"
echo "   - Mot de passe: voir PayPal Dashboard"
echo ""
echo "4. 📋 Vérifier les logs:"
echo "   - Console frontend: F12 → Console"
echo "   - Terminal backend: logs de vérification"
echo ""
echo "🔍 DEBUGGING:"
echo "- Si bouton PayPal ne s'affiche pas → vérifier REACT_APP_PAYPAL_CLIENT_ID"
echo "- Si erreur après paiement → vérifier logs backend (verifyPayment)"
echo "- Si 'paiement non validé' → vérifier que orderID est envoyé"
echo ""
