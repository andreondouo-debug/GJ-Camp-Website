import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import '../styles/GJSettingsPage.css';

function GJSettingsPage() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('leaders');
  const [message, setMessage] = useState({ type: '', text: '' });

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
  }, []);

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

      {/* Tab: Contenu Page (À venir) */}
      {activeTab === 'content' && (
        <div className="gj-tab-content">
          <div className="gj-coming-soon">
            <h2>📝 Personnalisation du Contenu</h2>
            <p>Cette section permettra de personnaliser les textes, couleurs et images de la page GJ.</p>
            <p className="gj-coming-soon-note">🚧 Fonctionnalité à venir...</p>
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
