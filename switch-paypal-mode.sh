#!/bin/bash

# 🔄 Script de Bascule PayPal : Sandbox ↔️ Production
# Usage: ./switch-paypal-mode.sh [sandbox|live]

MODE=$1

if [ -z "$MODE" ]; then
    echo "❌ Erreur: Mode non spécifié"
    echo ""
    echo "Usage:"
    echo "  ./switch-paypal-mode.sh sandbox  # Mode test (gratuit)"
    echo "  ./switch-paypal-mode.sh live     # Mode production (vrais paiements)"
    exit 1
fi

if [ "$MODE" != "sandbox" ] && [ "$MODE" != "live" ]; then
    echo "❌ Mode invalide: $MODE"
    echo "Modes disponibles: sandbox, live"
    exit 1
fi

echo "🔄 Bascule PayPal vers mode: $MODE"
echo "=================================="
echo ""

# Vérifier si c'est un passage en production
if [ "$MODE" = "live" ]; then
    echo "⚠️  ATTENTION: MODE PRODUCTION"
    echo "=================================="
    echo ""
    echo "🔴 Vous allez passer en mode PRODUCTION :"
    echo "   • Les paiements seront RÉELS"
    echo "   • PayPal prélèvera des FRAIS (~3.4% + 0.35€)"
    echo "   • Vous devrez REMBOURSER les tests"
    echo ""
    echo "📋 Avez-vous vos clés de PRODUCTION ?"
    echo "   Si NON, obtenez-les sur: https://www.paypal.com/businessprofile/mytools"
    echo ""
    read -p "⚠️  Voulez-vous vraiment continuer ? (oui/non): " confirm
    
    if [ "$confirm" != "oui" ]; then
        echo "❌ Annulation"
        exit 0
    fi
    
    echo ""
    echo "📝 Entrez vos clés PayPal PRODUCTION:"
    echo ""
    read -p "Client ID: " PROD_CLIENT_ID
    read -p "Client Secret: " PROD_CLIENT_SECRET
    
    if [ -z "$PROD_CLIENT_ID" ] || [ -z "$PROD_CLIENT_SECRET" ]; then
        echo "❌ Erreur: Clés non fournies"
        exit 1
    fi
    
    CLIENT_ID=$PROD_CLIENT_ID
    CLIENT_SECRET=$PROD_CLIENT_SECRET
else
    # Mode sandbox - utiliser les clés par défaut
    CLIENT_ID="AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb"
    CLIENT_SECRET="EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV"
fi

echo ""
echo "🔧 Configuration du Backend..."

# Backup de l'ancien .env
if [ -f backend/.env ]; then
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup créé: backend/.env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Mettre à jour ou ajouter PAYPAL_MODE
if grep -q "^PAYPAL_MODE=" backend/.env 2>/dev/null; then
    # Remplacer la ligne existante (macOS compatible)
    sed -i '' "s|^PAYPAL_MODE=.*|PAYPAL_MODE=$MODE|" backend/.env
else
    # Ajouter la ligne
    echo "" >> backend/.env
    echo "# PayPal Mode" >> backend/.env
    echo "PAYPAL_MODE=$MODE" >> backend/.env
fi

# Mettre à jour les clés PayPal
sed -i '' "s|^PAYPAL_CLIENT_ID=.*|PAYPAL_CLIENT_ID=$CLIENT_ID|" backend/.env
sed -i '' "s|^PAYPAL_CLIENT_SECRET=.*|PAYPAL_CLIENT_SECRET=$CLIENT_SECRET|" backend/.env

echo "✅ Backend configuré"

echo ""
echo "🔧 Configuration du Frontend..."

# Backup de l'ancien .env
if [ -f frontend/.env ]; then
    cp frontend/.env frontend/.env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup créé: frontend/.env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Mettre à jour le client ID
sed -i '' "s|^REACT_APP_PAYPAL_CLIENT_ID=.*|REACT_APP_PAYPAL_CLIENT_ID=$CLIENT_ID|" frontend/.env

echo "✅ Frontend configuré"

echo ""
echo "📋 Configuration actuelle:"
echo "--------------------------------"
echo "Mode: $MODE"
if [ "$MODE" = "live" ]; then
    echo "Client ID: ${CLIENT_ID:0:20}..."
else
    echo "Client ID: ${CLIENT_ID:0:20}... (sandbox)"
fi

echo ""
echo "✅ Bascule terminée !"
echo ""

if [ "$MODE" = "live" ]; then
    echo "🔴 MODE PRODUCTION ACTIVÉ"
    echo "=================================="
    echo ""
    echo "⚠️  RAPPELS IMPORTANTS:"
    echo "   1. Tous les paiements sont RÉELS"
    echo "   2. Testez avec un MONTANT MINIMUM (1€)"
    echo "   3. Remboursez IMMÉDIATEMENT après le test"
    echo "   4. Les frais PayPal ne sont PAS remboursés"
    echo ""
    echo "💡 Pour tester:"
    echo "   1. Modifiez temporairement le montant minimum à 1€"
    echo "   2. Redémarrez les serveurs"
    echo "   3. Testez UNE SEULE FOIS"
    echo "   4. Remboursez sur: https://www.paypal.com/activity"
    echo "   5. Revenez en sandbox: ./switch-paypal-mode.sh sandbox"
    echo ""
else
    echo "✅ MODE SANDBOX ACTIVÉ"
    echo "=================================="
    echo ""
    echo "💚 Mode test gratuit :"
    echo "   • Testez autant que vous voulez"
    echo "   • Aucun frais, aucun risque"
    echo "   • Utilisez les cartes de test"
    echo ""
    echo "💳 Cartes de test disponibles:"
    echo "   Visa:       4032039847809776"
    echo "   Mastercard: 5425233430109903"
    echo "   Amex:       378282246310005"
    echo ""
fi

echo "🔄 Prochaines étapes:"
echo "   1. Redémarrer le backend: cd backend && npm run dev"
echo "   2. Redémarrer le frontend: cd frontend && npm start"
echo "   3. Tester les paiements"
echo ""

# Demander si on doit redémarrer les serveurs
read -p "🚀 Voulez-vous redémarrer les serveurs maintenant ? (o/n): " restart

if [[ "$restart" =~ ^[Oo]$ ]]; then
    echo ""
    echo "🔄 Redémarrage des serveurs..."
    
    # Tuer les processus existants sur les ports
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    
    sleep 2
    
    # Démarrer le backend dans un nouveau terminal
    osascript -e 'tell application "Terminal" to do script "cd \"'"$PWD"'/backend\" && echo \"🟢 Backend en mode: '"$MODE"'\" && npm run dev"'
    
    sleep 2
    
    # Démarrer le frontend dans un nouveau terminal
    osascript -e 'tell application "Terminal" to do script "cd \"'"$PWD"'/frontend\" && echo \"🔵 Frontend en mode: '"$MODE"'\" && npm start"'
    
    echo "✅ Serveurs redémarrés en mode $MODE"
else
    echo "ℹ️  Redémarrez manuellement quand vous serez prêt"
fi

echo ""
echo "📚 Documentation: TEST_PAIEMENT_PRODUCTION.md"
echo ""
