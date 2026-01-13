/**
 * Contrôleur pour la gestion des slides du carrousel
 */

const CarouselSlide = require('../models/CarouselSlide');
const path = require('path');
const fs = require('fs').promises;
const cloudinary = require('../config/cloudinary');

/**
 * Récupérer toutes les slides actives (triées par ordre)
 */
exports.getSlides = async (req, res) => {
  try {
    const slides = await CarouselSlide.find({ isActive: true })
      .sort({ order: 1 })
      .populate('createdBy', 'firstName lastName');
    
    res.json({ 
      success: true,
      slides,
      count: slides.length
    });
  } catch (error) {
    console.error('❌ Erreur récupération slides:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des slides',
      error: error.message 
    });
  }
};

/**
 * Ajouter une nouvelle slide
 */
exports.addSlide = async (req, res) => {
  try {
    const { 
      title, 
      subtitle,
      highlight,
      subtitle2,
      highlight2,
      description, 
      description2, 
      description3,
      date,
      textAnimation,
      imageAnimation,
      order, 
      imageSize, 
      page, 
      overlayOpacity, 
      contentPosition 
    } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Aucune image fournie' 
      });
    }
    
    // Cloudinary retourne l'URL complète dans req.file.path
    const imageUrl = req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    
    const slide = new CarouselSlide({
      image: imageUrl,
      title: title || '',
      subtitle: subtitle || '',
      highlight: highlight || '',
      subtitle2: subtitle2 || '',
      highlight2: highlight2 || '',
      description: description || '',
      description2: description2 || '',
      description3: description3 || '',
      date: date || '',
      textAnimation: textAnimation || 'fade-up',
      imageAnimation: imageAnimation || 'ken-burns',
      order: order || 0,
      imageSize: imageSize || 'cover',
      page: page || 'home',
      overlayOpacity: overlayOpacity ? parseInt(overlayOpacity) : 50,
      contentPosition: contentPosition || 'center',
      createdBy: req.user.userId
    });
    
    await slide.save();
    
    console.log(`✅ Slide ajoutée par l'utilisateur ${req.user.userId} pour la page ${page || 'home'}`);
    console.log(`📸 Image Cloudinary: ${imageUrl}`);
    
    res.status(201).json({ 
      success: true,
      message: 'Slide ajoutée avec succès',
      slide
    });
  } catch (error) {
    console.error('❌ Erreur ajout slide:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout de la slide',
      error: error.message 
    });
  }
};

/**
 * Mettre à jour l'ordre d'une slide
 */
exports.updateSlideOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;
    
    const slide = await CarouselSlide.findById(id);
    
    if (!slide) {
      return res.status(404).json({ 
        message: 'Slide non trouvée' 
      });
    }
    
    slide.order = order;
    await slide.save();
    
    res.json({ 
      success: true,
      message: 'Ordre mis à jour',
      slide
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour ordre:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de l\'ordre',
      error: error.message 
    });
  }
};

/**
 * Modifier une slide existante
 */
exports.updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      subtitle,
      highlight,
      subtitle2,
      highlight2,
      description, 
      description2, 
      description3,
      date,
      textAnimation,
      imageAnimation,
      order, 
      imageSize, 
      page, 
      overlayOpacity, 
      contentPosition 
    } = req.body;
    
    const slide = await CarouselSlide.findById(id);
    
    if (!slide) {
      return res.status(404).json({ 
        message: 'Slide non trouvée' 
      });
    }
    
    // Mettre à jour les champs textuels
    if (title !== undefined) slide.title = title;
    if (subtitle !== undefined) slide.subtitle = subtitle;
    if (highlight !== undefined) slide.highlight = highlight;
    if (subtitle2 !== undefined) slide.subtitle2 = subtitle2;
    if (highlight2 !== undefined) slide.highlight2 = highlight2;
    if (description !== undefined) slide.description = description;
    if (description2 !== undefined) slide.description2 = description2;
    if (description3 !== undefined) slide.description3 = description3;
    if (date !== undefined) slide.date = date;
    if (textAnimation !== undefined) slide.textAnimation = textAnimation;
    if (imageAnimation !== undefined) slide.imageAnimation = imageAnimation;
    if (order !== undefined) slide.order = parseInt(order);
    if (imageSize !== undefined) slide.imageSize = imageSize;
    if (page !== undefined) slide.page = page;
    if (overlayOpacity !== undefined) slide.overlayOpacity = parseInt(overlayOpacity);
    if (contentPosition !== undefined) slide.contentPosition = contentPosition;
    
    // Si une nouvelle image a été uploadée
    if (req.file) {
      // Supprimer l'ancienne image de Cloudinary si elle existe
      if (slide.image && slide.image.includes('cloudinary.com')) {
        try {
          // Extraire le public_id de l'URL Cloudinary
          const urlParts = slide.image.split('/');
          const fileWithExt = urlParts[urlParts.length - 1];
          const publicId = `gj-camp/carousel/${fileWithExt.split('.')[0]}`;
          
          await cloudinary.v2.uploader.destroy(publicId);
          console.log(`🗑️ Ancienne image Cloudinary supprimée: ${publicId}`);
        } catch (err) {
          console.log(`⚠️ Impossible de supprimer l'ancienne image Cloudinary: ${err.message}`);
        }
      }
      
      // Mettre à jour avec la nouvelle image (URL Cloudinary complète)
      const imageUrl = req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
      slide.image = imageUrl;
      console.log(`📸 Nouvelle image Cloudinary: ${imageUrl}`);
    }
    
    await slide.save();
    
    console.log(`✅ Slide modifiée: ${slide._id}`);
    
    res.json({
      success: true,
      message: 'Slide modifiée avec succès',
      slide
    });
  } catch (error) {
    console.error('❌ Erreur lors de la modification de la slide:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la modification de la slide',
      error: error.message 
    });
  }
};

/**
 * Supprimer une slide
 */
exports.deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    
    const slide = await CarouselSlide.findById(id);
    
    if (!slide) {
      return res.status(404).json({ 
        message: 'Slide non trouvée' 
      });
    }
    
    // Supprimer le fichier image de Cloudinary si elle existe
    if (slide.image && slide.image.includes('cloudinary.com')) {
      try {
        // Extraire le public_id de l'URL Cloudinary
        const urlParts = slide.image.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `gj-camp/carousel/${fileWithExt.split('.')[0]}`;
        
        await cloudinary.v2.uploader.destroy(publicId);
        console.log(`🗑️ Image Cloudinary supprimée: ${publicId}`);
      } catch (err) {
        console.log(`⚠️ Impossible de supprimer l'image Cloudinary: ${err.message}`);
      }
    }
    
    // Supprimer la slide de la base de données
    await CarouselSlide.findByIdAndDelete(id);
    
    console.log(`✅ Slide supprimée par l'utilisateur ${req.user.userId}`);
    
    res.json({ 
      success: true,
      message: 'Slide supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur suppression slide:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de la slide',
      error: error.message 
    });
  }
};
