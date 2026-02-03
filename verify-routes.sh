#!/bin/bash

# 🔍 Script de Vérification des Routes API
# Vérifie que toutes les routes utilisées dans le frontend existent dans le backend

echo "🔍 VÉRIFICATION DES ROUTES API FRONTEND ↔ BACKEND"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL=0
ERRORS=0

# Fonction de test
check_route() {
    local route=$1
    local files=$2
    
    TOTAL=$((TOTAL + 1))
    
    # Rechercher dans les routes backend
    if grep -rq "$route" backend/src/routes/ 2>/dev/null; then
        echo -e "${GREEN}✅ $route${NC}"
        echo "   Fichiers frontend: $files"
    else
        echo -e "${RED}❌ $route MANQUANTE${NC}"
        echo "   Utilisée dans: $files"
        ERRORS=$((ERRORS + 1))
    fi
    echo ""
}

echo "📋 Vérification des routes d'inscription..."
echo ""

check_route "POST /api/registrations/" "CampRegistrationNewPage.js"
check_route "POST /api/registrations/camp-with-account" "CampRegistrationPage.js"
check_route "POST /api/registrations/guest" "GuestRegistrationPage.js"
check_route "POST /api/registrations/cash" "CampRegistrationNewPage.js"
check_route "GET /api/registrations/mes-inscriptions" "UserDashboard.js, CampRegistrationNewPage.js, ProgrammePage.js"
check_route "GET /api/registrations/my-registration" "ActivityTrackingPage.js, ActivitiesPage.js"
check_route "GET /api/registrations/mes-invites" "UserDashboard.js"
check_route "GET /api/registrations/all" "RegistrationDashboard.js"
check_route "GET /api/registrations/cash/stats" "CashPaymentsManagement.js"
check_route "GET /api/registrations/cash/pending-count" "Header.js"
check_route "PUT /api/registrations/:id/additional-payment" "UserDashboard.js"
check_route "POST /api/registrations/:registrationId/cash-payment" "UserDashboard.js"
check_route "PATCH /api/registrations/:registrationId/cash-payment/:paymentId/validate" "CashPaymentsManagement.js"
check_route "PATCH /api/registrations/:registrationId/cash-payment/:paymentId/reject" "CashPaymentsManagement.js"
check_route "PATCH /api/registrations/:id/payment-status" "RegistrationDashboard.js"
check_route "DELETE /api/registrations/:id" "RegistrationDashboard.js"
check_route "POST /api/registrations/create-without-payment" "CreateRegistrationPage.js"

echo "=================================================="
echo ""
echo "📊 RÉSUMÉ"
echo "Total routes vérifiées: $TOTAL"
echo -e "${GREEN}Routes OK: $((TOTAL - ERRORS))${NC}"
echo -e "${RED}Routes manquantes: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Toutes les routes sont correctement configurées !${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS route(s) manquante(s). Vérifiez backend/src/routes/registrationRoutes.js${NC}"
    exit 1
fi
