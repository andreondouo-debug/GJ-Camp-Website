#!/bin/bash

# Test inscription et connexion avec paiement espèces
API_URL="https://gj-camp-backend.onrender.com"
TEST_EMAIL="test.cash.$(date +%s)@example.com"
TEST_PASSWORD="TestCash2025!"

echo "🧪 Test inscription avec paiement espèces"
echo "📧 Email test: $TEST_EMAIL"
echo "🔐 Mot de passe: $TEST_PASSWORD"
echo "🌐 API: $API_URL"
echo ""

# Étape 1: Inscription avec paiement espèces
echo "📝 ÉTAPE 1: Inscription avec paiement espèces..."
REGISTRATION_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/registrations/camp-with-account" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Cash",
    "email": "'"$TEST_EMAIL"'",
    "password": "'"$TEST_PASSWORD"'",
    "confirmPassword": "'"$TEST_PASSWORD"'",
    "sex": "M",
    "dateOfBirth": "1995-01-01",
    "address": "123 Test Street",
    "city": "Test City",
    "zipCode": "75000",
    "phone": "+33612345678",
    "campus": "60d5f484b54764000015e7a1",
    "refuge": "Jeunes",
    "paymentMethod": "cash",
    "amountPaid": 50,
    "consent": {
      "privacyPolicy": true,
      "photoRelease": true,
      "codeOfConduct": true
    }
  }')

HTTP_STATUS=$(echo "$REGISTRATION_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$REGISTRATION_RESPONSE" | grep -v "HTTP_STATUS")

echo "Status: $HTTP_STATUS"
echo "Réponse:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

# Vérifier si le token est dans la réponse
HAS_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token"' | wc -l)
if [ "$HAS_TOKEN" -gt 0 ]; then
  echo "✅ Token reçu lors de l'inscription"
else
  echo "❌ PROBLÈME: Token manquant dans la réponse d'inscription"
fi
echo ""

# Attendre 2 secondes pour que la base de données soit à jour
echo "⏳ Attente 2 secondes..."
sleep 2

# Étape 2: Connexion avec les credentials
echo "🔑 ÉTAPE 2: Connexion avec email/password..."
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$TEST_EMAIL"'",
    "password": "'"$TEST_PASSWORD"'"
  }')

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | grep -v "HTTP_STATUS")

echo "Status: $HTTP_STATUS"
echo "Réponse:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" == "200" ]; then
  echo "🎉 TEST RÉUSSI: Connexion fonctionne!"
  echo ""
  echo "📋 Résumé:"
  echo "   ✅ Inscription avec paiement espèces"
  echo "   ✅ Connexion avec email/password"
else
  echo "❌ TEST ÉCHOUÉ: Connexion impossible après inscription"
  echo ""
  echo "🔍 DIAGNOSTIC:"
  echo "   Le compte a été créé mais la connexion échoue (HTTP $HTTP_STATUS)"
  echo "   Causes possibles:"
  echo "   - Mot de passe pas correctement hashé"
  echo "   - Email pas en lowercase"
  echo "   - Compte créé mais pas sauvegardé en base"
  echo "   - Problème avec bcrypt.compare"
  exit 1
fi
