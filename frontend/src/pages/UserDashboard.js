import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PayPalButton from '../components/PayPalButton';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getApiUrl } from '../config/api';
import '../styles/UserDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// Icônes SVG
const UserIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CheckCircleIcon = ({ size = 24, color = "#2ecc71" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ClockIcon = ({ size = 24, color = "#f39c12" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CameraIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const ActivityIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const CalendarIcon = ({ size = 20, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const MapPinIcon = ({ size = 20, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const DollarIcon = ({ size = 24, color = "#9b59b6" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const UserDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [guests, setGuests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [partialAmount, setPartialAmount] = useState(0);
  const [showPayPalButton, setShowPayPalButton] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paypal'); // 'paypal' ou 'cash'
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchUserRegistration();
      fetchUserGuests();
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Recharger les activités quand les sélections de l'utilisateur changent
  useEffect(() => {
    if (user) {
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.selectedActivities]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des infos utilisateur:', err);
    }
  };

  const fetchUserRegistration = async () => {
    try {
      console.log('🔍 Récupération des inscriptions avec token:', token ? 'présent' : 'absent');
      const response = await axios.get('/api/registration/mes-inscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Réponse inscriptions:', response.data);
      
      if (response.data.registrations && response.data.registrations.length > 0) {
        console.log('✅ Inscription trouvée:', response.data.registrations[0]);
        setRegistration(response.data.registrations[0]);
      } else {
        console.log('⚠️ Aucune inscription trouvée');
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération de l\'inscription:', err);
      console.error('Détails:', err.response?.data);
      setLoading(false);
    }
  };

  const fetchUserGuests = async () => {
    try {
      const response = await axios.get('/api/registration/mes-invites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('👥 Invités récupérés:', response.data.guests);
      setGuests(response.data.guests || []);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des invités:', err);
      setGuests([]);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/activities');
      const data = Array.isArray(response.data) ? response.data : (response.data.activities || []);
      console.log(`📋 ${data.length} activités chargées`);
      
      // Filtrer pour n'afficher que les activités obligatoires + les optionnelles sélectionnées
      const userSelectedIds = user?.selectedActivities || [];
      const filteredActivities = data.filter(activity => 
        activity.type === 'obligatoire' || userSelectedIds.includes(activity._id)
      );
      
      console.log(`✅ ${filteredActivities.length} activités pour cet utilisateur`);
      setActivities(filteredActivities);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des activités:', err);
      // En cas d'erreur, garder un tableau vide
      setActivities([]);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', file);

    setUploadingPhoto(true);
    try {
      const response = await axios.post('/api/auth/upload-photo', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUserInfo({ ...userInfo, profilePhoto: response.data.profilePhoto });
      alert('Photo de profil mise à jour avec succès!');
    } catch (err) {
      console.error('Erreur lors de l\'upload de la photo:', err);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAdditionalPayment = async (details) => {
    try {
      const targetRegistration = selectedGuest || registration;
      const response = await axios.put(
        `/api/registration/${targetRegistration._id}/additional-payment`,
        {
          additionalAmount: parseFloat(partialAmount),
          paymentDetails: {
            orderID: details.id,
            payerID: details.payer.payer_id,
            payerEmail: details.payer.email_address,
            status: details.status,
            amountPaid: parseFloat(partialAmount)
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (selectedGuest) {
        // Paiement pour un invité
        const newRemaining = targetRegistration.amountRemaining - parseFloat(partialAmount);
        if (newRemaining === 0) {
          alert('🎉 Paiement réussi ! L\'inscription de votre invité est maintenant complète.');
        } else {
          alert(`✅ Paiement de ${partialAmount}€ réussi ! Reste à payer : ${newRemaining}€`);
        }
        fetchUserGuests();
      } else {
        // Paiement pour soi-même
        setRegistration(response.data.registration);
        const newRemaining = targetRegistration.amountRemaining - parseFloat(partialAmount);
        if (newRemaining === 0) {
          alert('🎉 Paiement réussi ! Votre inscription est maintenant complète.');
        } else {
          alert(`✅ Paiement de ${partialAmount}€ réussi ! Reste à payer : ${newRemaining}€`);
        }
        fetchUserRegistration();
      }
      
      setShowPaymentModal(false);
      setSelectedGuest(null);
      setPartialAmount(0);
      setShowPayPalButton(false);
      setPaymentMethod('paypal');
    } catch (err) {
      console.error('Erreur lors du paiement supplémentaire:', err);
      alert('❌ Erreur lors du paiement. Veuillez réessayer.');
    }
  };

  const handleCashPayment = async () => {
    try {
      const targetRegistration = selectedGuest || registration;
      const response = await axios.post(
        `/api/registration/${targetRegistration._id}/cash-payment`,
        { amount: parseFloat(partialAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Paiement de ${partialAmount}€ en espèces enregistré. En attente de validation par un responsable.`);
      
      if (selectedGuest) {
        fetchUserGuests();
      } else {
        fetchUserRegistration();
      }
      
      setShowPaymentModal(false);
      setSelectedGuest(null);
      setPartialAmount(0);
      setShowPayPalButton(false);
      setPaymentMethod('paypal');
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du paiement espèces:', err);
      alert(err.response?.data?.message || '❌ Erreur lors de l\'enregistrement du paiement');
    }
  };

  const getPaymentChartData = () => {
    if (!registration) return null;

    return {
      labels: ['Montant payé', 'Reste à payer'],
      datasets: [
        {
          data: [registration.amountPaid || 0, registration.amountRemaining || 0],
          backgroundColor: [
            'rgba(46, 204, 113, 0.85)',
            'rgba(231, 76, 60, 0.85)'
          ],
          borderColor: ['#ffffff', '#ffffff'],
          borderWidth: 4,
          hoverBackgroundColor: [
            'rgba(46, 204, 113, 1)',
            'rgba(231, 76, 60, 1)'
          ],
          hoverBorderColor: ['#ffffff', '#ffffff'],
          hoverBorderWidth: 6,
          offset: [15, 10],
          spacing: 3,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}€ (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    elements: {
      arc: {
        borderWidth: 4,
        borderColor: '#ffffff',
        hoverBorderWidth: 6,
        hoverOffset: 15
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    layout: {
      padding: 15
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { text: 'Payé', class: 'status-paid', icon: <CheckCircleIcon size={18} color="#2ecc71" /> },
      partial: { text: 'Partiel', class: 'status-partial', icon: <ClockIcon size={18} color="#f39c12" /> },
      unpaid: { text: 'Non payé', class: 'status-unpaid', icon: <ClockIcon size={18} color="#e74c3c" /> }
    };
    return badges[status] || badges.unpaid;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="user-dashboard-container">
        <div className="dashboard-loading">Chargement...</div>
      </div>
    );
  }

  console.log('🎯 État registration:', registration);
  console.log('👤 État userInfo:', userInfo);

  return (
    <div className="user-dashboard-container">
      <div className="dashboard-header">
        <h1>Mon Tableau de Bord</h1>
        <p>Bienvenue {userInfo?.firstName} {userInfo?.lastName}</p>
      </div>

      <div className="dashboard-grid">
        {/* Section Profil */}
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <UserIcon size={24} color="#667eea" />
            <h2>Mon Profil</h2>
          </div>
          <div className="profile-content">
            <div className="profile-photo-section">
              <div className="photo-container">
                {userInfo?.profilePhoto ? (
                  <img src={userInfo.profilePhoto} alt="Profil" className="profile-photo" />
                ) : (
                  <div className="photo-placeholder">
                    <UserIcon size={60} color="#ccc" />
                  </div>
                )}
              </div>
              <label className="photo-upload-btn">
                <CameraIcon size={18} color="#fff" />
                <span>{uploadingPhoto ? 'Upload...' : 'Changer la photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{userInfo?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Église:</span>
                <span className="info-value">{userInfo?.churchWebsite || 'Non renseigné'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Inscription */}
        <div className="dashboard-card inscription-card">
          <div className="card-header">
            <CheckCircleIcon size={24} color="#2ecc71" />
            <h2>Mon Inscription</h2>
          </div>
          {registration ? (
            <div className="inscription-content">
              {/* Barre de progression */}
              <div className="payment-progress-section">
                <div className="progress-header">
                  <div className="status-badge-inline">
                    {getStatusBadge(registration.paymentStatus).icon}
                    <span className={`status-text ${getStatusBadge(registration.paymentStatus).class}`}>
                      {getStatusBadge(registration.paymentStatus).text}
                    </span>
                  </div>
                  <div className="progress-percentage">
                    {Math.round((registration.amountPaid / 120) * 100)}%
                  </div>
                </div>
                
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${Math.round((registration.amountPaid / 120) * 100)}%` }}
                  >
                    <span className="progress-bar-label">{registration.amountPaid}€</span>
                  </div>
                </div>
                
                <div className="progress-labels">
                  <span>0€</span>
                  <span>120€</span>
                </div>
              </div>

              {/* Cartes de paiement */}
              <div className="payment-cards-grid">
                <div className="payment-card total-card">
                  <div className="payment-card-icon">
                    <DollarIcon size={32} color="#667eea" />
                  </div>
                  <div className="payment-card-content">
                    <span className="payment-card-label">Montant Total</span>
                    <span className="payment-card-value">120€</span>
                  </div>
                </div>

                <div className="payment-card paid-card">
                  <div className="payment-card-icon">
                    <CheckCircleIcon size={32} color="#2ecc71" />
                  </div>
                  <div className="payment-card-content">
                    <span className="payment-card-label">Montant Payé</span>
                    <span className="payment-card-value paid">{registration.amountPaid}€</span>
                  </div>
                </div>

                <div className="payment-card remaining-card">
                  <div className="payment-card-icon">
                    <ClockIcon size={32} color="#e74c3c" />
                  </div>
                  <div className="payment-card-content">
                    <span className="payment-card-label">Reste à Payer</span>
                    <span className="payment-card-value remaining">{registration.amountRemaining}€</span>
                  </div>
                </div>
              </div>

              {/* Graphique camembert */}
              <div className="chart-section">
                <h3 className="chart-title">Répartition du Paiement</h3>
                <div className="chart-container">
                  {getPaymentChartData() && (
                    <Pie data={getPaymentChartData()} options={chartOptions} />
                  )}
                </div>
              </div>

              {/* Bouton de paiement du solde si inscription partielle */}
              {registration.paymentStatus === 'partial' && registration.amountRemaining > 0 && (
                <div className="payment-action-section">
                  <button 
                    className="btn-pay-remaining"
                    onClick={() => {
                      setPartialAmount(registration.amountRemaining);
                      setShowPayPalButton(false);
                      setShowPaymentModal(true);
                    }}
                  >
                    💳 Payer le solde ({registration.amountRemaining}€)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="no-inscription">
              <p>Vous n'avez pas encore d'inscription au camp</p>
              <a href="/inscription" className="btn-primary">S'inscrire maintenant</a>
            </div>
          )}
        </div>

        {/* Section Activités */}
        <div className="dashboard-card activities-card">
          <div className="card-header">
            <ActivityIcon size={24} color="#667eea" />
            <h2>Programme des Activités</h2>
          </div>
          <div className="activities-content">
            {activities.length > 0 ? (
              <div className="activities-list">
                {activities.map(activity => (
                  <div key={activity._id} className={`activity-item ${activity.type}`}>
                    <div className="activity-header-item">
                      {activity.image && (
                        <div className="activity-image-small">
                          <img src={getApiUrl(activity.image)} alt={activity.titre} />
                        </div>
                      )}
                      <div className="activity-info">
                        <h3>{activity.titre}</h3>
                        <span className={`activity-badge ${activity.type}`}>
                          {activity.type === 'obligatoire' ? '⭐ Obligatoire' : '💡 Optionnelle'}
                        </span>
                      </div>
                    </div>
                    <p className="activity-description">{activity.description}</p>
                    {activity.fichierPdf && (
                      <a 
                        href={getApiUrl(activity.fichierPdf)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="activity-pdf-link"
                      >
                        📄 Voir le document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-activities">Aucune activité disponible pour le moment</p>
            )}
          </div>
        </div>

        {/* Section Invités */}
        {registration && (
          <div className="dashboard-card guests-card">
            <div className="card-header">
              <UserIcon size={24} color="#667eea" />
              <h2>Mes Invités ({guests.length})</h2>
            </div>
            <div className="guests-content">
              {guests.length > 0 ? (
                <div className="guests-list">
                  {guests.map((guest, index) => (
                    <div key={guest._id} className="guest-item">
                      <div className="guest-number">#{index + 1}</div>
                      <div className="guest-info">
                        <h4>{guest.firstName} {guest.lastName}</h4>
                        <p className="guest-email">✉️ {guest.email}</p>
                        <p className="guest-refuge">🏛️ {guest.refuge}</p>
                      </div>
                      <div className="guest-payment">
                        <div className={`guest-status ${getStatusBadge(guest.paymentStatus).class}`}>
                          {getStatusBadge(guest.paymentStatus).icon}
                          <span>{getStatusBadge(guest.paymentStatus).text}</span>
                        </div>
                        <p className="guest-amount">
                          <strong>{guest.amountPaid}€</strong> / 120€
                        </p>
                        {guest.paymentStatus === 'partial' && guest.amountRemaining > 0 && (
                          <button 
                            className="btn-pay-guest-remaining"
                            onClick={() => {
                              setSelectedGuest(guest);
                              setPartialAmount(guest.amountRemaining);
                              setShowPayPalButton(false);
                              setShowPaymentModal(true);
                            }}
                          >
                            💳 Payer (reste {guest.amountRemaining}€)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-guests">
                  <p>Vous n'avez pas encore inscrit d'invité.</p>
                  <button 
                    className="add-guest-btn"
                    onClick={() => window.location.href = '/inscription-invite'}
                  >
                    👥 Inscrire un invité
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de paiement du solde */}
      {showPaymentModal && (registration || selectedGuest) && (
        <div className="payment-modal-overlay" onClick={() => {
          setShowPaymentModal(false);
          setSelectedGuest(null);
          setPartialAmount(0);
          setShowPayPalButton(false);
          setPaymentMethod('paypal');
        }}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h3>💳 Paiement supplémentaire</h3>
              {selectedGuest && <p className="guest-name-modal">Pour : {selectedGuest.firstName} {selectedGuest.lastName}</p>}
              <button className="modal-close" onClick={() => {
                setShowPaymentModal(false);
                setSelectedGuest(null);
                setPartialAmount(0);
                setShowPayPalButton(false);
                setPaymentMethod('paypal');
              }}>×</button>
            </div>
            <div className="payment-modal-body">
              <div className="payment-summary-modal">
                <div className="summary-row">
                  <span>Montant total :</span>
                  <strong>120€</strong>
                </div>
                <div className="summary-row">
                  <span>Déjà payé :</span>
                  <strong className="text-green">{(selectedGuest || registration).amountPaid}€</strong>
                </div>
                <div className="summary-row total">
                  <span>Reste à payer :</span>
                  <strong className="text-red">{(selectedGuest || registration).amountRemaining}€</strong>
                </div>
              </div>
              
              <div className="partial-payment-input">
                <label htmlFor="partialAmount">Montant à payer maintenant (€) :</label>
                <input
                  type="number"
                  id="partialAmount"
                  value={partialAmount}
                  onChange={(e) => {
                    setPartialAmount(e.target.value);
                    setShowPayPalButton(false);
                  }}
                  min="1"
                  max={(selectedGuest || registration).amountRemaining}
                  step="1"
                />
                <p className="payment-note">
                  Vous pouvez payer de 1€ à {(selectedGuest || registration).amountRemaining}€
                </p>

                {/* Choix du mode de paiement */}
                <div className="payment-method-choice">
                  <label>Mode de paiement :</label>
                  <div className="payment-method-options-modal">
                    <label className={`payment-method-option-modal ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value);
                          setShowPayPalButton(false);
                        }}
                      />
                      <span className="method-icon">💳</span>
                      <span className="method-text">PayPal / CB</span>
                    </label>
                    
                    <label className={`payment-method-option-modal ${paymentMethod === 'cash' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value);
                          setShowPayPalButton(false);
                        }}
                      />
                      <span className="method-icon">💵</span>
                      <span className="method-text">Espèces</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="cash-info-modal">
                    <p>⚠️ <strong>Paiement en espèces</strong></p>
                    <ul>
                      <li>Remettez le montant à un responsable</li>
                      <li>Votre paiement sera validé dans le système</li>
                      <li>Vous recevrez un email de confirmation</li>
                    </ul>
                  </div>
                )}
                
                {!showPayPalButton && partialAmount > 0 && partialAmount <= (selectedGuest || registration).amountRemaining && (
                  <button 
                    className="btn-validate-amount"
                    onClick={() => {
                      if (paymentMethod === 'paypal') {
                        setShowPayPalButton(true);
                      } else {
                        handleCashPayment();
                      }
                    }}
                  >
                    ✓ {paymentMethod === 'paypal' ? `Valider et payer ${partialAmount}€` : `Enregistrer paiement espèces ${partialAmount}€`}
                  </button>
                )}
              </div>

              {showPayPalButton && paymentMethod === 'paypal' && partialAmount > 0 && partialAmount <= (selectedGuest || registration).amountRemaining && (
                <div className="paypal-container-modal">
                  <PayPalButton
                    amount={parseFloat(partialAmount)}
                    onSuccess={handleAdditionalPayment}
                    onError={() => alert('❌ Erreur lors du paiement')}
                    onCancel={() => {
                      setShowPayPalButton(false);
                    }}
                  />
                </div>
              )}
              
              {partialAmount > (selectedGuest || registration).amountRemaining && (
                <p className="error-message">Le montant ne peut pas dépasser {(selectedGuest || registration).amountRemaining}€</p>
              )}
              
              {partialAmount < 1 && partialAmount !== 0 && (
                <p className="error-message">Le montant minimum est de 1€</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
