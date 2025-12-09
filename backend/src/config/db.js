const mongoose = require('mongoose');

// Singleton pour gérer une seule connexion MongoDB active
let mongoConnection = null;
let isConnecting = false;

/**
 * Connexion singleton à MongoDB
 * Garantit qu'une seule connexion active existe à tout moment
 */
const connectDB = async () => {
  try {
    // Si déjà connecté, retourner la connexion existante
    if (mongoConnection && mongoose.connection.readyState === 1) {
      console.log('📊 Connexion MongoDB existante réutilisée (singleton)');
      return mongoConnection;
    }

    // Si une connexion est déjà en cours, attendre qu'elle se termine
    if (isConnecting) {
      console.log('⏳ Connexion MongoDB en cours, attente...');
      // Attendre jusqu'à ce que la connexion soit établie
      while (isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return mongoConnection;
    }

    // Marquer qu'une connexion est en cours
    isConnecting = true;

    console.log('🔌 Établissement d\'une nouvelle connexion MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoConnection = mongoose.connection;
    isConnecting = false;

    console.log('✅ MongoDB connecté avec succès (singleton établi)');

    // Gérer les événements de connexion
    mongoConnection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoConnection.on('disconnected', () => {
      console.warn('⚠️ MongoDB déconnecté');
      mongoConnection = null;
    });

    mongoConnection.on('reconnected', () => {
      console.log('✅ MongoDB reconnecté');
    });

    return mongoConnection;
  } catch (error) {
    isConnecting = false;
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Fermer proprement la connexion MongoDB
 */
const disconnectDB = async () => {
  if (mongoConnection) {
    await mongoose.connection.close();
    mongoConnection = null;
    console.log('🔌 Connexion MongoDB fermée');
  }
};

/**
 * Obtenir l'état actuel de la connexion
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return {
    state: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

module.exports = { 
  connectDB, 
  disconnectDB, 
  getConnectionStatus 
};
