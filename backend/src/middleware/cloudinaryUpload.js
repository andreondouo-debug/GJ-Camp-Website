/**
 * Middleware pour upload vers Cloudinary
 * Stockage cloud persistant pour les images (pas de disque local)
 */

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configuration Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Stockage en mémoire (pas de disque local)
const storage = multer.memoryStorage();

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (JPEG, PNG, GIF, SVG, WebP)'));
  }
};

// Configuration de Multer
const cloudinaryUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: fileFilter
}).single('logo');

/**
 * Middleware pour uploader le fichier vers Cloudinary
 */
const uploadToCloudinary = async (req, res, next) => {
  // Si pas de fichier ou pas configuré, passer au suivant
  if (!req.file) {
    return next();
  }

  // Si Cloudinary n'est pas configuré, utiliser le stockage local
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ Cloudinary non configuré, utilisation du stockage local');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Créer le dossier uploads s'il n'existe pas
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Nettoyer le nom du fichier (remplacer espaces par tirets)
      const cleanFilename = req.file.originalname.replace(/\s+/g, '-');
      const filename = `${Date.now()}-${cleanFilename}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Sauvegarder le fichier sur le disque
      fs.writeFileSync(filepath, req.file.buffer);
      
      // Définir l'URL locale
      req.file.cloudinaryUrl = `/uploads/${filename}`;
      console.log(`✅ Fichier sauvegardé localement: ${req.file.cloudinaryUrl}`);
      
      return next();
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
      return res.status(500).json({ 
        message: 'Erreur lors de la sauvegarde du fichier',
        error: error.message 
      });
    }
  }

  try {
    console.log(`🚀 Upload vers Cloudinary: ${req.file.originalname}`);
    
    // Upload vers Cloudinary via stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gj-camp',
          resource_type: 'auto',
          quality: 'auto', // Optimisation auto
          fetch_format: 'auto' // Format auto selon le navigateur
        },
        (error, result) => {
          if (error) {
            console.error('❌ Erreur Cloudinary:', error);
            reject(error);
          } else {
            console.log(`✅ Upload réussi: ${result.secure_url}`);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    // Ajouter l'URL au request pour le controller
    req.file.cloudinaryUrl = result.secure_url;
    next();
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload Cloudinary:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message 
    });
  }
};

/**
 * Middleware pour uploader les images d'activités vers Cloudinary
 */
const uploadActivityImageToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ Cloudinary non configuré, utilisation du stockage local');
    
    try {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const cleanFilename = req.file.originalname.replace(/\s+/g, '-');
      const filename = `activity-${Date.now()}-${Math.floor(Math.random() * 1000000000)}.${cleanFilename.split('.').pop()}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      
      req.file.cloudinaryUrl = `/uploads/${filename}`;
      console.log(`✅ Image d'activité sauvegardée: ${req.file.cloudinaryUrl}`);
      return next();
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale activité:', error);
      return res.status(500).json({ message: 'Erreur lors de la sauvegarde', error: error.message });
    }
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gj-camp/activities',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    req.file.cloudinaryUrl = result.secure_url;
    next();
  } catch (error) {
    console.error('❌ Erreur upload activité:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'upload de l\'image',
      error: error.message 
    });
  }
};

/**
 * Middleware pour uploader les images de carousel vers Cloudinary
 */
const uploadCarouselImageToCloudinary = async (req, res, next) => {
  if (!req.file) return next();

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ Cloudinary non configuré, utilisation du stockage local');
    
    try {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const cleanFilename = req.file.originalname.replace(/\s+/g, '-');
      const filename = `carousel-${Date.now()}-${Math.floor(Math.random() * 1000000000)}.${cleanFilename.split('.').pop()}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      
      req.file.cloudinaryUrl = `/uploads/${filename}`;
      console.log(`✅ Image de carousel sauvegardée: ${req.file.cloudinaryUrl}`);
      return next();
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale carousel:', error);
      return res.status(500).json({ message: 'Erreur lors de la sauvegarde', error: error.message });
    }
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gj-camp/carousel',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    req.file.cloudinaryUrl = result.secure_url;
    next();
  } catch (error) {
    console.error('❌ Erreur upload carousel:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'upload de l\'image',
      error: error.message 
    });
  }
};

module.exports = {
  cloudinaryUpload,
  uploadToCloudinary,
  uploadActivityImageToCloudinary,
  uploadCarouselImageToCloudinary
};
