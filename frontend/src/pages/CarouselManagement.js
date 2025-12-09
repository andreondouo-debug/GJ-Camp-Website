import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CarouselManagement.css';

const CarouselManagement = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [activeTab, setActiveTab] = useState('slides'); // 'slides' ou 'settings'
  
  // États pour les paramètres globaux
  const [globalSettings, setGlobalSettings] = useState({
    carouselEnabled: true,
    carouselHeight: '500px',
    carouselAutoplayInterval: 6000,
    carouselTransitionDuration: 1000,
  });
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    highlight: '',
    subtitle2: '',
    highlight2: '',
    description: '',
    date: '',
    textAnimation: 'fade-up',
    imageAnimation: 'ken-burns',
    order: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const textAnimations = [
    { value: 'fade-up', label: 'Fade Up (Apparition bas → haut)' },
    { value: 'slide-left', label: 'Slide Left (Glissement droite → gauche)' },
    { value: 'zoom-in', label: 'Zoom In (Zoom progressif)' },
    { value: 'rotate-in', label: 'Rotate In (Rotation + apparition)' },
    { value: 'bounce-in', label: 'Bounce In (Rebond dynamique)' },
  ];

  const imageAnimations = [
    { value: 'ken-burns', label: 'Ken Burns (Zoom lent)' },
    { value: 'zoom-out', label: 'Zoom Out (Dézoom)' },
    { value: 'slide-right', label: 'Slide Right (Panoramique)' },
    { value: 'fade-scale', label: 'Fade Scale (Fondu + rotation)' },
  ];

  useEffect(() => {
    fetchSlides();
    fetchGlobalSettings();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await axios.get('/api/carousel');
      setSlides(response.data.slides || []);
    } catch (error) {
      console.error('❌ Erreur chargement slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      if (response.data.settings) {
        setGlobalSettings({
          carouselEnabled: response.data.settings.carouselEnabled ?? true,
          carouselHeight: response.data.settings.carouselHeight || '500px',
          carouselAutoplayInterval: response.data.settings.carouselAutoplayInterval || 6000,
          carouselTransitionDuration: response.data.settings.carouselTransitionDuration || 1000,
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        highlight: slide.highlight || '',
        subtitle2: slide.subtitle2 || '',
        highlight2: slide.highlight2 || '',
        description: slide.description || '',
        date: slide.date || '',
        textAnimation: slide.textAnimation || 'fade-up',
        imageAnimation: slide.imageAnimation || 'ken-burns',
        order: slide.order || 0,
      });
      setImagePreview(slide.image ? `/uploads/carousel/${slide.image}` : '');
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        subtitle: '',
        highlight: '',
        subtitle2: '',
        highlight2: '',
        description: '',
        date: '',
        textAnimation: 'fade-up',
        imageAnimation: 'ken-burns',
        order: slides.length,
      });
      setImagePreview('');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlide(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Ajouter tous les champs
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Ajouter l'image si elle existe
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingSlide) {
        // Mise à jour
        await axios.put(`/api/carousel/${editingSlide._id}`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('✅ Slide mise à jour avec succès');
      } else {
        // Création
        if (!imageFile) {
          alert('❌ Veuillez sélectionner une image');
          return;
        }
        await axios.post('/api/carousel', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('✅ Slide ajoutée avec succès');
      }

      closeModal();
      fetchSlides();
    } catch (error) {
      console.error('❌ Erreur sauvegarde slide:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette slide ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/carousel/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert('✅ Slide supprimée avec succès');
      fetchSlides();
    } catch (error) {
      console.error('❌ Erreur suppression slide:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const updateOrder = async (id, newOrder) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/carousel/${id}/order`, 
        { order: newOrder },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchSlides();
    } catch (error) {
      console.error('❌ Erreur mise à jour ordre:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer d'abord tous les paramètres actuels
      const currentSettings = await axios.get('/api/settings');
      
      // Fusionner avec les nouveaux paramètres du carrousel
      const updatedSettings = {
        ...currentSettings.data.settings,
        ...globalSettings
      };
      
      await axios.put('/api/settings', 
        { settings: updatedSettings },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('✅ Paramètres du carrousel sauvegardés');
    } catch (error) {
      console.error('❌ Erreur sauvegarde paramètres:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    }
  };

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  return (
    <div className="carousel-management">
      <div className="carousel-management-header">
        <h1>🎨 Gestion Complète du Carrousel</h1>
        <div className="header-actions">
          {activeTab === 'slides' && (
            <button className="btn-add-slide" onClick={() => openModal()}>
              ➕ Ajouter une slide
            </button>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="carousel-tabs">
        <button 
          className={`carousel-tab ${activeTab === 'slides' ? 'active' : ''}`}
          onClick={() => setActiveTab('slides')}
        >
          🖼️ Gestion des Slides ({slides.length})
        </button>
        <button 
          className={`carousel-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Paramètres Globaux
        </button>
      </div>

      {/* Onglet Slides */}
      {activeTab === 'slides' && (
        <div className="slides-grid">
        {slides.map((slide) => (
          <div key={slide._id} className="slide-card">
            <div className="slide-image-preview">
              <img 
                src={slide.image ? `/uploads/${slide.image}` : '/images/placeholder.jpg'} 
                alt={slide.title} 
              />
              <div className="slide-animations-badge">
                <span title={`Animation texte: ${slide.textAnimation}`}>
                  📝 {slide.textAnimation}
                </span>
                <span title={`Animation image: ${slide.imageAnimation}`}>
                  🖼️ {slide.imageAnimation}
                </span>
              </div>
            </div>
            <div className="slide-card-content">
              <h3>{slide.title || 'Sans titre'}</h3>
              <div className="slide-subtitle">
                {slide.subtitle} <strong>{slide.highlight}</strong>
              </div>
              <p className="slide-description">{slide.description}</p>
              <div className="slide-date">📅 {slide.date}</div>
              <div className="slide-order">Ordre: {slide.order}</div>
            </div>
            <div className="slide-card-actions">
              <button 
                className="btn-edit" 
                onClick={() => openModal(slide)}
              >
                ✏️ Modifier
              </button>
              <button 
                className="btn-delete" 
                onClick={() => handleDelete(slide._id)}
              >
                🗑️ Supprimer
              </button>
              <div className="order-controls">
                <button onClick={() => updateOrder(slide._id, slide.order - 1)}>⬆️</button>
                <button onClick={() => updateOrder(slide._id, slide.order + 1)}>⬇️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Onglet Paramètres */}
      {activeTab === 'settings' && (
        <div className="settings-panel">
          <h2>⚙️ Paramètres Globaux du Carrousel</h2>
          <p className="settings-description">
            Configurez le comportement général du carrousel sur la page d'accueil
          </p>

          <div className="settings-form">
            <div className="setting-group">
              <label>
                <span className="label-icon">✅</span>
                Activer le carrousel
              </label>
              <select
                value={globalSettings.carouselEnabled.toString()}
                onChange={(e) => setGlobalSettings({
                  ...globalSettings,
                  carouselEnabled: e.target.value === 'true'
                })}
                className="setting-input"
              >
                <option value="true">✅ Activé</option>
                <option value="false">❌ Désactivé</option>
              </select>
              <small>Afficher ou masquer le carrousel sur la page d'accueil</small>
            </div>

            <div className="setting-group">
              <label>
                <span className="label-icon">📏</span>
                Hauteur du carrousel
              </label>
              <select
                value={globalSettings.carouselHeight}
                onChange={(e) => setGlobalSettings({
                  ...globalSettings,
                  carouselHeight: e.target.value
                })}
                className="setting-input"
              >
                <option value="350px">Petit (350px)</option>
                <option value="400px">Moyen-petit (400px)</option>
                <option value="450px">Moyen (450px)</option>
                <option value="500px">Standard (500px) - Recommandé</option>
                <option value="550px">Grand (550px)</option>
                <option value="600px">Très grand (600px)</option>
                <option value="650px">Extra large (650px)</option>
              </select>
              <small>Hauteur d'affichage du carrousel en pixels</small>
            </div>

            <div className="setting-group">
              <label>
                <span className="label-icon">⏱️</span>
                Durée d'affichage des slides
              </label>
              <select
                value={globalSettings.carouselAutoplayInterval}
                onChange={(e) => setGlobalSettings({
                  ...globalSettings,
                  carouselAutoplayInterval: parseInt(e.target.value)
                })}
                className="setting-input"
              >
                <option value={3000}>3 secondes (rapide)</option>
                <option value={4000}>4 secondes</option>
                <option value={5000}>5 secondes</option>
                <option value={6000}>6 secondes (recommandé)</option>
                <option value={7000}>7 secondes</option>
                <option value={8000}>8 secondes</option>
                <option value={10000}>10 secondes (lent)</option>
              </select>
              <small>Temps avant passage automatique à la slide suivante</small>
            </div>

            <div className="setting-group">
              <label>
                <span className="label-icon">🎬</span>
                Durée de transition
              </label>
              <select
                value={globalSettings.carouselTransitionDuration}
                onChange={(e) => setGlobalSettings({
                  ...globalSettings,
                  carouselTransitionDuration: parseInt(e.target.value)
                })}
                className="setting-input"
              >
                <option value={500}>0.5 seconde (rapide)</option>
                <option value={800}>0.8 seconde</option>
                <option value={1000}>1 seconde (recommandé)</option>
                <option value={1200}>1.2 secondes</option>
                <option value={1500}>1.5 secondes (lent)</option>
              </select>
              <small>Durée de l'animation entre les slides</small>
            </div>

            <div className="settings-preview">
              <h3>👁️ Aperçu des paramètres</h3>
              <div className="preview-grid">
                <div className="preview-item">
                  <strong>État :</strong> {globalSettings.carouselEnabled ? '✅ Activé' : '❌ Désactivé'}
                </div>
                <div className="preview-item">
                  <strong>Hauteur :</strong> {globalSettings.carouselHeight}
                </div>
                <div className="preview-item">
                  <strong>Défilement :</strong> Toutes les {globalSettings.carouselAutoplayInterval / 1000}s
                </div>
                <div className="preview-item">
                  <strong>Transition :</strong> {globalSettings.carouselTransitionDuration / 1000}s
                </div>
              </div>
            </div>

            <button className="btn-save-settings" onClick={handleSaveSettings}>
              💾 Enregistrer les paramètres
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSlide ? '✏️ Modifier la slide' : '➕ Nouvelle slide'}</h2>
              <button className="btn-close" onClick={closeModal}>✖️</button>
            </div>

            <form onSubmit={handleSubmit} className="slide-form">
              <div className="form-grid">
                <div className="form-left">
                  <div className="form-group">
                    <label>Titre (tag "À LA UNE")</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="À LA UNE"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Sous-titre 1</label>
                      <input
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleInputChange}
                        placeholder="PLUS DE"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mot en surbrillance 1</label>
                      <input
                        type="text"
                        name="highlight"
                        value={formData.highlight}
                        onChange={handleInputChange}
                        placeholder="place"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Sous-titre 2</label>
                      <input
                        type="text"
                        name="subtitle2"
                        value={formData.subtitle2}
                        onChange={handleInputChange}
                        placeholder="POUR"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mot en surbrillance 2</label>
                      <input
                        type="text"
                        name="highlight2"
                        value={formData.highlight2}
                        onChange={handleInputChange}
                        placeholder="EUX"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Le camp GJ, des moments inoubliables..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="text"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      placeholder="Du 08/08/2026 au 11/08/2026"
                    />
                  </div>

                  <div className="form-group">
                    <label>Ordre d'affichage</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-right">
                  <div className="form-group">
                    <label>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Aperçu" />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>🎬 Animation du texte</label>
                    <select
                      name="textAnimation"
                      value={formData.textAnimation}
                      onChange={handleInputChange}
                    >
                      {textAnimations.map(anim => (
                        <option key={anim.value} value={anim.value}>
                          {anim.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>🖼️ Animation de l'image</label>
                    <select
                      name="imageAnimation"
                      value={formData.imageAnimation}
                      onChange={handleInputChange}
                    >
                      {imageAnimations.map(anim => (
                        <option key={anim.value} value={anim.value}>
                          {anim.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="animation-preview-info">
                    <h4>ℹ️ Aperçu des animations</h4>
                    <p><strong>Texte:</strong> {textAnimations.find(a => a.value === formData.textAnimation)?.label}</p>
                    <p><strong>Image:</strong> {imageAnimations.find(a => a.value === formData.imageAnimation)?.label}</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-save">
                  {editingSlide ? '💾 Enregistrer' : '➕ Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselManagement;
