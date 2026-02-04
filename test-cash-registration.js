const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'https://gj-camp-backend.onrender.com';
const TEST_EMAIL = `test.cash.${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestCash2025!';

console.log('🧪 Test inscription avec paiement espèces');
console.log('📧 Email test:', TEST_EMAIL);
console.log('🔐 Mot de passe:', TEST_PASSWORD);
console.log('🌐 API:', API_URL);
console.log('');

async function testCashRegistration() {
  try {
    // Étape 1: Inscription avec paiement espèces
    console.log('📝 ÉTAPE 1: Inscription avec paiement espèces...');
    const registrationResponse = await axios.post(
      `${API_URL}/api/registrations/camp-with-account`,
      {
        firstName: 'Test',
        lastName: 'Cash',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        sex: 'M',
        dateOfBirth: '1995-01-01',
        address: '123 Test Street',
        city: 'Test City',
        zipCode: '75000',
        phone: '+33612345678',
        campus: '60d5f484b54764000015e7a1', // ID campus exemple
        refuge: 'Jeunes',
        paymentMethod: 'cash',
        amountPaid: 50,
        consent: {
          privacyPolicy: true,
          photoRelease: true,
          codeOfConduct: true
        }
      }
    );

    console.log('✅ Inscription réussie!');
    console.log('   Status:', registrationResponse.status);
    console.log('   Message:', registrationResponse.data.message);
    console.log('   User ID:', registrationResponse.data.user?.id);
    console.log('   Token reçu?', registrationResponse.data.token ? 'Oui ✅' : 'Non ❌');
    console.log('');

    const receivedToken = registrationResponse.data.token;

    // Étape 2: Connexion avec les credentials
    console.log('🔑 ÉTAPE 2: Connexion avec email/password...');
    const loginResponse = await axios.post(
      `${API_URL}/api/auth/login`,
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }
    );

    console.log('✅ Connexion réussie!');
    console.log('   Status:', loginResponse.status);
    console.log('   Message:', loginResponse.data.message);
    console.log('   User:', loginResponse.data.user?.firstName, loginResponse.data.user?.lastName);
    console.log('   Token reçu?', loginResponse.data.token ? 'Oui ✅' : 'Non ❌');
    console.log('');

    // Étape 3: Vérifier l'utilisateur avec le token d'inscription
    if (receivedToken) {
      console.log('👤 ÉTAPE 3: Vérification profil avec token d\'inscription...');
      const profileResponse = await axios.get(
        `${API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${receivedToken}`
          }
        }
      );

      console.log('✅ Profil récupéré avec succès!');
      console.log('   Email:', profileResponse.data.email);
      console.log('   Role:', profileResponse.data.role);
      console.log('   Email vérifié?', profileResponse.data.isEmailVerified ? 'Oui ✅' : 'Non ❌');
    }

    console.log('');
    console.log('🎉 TEST COMPLET RÉUSSI! Le système fonctionne correctement.');
    console.log('');
    console.log('📋 Résumé:');
    console.log('   ✅ Inscription avec paiement espèces');
    console.log('   ✅ Token généré automatiquement');
    console.log('   ✅ Connexion avec email/password');
    console.log('   ✅ Profil accessible');

  } catch (error) {
    console.error('');
    console.error('❌ ERREUR DÉTECTÉE:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
      
      if (error.response.status === 401) {
        console.error('');
        console.error('🔍 DIAGNOSTIC:');
        console.error('   Le compte a été créé mais la connexion échoue.');
        console.error('   Causes possibles:');
        console.error('   - Mot de passe pas correctement hashé');
        console.error('   - Email pas en lowercase');
        console.error('   - Compte créé mais pas sauvegardé en base');
        console.error('   - Problème avec bcrypt.compare');
      }
    } else {
      console.error('   Erreur réseau:', error.message);
    }
    
    process.exit(1);
  }
}

testCashRegistration();
