#!/bin/bash

# Script de déploiement manuel pour GJ Camp Website
# Date: 18 janvier 2026

echo "🚀 Déploiement manuel de GJ Camp Website"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier qu'on est sur la branche main
echo -e "${BLUE}📌 Vérification de la branche...${NC}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo -e "${RED}❌ Erreur: Vous devez être sur la branche main${NC}"
    echo "   Branche actuelle: $BRANCH"
    exit 1
fi
echo -e "${GREEN}✓ Sur la branche main${NC}"
echo ""

# 2. Vérifier qu'il n'y a pas de modifications non commitées
echo -e "${BLUE}📌 Vérification des modifications...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Il y a des modifications non commitées${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Voulez-vous continuer quand même ? (o/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        echo -e "${RED}❌ Déploiement annulé${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Aucune modification non commitée${NC}"
fi
echo ""

# 3. Pull des dernières modifications
echo -e "${BLUE}📥 Récupération des dernières modifications...${NC}"
git pull origin main
echo -e "${GREEN}✓ Repository à jour${NC}"
echo ""

# 4. Afficher le dernier commit
echo -e "${BLUE}📝 Dernier commit:${NC}"
git log -1 --oneline --decorate
echo ""

# 5. Instructions pour Render
echo -e "${YELLOW}🔧 BACKEND - Render${NC}"
echo "   1. Ouvrir: https://dashboard.render.com"
echo "   2. Sélectionner le service: gj-camp-backend"
echo "   3. Cliquer sur 'Manual Deploy' → 'Deploy latest commit'"
echo "   4. Attendre ~3-5 minutes"
echo ""
read -p "Appuyez sur Entrée pour continuer vers Vercel..." -r
echo ""

# 6. Instructions pour Vercel
echo -e "${YELLOW}🌐 FRONTEND - Vercel${NC}"
echo "   1. Ouvrir: https://vercel.com/dashboard"
echo "   2. Sélectionner le projet GJ-Camp-Website"
echo "   3. Aller dans l'onglet 'Deployments'"
echo "   4. Cliquer sur les 3 points (...) du dernier déploiement"
echo "   5. Sélectionner 'Redeploy'"
echo "   6. Confirmer avec 'Redeploy'"
echo "   7. Attendre ~1-2 minutes"
echo ""

# 7. URLs de vérification
echo -e "${GREEN}✅ URLs de vérification après déploiement:${NC}"
echo "   Backend:  https://gj-camp-backend.onrender.com/api/health"
echo "   Frontend: https://gjsdecrpt.fr"
echo ""

# 8. Forcer un nouveau commit vide pour déclencher les webhooks
echo -e "${BLUE}🔄 Option: Forcer un redéploiement automatique${NC}"
read -p "Voulez-vous créer un commit vide pour forcer le redéploiement ? (o/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${BLUE}📝 Création d'un commit vide...${NC}"
    git commit --allow-empty -m "chore: trigger auto-deploy"
    echo -e "${BLUE}📤 Push vers origin/main...${NC}"
    git push origin main
    echo -e "${GREEN}✓ Commit vide pushé - Les déploiements automatiques devraient se déclencher${NC}"
    echo ""
    echo -e "${YELLOW}⏱️  Attendre 2-3 minutes puis vérifier:${NC}"
    echo "   - Render: https://dashboard.render.com"
    echo "   - Vercel: https://vercel.com/dashboard"
fi

echo ""
echo -e "${GREEN}🎉 Processus de déploiement terminé !${NC}"
