const CampusLeader = require('../models/CampusLeader');
const Campus = require('../models/Campus');
const cloudinary = require('../config/cloudinary');

// @route   GET /api/campus-leaders
// @desc    Récupérer tous les responsables de campus actifs groupés par campus
// @access  Public
exports.getAllCampusLeaders = async (req, res) => {
  try {
    console.log('📋 Récupération des responsables de campus...');
    
    const leaders = await CampusLeader.find({ isActive: true })
      .populate('campus', 'name city')
      .sort({ 'campus.name': 1, order: 1 })
      .lean();

    // Grouper par campus
    const leadersByCampus = leaders.reduce((acc, leader) => {
      const campusName = leader.campus?.name || 'Sans campus';
      if (!acc[campusName]) {
        acc[campusName] = {
          campus: leader.campus,
          leaders: []
        };
      }
      acc[campusName].leaders.push(leader);
      return acc;
    }, {});

    console.log(`✅ ${leaders.length} responsables trouvés pour ${Object.keys(leadersByCampus).length} campus`);

    res.status(200).json({
      success: true,
      count: leaders.length,
      leadersByCampus
    });
  } catch (error) {
    console.error('❌ Erreur récupération responsables:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des responsables',
      error: error.message
    });
  }
};

// @route   GET /api/campus-leaders/:id
// @desc    Récupérer un responsable spécifique
// @access  Public
exports.getCampusLeaderById = async (req, res) => {
  try {
    const leader = await CampusLeader.findById(req.params.id)
      .populate('campus', 'name city address');

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Responsable non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      leader
    });
  } catch (error) {
    console.error('❌ Erreur récupération responsable:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du responsable',
      error: error.message
    });
  }
};

// @route   POST /api/campus-leaders
// @desc    Créer un nouveau responsable de campus
// @access  Private (Admin/Responsable)
exports.createCampusLeader = async (req, res) => {
  try {
    console.log('➕ Création d\'un nouveau responsable de campus...');
    const { campusId, firstName, lastName, email, phone, role, order } = req.body;

    // Vérifier que le campus existe
    const campus = await Campus.findById(campusId);
    if (!campus) {
      return res.status(404).json({
        success: false,
        message: 'Campus non trouvé'
      });
    }

    const leaderData = {
      campus: campusId,
      firstName,
      lastName,
      email,
      phone,
      role: role || 'Responsable Campus',
      order: order || 0
    };

    const leader = await CampusLeader.create(leaderData);
    await leader.populate('campus', 'name city');

    console.log(`✅ Responsable créé: ${firstName} ${lastName} pour ${campus.name}`);

    res.status(201).json({
      success: true,
      message: '✅ Responsable créé avec succès !',
      leader
    });
  } catch (error) {
    console.error('❌ Erreur création responsable:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du responsable',
      error: error.message
    });
  }
};

// @route   PUT /api/campus-leaders/:id
// @desc    Mettre à jour un responsable
// @access  Private (Admin/Responsable)
exports.updateCampusLeader = async (req, res) => {
  try {
    console.log(`🔄 Mise à jour du responsable ${req.params.id}...`);
    const { campusId, firstName, lastName, email, phone, role, order, isActive } = req.body;

    const leader = await CampusLeader.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Responsable non trouvé'
      });
    }

    // Vérifier le campus si changé
    if (campusId && campusId !== leader.campus.toString()) {
      const campus = await Campus.findById(campusId);
      if (!campus) {
        return res.status(404).json({
          success: false,
          message: 'Campus non trouvé'
        });
      }
      leader.campus = campusId;
    }

    if (firstName) leader.firstName = firstName;
    if (lastName) leader.lastName = lastName;
    if (email) leader.email = email;
    if (phone) leader.phone = phone;
    if (role) leader.role = role;
    if (order !== undefined) leader.order = order;
    if (isActive !== undefined) leader.isActive = isActive;

    await leader.save();
    await leader.populate('campus', 'name city');

    console.log(`✅ Responsable mis à jour: ${leader.firstName} ${leader.lastName}`);

    res.status(200).json({
      success: true,
      message: '✅ Responsable mis à jour avec succès !',
      leader
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour responsable:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du responsable',
      error: error.message
    });
  }
};

// @route   DELETE /api/campus-leaders/:id
// @desc    Supprimer un responsable
// @access  Private (Admin/Responsable)
exports.deleteCampusLeader = async (req, res) => {
  try {
    console.log(`🗑️ Suppression du responsable ${req.params.id}...`);

    const leader = await CampusLeader.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Responsable non trouvé'
      });
    }

    // Supprimer la photo de Cloudinary si elle existe
    if (leader.photo && leader.photo.publicId) {
      try {
        await cloudinary.uploader.destroy(leader.photo.publicId);
        console.log('🗑️ Photo supprimée de Cloudinary');
      } catch (error) {
        console.error('⚠️ Erreur suppression photo Cloudinary:', error);
      }
    }

    await leader.deleteOne();

    console.log(`✅ Responsable supprimé: ${leader.firstName} ${leader.lastName}`);

    res.status(200).json({
      success: true,
      message: '✅ Responsable supprimé avec succès !'
    });
  } catch (error) {
    console.error('❌ Erreur suppression responsable:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du responsable',
      error: error.message
    });
  }
};

// @route   POST /api/campus-leaders/:id/upload-photo
// @desc    Upload la photo d'un responsable vers Cloudinary
// @access  Private (Admin/Responsable)
exports.uploadCampusLeaderPhoto = async (req, res) => {
  try {
    console.log(`📸 Upload photo pour le responsable ${req.params.id}...`);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune photo fournie'
      });
    }

    const leader = await CampusLeader.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Responsable non trouvé'
      });
    }

    // Supprimer l'ancienne photo si elle existe
    if (leader.photo && leader.photo.publicId) {
      try {
        await cloudinary.uploader.destroy(leader.photo.publicId);
        console.log('🗑️ Ancienne photo supprimée');
      } catch (error) {
        console.error('⚠️ Erreur suppression ancienne photo:', error);
      }
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'gj-camp/campus-leaders',
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face'
    });

    leader.photo = {
      url: result.secure_url,
      publicId: result.public_id
    };

    await leader.save();

    console.log(`✅ Photo uploadée pour ${leader.firstName} ${leader.lastName}`);

    res.status(200).json({
      success: true,
      message: '✅ Photo uploadée avec succès !',
      photo: leader.photo
    });
  } catch (error) {
    console.error('❌ Erreur upload photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de la photo',
      error: error.message
    });
  }
};
