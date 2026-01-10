#!/bin/bash

# Générer un email unique
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-email-$TIMESTAMP@gmail.com"

echo "🔍 TEST ENVOI EMAIL EN PRODUCTION"
echo "=================================="
echo ""
echo "📧 Email de test: $TEST_EMAIL"
echo ""

# Créer le fichier JSON temporaire
cat > /tmp/signup-test.json <<EOF
{
  "firstName": "Test",
  "lastName": "Email",
  "email": "$TEST_EMAIL",
  "password": "Test1234!",
  "churchWebsite": "https://test.com"
}
EOF

# Envoyer la requête
echo "📨 Envoi de la requête d'inscription..."
RESPONSE=$(curl -s -X POST \
  "https://gj-camp-website-1.onrender.com/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d @/tmp/signup-test.json)

echo ""
echo "📬 Réponse du serveur:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Nettoyer
rm -f /tmp/signup-test.json

# Vérifier le succès
if echo "$RESPONSE" | grep -q "Inscription réussie"; then
  echo "✅ L'inscription a réussi!"
  echo ""
  echo "🔍 MAINTENANT, ALLEZ VÉRIFIER LES LOGS SUR RENDER:"
  echo ""
  echo "1. Connectez-vous sur https://dashboard.render.com"
  echo "2. Sélectionnez votre service backend"
  echo "3. Cliquez sur 'Logs'"
  echo "4. Cherchez ces messages:"
  echo "   - '📧 Configuration email détectée'"
  echo "   - '✅ Utilisation de Gmail pour l'envoi d'emails'"
  echo "   - '📨 Tentative d'envoi d'email de vérification'"
  echo "   - '✅ Email envoyé avec succès'"
  echo ""
  echo "Si vous voyez '❌ Erreur lors de l'envoi de l'email',"
  echo "alors le problème vient de la configuration Gmail sur Render."
else
  echo "❌ L'inscription a échoué"
fi
