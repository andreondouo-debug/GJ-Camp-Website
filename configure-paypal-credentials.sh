#!/bin/bash

# 🔧 Script de configuration PayPal Sandbox/Live
# Ce script vous guide pour configurer vos credentials PayPal sur Vercel et Render

echo "🔧 Configuration PayPal Sandbox/Live"
echo "====================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Ce script va vous aider à configurer vos credentials PayPal${NC}"
echo ""

# 1. Vérifier les credentials Sandbox
echo -e "${YELLOW}1️⃣ Credentials Sandbox (déjà configurées)${NC}"
echo "----------------------------------------"
SANDBOX_CLIENT_ID="AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb"
echo "✅ Sandbox Client ID: ${SANDBOX_CLIENT_ID:0:20}..."
echo ""

# 2. Demander les credentials Live
echo -e "${YELLOW}2️⃣ Credentials Live (Production)${NC}"
echo "-----------------------------------"
echo "👉 Obtenez vos credentials Live sur : https://developer.paypal.com"
echo "   1. Connectez-vous"
echo "   2. Basculez en mode 'Live' (toggle en haut)"
echo "   3. My Apps & Credentials → Create App"
echo "   4. Copiez Client ID et Client Secret"
echo ""

read -p "Avez-vous vos credentials Live ? (o/n) : " HAS_LIVE

if [ "$HAS_LIVE" != "o" ]; then
    echo -e "${RED}❌ Vous devez d'abord obtenir vos credentials Live.${NC}"
    echo "   Rendez-vous sur https://developer.paypal.com"
    exit 1
fi

echo ""
read -p "Entrez votre Live Client ID : " LIVE_CLIENT_ID
read -sp "Entrez votre Live Client Secret : " LIVE_CLIENT_SECRET
echo ""

if [ -z "$LIVE_CLIENT_ID" ] || [ -z "$LIVE_CLIENT_SECRET" ]; then
    echo -e "${RED}❌ Erreur : Les credentials ne peuvent pas être vides${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Credentials Live enregistrées localement${NC}"
echo ""

# 3. Afficher les commandes pour Vercel
echo -e "${BLUE}3️⃣ Configuration VERCEL (Frontend)${NC}"
echo "------------------------------------"
echo "Copiez-collez ces commandes dans votre terminal :"
echo ""
echo -e "${YELLOW}# Supprimer l'ancienne variable (si elle existe)${NC}"
echo "vercel env rm REACT_APP_PAYPAL_CLIENT_ID production"
echo ""
echo -e "${YELLOW}# Ajouter les nouvelles variables${NC}"
echo "vercel env add REACT_APP_PAYPAL_SANDBOX_CLIENT_ID production"
echo "# Collez : $SANDBOX_CLIENT_ID"
echo ""
echo "vercel env add REACT_APP_PAYPAL_LIVE_CLIENT_ID production"
echo "# Collez : $LIVE_CLIENT_ID"
echo ""
echo "vercel deploy --prod"
echo ""
echo -e "${YELLOW}Ou via l'interface web :${NC}"
echo "👉 https://vercel.com/votre-projet/settings/environment-variables"
echo ""

# 4. Afficher les instructions pour Render
echo -e "${BLUE}4️⃣ Configuration RENDER (Backend)${NC}"
echo "-----------------------------------"
echo "Allez sur : https://dashboard.render.com/votre-service/env"
echo ""
echo -e "${YELLOW}Variables à ajouter :${NC}"
echo ""
echo "PAYPAL_SANDBOX_CLIENT_ID"
echo "Valeur : $SANDBOX_CLIENT_ID"
echo ""
echo "PAYPAL_SANDBOX_CLIENT_SECRET"
echo "Valeur : EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV"
echo ""
echo "PAYPAL_LIVE_CLIENT_ID"
echo "Valeur : $LIVE_CLIENT_ID"
echo ""
echo "PAYPAL_LIVE_CLIENT_SECRET"
echo "Valeur : $LIVE_CLIENT_SECRET"
echo ""
echo -e "${YELLOW}⚠️ Supprimez les anciennes variables :${NC}"
echo "- PAYPAL_CLIENT_ID"
echo "- PAYPAL_CLIENT_SECRET"
echo ""

# 5. Fichier de sauvegarde (LOCAL SEULEMENT - ne pas commiter)
echo -e "${BLUE}5️⃣ Sauvegarde locale${NC}"
echo "--------------------"
cat > .paypal-credentials.local <<EOF
# ⚠️ NE PAS COMMITER CE FICHIER ! (déjà dans .gitignore)
# Credentials PayPal pour référence locale uniquement

# Sandbox
PAYPAL_SANDBOX_CLIENT_ID=$SANDBOX_CLIENT_ID
PAYPAL_SANDBOX_CLIENT_SECRET=EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV

# Live
PAYPAL_LIVE_CLIENT_ID=$LIVE_CLIENT_ID
PAYPAL_LIVE_CLIENT_SECRET=$LIVE_CLIENT_SECRET
EOF

echo -e "${GREEN}✅ Credentials sauvegardées dans .paypal-credentials.local${NC}"
echo ""

# 6. Mettre à jour .gitignore
if ! grep -q ".paypal-credentials.local" .gitignore 2>/dev/null; then
    echo ".paypal-credentials.local" >> .gitignore
    echo -e "${GREEN}✅ .paypal-credentials.local ajouté à .gitignore${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuration terminée !${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo "1. Configurez les variables sur Vercel (voir ci-dessus)"
echo "2. Configurez les variables sur Render (voir ci-dessus)"
echo "3. Allez sur https://gjsdecrpt.fr/parametres"
echo "4. Onglet 💳 Paiements"
echo "5. Testez en mode Sandbox d'abord"
echo "6. Basculez en Live quand vous êtes prêt"
echo ""
echo -e "${YELLOW}⚠️ Rappel : En mode Live, les transactions sont RÉELLES !${NC}"
echo ""
