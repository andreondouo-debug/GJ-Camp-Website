import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import '../styles/ActivitiesManagement.css';

// Icônes SVG
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

function ActivitiesManagement() {
  const createInitialFormState = () => ({
    titre: '',
    description: '',
    type: 'optionnelle',
    heureDebut: '',
    heureFin: '',
    jour: 1,
    referent: ''
  });

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState(createInitialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [detailActivity, setDetailActivity] = useState(null);
  const [selectedJour, setSelectedJour] = useState(null);
  const [responsables, setResponsables] = useState([]);

  useEffect(() => {
    fetchActivities();
    fetchResponsables();
  }, []);

  const fetchResponsables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrer seulement les admins et responsables
      const respList = response.data.filter(u => 
        u.role === 'responsable' || u.role === 'admin'
      );
      setResponsables(respList);
      console.log(`👥 ${respList.length} responsables chargés`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des responsables:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/activities');
      setActivities(response.data);
      if (detailActivity) {
        const refreshed = response.data.find(item => item._id === detailActivity._id);
        setDetailActivity(refreshed || null);
      }
      console.log(`📋 ${response.data.length} activités chargées`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des activités:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const openDetail = (activity) => {
    setDetailActivity(activity);
  };

  const closeDetail = () => {
    setDetailActivity(null);
  };

  const handleEditActivity = (activity) => {
    if (activity) {
      setDetailActivity(null);
      openModal(activity);
    }
  };

  const openModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        titre: activity.titre,
        description: activity.description,
        type: activity.type,
        heureDebut: activity.heureDebut || '',
        heureFin: activity.heureFin || '',
        jour: activity.jour || 1,
        referent: activity.referent?._id || activity.referent || ''
      });
      setImagePreview(activity.image ? getApiUrl(activity.image) : null);
    } else {
      setEditingActivity(null);
      setFormData(createInitialFormState());
      setImagePreview(null);
    }
    setImageFile(null);
    setPdfFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingActivity(null);
    setFormData(createInitialFormState());
    setImageFile(null);
    setPdfFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('jour', formData.jour);
      if (formData.heureDebut) formDataToSend.append('heureDebut', formData.heureDebut);
      if (formData.heureFin) formDataToSend.append('heureFin', formData.heureFin);
      if (formData.referent) formDataToSend.append('referent', formData.referent);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      if (pdfFile) {
        formDataToSend.append('fichierPdf', pdfFile);
      }

      if (editingActivity) {
        // Modification
        await axios.put(
          `/api/activities/${editingActivity._id}`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('✅ Activité modifiée');
      } else {
        // Création
        await axios.post(
          '/api/activities',
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('✅ Activité créée');
      }

      closeModal();
      fetchActivities();
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      const fallbackMessage = 'Erreur lors de la sauvegarde de l\'activité';
      console.error('❌ Erreur lors de la sauvegarde:', {
        status: error.response?.status,
        message: apiMessage,
        details: error.response?.data
      });
      alert(apiMessage || fallbackMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (activityId, titre) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'activité "${titre}" ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/activities/${activityId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('🗑️ Activité supprimée');
      if (detailActivity && detailActivity._id === activityId) {
        setDetailActivity(null);
      }
      if (editingActivity && editingActivity._id === activityId) {
        closeModal();
      }
      fetchActivities();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'activité');
    }
  };

  // Calculer la liste des jours disponibles
  const joursDisponibles = Array.from(new Set(activities.map(a => Number(a.jour)).filter(j => !isNaN(j)))).sort((a, b) => a - b);

  if (loading) {
    return <div className="activities-loading">Chargement des activités...</div>;
  }

  return (
    <div className="activities-management">
      <div className="activities-header">
        <h1>🎯 Gestion des Activités</h1>
        <button className="btn-add-activity" onClick={() => openModal()}>
          <PlusIcon />
          Nouvelle Activité
        </button>
      </div>

      {/* Boutons de sélection des jours */}
      <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
        {joursDisponibles.map(jour => (
          <button
            key={jour}
            className={selectedJour === jour ? 'btn-jour selected' : 'btn-jour'}
            onClick={() => setSelectedJour(jour)}
            style={{padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none', background: selectedJour === jour ? '#6c47d6' : '#e3f0ff', color: selectedJour === jour ? '#fff' : '#1a2340', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}}
          >
            Jour {jour}
          </button>
        ))}
        {selectedJour !== null && (
          <button onClick={() => setSelectedJour(null)} style={{padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none', background: '#f0f0f0', color: '#1a2340', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}}>Tous les jours</button>
        )}
      </div>

      <div className="activities-grid">
        {activities.length === 0 ? (
          <div className="no-activities">
            <p>Aucune activité pour le moment</p>
            <button className="btn-add-activity" onClick={() => openModal()}>
              <PlusIcon /> Créer une activité
            </button>
          </div>
        ) : (
          (selectedJour ? activities.filter(a => Number(a.jour) === selectedJour) : activities)
            .map(activity => (
              <div key={activity._id} className="activity-card">
                <div style={{position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px', zIndex: 3}}>
                  <button
                    className="activity-edit-btn"
                    title="Modifier l'activité"
                    onClick={() => handleEditActivity(activity)}
                    style={{background: 'none', border: 'none', cursor: 'pointer'}}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c47d6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button
                    className="activity-delete-btn"
                    title="Supprimer l'activité"
                    onClick={() => handleDelete(activity._id, activity.titre)}
                    style={{background: 'none', border: 'none', cursor: 'pointer'}}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e57373" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
                <div className="activity-image">
                  {activity.image ? (
                    <img src={getApiUrl(activity.image)} alt={activity.titre} />
                  ) : (
                    <span>Pas d'image</span>
                  )}
                  <div className="activity-hour-badge">
                    <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" style={{marginRight: '6px'}} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {activity.heureDebut || '--:--'} - {activity.heureFin || '--:--'}
                  </div>
                </div>
                <div className="activity-content">
                  <div className="activity-title-row">
                    <h2>{activity.titre}</h2>
                    <span className={`activity-type-badge ${activity.type}`}>{activity.type === 'obligatoire' ? '🔒 Obligatoire' : '💡 Optionnelle'}</span>
                  </div>
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-action">
                    <button type="button">✔️ Ajouter à mes activités</button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingActivity ? 'Modifier l\'activité' : 'Nouvelle activité'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  placeholder="Ex: Atelier musique"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="optionnelle">Optionnelle</option>
                  <option value="obligatoire">Obligatoire</option>
                </select>
              </div>

              <div className="form-group">
                <label>📅 Jour *</label>
                <select
                  name="jour"
                  value={formData.jour}
                  onChange={handleInputChange}
                  required
                >
                  <option value={1}>Jour 1</option>
                  <option value={2}>Jour 2</option>
                  <option value={3}>Jour 3</option>
                  <option value={4}>Jour 4</option>
                </select>
              </div>

              <div className="form-group">
                <label>👤 Référent de l'activité</label>
                <select
                  name="referent"
                  value={formData.referent}
                  onChange={handleInputChange}
                >
                  <option value="">Aucun référent</option>
                  {responsables.map(resp => (
                    <option key={resp._id} value={resp._id}>
                      {resp.firstName} {resp.lastName} ({resp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez l'activité..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>🕐 Heure de début</label>
                  <input
                    type="time"
                    name="heureDebut"
                    value={formData.heureDebut}
                    onChange={handleInputChange}
                    placeholder="09:00"
                  />
                </div>

                <div className="form-group">
                  <label>🕐 Heure de fin</label>
                  <input
                    type="time"
                    name="heureFin"
                    value={formData.heureFin}
                    onChange={handleInputChange}
                    placeholder="12:00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <ImageIcon /> Image
                </label>
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
                <label>
                  <FileIcon /> Document PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                />
                {pdfFile && (
                  <p className="file-selected">📄 {pdfFile.name}</p>
                )}
                {editingActivity && editingActivity.fichierPdf && !pdfFile && (
                  <p className="file-existing">📄 PDF existant</p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Enregistrement...' : (editingActivity ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailActivity && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal-content activity-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Détails de l'activité</h2>

            {detailActivity.image && (
              <div className="detail-image">
                <img src={getApiUrl(detailActivity.image)} alt={detailActivity.titre} />
              </div>
            )}

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Nom de l'activité</span>
                <p>{detailActivity.titre}</p>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type</span>
                <p>{detailActivity.type === 'obligatoire' ? 'Obligatoire' : 'Optionnelle'}</p>
              </div>
              <div className="detail-item">
                <span className="detail-label">Jour</span>
                <p>Jour {detailActivity.jour}</p>
              </div>
              <div className="detail-item">
                <span className="detail-label">Horaires</span>
                <p>
                  {(detailActivity.heureDebut || '--:--')} - {(detailActivity.heureFin || '--:--')}
                </p>
              </div>
            </div>

            <div className="detail-section">
              <span className="detail-label">Description</span>
              <p className="detail-description">{detailActivity.description}</p>
            </div>

            {detailActivity.fichierPdf && (
              <a 
                href={getApiUrl(detailActivity.fichierPdf)}
                target="_blank"
                rel="noopener noreferrer"
                className="activity-pdf-link detail-pdf-link"
              >
                <FileIcon />
                Ouvrir le document PDF
              </a>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeDetail}>
                Fermer
              </button>
              <button type="button" className="btn-submit" onClick={() => handleEditActivity(detailActivity)}>
                Modifier cette activité
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivitiesManagement;
