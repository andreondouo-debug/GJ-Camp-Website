import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import '../styles/GJSettingsPage.css';

const gjDefaults = require('../config/gjPageDefaults');

function GJSettingsPage() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('leaders');
  const [message, setMessage] = useState({ type: '', text: '' });

  // ===== SETTINGS GJ =====
  const [gjSettings, setGjSettings] = useState(gjDefaults);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // ===== GESTION DES RESPONSABLES =====
  const [leaders, setLeaders] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    campusId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Responsable Jeunesse',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchLeadersData();
    fetchGjSettings();
  }, []);

  const fetchGjSettings = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(getApiUrl(`/api/settings/gj?t=${timestamp}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.gjSettings) {
        setGjSettings(response.data.gjSettings);
      }
    } catch (error) {
      console.error('❌ Erreur chargement settings GJ:', error);
    }
  };

  const handleSaveGjSettings = async () => {
    setLoadingSettings(true);
    try {
      const response = await axios.put(
        getApiUrl('/api/settings/gj'),
        { gjSettings },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      showMessage('success', response.data.message);
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      showMessage('error', 'Erreur lors de la sauvegarde');
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchLeadersData = async () => {
    try {
      const [leadersRes, campusesRes] = await Promise.all([
        axios.get(getApiUrl('/api/campus-leaders')),
        axios.get(getApiUrl('/api/campus'))
      ]);

      if (leadersRes.data.success) {
        const leadersArray = Object.values(leadersRes.data.leadersByCampus)
          .flatMap(group => group.leaders);
        setLeaders(leadersArray);
      }

      if (Array.isArray(campusesRes.data)) {
        setCampuses(campusesRes.data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      showMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setLoadingLeaders(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const openModal = (leader = null) => {
    if (leader) {
      setEditingLeader(leader);
      setFormData({
        campusId: leader.campus?._id || leader.campus || '',
        firstName: leader.firstName,
        lastName: leader.lastName,
        email: leader.email,
        phone: leader.phone,
        role: leader.role,
        order: leader.order || 0,
        isActive: leader.isActive !== undefined ? leader.isActive : true
      });
      setPhotoPreview(leader.photo?.url || null);
    } else {
      setEditingLeader(null);
      setFormData({
        campusId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Responsable Jeunesse',
        order: 0,
        isActive: true
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLeader(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let response;
      if (editingLeader) {
        response = await axios.put(
          getApiUrl(`/api/campus-leaders/${editingLeader._id}`),
          formData,
          config
        );
      } else {
        response = await axios.post(
          getApiUrl('/api/campus-leaders'),
          formData,
          config
        );
      }

      // Upload photo si nouvelle
      if (photoFile && response.data.leader) {
        const formDataPhoto = new FormData();
        formDataPhoto.append('photo', photoFile);

        await axios.post(
          getApiUrl(`/api/campus-leaders/${response.data.leader._id}/upload-photo`),
          formDataPhoto,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      showMessage('success', response.data.message);
      closeModal();
      fetchLeadersData();
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      showMessage('error', error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (leaderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce responsable ?')) {
      return;
    }

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.delete(
        getApiUrl(`/api/campus-leaders/${leaderId}`),
        config
      );

      showMessage('success', response.data.message);
      fetchLeadersData();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showMessage('error', error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const updateGjSetting = (section, field, value) => {
    setGjSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showMessage('info', '📤 Upload du logo en cours...');
      
      const response = await axios.post(
        getApiUrl('/api/upload/gj-image'),
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      updateGjSetting('hero', 'logoUrl', response.data.url);
      showMessage('success', '✅ Logo uploadé avec succès !');
    } catch (error) {
      console.error('❌ Erreur upload logo:', error);
      showMessage('error', '❌ Erreur lors de l\'upload du logo');
    }
  };

  return (
    <div className="gj-settings-page">
      <div className="gj-settings-header">
        <h1>⚙️ Paramètres Page Génération Josué</h1>
        <p className="gj-settings-subtitle">
          Gérez les responsables de jeunesse et personnalisez la page GJ
        </p>
      </div>

      {message.text && (
        <div className={`gj-settings-message gj-settings-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="gj-settings-tabs">
        <button
          className={`gj-tab ${activeTab === 'leaders' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaders')}
        >
          👥 Responsables Campus
        </button>
        <button
          className={`gj-tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📝 Contenu Page
        </button>
      </div>

      {/* Tab: Responsables Campus */}
      {activeTab === 'leaders' && (
        <div className="gj-tab-content">
          <div className="gj-leaders-section">
            <div className="gj-section-header">
              <h2>👥 Responsables de Campus</h2>
              <button className="btn-add-leader" onClick={() => openModal()}>
                ➕ Ajouter un responsable
              </button>
            </div>

            {loadingLeaders ? (
              <div className="gj-loading">⏳ Chargement...</div>
            ) : (
              <div className="gj-leaders-grid">
                {leaders.length === 0 ? (
                  <div className="gj-empty-state">
                    <p>Aucun responsable de campus pour le moment.</p>
                    <button className="btn-add-leader" onClick={() => openModal()}>
                      ➕ Ajouter le premier responsable
                    </button>
                  </div>
                ) : (
                  leaders.map((leader) => (
                    <div key={leader._id} className="gj-leader-card">
                      {leader.photo?.url && (
                        <div className="gj-leader-photo">
                          <img src={leader.photo.url} alt={`${leader.firstName} ${leader.lastName}`} />
                        </div>
                      )}
                      <div className="gj-leader-info-section">
                        <h3>{leader.firstName} {leader.lastName}</h3>
                        <p className="gj-leader-role">{leader.role}</p>
                        <p className="gj-leader-campus">
                          🏛️ {leader.campus?.name || 'Campus non défini'}
                        </p>
                        <p className="gj-leader-contact">✉️ {leader.email}</p>
                        <p className="gj-leader-contact">📞 {leader.phone}</p>
                        <div className="gj-leader-status">
                          {leader.isActive ? (
                            <span className="status-active">✅ Actif</span>
                          ) : (
                            <span className="status-inactive">❌ Inactif</span>
                          )}
                        </div>
                      </div>
                      <div className="gj-leader-actions">
                        <button
                          className="btn-edit"
                          onClick={() => openModal(leader)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(leader._id)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Contenu Page */}
      {activeTab === 'content' && (
        <div className="gj-tab-content">
          <div className="gj-content-section">
            <div className="gj-section-header">
              <h2>📝 Personnalisation du Contenu</h2>
              <button 
                className="btn-save-settings" 
                onClick={handleSaveGjSettings}
                disabled={loadingSettings}
              >
                {loadingSettings ? '⏳ Sauvegarde...' : '💾 Enregistrer'}
              </button>
            </div>

            {/* Hero Section */}
            <div className="gj-settings-group">
              <h3 className="group-title">🎬 Section Hero</h3>
              
              <div className="form-group">
                <label>Logo</label>
                <div className="logo-upload-section">
                  {gjSettings.hero.logoUrl && (
                    <div className="logo-preview">
                      <img src={gjSettings.hero.logoUrl} alt="Logo GJ" />
                    </div>
                  )}
                  <div className="logo-upload-controls">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      id="logo-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="logo-upload" className="btn-upload-logo">
                      📤 Changer le logo
                    </label>
                    <small>Format recommandé : PNG avec fond transparent, max 500x500px</small>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={gjSettings.hero.title}
                  onChange={(e) => updateGjSetting('hero', 'title', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Sous-titre</label>
                <textarea
                  rows="3"
                  value={gjSettings.hero.subtitle}
                  onChange={(e) => updateGjSetting('hero', 'subtitle', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Couleur de fond (Gradient)</label>
                <input
                  type="text"
                  value={gjSettings.hero.backgroundColor}
                  onChange={(e) => updateGjSetting('hero', 'backgroundColor', e.target.value)}
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
                <small>Exemple: linear-gradient(135deg, #667eea 0%, #764ba2 100%)</small>
              </div>

              <div className="form-group">
                <label>Taille du logo</label>
                <input
                  type="text"
                  value={gjSettings.hero.logoSize}
                  onChange={(e) => updateGjSetting('hero', 'logoSize', e.target.value)}
                  placeholder="150px"
                />
              </div>
            </div>

            {/* Section Génération */}
            <div className="gj-settings-group">
              <h3 className="group-title">👨‍👩‍👧‍👦 Section Notre Jeunesse</h3>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={gjSettings.generation.enabled}
                    onChange={(e) => updateGjSetting('generation', 'enabled', e.target.checked)}
                  />
                  <span>Activer cette section</span>
                </label>
              </div>

              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={gjSettings.generation.title}
                  onChange={(e) => updateGjSetting('generation', 'title', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={gjSettings.generation.description}
                  onChange={(e) => updateGjSetting('generation', 'description', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Couleur de fond</label>
                <input
                  type="text"
                  value={gjSettings.generation.backgroundColor}
                  onChange={(e) => updateGjSetting('generation', 'backgroundColor', e.target.value)}
                />
              </div>
            </div>

            {/* Section Groupes de Jeunesse */}
            <div className="gj-settings-group">
              <h3 className="group-title">⛪ Section Groupes de Jeunesse</h3>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={gjSettings.youthGroups.enabled}
                    onChange={(e) => updateGjSetting('youthGroups', 'enabled', e.target.checked)}
                  />
                  <span>Activer cette section</span>
                </label>
              </div>

              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={gjSettings.youthGroups.title}
                  onChange={(e) => updateGjSetting('youthGroups', 'title', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Sous-titre</label>
                <textarea
                  rows="2"
                  value={gjSettings.youthGroups.subtitle}
                  onChange={(e) => updateGjSetting('youthGroups', 'subtitle', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={gjSettings.youthGroups.showLeaderPhotos}
                    onChange={(e) => updateGjSetting('youthGroups', 'showLeaderPhotos', e.target.checked)}
                  />
                  <span>Afficher les photos des responsables</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={gjSettings.youthGroups.showContactInfo}
                    onChange={(e) => updateGjSetting('youthGroups', 'showContactInfo', e.target.checked)}
                  />
                  <span>Afficher les informations de contact</span>
                </label>
              </div>
            </div>

            {/* Section CTA */}
            <div className="gj-settings-group">
              <h3 className="group-title">📢 Section Call-to-Action</h3>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={gjSettings.cta.enabled}
                    onChange={(e) => updateGjSetting('cta', 'enabled', e.target.checked)}
                  />
                  <span>Activer cette section</span>
                </label>
              </div>

              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={gjSettings.cta.title}
                  onChange={(e) => updateGjSetting('cta', 'title', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Texte du bouton</label>
                <input
                  type="text"
                  value={gjSettings.cta.buttonText}
                  onChange={(e) => updateGjSetting('cta', 'buttonText', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Lien du bouton</label>
                <input
                  type="text"
                  value={gjSettings.cta.buttonLink}
                  onChange={(e) => updateGjSetting('cta', 'buttonLink', e.target.value)}
                  placeholder="/inscription"
                />
              </div>

              <div className="form-group">
                <label>Couleur de fond</label>
                <input
                  type="text"
                  value={gjSettings.cta.backgroundColor}
                  onChange={(e) => updateGjSetting('cta', 'backgroundColor', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Couleur du bouton</label>
                <input
                  type="text"
                  value={gjSettings.cta.buttonColor}
                  onChange={(e) => updateGjSetting('cta', 'buttonColor', e.target.value)}
                  placeholder="#d4af37"
                />
              </div>
            </div>

            {/* Bouton Enregistrer en bas */}
            <div className="gj-save-footer">
              <button 
                className="btn-save-settings btn-large" 
                onClick={handleSaveGjSettings}
                disabled={loadingSettings}
              >
                {loadingSettings ? '⏳ Sauvegarde en cours...' : '💾 Enregistrer tous les changements'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulaire */}
      {showModal && (
        <div className="gj-modal-overlay" onClick={closeModal}>
          <div className="gj-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gj-modal-header">
              <h2>{editingLeader ? 'Modifier le responsable' : 'Nouveau responsable'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="gj-form">
              <div className="form-group">
                <label>Campus *</label>
                <select
                  name="campusId"
                  value={formData.campusId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionner un campus</option>
                  {campuses.map((campus) => (
                    <option key={campus._id} value={campus._id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rôle *</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
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

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Actif</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {photoPreview && (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Aperçu" />
                  </div>
                )}
                <p className="form-hint">Format recommandé : JPG, PNG (max 5 Mo)</p>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  {editingLeader ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GJSettingsPage;
