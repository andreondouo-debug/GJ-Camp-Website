#!/bin/bash

echo "🔍 TEST ENVOI EMAIL EN PRODUCTION"
echo "=================================="
echo ""

# URL du backend en production
BACKEND_URL="https://gj-camp-website-1.onrender.com"

# Email de test
TEST_EMAIL="andreondouo@gmail.com"

echo "📧 Envoi d'une demande d'inscription à:"
echo "   $BACKEND_URL/api/auth/signup"
echo ""

# Créer un compte de test
RESPONSE=$(curl -s -X POST \
  "$BACKEND_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Test\",
    \"lastName\": \"Email\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test1234!\",
    \"churchWebsite\": \"https://test.com\"
  }")

echo "📬 Réponse du serveur:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Vérifier si l'inscription a réussi
if echo "$RESPONSE" | grep -q "Inscription réussie"; then
  echo "✅ Inscription réussie! Vérifiez votre boîte email: $TEST_EMAIL"
  echo ""
  echo "⚠️  Points à vérifier:"
  echo "   1. Boîte de réception"
  echo "   2. Dossier SPAM/Courrier indésirable"
  echo "   3. Onglet Promotions (Gmail)"
  echo ""
  echo "🔍 Pour voir les logs détaillés:"
  echo "   Allez sur Render.com → Votre service backend → Logs"
  echo "   Cherchez les messages commençant par 📧, ✅ ou ❌"
else
  echo "❌ Erreur lors de l'inscription"
  echo ""
  echo "Vérifiez les logs sur Render.com"
fi
