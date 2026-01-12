#!/bin/bash

echo "🔍 DIAGNOSTIC COMPLET DE L'ENVOI D'EMAILS"
echo "=========================================="
echo ""

BACKEND_URL="https://gj-camp-website-1.onrender.com"

# Test 1: Vérifier les logs du dernier email envoyé
echo "1️⃣ Vérification du dernier test email-config"
echo "----------------------------------------------"
RESPONSE=$(curl -s "$BACKEND_URL/api/test/email-config")
echo "$RESPONSE" | python3 -m json.tool

SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[^,]*' | cut -d':' -f2)
if [ "$SUCCESS" = "true" ]; then
    MESSAGE_ID=$(echo "$RESPONSE" | grep -o '"messageId":"[^"]*"' | cut -d'"' -f4)
    EMAIL=$(echo "$RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
    
    echo ""
    echo "✅ Email envoyé avec succès!"
    echo "   📧 Destinataire: $EMAIL"
    echo "   🆔 Message ID: $MESSAGE_ID"
    echo ""
    echo "🔍 ANALYSE:"
    echo "   - L'API Brevo a accepté l'email (code 201)"
    echo "   - Un Message ID a été généré"
    echo "   - L'email est dans la file d'envoi de Brevo"
    echo ""
    echo "❓ POURQUOI L'EMAIL N'ARRIVE PAS?"
    echo ""
    echo "   Causes possibles:"
    echo "   1. 📨 Email dans les SPAMS - Vérifiez le dossier indésirables"
    echo "   2. 🚫 Expéditeur non vérifié dans Brevo"
    echo "   3. ⚠️ Email rejeté par le serveur de réception"
    echo "   4. ⏰ Délai de livraison (peut prendre 1-5 minutes)"
    echo ""
    echo "🔧 VÉRIFICATIONS À FAIRE:"
    echo ""
    echo "   A. Sur Brevo (https://app.brevo.com/):"
    echo "      → Campaigns → Statistics → Voir les logs d'envoi"
    echo "      → Vérifiez si l'email apparaît comme 'Delivered' ou 'Bounced'"
    echo ""
    echo "   B. Vérifier l'expéditeur:"
    echo "      → Settings → Senders"
    echo "      → Vérifiez que $EMAIL est dans la liste"
    echo "      → Status doit être 'Verified' (pas 'Pending')"
    echo ""
    echo "   C. Dans votre boîte email:"
    echo "      → Vérifiez SPAM/Indésirables/Courrier indésirable"
    echo "      → Recherchez l'expéditeur: 'GJ Camp' ou '$EMAIL'"
    echo "      → Recherchez le sujet contenant 'Test' ou 'Brevo'"
    echo ""
else
    echo ""
    echo "❌ Échec de l'envoi - voir détails ci-dessus"
fi

echo ""
echo "=========================================="
echo ""

# Test 2: Créer un compte test et suivre l'envoi
echo "2️⃣ Test d'inscription avec suivi détaillé"
echo "------------------------------------------"

RANDOM_NUM=$((RANDOM % 10000))
TEST_EMAIL="test.debug.${RANDOM_NUM}@gmail.com"

echo "📝 Création du compte test: $TEST_EMAIL"
echo ""

SIGNUP_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Debug",
    "lastName": "Test",
    "email": "'$TEST_EMAIL'",
    "password": "TestDebug123!",
    "phone": "0612345678",
    "dateOfBirth": "2000-01-01",
    "refuge": "Agen"
  }')

echo "Réponse complète:"
echo "$SIGNUP_RESPONSE" | python3 -m json.tool

EMAIL_SENT=$(echo "$SIGNUP_RESPONSE" | grep -o '"emailSent":[^,}]*' | cut -d':' -f2)

echo ""
if [ "$EMAIL_SENT" = "true" ]; then
    echo "✅ Backend dit: Email envoyé"
    echo ""
    echo "⚠️ MAIS l'email n'arrive pas dans votre boîte!"
    echo ""
    echo "🔍 DIAGNOSTIC:"
    echo "   Le backend envoie bien à l'API Brevo (pas d'erreur)"
    echo "   Brevo accepte l'email (retourne success)"
    echo "   → Le problème est au niveau de Brevo ou de la réception"
    echo ""
    echo "🚨 ACTION IMMÉDIATE REQUISE:"
    echo ""
    echo "   1. Allez sur: https://app.brevo.com/campaign/statistics"
    echo "   2. Cherchez les emails récents dans les logs"
    echo "   3. Vérifiez leur statut:"
    echo "      - 'Sent' = envoyé par Brevo"
    echo "      - 'Delivered' = reçu par le serveur email"
    echo "      - 'Bounced' = rejeté (problème!)"
    echo "      - 'Blocked' = bloqué par Brevo (expéditeur non vérifié!)"
    echo ""
    echo "   Si status = 'Blocked':"
    echo "   → L'expéditeur '$EMAIL' n'est PAS vérifié dans Brevo"
    echo "   → Solution: Settings → Senders → Verify"
    echo ""
else
    echo "❌ Backend dit: Email NON envoyé"
    ERROR=$(echo "$SIGNUP_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo "   Erreur: $ERROR"
fi

echo ""
echo "=========================================="
echo "🏁 Diagnostic terminé"
echo ""
echo "📋 RÉSUMÉ DES ACTIONS:"
echo "   1. Vérifiez les SPAMS de votre boîte email"
echo "   2. Connectez-vous à Brevo et vérifiez les logs"
echo "   3. Assurez-vous que l'expéditeur est VÉRIFIÉ dans Brevo"
echo ""
