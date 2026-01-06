const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

const setAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:GjCamp2025Mongo@localhost:27017/gj-camp?authSource=admin');
    console.log('✅ MongoDB connecté\n');

    const email = 'odoungaetoumbi@gmail.com';

    // Chercher l'utilisateur
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé avec l\'email:', email);
      await mongoose.connection.close();
      process.exit(1);
    }

    // Mettre à jour en admin avec tous les droits
    user.role = 'admin';
    user.isEmailVerified = true;
    user.isActive = true;
    user.canCreatePost = true;
    user.emailNotifications = true;
    
    await user.save();
    
    console.log('✅ Utilisateur mis à jour en ADMIN avec succès!\n');
    console.log('📧 Email:', user.email);
    console.log('👤 Nom:', user.firstName, user.lastName);
    console.log('🔑 Rôle:', user.role);
    console.log('✅ Email vérifié:', user.isEmailVerified);
    console.log('✅ Compte actif:', user.isActive);
    console.log('✅ Peut créer des posts:', user.canCreatePost);
    console.log('\n🎉 Tous les droits administrateur accordés!');

    await mongoose.connection.close();
    console.log('\n✅ Terminé');
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

setAdmin();
