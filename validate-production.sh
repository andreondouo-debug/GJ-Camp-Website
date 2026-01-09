#!/bin/bash

# 🚀 Script de validation production GJ Camp Website
# Vérifie que tout est prêt pour la mise en production

echo "🔍 VALIDATION PRODUCTION GJ CAMP WEBSITE"
echo "========================================"
echo ""

ERRORS=0
WARNINGS=0

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1️⃣ VÉRIFICATION VARIABLES D'ENVIRONNEMENT
echo "1️⃣  Vérification variables d'environnement..."

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env existe${NC}"
    
    # Vérifier les variables critiques
    if grep -q "MONGODB_URI=" backend/.env && ! grep -q "MONGODB_URI=mongodb://localhost" backend/.env; then
        echo -e "${GREEN}✅ MONGODB_URI configuré (production)${NC}"
    else
        echo -e "${RED}❌ MONGODB_URI non configuré ou en local${NC}"
        ERRORS=$((ERRORS+1))
    fi
    
    if grep -q "JWT_SECRET=" backend/.env && ! grep -q "JWT_SECRET=your-secret-key" backend/.env; then
        echo -e "${GREEN}✅ JWT_SECRET configuré${NC}"
    else
        echo -e "${RED}❌ JWT_SECRET non configuré${NC}"
        ERRORS=$((ERRORS+1))
    fi
    
    if grep -q "CLOUDINARY_CLOUD_NAME=" backend/.env; then
        echo -e "${GREEN}✅ Cloudinary configuré${NC}"
    else
        echo -e "${YELLOW}⚠️  Cloudinary non configuré (upload images impossible)${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
    
    if grep -q "PAYPAL_CLIENT_ID=" backend/.env; then
        echo -e "${GREEN}✅ PayPal configuré${NC}"
    else
        echo -e "${RED}❌ PayPal non configuré (paiements impossibles)${NC}"
        ERRORS=$((ERRORS+1))
    fi
    
    if grep -q "EMAIL_SERVICE=" backend/.env; then
        echo -e "${GREEN}✅ Email configuré${NC}"
    else
        echo -e "${YELLOW}⚠️  Email non configuré (notifications désactivées)${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "${RED}❌ backend/.env n'existe pas${NC}"
    ERRORS=$((ERRORS+1))
fi

if [ -f "frontend/.env.production" ]; then
    echo -e "${GREEN}✅ frontend/.env.production existe${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env.production n'existe pas${NC}"
    WARNINGS=$((WARNINGS+1))
fi

echo ""

# 2️⃣ VÉRIFICATION DÉPENDANCES
echo "2️⃣  Vérification des dépendances..."

if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ backend/node_modules installé${NC}"
else
    echo -e "${RED}❌ backend/node_modules manquant (npm install requis)${NC}"
    ERRORS=$((ERRORS+1))
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ frontend/node_modules installé${NC}"
else
    echo -e "${RED}❌ frontend/node_modules manquant (npm install requis)${NC}"
    ERRORS=$((ERRORS+1))
fi

echo ""

# 3️⃣ VÉRIFICATION FICHIERS CRITIQUES
echo "3️⃣  Vérification fichiers critiques..."

CRITICAL_FILES=(
    "backend/src/server.js"
    "backend/src/models/User.js"
    "backend/src/models/Registration.js"
    "backend/src/controllers/authController.js"
    "backend/src/controllers/registrationController.js"
    "backend/src/services/paypalService.js"
    "frontend/src/App.js"
    "frontend/src/pages/HomePage.js"
    "frontend/src/pages/CRPTPage.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file manquant${NC}"
        ERRORS=$((ERRORS+1))
    fi
done

echo ""

# 4️⃣ VÉRIFICATION SÉCURITÉ
echo "4️⃣  Vérification sécurité..."

# Vérifier qu'il n'y a pas de clés en dur dans le code
if grep -r "mongodb+srv://.*:.*@" backend/src/ 2>/dev/null | grep -v ".env" > /dev/null; then
    echo -e "${RED}❌ Connexion MongoDB en dur détectée dans le code${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ Pas de connexion MongoDB en dur${NC}"
fi

if grep -r "paypal.*secret" backend/src/ 2>/dev/null | grep -v ".env" | grep -v "process.env" > /dev/null; then
    echo -e "${RED}❌ Secrets PayPal en dur détectés${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ Pas de secrets PayPal en dur${NC}"
fi

# Vérifier que .env est dans .gitignore
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ .env dans .gitignore${NC}"
else
    echo -e "${RED}❌ .env pas dans .gitignore (risque de fuite)${NC}"
    ERRORS=$((ERRORS+1))
fi

echo ""

# 5️⃣ VÉRIFICATION BUILD
echo "5️⃣  Test de build frontend..."

cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build frontend réussi${NC}"
    rm -rf build
else
    echo -e "${RED}❌ Build frontend échoué${NC}"
    ERRORS=$((ERRORS+1))
fi
cd ..

echo ""

# 6️⃣ RÉSUMÉ
echo "========================================"
echo "📊 RÉSUMÉ"
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TOUT EST PRÊT POUR LA PRODUCTION !${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s) - Production possible mais recommandations à suivre${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) critique(s) - Production IMPOSSIBLE${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
    echo ""
    echo "Corrigez les erreurs avant de déployer en production."
    exit 1
fi
