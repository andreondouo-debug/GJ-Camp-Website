#!/bin/bash

# Script de test complet de l'envoi d'emails en production
# Teste l'inscription avec envoi d'email de vérification

echo "🧪 TEST COMPLET DE L'ENVOI D'EMAILS EN PRODUCTION"
echo "=================================================="
echo ""

BACKEND_URL="https://gj-camp-website-1.onrender.com"

# Test 1: Vérifier que le backend est en ligne
echo "1️⃣ Test: Backend en ligne"
echo "-------------------------"
HEALTH=$(curl -s "$BACKEND_URL/api/health")
echo "Réponse: $HEALTH"
if echo "$HEALTH" | grep -q "fonctionnel"; then
    echo "✅ Backend opérationnel"
else
    echo "❌ Backend non disponible"
    exit 1
fi
echo ""

# Test 2: Tester la configuration email (API Brevo)
echo "2️⃣ Test: Configuration email API Brevo"
echo "--------------------------------------"
echo "⏰ Attente de 30 secondes pour le redéploiement..."
sleep 30
EMAIL_CONFIG=$(curl -s "$BACKEND_URL/api/test/email-config")
echo "Réponse: $EMAIL_CONFIG"
if echo "$EMAIL_CONFIG" | grep -q "success.*true"; then
    echo "✅ API Brevo configurée et fonctionnelle"
    MESSAGE_ID=$(echo "$EMAIL_CONFIG" | grep -o '"messageId":"[^"]*"' | cut -d'"' -f4)
    echo "   Message ID: $MESSAGE_ID"
else
    echo "⚠️ Configuration email: vérifier les logs"
    echo "   Vérifiez que BREVO_API_KEY est bien configurée sur Render"
fi
echo ""

# Test 3: Créer un compte test
echo "3️⃣ Test: Inscription avec envoi d'email"
echo "---------------------------------------"
RANDOM_NUM=$((RANDOM % 10000))
TEST_EMAIL="test.gjcamp.${RANDOM_NUM}@gmail.com"
TEST_PASSWORD="TestPass123!"

echo "📧 Email de test: $TEST_EMAIL"
echo "🔐 Mot de passe: $TEST_PASSWORD"
echo ""

SIGNUP_DATA=$(cat <<EOF
{
  "firstName": "Test",
  "lastName": "GJCamp",
  "email": "$TEST_EMAIL",
  "password": "$TEST_PASSWORD",
  "phone": "0612345678",
  "dateOfBirth": "2000-01-01",
  "refuge": "Agen"
}
EOF
)

echo "🚀 Envoi de la requête d'inscription..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "$SIGNUP_DATA")

echo "Réponse: $SIGNUP_RESPONSE"
echo ""

# Vérifier la réponse
if echo "$SIGNUP_RESPONSE" | grep -q "Inscription réussie"; then
    echo "✅ Inscription réussie!"
    
    # Vérifier si l'email a été envoyé
    if echo "$SIGNUP_RESPONSE" | grep -q '"emailSent":true'; then
        echo "✅ Email de vérification envoyé avec succès!"
        echo ""
        echo "📬 VÉRIFIEZ VOTRE BOÎTE EMAIL: $TEST_EMAIL"
        echo "   (ou vérifiez les logs Render pour voir le Message ID Brevo)"
    else
        echo "⚠️ Email non envoyé - vérifier les logs"
    fi
    
    # Extraire le token si disponible
    TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo ""
        echo "🔑 Token JWT généré (30 premiers caractères):"
        echo "   ${TOKEN:0:30}..."
    fi
else
    echo "❌ Échec de l'inscription"
    ERROR=$(echo "$SIGNUP_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo "   Erreur: $ERROR"
fi

echo ""
echo "=================================================="
echo "🏁 Test terminé"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "   1. Vérifiez votre email: $TEST_EMAIL"
echo "   2. Consultez les logs Render pour voir les détails d'envoi"
echo "   3. Si l'email n'arrive pas, vérifiez:"
echo "      - BREVO_API_KEY est configurée sur Render"
echo "      - EMAIL_FROM est configuré (gjcontactgj0@gmail.com)"
echo "      - Le domaine est vérifié dans Brevo"
