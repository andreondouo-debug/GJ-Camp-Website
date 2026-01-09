#!/bin/bash

echo "🔍 DIAGNOSTIC CONNEXION GJ-CAMP"
echo "================================"
echo ""

# Test 1: Backend Health
echo "1️⃣ Test Backend Render..."
BACKEND_HEALTH=$(curl -s "https://gj-camp-website-1.onrender.com/api/health")
if [[ $BACKEND_HEALTH == *"Backend fonctionnel"* ]]; then
  echo "   ✅ Backend opérationnel"
else
  echo "   ❌ Backend ne répond pas"
fi
echo ""

# Test 2: Frontend accessible
echo "2️⃣ Test Frontend Vercel..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://gj-camp-website-3fuu.vercel.app")
if [[ $FRONTEND_STATUS == "200" ]]; then
  echo "   ✅ Frontend accessible (HTTP $FRONTEND_STATUS)"
else
  echo "   ❌ Frontend erreur (HTTP $FRONTEND_STATUS)"
fi
echo ""

# Test 3: Vérifier URL API dans le frontend
echo "3️⃣ Vérification configuration frontend..."
FRONTEND_HTML=$(curl -s "https://gj-camp-website-3fuu.vercel.app")
if [[ $FRONTEND_HTML == *"gj-camp-website-1.onrender.com"* ]]; then
  echo "   ✅ Frontend configuré avec URL Render"
elif [[ $FRONTEND_HTML == *"localhost:5000"* ]]; then
  echo "   ❌ Frontend utilise encore localhost:5000"
  echo "   ⚠️  SOLUTION: Redéployer le frontend sur Vercel"
else
  echo "   ⚠️  Impossible de déterminer l'URL API"
fi
echo ""

# Test 4: CORS
echo "4️⃣ Test CORS..."
CORS_HEADERS=$(curl -s -I -X OPTIONS "https://gj-camp-website-1.onrender.com/api/auth/login" \
  -H "Origin: https://gj-camp-website-3fuu.vercel.app" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control-allow-origin")
  
if [[ $CORS_HEADERS == *"gj-camp-website-3fuu.vercel.app"* ]]; then
  echo "   ✅ CORS configuré correctement"
else
  echo "   ❌ CORS non configuré"
  echo "   ⚠️  SOLUTION: Vérifier FRONTEND_URL sur Render"
fi
echo ""

# Test 5: Test connexion API
echo "5️⃣ Test connexion API (avec compte test)..."
LOGIN_RESPONSE=$(curl -s -X POST "https://gj-camp-website-1.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"andreondouo@gmail.com","password":"wrongpassword"}')
  
if [[ $LOGIN_RESPONSE == *"Mot de passe incorrect"* ]]; then
  echo "   ✅ Endpoint login fonctionne (erreur attendue)"
elif [[ $LOGIN_RESPONSE == *"token"* ]]; then
  echo "   ✅ Endpoint login fonctionne (connexion réussie)"
else
  echo "   ❌ Endpoint login ne répond pas correctement"
  echo "   Réponse: $LOGIN_RESPONSE"
fi
echo ""

echo "================================"
echo "📋 ACTIONS À FAIRE:"
echo ""

# Vérifier si le redéploiement est nécessaire
if [[ $FRONTEND_HTML == *"localhost:5000"* ]] || [[ ! $FRONTEND_HTML == *"gj-camp-website-1.onrender.com"* ]]; then
  echo "🔴 CRITIQUE:"
  echo "   1. Aller sur https://vercel.com/dashboard"
  echo "   2. Projet 'gj-camp-website'"
  echo "   3. Settings → Environment Variables"
  echo "   4. Ajouter: REACT_APP_API_URL = https://gj-camp-website-1.onrender.com"
  echo "   5. Deployments → dernier déploiement → ⋮ → Redeploy"
  echo ""
fi

if [[ ! $CORS_HEADERS == *"gj-camp-website-3fuu.vercel.app"* ]]; then
  echo "🟡 IMPORTANT:"
  echo "   1. Aller sur https://dashboard.render.com"
  echo "   2. Service 'gj-camp-website-1'"
  echo "   3. Environment → FRONTEND_URL"
  echo "   4. Valeur: https://gj-camp-website-3fuu.vercel.app,http://localhost:3000"
  echo "   5. Save Changes"
  echo ""
fi

echo "✅ Une fois fait, attendre 3 minutes et réessayer de se connecter"
echo ""
