#!/bin/bash

# Test diagnostic PayPal en production
echo "🔍 TEST PAYPAL PRODUCTION - https://gj-camp-website-1.onrender.com"
echo "=================================================================="
echo ""

# Test avec un orderID fictif pour voir l'erreur
echo "📋 Test 1: Vérifier que les credentials sont chargés"
echo ""

# Créer un payload de test
TEST_PAYLOAD='{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@test.com",
  "sex": "M",
  "dateOfBirth": "2000-01-01",
  "address": "123 Test St",
  "phone": "0600000000",
  "refuge": "Lorient",
  "hasAllergies": false,
  "amountPaid": 20,
  "paymentDetails": {
    "orderID": "TEST_ORDER_ID_12345",
    "payerID": "TEST_PAYER",
    "payerEmail": "test@paypal.com",
    "status": "COMPLETED",
    "amountPaid": 20
  }
}'

echo "🔄 Envoi requête test au backend..."
echo ""

RESPONSE=$(curl -s -X POST "https://gj-camp-website-1.onrender.com/api/registration" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FAKE_TOKEN_FOR_TEST" \
  -d "$TEST_PAYLOAD" 2>&1)

echo "📝 Réponse backend:"
echo "$RESPONSE" | head -20
echo ""

# Analyser la réponse
if echo "$RESPONSE" | grep -q "PAYPAL_CLIENT_SECRET manquant"; then
    echo "❌ PROBLÈME: Credentials PayPal non configurés sur Render"
    echo ""
    echo "Solution:"
    echo "1. Aller sur https://dashboard.render.com"
    echo "2. Service gj-camp-website-1 → Environment"
    echo "3. Vérifier que PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET existent"
    echo "4. Si manquants, les ajouter et sauvegarder"
elif echo "$RESPONSE" | grep -q "Utilisateur non trouvé"; then
    echo "✅ Backend PayPal configuré (erreur normale: token invalide)"
    echo ""
    echo "Le backend fonctionne, problème ailleurs. Vérifions le frontend..."
elif echo "$RESPONSE" | grep -q "Paiement invalide"; then
    echo "✅ Backend vérifie les paiements PayPal (orderID test invalide = normal)"
    echo ""
    echo "Credentials chargés, vérification active ✓"
else
    echo "⚠️ Réponse inattendue, voir ci-dessus"
fi

echo ""
echo "=================================================================="
echo "📋 Test 2: Vérifier le frontend"
echo ""

# Tester si le SDK PayPal charge
echo "🔄 Test chargement SDK PayPal sur frontend..."
FRONTEND_HTML=$(curl -s "https://www.gjsdecrpt.fr" | head -100)

if echo "$FRONTEND_HTML" | grep -q "gjsdecrpt"; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend non accessible"
fi

echo ""
echo "🔍 Pour debug complet:"
echo ""
echo "1. Ouvre https://www.gjsdecrpt.fr"
echo "2. F12 → Console"
echo "3. Va sur inscription camp"
echo "4. Regarde les erreurs console:"
echo ""
echo "   - Si '❌ Client ID PayPal non configuré' → Vercel pas configuré"
echo "   - Si bouton PayPal ne s'affiche pas → Variable Vercel manquante"
echo "   - Si bouton s'affiche mais erreur après paiement → Backend Render"
echo ""
echo "5. Dans l'onglet Network:"
echo "   - Cherche la requête POST /api/registration"
echo "   - Regarde la réponse"
echo ""
