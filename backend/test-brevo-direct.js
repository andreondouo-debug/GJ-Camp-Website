const fetch = require('node-fetch');
require('dotenv').config();

// Test direct de l'API Brevo avec tous les détails
async function testBrevoAPI() {
  console.log('🧪 TEST DIRECT DE L\'API BREVO');
  console.log('===============================\n');

  // 1. Vérifier les variables d'environnement
  console.log('1️⃣ Variables d\'environnement:');
  console.log('   BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ Définie (' + process.env.BREVO_API_KEY.substring(0, 15) + '...)' : '❌ Manquante');
  console.log('   EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Manquante');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');

  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY manquante!');
    process.exit(1);
  }

  // 2. Test de l'API Brevo - Account Info
  console.log('2️⃣ Test: Vérification du compte Brevo');
  try {
    const accountResponse = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      console.error('❌ Erreur API Brevo Account:', accountResponse.status, errorText);
    } else {
      const accountData = await accountResponse.json();
      console.log('✅ Compte Brevo vérifié');
      console.log('   Email:', accountData.email);
      console.log('   Plan:', accountData.plan?.[0]?.type || 'N/A');
      console.log('   Crédits email:', accountData.plan?.[0]?.credits || 'Illimité');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du compte:', error.message);
  }
  console.log('');

  // 3. Vérifier les expéditeurs autorisés
  console.log('3️⃣ Test: Expéditeurs autorisés (Senders)');
  try {
    const sendersResponse = await fetch('https://api.brevo.com/v3/senders', {
      method: 'GET',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!sendersResponse.ok) {
      const errorText = await sendersResponse.text();
      console.error('❌ Erreur récupération senders:', sendersResponse.status, errorText);
    } else {
      const sendersData = await sendersResponse.json();
      console.log('✅ Expéditeurs configurés:', sendersData.senders?.length || 0);
      
      if (sendersData.senders && sendersData.senders.length > 0) {
        sendersData.senders.forEach((sender, index) => {
          console.log(`   ${index + 1}. ${sender.email} (${sender.name}) - ${sender.active ? '✅ Actif' : '❌ Inactif'}`);
        });
        
        const emailFrom = process.env.EMAIL_FROM || 'gjcontactgj0@gmail.com';
        const isAuthorized = sendersData.senders.some(s => s.email === emailFrom && s.active);
        
        if (isAuthorized) {
          console.log(`   ✅ L'email ${emailFrom} est autorisé et actif`);
        } else {
          console.log(`   ⚠️ L'email ${emailFrom} n'est PAS dans les expéditeurs autorisés!`);
          console.log(`   → Vous devez ajouter et vérifier cet email dans Brevo:`);
          console.log(`      1. Allez sur Brevo → Settings → Senders`);
          console.log(`      2. Ajoutez ${emailFrom}`);
          console.log(`      3. Vérifiez-le (email ou DNS)`);
        }
      } else {
        console.log('   ⚠️ Aucun expéditeur configuré dans Brevo!');
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des senders:', error.message);
  }
  console.log('');

  // 4. Test d'envoi d'email réel
  console.log('4️⃣ Test: Envoi d\'un email de test');
  const emailFrom = process.env.EMAIL_FROM || 'gjcontactgj0@gmail.com';
  const emailTo = process.env.TEST_EMAIL || emailFrom; // S'envoyer à soi-même
  
  console.log('   De:', emailFrom);
  console.log('   À:', emailTo);

  const payload = {
    sender: {
      name: "GJ Camp Test",
      email: emailFrom
    },
    to: [
      {
        email: emailTo,
        name: "Test Recipient"
      }
    ],
    subject: `🧪 Test Brevo API - ${new Date().toLocaleTimeString('fr-FR')}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #a01e1e; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 Test API Brevo</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2>✅ Email envoyé avec succès!</h2>
                <p>Si vous recevez cet email, l'API Brevo fonctionne correctement.</p>
              </div>
              <p><strong>Détails du test:</strong></p>
              <ul>
                <li>Date: ${new Date().toLocaleString('fr-FR')}</li>
                <li>Expéditeur: ${emailFrom}</li>
                <li>Destinataire: ${emailTo}</li>
                <li>Méthode: API HTTP Brevo v3</li>
              </ul>
              <p><em>Ce test a été généré automatiquement par le script test-brevo-direct.js</em></p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `Test API Brevo - Si vous recevez cet email, tout fonctionne!\n\nDate: ${new Date().toLocaleString('fr-FR')}\nExpéditeur: ${emailFrom}\nDestinataire: ${emailTo}`
  };

  try {
    console.log('   📤 Envoi en cours...');
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    console.log('   Statut HTTP:', response.status, response.statusText);
    console.log('   Réponse complète:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('');
      console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS!');
      console.log('   Message ID:', responseData.messageId);
      console.log('');
      console.log('📬 VÉRIFIEZ VOTRE BOÎTE EMAIL:', emailTo);
      console.log('   - Consultez la boîte de réception');
      console.log('   - Vérifiez le dossier SPAM/Indésirables');
      console.log('   - Attendez 1-2 minutes (délai de livraison)');
    } else {
      console.log('');
      console.log('❌ ERREUR LORS DE L\'ENVOI:');
      console.log('   Code:', response.status);
      console.log('   Message:', responseData.message || responseData.code || 'Erreur inconnue');
      
      if (responseData.code === 'invalid_parameter') {
        console.log('');
        console.log('⚠️ PARAMÈTRE INVALIDE DÉTECTÉ:');
        console.log('   Causes possibles:');
        console.log('   1. L\'email expéditeur n\'est pas vérifié dans Brevo');
        console.log('   2. Le format de l\'email est invalide');
        console.log('   3. Le domaine n\'est pas autorisé');
        console.log('');
        console.log('   SOLUTION:');
        console.log('   → Allez sur https://app.brevo.com/');
        console.log('   → Settings → Senders');
        console.log('   → Ajoutez et VÉRIFIEZ l\'email:', emailFrom);
      }
    }
  } catch (error) {
    console.error('');
    console.error('❌ ERREUR RÉSEAU/EXCEPTION:', error.message);
    console.error('   Stack:', error.stack);
  }

  console.log('');
  console.log('===============================');
  console.log('🏁 Test terminé');
}

// Exécuter le test
testBrevoAPI().catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
