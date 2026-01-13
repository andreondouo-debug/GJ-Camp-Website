#!/bin/bash

echo "🔍 VÉRIFICATION CONFIGURATION PAYPAL SUR RENDER"
echo "==============================================="
echo ""
echo "⏳ Attente du déploiement automatique de Render..."
echo ""

MAX_ATTEMPTS=20
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "Tentative $ATTEMPT/$MAX_ATTEMPTS..."
  
  RESPONSE=$(curl -s https://gj-camp-website-1.onrender.com/api/test/paypal-config)
  
  if echo "$RESPONSE" | grep -q "clientIdConfigured"; then
    echo ""
    echo "✅ Endpoint de test disponible!"
    echo ""
    echo "$RESPONSE" | jq '.'
    
    # Vérifier si les credentials sont configurés
    if echo "$RESPONSE" | grep -q '"success":true'; then
      echo ""
      echo "✅✅✅ PAYPAL DÉJÀ CONFIGURÉ SUR RENDER! ✅✅✅"
      echo ""
      echo "Les credentials PayPal sont bien présents."
      echo "Le problème doit venir d'autre chose."
      echo ""
      exit 0
    else
      echo ""
      echo "❌❌❌ PAYPAL NON CONFIGURÉ SUR RENDER ❌❌❌"
      echo ""
      echo "Les variables d'environnement manquantes:"
      
      if echo "$RESPONSE" | grep -q '"clientIdConfigured":false'; then
        echo "  ❌ PAYPAL_CLIENT_ID"
      fi
      
      if echo "$RESPONSE" | grep -q '"clientSecretConfigured":false'; then
        echo "  ❌ PAYPAL_CLIENT_SECRET"
      fi
      
      echo ""
      echo "📋 AJOUTEZ CES VARIABLES SUR RENDER:"
      echo ""
      echo "1. https://dashboard.render.com"
      echo "2. Service: gj-camp-website-1"
      echo "3. Environment → Add Environment Variable"
      echo ""
      echo "PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb"
      echo ""
      echo "PAYPAL_CLIENT_SECRET=EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV"
      echo ""
      exit 1
    fi
  fi
  
  sleep 10
done

echo ""
echo "⚠️  Le déploiement prend plus de temps que prévu"
echo ""
echo "Allez sur https://dashboard.render.com/web/srv-ctv29l23esus73a9k5f0"
echo "pour vérifier le status du déploiement."
echo ""
echo "Une fois déployé, relancez: ./verifier-paypal-render.sh"
echo ""
