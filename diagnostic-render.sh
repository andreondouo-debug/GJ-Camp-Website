#!/bin/bash

echo "🔍 DIAGNOSTIC RENDER - Backend GJ Camp"
echo "========================================"
echo ""

API_URL="https://gj-camp-backend.onrender.com"

# Test 1: Ping général
echo "📡 Test 1: Ping serveur..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/")
if [ "$RESPONSE" == "404" ]; then
  HEADERS=$(curl -s -I "$API_URL/" 2>&1 | grep -i "x-render-routing")
  if echo "$HEADERS" | grep -q "no-server"; then
    echo "❌ SERVEUR DOWN - Render indique 'no-server'"
    echo "   Causes possibles:"
    echo "   • Crash au démarrage"
    echo "   • Variables d'environnement manquantes"
    echo "   • Erreur dans le code récent"
    echo "   • Service en veille (free plan)"
  else
    echo "⚠️  404 mais serveur actif - Problème de routing"
  fi
elif [ "$RESPONSE" == "000" ]; then
  echo "❌ SERVEUR INACCESSIBLE - Timeout ou DNS"
else
  echo "✅ Serveur répond (HTTP $RESPONSE)"
fi
echo ""

# Test 2: Vérifier si c'est un cold start
echo "⏰ Test 2: Attente réveil service (30s)..."
START_TIME=$(date +%s)
for i in {1..6}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$API_URL/" 2>/dev/null)
  if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "301" ] || [ "$RESPONSE" == "302" ]; then
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    echo "✅ Serveur réveillé après ${ELAPSED}s"
    break
  fi
  echo "   Tentative $i/6: HTTP $RESPONSE"
  sleep 5
done
echo ""

# Test 3: Headers détaillés
echo "📋 Test 3: Headers HTTP..."
curl -s -I "$API_URL/" 2>&1 | grep -E "^(HTTP|x-render|cf-ray|date|server):" | head -10
echo ""

# Test 4: Test endpoint santé
echo "🏥 Test 4: Endpoint /api/health..."
HEALTH_RESPONSE=$(curl -s -w "\nHTTP:%{http_code}" "$API_URL/api/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "^HTTP:" | cut -d':' -f2)
BODY=$(echo "$HEALTH_RESPONSE" | grep -v "^HTTP:")
echo "   Status: $HTTP_CODE"
echo "   Body: $BODY"
echo ""

# Test 5: Vérifier si CORS est configuré
echo "🌐 Test 5: Headers CORS..."
CORS=$(curl -s -I -H "Origin: https://gjsdecrpt.fr" "$API_URL/" 2>&1 | grep -i "access-control")
if [ -z "$CORS" ]; then
  echo "⚠️  Pas de headers CORS détectés"
else
  echo "$CORS"
fi
echo ""

# Test 6: Vérifier la route login (ne devrait pas être 404)
echo "🔑 Test 6: Route /api/auth/login existe..."
LOGIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}')
if [ "$LOGIN_TEST" == "404" ]; then
  echo "❌ Route login retourne 404 - Serveur pas démarré ou routes pas chargées"
elif [ "$LOGIN_TEST" == "400" ] || [ "$LOGIN_TEST" == "401" ]; then
  echo "✅ Route login existe (retourne $LOGIN_TEST comme attendu)"
else
  echo "⚠️  Route login retourne $LOGIN_TEST"
fi
echo ""

# Résumé
echo "📊 RÉSUMÉ"
echo "========="
if [ "$RESPONSE" == "404" ]; then
  echo "🔴 STATUT: Serveur DOWN"
  echo ""
  echo "🔧 ACTIONS RECOMMANDÉES:"
  echo "   1. Aller sur dashboard.render.com"
  echo "   2. Vérifier les logs du service 'gj-camp-backend'"
  echo "   3. Chercher erreurs au démarrage:"
  echo "      • MongoDB connection failed"
  echo "      • Missing environment variables"
  echo "      • Module not found"
  echo "      • Syntax error"
  echo "   4. Vérifier que toutes les variables d'env sont définies"
  echo "   5. Si service en veille: attendre 30-60s puis retester"
  echo "   6. Si erreur persistante: Redéployer manuellement"
else
  echo "🟢 STATUT: Serveur opérationnel"
fi
