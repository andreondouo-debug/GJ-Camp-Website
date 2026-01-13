require('dotenv').config();
const mongoose = require('mongoose');
const Campus = require('./src/models/Campus');

async function createCampus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const campusList = [
      {
        name: 'Laval',
        paypalEmail: '', // À configurer
        iban: '',
        redistributionPercentage: 100,
        isActive: true,
        contactPerson: {
          name: '',
          email: '',
          phone: ''
        },
        notes: 'Campus Laval - Email PayPal à configurer'
      },
      {
        name: 'Nantes',
        paypalEmail: '', // À configurer
        iban: '',
        redistributionPercentage: 100,
        isActive: true,
        contactPerson: {
          name: '',
          email: '',
          phone: ''
        },
        notes: 'Campus Nantes - Email PayPal à configurer'
      },
      {
        name: 'Lorient',
        paypalEmail: '', // À configurer
        iban: '',
        redistributionPercentage: 100,
        isActive: true,
        contactPerson: {
          name: '',
          email: '',
          phone: ''
        },
        notes: 'Campus Lorient - Email PayPal à configurer'
      },
      {
        name: 'Amiens',
        paypalEmail: '', // À configurer
        iban: '',
        redistributionPercentage: 100,
        isActive: true,
        contactPerson: {
          name: '',
          email: '',
          phone: ''
        },
        notes: 'Campus Amiens - Email PayPal à configurer'
      }
    ];

    console.log('📝 Création des campus...\n');

    for (const campusData of campusList) {
      // Vérifier si le campus existe déjà
      const existing = await Campus.findOne({ name: campusData.name });
      
      if (existing) {
        console.log(`ℹ️  ${campusData.name} existe déjà - ignoré`);
      } else {
        const campus = await Campus.create(campusData);
        console.log(`✅ ${campusData.name} créé`);
      }
    }

    console.log('\n📋 Liste des campus:');
    const allCampus = await Campus.find();
    allCampus.forEach(c => {
      console.log({
        name: c.name,
        paypalEmail: c.paypalEmail || '❌ NON CONFIGURÉ',
        redistribution: c.redistributionPercentage + '%',
        actif: c.isActive ? '✅' : '❌'
      });
    });

    console.log('\n⚠️  IMPORTANT: Configurez les emails PayPal pour chaque campus');
    console.log('   Utilisez la page de gestion /gestion/redistributions sur le frontend\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  }
}

createCampus();
