#!/bin/bash

echo "🔧 CORRECTION DU DÉPLOIEMENT VERCEL"
echo "===================================="
echo ""

# 1. Vérifier que les variables d'environnement nécessaires sont présentes
echo "📋 Variables d'environnement requises sur Vercel:"
echo "   REACT_APP_API_URL = https://gj-camp-website-1.onrender.com"
echo "   REACT_APP_PAYPAL_CLIENT_ID = AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpwsC1a4u9RfSrQC9pqFX-FOFqWTb"
echo ""

# 2. Instructions pour Vercel
echo "🎯 ÉTAPES À SUIVRE:"
echo ""
echo "1️⃣ Allez sur https://vercel.com/dashboard"
echo "2️⃣ Sélectionnez votre projet (gj-camp-website ou gjsdecrpt)"
echo "3️⃣ Cliquez sur 'Settings' → 'Environment Variables'"
echo ""
echo "4️⃣ Vérifiez/Ajoutez ces variables:"
echo "   ┌─────────────────────────────────────────────────────────────┐"
echo "   │ REACT_APP_API_URL                                           │"
echo "   │ https://gj-camp-website-1.onrender.com                      │"
echo "   │ ✅ Production ✅ Preview ✅ Development                      │"
echo "   └─────────────────────────────────────────────────────────────┘"
echo ""
echo "   ┌─────────────────────────────────────────────────────────────┐"
echo "   │ REACT_APP_PAYPAL_CLIENT_ID                                  │"
echo "   │ AdT-LwZtwJCWWY-mQxdypz0Ael6KiDY4Puw2QOrgppkh7379iy-cpw...    │"
echo "   │ ✅ Production ✅ Preview ✅ Development                      │"
echo "   └─────────────────────────────────────────────────────────────┘"
echo ""
echo "5️⃣ Allez dans 'Deployments'"
echo "6️⃣ Trouvez le dernier déploiement réussi"
echo "7️⃣ Cliquez sur les 3 points '...' → 'Redeploy'"
echo "8️⃣ Cochez 'Use existing Build Cache' → 'Redeploy'"
echo ""
echo "⏳ Attendez 2-3 minutes que le déploiement se termine"
echo ""

# 3. Test après déploiement
echo "✅ APRÈS LE DÉPLOIEMENT, TESTEZ:"
echo "   1. Ouvrez https://www.gjsdecrpt.fr"
echo "   2. Appuyez sur F12 → onglet 'Console'"
echo "   3. Recherchez '🔗 API URL configurée:'"
echo "   4. Vérifiez que ça affiche: https://gj-camp-website-1.onrender.com"
echo "   5. Le carrousel devrait afficher les 2 images Cloudinary"
echo "   6. Le logo devrait s'afficher en haut à gauche"
echo "   7. La connexion devrait fonctionner"
echo ""

# 4. Diagnostic si ça ne marche toujours pas
echo "🔍 SI ÇA NE MARCHE TOUJOURS PAS:"
echo "   1. Videz le cache: Ctrl+Shift+Delete (Cmd+Shift+Delete sur Mac)"
echo "   2. Rechargez: Ctrl+F5 (Cmd+Shift+R sur Mac)"
echo "   3. Ouvrez la console (F12) et copiez-moi tous les messages en ROUGE"
echo ""

echo "✅ Script terminé!"
