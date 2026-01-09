#!/bin/bash

echo "🔍 VÉRIFICATION CONFIGURATION VERCEL"
echo "===================================="
echo ""

# Vérifier le déploiement actuel
echo "1️⃣ Fichier JS actuel sur Vercel:"
CURRENT_JS=$(curl -s "https://gj-camp-website-3fuu.vercel.app" | grep -o "main\.[a-z0-9]*\.js" | head -1)
echo "   📦 $CURRENT_JS"
echo ""

# Vérifier quelle URL est dans le JS
echo "2️⃣ Recherche de l'URL API dans le fichier JS:"
JS_CONTENT=$(curl -s "https://gj-camp-website-3fuu.vercel.app/static/js/$CURRENT_JS" 2>&1)

if [[ $JS_CONTENT == *"gj-camp-website-1.onrender.com"* ]]; then
  echo "   ✅ Nouvelle URL détectée: gj-camp-website-1.onrender.com"
elif [[ $JS_CONTENT == *"gj-camp-backend.onrender.com"* ]]; then
  echo "   ❌ Ancienne URL détectée: gj-camp-backend.onrender.com"
  echo "   ⚠️  Le redéploiement n'a pas pris effet"
elif [[ $JS_CONTENT == *"localhost:5000"* ]]; then
  echo "   ❌ URL locale détectée: localhost:5000"
  echo "   ⚠️  La variable d'environnement n'est pas configurée"
else
  echo "   ⚠️  Impossible de déterminer l'URL"
fi
echo ""

echo "===================================="
echo "📋 ACTIONS:"
echo ""
echo "Si l'ancienne URL est toujours présente :"
echo ""
echo "1️⃣ Sur Vercel (https://vercel.com/dashboard) :"
echo "   → Vérifier Settings → Environment Variables"
echo "   → REACT_APP_API_URL doit être:"
echo "     https://gj-camp-website-1.onrender.com"
echo ""
echo "2️⃣ Forcer un nouveau build :"
echo "   → Deployments → Plus récent"
echo "   → ... (3 points) → Redeploy"
echo "   → ❌ DÉCOCHER 'Use existing Build Cache'"
echo "   → Cliquer 'Redeploy'"
echo ""
echo "3️⃣ Attendre 5 minutes que le build se termine"
echo ""
echo "4️⃣ Dans le navigateur :"
echo "   → Ouvrir https://gj-camp-website-3fuu.vercel.app"
echo "   → Cmd + Shift + R (hard refresh)"
echo "   → F12 → Console → Vérifier les URLs"
echo ""
