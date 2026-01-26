#!/bin/bash

# 💳 Script de Test des Paiements par Carte Bancaire
# Ce script démarre l'environnement de test pour les paiements PayPal

echo "💳 Configuration de l'environnement de test PayPal"
echo "=================================================="
echo ""

# Vérifier que MongoDB est démarré
echo "🔍 Vérification de MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB n'est pas démarré"
    echo "Démarrage de MongoDB..."
    brew services start mongodb-community 2>/dev/null || mongod --fork --logpath /tmp/mongodb.log
    sleep 2
fi
echo "✅ MongoDB actif"
echo ""

# Afficher la configuration PayPal
echo "📋 Configuration PayPal actuelle:"
echo "--------------------------------"
echo "Mode: SANDBOX (test)"
echo "Client ID: $(grep PAYPAL_CLIENT_ID backend/.env | cut -d'=' -f2 | cut -c1-20)..."
echo "Frontend URL: http://localhost:3000"
echo "Backend URL: http://localhost:5000"
echo ""

# Afficher les cartes de test
echo "💳 Cartes de Test Disponibles:"
echo "--------------------------------"
echo "Visa:       4032039847809776 | CVV: 123 | Exp: 12/2028"
echo "Mastercard: 5425233430109903 | CVV: 123 | Exp: 12/2028"
echo "Amex:       378282246310005  | CVV: 1234 | Exp: 12/2028"
echo ""

# Demander si l'utilisateur veut démarrer les serveurs
echo "🚀 Voulez-vous démarrer les serveurs ? (o/n)"
read -r response

if [[ "$response" =~ ^[Oo]$ ]]; then
    echo ""
    echo "📦 Démarrage des serveurs..."
    echo ""
    
    # Ouvrir un terminal pour le backend
    echo "🟢 Démarrage du backend (port 5000)..."
    osascript -e 'tell application "Terminal" to do script "cd \"'"$PWD"'/backend\" && npm run dev"'
    
    sleep 3
    
    # Ouvrir un terminal pour le frontend
    echo "🔵 Démarrage du frontend (port 3000)..."
    osascript -e 'tell application "Terminal" to do script "cd \"'"$PWD"'/frontend\" && npm start"'
    
    sleep 3
    
    echo ""
    echo "✅ Serveurs démarrés !"
    echo ""
    echo "🌐 Accédez à l'application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5000"
    echo ""
    echo "📖 Consultez TEST_PAIEMENT_CARTE.md pour les instructions détaillées"
    echo ""
    echo "🧪 Étapes de test:"
    echo "   1. Connectez-vous sur http://localhost:3000"
    echo "   2. Allez sur 'Inscription au Camp'"
    echo "   3. Remplissez le formulaire"
    echo "   4. Cliquez sur le bouton PayPal"
    echo "   5. Utilisez une carte de test (voir ci-dessus)"
    echo ""
else
    echo ""
    echo "ℹ️  Pour démarrer manuellement:"
    echo ""
    echo "Terminal 1 - Backend:"
    echo "  cd backend && npm run dev"
    echo ""
    echo "Terminal 2 - Frontend:"
    echo "  cd frontend && npm start"
    echo ""
fi

echo "📚 Documentation complète: TEST_PAIEMENT_CARTE.md"
echo ""
