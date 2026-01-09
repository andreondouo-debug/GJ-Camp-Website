/**
 * Middleware simplifié pour upload vers Cloudinary (posts)
 */

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

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

// Configuration multer pour posts (retourne le middleware complet)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// Middleware multer avec .fields()
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]);

/**
 * Upload vers Cloudinary après multer
 */
const uploadToCloudinary = async (req, res, next) => {
  // Si pas de fichiers, continuer
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('📭 Aucun fichier à uploader');
    return next();
  }

  console.log(`📤 Upload de ${Object.keys(req.files).length} fichier(s) vers Cloudinary...`);

  try {
    // Traiter chaque type de fichier
    for (const fieldname in req.files) {
      const fileArray = req.files[fieldname];
      if (!fileArray || fileArray.length === 0) continue;

      const file = fileArray[0];
      console.log(`🔄 Upload ${fieldname}: ${file.originalname} (${(file.size / 1024).toFixed(2)}KB)`);

      // Déterminer le dossier Cloudinary
      let folder = 'gj-camp/posts';
      let resourceType = 'auto';
      
      if (fieldname === 'video') {
        folder = 'gj-camp/posts/videos';
        resourceType = 'video';
      } else if (fieldname === 'document') {
        folder = 'gj-camp/posts/documents';
        resourceType = 'raw';
      } else if (fieldname === 'image') {
        folder = 'gj-camp/posts/images';
        resourceType = 'image';
      }

      // Upload via stream
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: resourceType,
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) {
              console.error(`❌ Erreur upload ${fieldname}:`, error.message);
              reject(error);
            } else {
              console.log(`✅ ${fieldname} uploadé: ${result.secure_url}`);
              resolve(result);
            }
          }
        );
        
        // Créer un stream depuis le buffer
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      const result = await uploadPromise;
      
      // Ajouter l'URL au fichier
      file.cloudinaryUrl = result.secure_url;
      file.cloudinaryPublicId = result.public_id;
    }

    console.log('✅ Tous les fichiers uploadés vers Cloudinary');
    next();
  } catch (error) {
    console.error('❌ Erreur upload Cloudinary:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'upload des médias',
      error: error.message 
    });
  }
};

module.exports = {
  uploadFields,
  uploadToCloudinary
};
