const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🔧 Configuration Cloudinary :');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Configuré' : '❌ Manquant');
console.log('');

// Test de connexion
console.log('🧪 Test de connexion à Cloudinary...');

cloudinary.api.ping()
  .then(result => {
    console.log('✅ Connexion réussie !');
    console.log('Statut:', result.status);
    console.log('');
    
    // Test upload d'un petit fichier test
    console.log('📤 Test d\'upload...');
    
    // Créer un buffer simple pour tester
    const testBuffer = Buffer.from('Test Cloudinary GJ Camp');
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gj-camp/test',
          resource_type: 'raw',
          public_id: 'test-connection'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(testBuffer);
    });
  })
  .then(uploadResult => {
    console.log('✅ Upload réussi !');
    console.log('URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);
    console.log('');
    console.log('🎉 Cloudinary est correctement configuré et fonctionnel !');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
    console.error('Message:', error.message);
    if (error.http_code) {
      console.error('Code HTTP:', error.http_code);
    }
    if (error.error) {
      console.error('Détails:', error.error);
    }
    console.log('');
    console.log('💡 Vérifiez vos credentials sur https://console.cloudinary.com/');
    process.exit(1);
  });
