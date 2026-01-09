/**
 * Middleware pour upload de médias de posts vers Cloudinary
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

// Stockage en mémoire
const storage = multer.memoryStorage();

// Filtre pour médias (images, vidéos, documents)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|webm/;
  const allowedDocTypes = /pdf|doc|docx|txt/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  // Images
  if (file.fieldname === 'image') {
    if (allowedImageTypes.test(extname.replace('.', '')) && mimetype.startsWith('image/')) {
      return cb(null, true);
    }
  }
  
  // Vidéos
  if (file.fieldname === 'video') {
    if (allowedVideoTypes.test(extname.replace('.', '')) && mimetype.startsWith('video/')) {
      return cb(null, true);
    }
  }
  
  // Documents
  if (file.fieldname === 'document') {
    if (allowedDocTypes.test(extname.replace('.', '')) || 
        mimetype.includes('pdf') || 
        mimetype.includes('document') ||
        mimetype.includes('text')) {
      return cb(null, true);
    }
  }
  
  cb(new Error(`Type de fichier non autorisé pour ${file.fieldname}`));
};

// Configuration multer pour posts
const postUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  },
  fileFilter: fileFilter
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]);

/**
 * Middleware pour uploader les fichiers vers Cloudinary
 */
const uploadPostMediaToCloudinary = async (req, res, next) => {
  // Si pas de fichiers, continuer
  if (!req.files || Object.keys(req.files).length === 0) {
    return next();
  }

  // Si Cloudinary non configuré, utiliser stockage local
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️ Cloudinary non configuré, utilisation du stockage local');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Traiter chaque fichier
      for (const fieldname in req.files) {
        const fileArray = req.files[fieldname];
        if (fileArray && fileArray.length > 0) {
          const file = fileArray[0];
          const cleanFilename = file.originalname.replace(/\s+/g, '-');
          const filename = `${fieldname}-${Date.now()}-${Math.floor(Math.random() * 1000000000)}${path.extname(cleanFilename)}`;
          const filepath = path.join(uploadsDir, filename);
          
          fs.writeFileSync(filepath, file.buffer);
          file.cloudinaryUrl = `/uploads/${filename}`;
          console.log(`✅ ${fieldname} sauvegardé localement: ${file.cloudinaryUrl}`);
        }
      }
      
      return next();
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
      return res.status(500).json({ 
        message: 'Erreur lors de la sauvegarde des fichiers',
        error: error.message 
      });
    }
  }

  try {
    console.log('🚀 Upload vers Cloudinary...');
    
    // Uploader chaque fichier vers Cloudinary
    for (const fieldname in req.files) {
      const fileArray = req.files[fieldname];
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        
        // Déterminer le type de ressource
        let resourceType = 'auto';
        let folder = 'gj-camp/posts';
        
        if (fieldname === 'video') {
          resourceType = 'video';
          folder = 'gj-camp/posts/videos';
        } else if (fieldname === 'document') {
          resourceType = 'raw';
          folder = 'gj-camp/posts/documents';
        } else if (fieldname === 'image') {
          resourceType = 'image';
          folder = 'gj-camp/posts/images';
        }
        
        console.log(`📤 Upload ${fieldname}: ${file.originalname}`);
        
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder,
              resource_type: resourceType,
              quality: 'auto',
              fetch_format: 'auto'
            },
            (error, result) => {
              if (error) {
                console.error(`❌ Erreur upload ${fieldname}:`, error);
                reject(error);
              } else {
                console.log(`✅ ${fieldname} uploadé: ${result.secure_url}`);
                resolve(result);
              }
            }
          );
          
          uploadStream.end(file.buffer);
        });
        
        // Ajouter l'URL Cloudinary au fichier
        file.cloudinaryUrl = result.secure_url;
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload vers Cloudinary:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'upload des médias',
      error: error.message 
    });
  }
};

module.exports = {
  postUpload,
  uploadPostMediaToCloudinary
};
