import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChartIcon, 
  UsersIcon, 
  DownloadIcon, 
  RefreshIcon, 
  ClockIcon, 
  CalendarIcon,
  XIcon,
  EyeIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ImageIcon,
  AlertTriangleIcon
} from '../components/Icons';
import '../styles/ActivityTrackingPage.css';

const ActivityTrackingPage = () => {
  const [statistiques, setStatistiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [hasRegistration, setHasRegistration] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  // Vérifier si l'utilisateur a une inscription validée
  useEffect(() => {
    const checkRegistration = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCheckingRegistration(false);
        setHasRegistration(false);
        return;
      }

      try {
        const response = await axios.get('/api/registration/my-registration', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Vérifier si l'inscription a un paiement complet (paid = 120€)
        if (response.data && response.data.paymentStatus === 'paid') {
          setHasRegistration(true);
        } else {
          setHasRegistration(false);
        }
      } catch (err) {
        console.log('Aucune inscription trouvée ou non validée');
        setHasRegistration(false);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistration();
  }, []);

  useEffect(() => {
    if (hasRegistration) {
      loadStatistics();
    } else {
      setLoading(false);
    }
  }, [hasRegistration]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/activity-tracking/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatistiques(response.data);
      console.log('📊 Statistiques chargées:', response.data.length, 'activités');
    } catch (err) {
      console.error('❌ Erreur lors du chargement des statistiques:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (activityId, activityTitle) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`/api/activity-tracking/${activityId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants_${activityTitle.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      console.log('✅ Export CSV réussi pour:', activityTitle);
    } catch (err) {
      console.error('❌ Erreur lors de l\'export CSV:', err);
      alert('Erreur lors de l\'export CSV');
    }
  };

  const handleShowParticipants = (activity) => {
    setSelectedActivity(activity);
    setShowParticipants(true);
  };

  const getJourLabel = (jour) => {
    const jours = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3', 4: 'Jour 4' };
    return jours[jour] || `Jour ${jour}`;
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (checkingRegistration) {
    return (
      <div className="activity-tracking-container">
        <div className="loading-spinner">
          <RefreshIcon size={40} color="#a01e1e" />
          <span>Vérification de votre inscription...</span>
        </div>
      </div>
    );
  }

  if (!hasRegistration) {
    return (
      <div className="activity-tracking-container">
        <div style={{
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          margin: '80px auto',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#856404', marginBottom: '20px' }}>🔒 Accès restreint</h2>
          <p style={{ color: '#856404', fontSize: '16px', marginBottom: '20px' }}>
            Vous devez être inscrit au camp avec un paiement validé pour accéder au programme.
          </p>
          <a
            href="/inscription"
            style={{
              display: 'inline-block',
              backgroundColor: '#a01e1e',
              color: 'white',
              padding: '12px 30px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              textDecoration: 'none',
              marginTop: '10px'
            }}
          >
            S'inscrire au camp
          </a>
        </div>
      </div>
    );
  }

  if (loading && statistiques.length === 0) {
    return (
      <div className="activity-tracking-container">
        <div className="loading-spinner">
          <RefreshIcon size={40} color="#a01e1e" />
          <span>Chargement des statistiques...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-tracking-container">
        <div className="error-message">
          <AlertTriangleIcon size={24} color="#a01e1e" />
          <span>{error}</span>
        </div>
        <button onClick={loadStatistics} className="btn-retry">
          <RefreshIcon size={20} color="white" />
          <span>Réessayer</span>
        </button>
      </div>
    );
  }

  return (
    <div className="activity-tracking-container">
      <header className="tracking-header">
        <h1>
          <BarChartIcon size={36} color="#a01e1e" />
          <span>Suivi des Inscriptions aux Activités</span>
        </h1>
        <p className="tracking-subtitle">Vue d'ensemble des inscriptions aux activités optionnelles</p>
        <button onClick={loadStatistics} className="btn-refresh">
          <RefreshIcon size={20} color="white" />
          <span>Actualiser</span>
        </button>
      </header>

      {statistiques.length === 0 ? (
        <div className="no-activities">
          <p>Aucune activité optionnelle trouvée.</p>
        </div>
      ) : (
        <div className="statistics-grid">
          {statistiques.map((stat) => (
            <div key={stat.activity._id} className="activity-card">
              <div className="activity-card-header">
                {stat.activity.image && (
                  <img 
                    src={stat.activity.image} 
                    alt={stat.activity.titre}
                    className="activity-card-image"
                  />
                )}
                <div className="activity-card-info">
                  <h2>{stat.activity.titre}</h2>
                  <p className="activity-description">{stat.activity.description}</p>
                  <div className="activity-meta">
                    <span className="activity-day">
                      <CalendarIcon size={16} color="white" />
                      <span>{getJourLabel(stat.activity.jour)}</span>
                    </span>
                    {stat.activity.heureDebut && stat.activity.heureFin && (
                      <span className="activity-time">
                        <ClockIcon size={16} color="#666" />
                        <span>{stat.activity.heureDebut} - {stat.activity.heureFin}</span>
                      </span>
                    )}
                  </div>
                  {stat.activity.referent && (
                    <div className="activity-referent">
                      <UserIcon size={18} color="#555" />
                      <span>Référent: {stat.activity.referent.firstName} {stat.activity.referent.lastName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="activity-card-stats">
                <div className="stat-badge">
                  <span className="stat-number">{stat.inscritCount}</span>
                  <span className="stat-label">Inscrit{stat.inscritCount > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="activity-card-actions">
                <button 
                  onClick={() => handleShowParticipants(stat)}
                  className="btn-view-participants"
                  disabled={stat.inscritCount === 0}
                >
                  <EyeIcon size={20} color="white" />
                  <span>Voir les participants</span>
                </button>
                <button 
                  onClick={() => handleExportCSV(stat.activity._id, stat.activity.titre)}
                  className="btn-export"
                  disabled={stat.inscritCount === 0}
                >
                  <DownloadIcon size={20} color="white" />
                  <span>Exporter CSV</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal des participants */}
      {showParticipants && selectedActivity && (
        <div className="modal-overlay" onClick={() => setShowParticipants(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <UsersIcon size={28} color="white" />
                <span>Participants - {selectedActivity.activity.titre}</span>
              </h2>
              <button 
                onClick={() => setShowParticipants(false)} 
                className="modal-close"
              >
                <XIcon size={24} color="white" />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="participants-count">
                Total: <strong>{selectedActivity.inscritCount}</strong> participant{selectedActivity.inscritCount > 1 ? 's' : ''}
              </p>
              
              {selectedActivity.inscrits.length > 0 ? (
                <div className="participants-table-container">
                  <table className="participants-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Refuge</th>
                        <th>Sexe</th>
                        <th>Âge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedActivity.inscrits.map((participant) => (
                        <tr key={participant._id}>
                          <td>{participant.lastName}</td>
                          <td>{participant.firstName}</td>
                          <td>{participant.email}</td>
                          <td>{participant.phone || 'N/A'}</td>
                          <td>{participant.refuge || 'N/A'}</td>
                          <td>{participant.sex || 'N/A'}</td>
                          <td>{calculateAge(participant.dateOfBirth)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-participants">Aucun participant inscrit.</p>
              )}
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => handleExportCSV(selectedActivity.activity._id, selectedActivity.activity.titre)}
                className="btn-export-modal"
              >
                <DownloadIcon size={20} color="white" />
                <span>Exporter en CSV</span>
              </button>
              <button 
                onClick={() => setShowParticipants(false)} 
                className="btn-close-modal"
              >
                <XIcon size={20} color="white" />
                <span>Fermer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTrackingPage;
