require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const activitiesRoutes = require('./routes/activitiesRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const campusRoutes = require('./routes/campusRoutes');
const messageRoutes = require('./routes/messageRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const carouselRoutes = require('./routes/carouselRoutes');
const activityTrackingRoutes = require('./routes/activityTrackingRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour Cloudinary et React
  crossOriginEmbedderPolicy: false,
}));

// Middleware
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => origin.includes(allowedOrigin.trim()))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connexion à la base de données
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/activity-tracking', activityTrackingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/test', testRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: '✅ Backend fonctionnel' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
