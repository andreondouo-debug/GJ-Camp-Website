/**
 * Middleware pour upload de photos de profil vers Cloudinary
 * Stockage cloud persistant (pas de disque local)
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
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images JPG, PNG et WebP sont autorisées'));
  }
};

// Configuration de Multer pour photo de profil
const profilePhotoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
}).single('profilePhoto');

/**
 * Middleware pour uploader la photo de profil vers Cloudinary
 */
const uploadProfilePhotoToCloudinary = async (req, res, next) => {
  // Si pas de fichier, passer au suivant
  if (!req.file) {
    return res.status(400).json({ 
      message: 'Aucun fichier sélectionné' 
    });
  }

  // Si Cloudinary n'est pas configuré
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('❌ Cloudinary non configuré !');
    return res.status(500).json({ 
      message: 'Service de stockage non configuré',
      error: 'CLOUDINARY_NOT_CONFIGURED'
    });
  }

  try {
    console.log(`🚀 Upload photo de profil vers Cloudinary: ${req.file.originalname}`);
    
    // Créer un nom unique pour le fichier
    const filename = `profile-${req.user.userId}-${Date.now()}`;
    
    // Uploader vers Cloudinary depuis le buffer
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gj-camp/profile-photos',
          public_id: filename,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Erreur Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ Upload Cloudinary réussi:', result.secure_url);
            resolve(result);
          }
        }
      );
      
      // Envoyer le buffer vers Cloudinary
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;
    
    // Ajouter l'URL Cloudinary à la requête
    req.file.cloudinaryUrl = result.secure_url;
    req.file.cloudinaryPublicId = result.public_id;
    
    next();
  } catch (error) {
    console.error('❌ Erreur upload Cloudinary:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'upload de la photo',
      error: error.message 
    });
  }
};

module.exports = {
  profilePhotoUpload,
  uploadProfilePhotoToCloudinary
};
