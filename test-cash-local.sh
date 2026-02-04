#!/bin/bash

# Test inscription et connexion avec paiement espèces (LOCAL)
API_URL="http://localhost:5001"
TEST_EMAIL="test.cash.local.$(date +%s)@example.com"
TEST_PASSWORD="TestCash2025!"

echo "🧪 Test LOCAL inscription avec paiement espèces"
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
    "campus": "678e0f0f8c8e9b001d4e3c7a",
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
HAS_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token"' | wc -l | tr -d ' ')
if [ "$HAS_TOKEN" -gt 0 ]; then
  echo "✅ Token reçu lors de l'inscription"
  TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.token' 2>/dev/null)
else
  echo "❌ PROBLÈME: Token manquant dans la réponse d'inscription"
  echo "   Ceci empêche la connexion automatique!"
fi
echo ""

# Attendre 1 seconde
echo "⏳ Attente 1 seconde..."
sleep 1

# Étape 2: Connexion avec les credentials
echo "🔑 ÉTAPE 2: Connexion avec email/password..."
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$TEST_EMAIL"'",
    "password": "'"$TEST_PASSWORD"'"
  }')

HTTP_STATUS_LOGIN=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY_LOGIN=$(echo "$LOGIN_RESPONSE" | grep -v "HTTP_STATUS")

echo "Status: $HTTP_STATUS_LOGIN"
echo "Réponse:"
echo "$RESPONSE_BODY_LOGIN" | jq . 2>/dev/null || echo "$RESPONSE_BODY_LOGIN"
echo ""

if [ "$HTTP_STATUS_LOGIN" == "200" ]; then
  echo "🎉 TEST RÉUSSI: Connexion fonctionne!"
  echo ""
  echo "📋 Résumé:"
  echo "   ✅ Inscription avec paiement espèces"
  if [ "$HAS_TOKEN" -gt 0 ]; then
    echo "   ✅ Token généré automatiquement"
  else
    echo "   ⚠️  Token manquant (connexion manuelle requise)"
  fi
  echo "   ✅ Connexion avec email/password fonctionne"
  
  # Test avec le token d'inscription si disponible
  if [ "$HAS_TOKEN" -gt 0 ] && [ ! -z "$TOKEN" ]; then
    echo ""
    echo "👤 ÉTAPE 3: Vérification profil avec token d'inscription..."
    PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
      -H "Authorization: Bearer $TOKEN")
    echo "$PROFILE_RESPONSE" | jq . 2>/dev/null || echo "$PROFILE_RESPONSE"
  fi
else
  echo "❌ TEST ÉCHOUÉ: Connexion impossible après inscription"
  echo ""
  echo "🔍 DIAGNOSTIC:"
  echo "   Le compte a été créé mais la connexion échoue (HTTP $HTTP_STATUS_LOGIN)"
  echo ""
  echo "   Réponse du serveur:"
  echo "   $RESPONSE_BODY_LOGIN"
  echo ""
  echo "   Causes possibles:"
  echo "   - Mot de passe pas correctement hashé lors de l'inscription"
  echo "   - Email pas en lowercase (Test.Cash vs test.cash)"
  echo "   - Compte créé mais pas sauvegardé en base"
  echo "   - Problème avec bcrypt.compare"
  exit 1
fi
