// Test minimal pour identifier la cause du crash Render
console.log('🔍 Test démarrage serveur...');

try {
  // Test 1: Dotenv
  console.log('📦 Test 1: Chargement dotenv...');
  require('dotenv').config();
  console.log('✅ Dotenv OK');

  // Test 2: Variables d'environnement critiques
  console.log('🔑 Test 2: Variables d\'environnement...');
  const required = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Variables manquantes:', missing);
    process.exit(1);
  }
  console.log('✅ Variables env OK');

  // Test 3: Express
  console.log('📦 Test 3: Chargement Express...');
  const express = require('express');
  console.log('✅ Express OK');

  // Test 4: Connexion MongoDB
  console.log('🔌 Test 4: Connexion MongoDB...');
  const { connectDB } = require('./src/config/db');
  connectDB()
    .then(() => {
      console.log('✅ MongoDB connecté');
      
      // Test 5: Chargement des routes
      console.log('🛣️  Test 5: Chargement des routes...');
      try {
        require('./src/routes/authRoutes');
        require('./src/routes/registrationRoutes');
        require('./src/routes/activitiesRoutes');
        console.log('✅ Routes chargées');
        
        // Test 6: Démarrage serveur
        console.log('🚀 Test 6: Démarrage serveur...');
        const app = express();
        const PORT = process.env.PORT || 5000;
        app.get('/test', (req, res) => res.json({ status: 'ok' }));
        app.listen(PORT, () => {
          console.log(`✅ Serveur test OK sur port ${PORT}`);
          console.log('');
          console.log('🎉 TOUS LES TESTS PASSÉS - Le serveur devrait fonctionner');
          process.exit(0);
        });
      } catch (error) {
        console.error('❌ Erreur chargement routes:', error.message);
        console.error(error.stack);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Erreur connexion MongoDB:', error.message);
      console.error('   MONGODB_URI:', process.env.MONGODB_URI ? 'défini' : 'MANQUANT');
      process.exit(1);
    });

} catch (error) {
  console.error('❌ ERREUR FATALE:', error.message);
  console.error(error.stack);
  process.exit(1);
}
