#!/bin/bash

echo "🔍 VÉRIFICATION DE LA CONFIGURATION VERCEL"
echo "=========================================="
echo ""

# 1. Tester le backend
echo "1️⃣ Test du backend Render..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gj-camp-website-1.onrender.com/api/health)
if [ "$BACKEND_STATUS" = "200" ]; then
  echo "✅ Backend actif (status: $BACKEND_STATUS)"
else
  echo "❌ Backend inactif (status: $BACKEND_STATUS)"
fi
echo ""

# 2. Tester le frontend
echo "2️⃣ Test du frontend Vercel..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.gjsdecrpt.fr)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ Frontend actif (status: $FRONTEND_STATUS)"
else
  echo "❌ Frontend inactif (status: $FRONTEND_STATUS)"
fi
echo ""

# 3. Vérifier quelle API_URL le frontend utilise
echo "3️⃣ Vérification de l'API_URL dans le frontend..."
FRONTEND_JS=$(curl -s https://www.gjsdecrpt.fr/static/js/main.*.js 2>/dev/null | head -c 50000)

if echo "$FRONTEND_JS" | grep -q "gj-camp-website-1.onrender.com"; then
  echo "✅ Frontend configuré avec le bon backend (gj-camp-website-1.onrender.com)"
elif echo "$FRONTEND_JS" | grep -q "localhost:5000"; then
  echo "❌ Frontend pointe vers localhost au lieu du backend en ligne!"
  echo "   → Il faut ajouter REACT_APP_API_URL sur Vercel"
else
  echo "⚠️  Impossible de détecter l'URL du backend dans le code JS"
fi
echo ""

# 4. Tester le logo
echo "4️⃣ Test du chargement du logo..."
LOGO_URL=$(curl -s https://gj-camp-website-1.onrender.com/api/settings | grep -o '"logoUrl":"[^"]*' | cut -d'"' -f4)
if [ -n "$LOGO_URL" ]; then
  echo "✅ URL du logo trouvée: $LOGO_URL"
  LOGO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$LOGO_URL")
  if [ "$LOGO_STATUS" = "200" ]; then
    echo "✅ Logo accessible (status: $LOGO_STATUS)"
  else
    echo "❌ Logo inaccessible (status: $LOGO_STATUS)"
  fi
else
  echo "❌ Aucune URL de logo trouvée"
fi
echo ""

# 5. Instructions
echo "📋 ACTIONS NÉCESSAIRES:"
echo "======================"
if echo "$FRONTEND_JS" | grep -q "localhost:5000"; then
  echo "🔴 URGENT: Configurer REACT_APP_API_URL sur Vercel"
  echo ""
  echo "1. Allez sur https://vercel.com/dashboard"
  echo "2. Sélectionnez votre projet"
  echo "3. Settings → Environment Variables"
  echo "4. Ajoutez:"
  echo "   Nom: REACT_APP_API_URL"
  echo "   Valeur: https://gj-camp-website-1.onrender.com"
  echo "5. Redéployez le frontend"
else
  echo "✅ Configuration semble correcte!"
fi
