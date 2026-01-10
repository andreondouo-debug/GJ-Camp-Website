const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

const createAdminUser = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:GjCamp2025Mongo@localhost:27017/gj-camp?authSource=admin');
    console.log('✅ MongoDB connecté\n');

    // Informations du compte admin
    const email = 'andreondouo@gmail.com';
    const firstName = 'André';
    const lastName = 'Ondouo';
    const password = 'Admin2026!'; // Mot de passe temporaire à changer

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email });
    
    if (existingUser) {
      // Mettre à jour le rôle et les informations
      existingUser.role = 'admin';
      existingUser.isEmailVerified = true;
      existingUser.password = password;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      await existingUser.save();
      console.log('✅ Utilisateur existant mis à jour en tant qu\'admin');
    } else {
      // Créer un nouvel utilisateur admin
      const adminUser = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        churchWebsite: 'https://gj-camp.fr',
        role: 'admin',
        isEmailVerified: true,
        dataProcessingConsent: true,
        dataProcessingConsentDate: new Date(),
        privacyPolicyAcceptedAt: new Date()
      });

      await adminUser.save();
      console.log('✅ Nouveau compte administrateur créé avec succès');
    }

    console.log('\n📧 Email:', email);
    console.log('👤 Nom:', firstName, lastName);
    console.log('🔑 Mot de passe:', password);
    console.log('✅ Rôle: admin');
    console.log('✅ Email vérifié: Oui\n');

    await mongoose.connection.close();
    console.log('✅ Terminé - Vous pouvez maintenant vous connecter');
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdminUser();
