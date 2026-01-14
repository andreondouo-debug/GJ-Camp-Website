const Activity = require('../models/Activity');
const path = require('path');
const fs = require('fs').promises;
const pushService = require('../services/pushService');

// 📋 Récupérer toutes les activités
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ actif: true })
      .sort({ dateCreation: -1 });
    
    console.log(`📋 ${activities.length} activités récupérées`);
    res.json(activities);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des activités:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des activités' });
  }
};

// 🔍 Récupérer une activité par ID
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activité non trouvée' });
    }
    
    res.json(activity);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'activité:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'activité' });
  }
};

// ➕ Créer une nouvelle activité
exports.createActivity = async (req, res) => {
  try {
    const { titre, description, type, heureDebut, heureFin, jour } = req.body;
    
    // Validation des champs requis
    if (!titre || !description || !type || !jour) {
      return res.status(400).json({ 
        message: 'Titre, description, type et jour sont requis' 
      });
    }
    
    // Préparer les données de l'activité
    const activityData = {
      titre,
      description,
      type,
      heureDebut: heureDebut || null,
      heureFin: heureFin || null,
      jour: parseInt(jour)
    };
    
    // Ajouter l'image si fournie
    if (req.files && req.files.image) {
      activityData.image = `/uploads/${req.files.image[0].filename}`;
    }
    
    // Ajouter le PDF si fourni
    if (req.files && req.files.fichierPdf) {
      activityData.fichierPdf = `/uploads/${req.files.fichierPdf[0].filename}`;
    }
    
    const activity = new Activity(activityData);
    await activity.save();
    
    console.log(`✅ Nouvelle activité créée: ${titre}`);
    
    // Envoyer notification push à tous les utilisateurs
    pushService.notifyNewActivity(activity).catch(err => {
      console.error('❌ Erreur notification push activité:', err);
    });
    
    res.status(201).json({ 
      message: 'Activité créée avec succès',
      activity 
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'activité:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'activité' });
  }
};

// ✏️ Modifier une activité
exports.updateActivity = async (req, res) => {
  try {
    const { titre, description, type, heureDebut, heureFin, jour, referent } = req.body;
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activité non trouvée' });
    }
    
    // Mettre à jour les champs texte
    if (titre) activity.titre = titre;
    if (description) activity.description = description;
    if (type) activity.type = type;
    if (heureDebut !== undefined) activity.heureDebut = heureDebut;
    if (heureFin !== undefined) activity.heureFin = heureFin;
    if (jour) activity.jour = parseInt(jour);
    if (referent !== undefined) activity.referent = referent || null;
    
    // Gérer la mise à jour de l'image
    if (req.files && req.files.image) {
      // Supprimer l'ancienne image si elle existe
      if (activity.image) {
        const oldImagePath = path.join(__dirname, '../../', activity.image);
        try {
          await fs.unlink(oldImagePath);
          console.log(`🗑️ Ancienne image supprimée: ${activity.image}`);
        } catch (err) {
          console.log('⚠️ Impossible de supprimer l\'ancienne image');
        }
      }
      activity.image = `/uploads/${req.files.image[0].filename}`;
    }
    
    // Gérer la mise à jour du PDF
    if (req.files && req.files.fichierPdf) {
      // Supprimer l'ancien PDF si il existe
      if (activity.fichierPdf) {
        const oldPdfPath = path.join(__dirname, '../../', activity.fichierPdf);
        try {
          await fs.unlink(oldPdfPath);
          console.log(`🗑️ Ancien PDF supprimé: ${activity.fichierPdf}`);
        } catch (err) {
          console.log('⚠️ Impossible de supprimer l\'ancien PDF');
        }
      }
      activity.fichierPdf = `/uploads/${req.files.fichierPdf[0].filename}`;
    }
    
    await activity.save();
    
    console.log(`✅ Activité modifiée: ${activity.titre}`);
    res.json({ 
      message: 'Activité modifiée avec succès',
      activity 
    });
  } catch (error) {
    console.error('❌ Erreur lors de la modification de l\'activité:', error);
    res.status(500).json({ message: 'Erreur lors de la modification de l\'activité' });
  }
};

// 🗑️ Supprimer une activité (soft delete)
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activité non trouvée' });
    }
    
    // Soft delete - marquer comme inactif
    activity.actif = false;
    await activity.save();
    
    console.log(`🗑️ Activité désactivée: ${activity.titre}`);
    res.json({ message: 'Activité supprimée avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'activité:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'activité' });
  }
};

// 🗑️ Supprimer définitivement une activité
exports.hardDeleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activité non trouvée' });
    }
    
    // Supprimer les fichiers associés
    if (activity.image) {
      const imagePath = path.join(__dirname, '../../', activity.image);
      try {
        await fs.unlink(imagePath);
        console.log(`🗑️ Image supprimée: ${activity.image}`);
      } catch (err) {
        console.log('⚠️ Impossible de supprimer l\'image');
      }
    }
    
    if (activity.fichierPdf) {
      const pdfPath = path.join(__dirname, '../../', activity.fichierPdf);
      try {
        await fs.unlink(pdfPath);
        console.log(`🗑️ PDF supprimé: ${activity.fichierPdf}`);
      } catch (err) {
        console.log('⚠️ Impossible de supprimer le PDF');
      }
    }
    
    // Supprimer de la base de données
    await Activity.findByIdAndDelete(req.params.id);
    
    console.log(`🗑️ Activité supprimée définitivement: ${activity.titre}`);
    res.json({ message: 'Activité supprimée définitivement' });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression définitive:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression définitive' });
  }
};
