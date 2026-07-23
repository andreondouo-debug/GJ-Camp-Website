/**
 * Middleware upload Cloudinary pour les activités (images + PDF)
 * Stockage cloud persistant — évite la perte des fichiers sur Render
 * (le disque local de Render est éphémère et effacé à chaque redéploiement).
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
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

// Stockage Cloudinary : params dynamiques selon le type de fichier
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'fichierPdf') {
      // Les PDF sont stockés en tant que fichiers "raw"
      return {
        folder: 'gj-camp/activities/pdf',
        resource_type: 'raw',
        public_id: `pdf-${Date.now()}-${Math.round(Math.random() * 1e9)}`
      };
    }
    // Images
    return {
      folder: 'gj-camp/activities',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }]
    };
  }
});

// Filtre : images OU PDF selon le champ
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    return cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
  }
  if (file.fieldname === 'fichierPdf') {
    const isPdf = file.mimetype === 'application/pdf';
    const extOk = path.extname(file.originalname).toLowerCase() === '.pdf';
    if (isPdf && extOk) return cb(null, true);
    return cb(new Error('Seuls les fichiers PDF sont autorisés'));
  }
  return cb(new Error('Champ de fichier non reconnu'));
};

const activityCloudinaryUpload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max
  },
  fileFilter: fileFilter
});

module.exports = activityCloudinaryUpload;
