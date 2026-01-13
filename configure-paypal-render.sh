#!/bin/bash

echo "💳 CONFIGURATION PAYPAL SUR RENDER"
echo "==================================="
echo ""
echo "L'erreur 'Impossible d'obtenir le token PayPal' signifie que"
echo "les credentials PayPal ne sont PAS configurés sur Render."
echo ""
echo "📋 ÉTAPES À SUIVRE:"
echo ""
echo "1️⃣ Allez sur https://dashboard.render.com"
echo ""
echo "2️⃣ Sélectionnez le service 'gj-camp-website-1' (backend)"
echo ""
echo "3️⃣ Cliquez sur 'Environment'"
echo ""
echo "4️⃣ Ajoutez ces DEUX nouvelles variables:"
echo ""
echo "   ╔════════════════════════════════════════════════════════════╗"
echo "   ║ Variable 1: PAYPAL_CLIENT_ID                               ║"
echo "   ╠════════════════════════════════════════════════════════════╣"
echo "   ║ AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-        ║"
echo "   ║ cpwsC1a4u9RfSrQC9pqFX-FOFqWTb                              ║"
echo "   ╚════════════════════════════════════════════════════════════╝"
echo ""
echo "   ╔════════════════════════════════════════════════════════════╗"
echo "   ║ Variable 2: PAYPAL_CLIENT_SECRET                           ║"
echo "   ╠════════════════════════════════════════════════════════════╣"
echo "   ║ EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-       ║"
echo "   ║ ScRzoYTSLEfb_M_OK9qnKPWm3WjV                               ║"
echo "   ╚════════════════════════════════════════════════════════════╝"
echo ""
echo "5️⃣ Pour chaque variable:"
echo "   - Cliquez sur 'Add Environment Variable'"
echo "   - Collez le nom (PAYPAL_CLIENT_ID ou PAYPAL_CLIENT_SECRET)"
echo "   - Collez la valeur complète"
echo "   - Cliquez 'Save'"
echo ""
echo "6️⃣ Une fois les DEUX variables ajoutées:"
echo "   - Cliquez 'Save Changes' en haut"
echo "   - Render va redémarrer le backend (1-2 minutes)"
echo ""
echo "7️⃣ Attendez que le status passe à 'Live' (point vert)"
echo ""
echo "✅ VÉRIFICATION:"
echo ""
echo "Une fois le backend redémarré, testez le paiement:"
echo "   1. Allez sur votre site"
echo "   2. Inscription → Remplissez le formulaire"
echo "   3. PayPal → Payez avec le compte sandbox"
echo "   4. Le paiement devrait être validé ✅"
echo ""
echo "📝 RAPPEL - VOUS DEVEZ AUSSI:"
echo ""
echo "Configurer FRONTEND_URL avec les deux URLs:"
echo ""
echo "   Variable: FRONTEND_URL"
echo "   Valeur: https://www.gjsdecrpt.fr,https://gj-camp-website-3fuu.vercel.app"
echo ""
echo "⚠️  IMPORTANT:"
echo "Ces credentials sont pour le mode SANDBOX (test)."
echo "Pour la production, vous devrez créer une app PayPal en mode LIVE."
echo ""

# Créer un fichier avec les variables à ajouter
cat > render-paypal-env.txt << 'ENVEOF'
# Variables PayPal à ajouter sur Render
# Copiez-collez ces valeurs dans Dashboard → Environment

PAYPAL_CLIENT_ID=AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb

PAYPAL_CLIENT_SECRET=EBGL8OQ0k2EvtVS1CVXvuJ99Lv42EN61bSkOgh3nStxB4f0Yx7Z-ScRzoYTSLEfb_M_OK9qnKPWm3WjV

# Aussi nécessaire pour CORS:
FRONTEND_URL=https://www.gjsdecrpt.fr,https://gj-camp-website-3fuu.vercel.app
ENVEOF

echo "✅ Fichier 'render-paypal-env.txt' créé avec les valeurs à copier"
echo ""
