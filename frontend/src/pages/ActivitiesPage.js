import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import PlanningCarousel from '../components/PlanningCarousel';
import DynamicCarousel from '../components/DynamicCarousel';


function ActivitiesPage() {
  const navigate = useNavigate();
  const { user, token, updateUserActivities, refreshUser } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  // Pour la sélection exclusive par créneau :
  // { '08:00-09:00': 'activityId1', '10:00-11:00': 'activityId2', ... }
  const [selectedCreneaux, setSelectedCreneaux] = useState(user?.selectedCreneaux || {});
  const [selectedDay, setSelectedDay] = useState(1);
  // showCarousel dynamique selon le jour sélectionné et les choix enregistrés
  const [showCarousel, setShowCarousel] = useState(true);
  const [hasRegistration, setHasRegistration] = useState(false);

  // Vérifier si l'utilisateur a une inscription validée (pour activer la sélection)
  useEffect(() => {
    const checkRegistration = async () => {
      if (!token) {
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
      }
    };

    checkRegistration();
  }, [token]);

  useEffect(() => {
    // Vérifie s'il y a des choix enregistrés pour le jour sélectionné
    const hasChoicesForDay = Object.entries(user?.selectedCreneaux || {}).some(([creneau, actId]) => {
      // On suppose que les créneaux sont uniques par jour (clé = heureDebut-heureFin)
      // Si besoin, adapter la logique pour filtrer par jour
      const act = activities.find(a => a._id === actId);
      return act && act.jour === selectedDay;
    });
    setShowCarousel(!hasChoicesForDay);
  }, [selectedDay, user?.selectedCreneaux, activities]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedActivityDetail, setSelectedActivityDetail] = useState(null);

  useEffect(() => {
    fetchActivities();
    // Charger les choix enregistrés si présents (mapping creneau -> activité)
    if (user?.selectedCreneaux) {
      setSelectedCreneaux(user.selectedCreneaux);
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/activities');
      console.log('📋 Activités reçues:', response.data);
      const data = Array.isArray(response.data) ? response.data : (response.data.activities || []);
      setActivities(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des activités');
      console.error('❌ Erreur:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner une activité pour un créneau (radio)
  const handleSelectCreneau = (creneauKey, activityId) => {
    setSelectedCreneaux(prev => ({ ...prev, [creneauKey]: activityId }));
  };

  // Sauvegarder les choix de créneaux (mapping creneau -> activitéId)
  const handleSaveSelection = async (creneauxToSave = selectedCreneaux) => {
    if (!token) {
      setError('Vous devez être connecté pour enregistrer vos activités');
      return;
    }
    try {
      setLoading(true);
      // On envoie le mapping creneau -> activitéId au backend
      const response = await axios.patch(
        '/api/auth/update-selected-creneaux',
        { selectedCreneaux: creneauxToSave },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('✅ Vos choix ont été enregistrés avec succès !');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de vos choix');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivitiesByDay = (day) => {
    const filtered = activities.filter(activity => activity.jour === day);
    // Trier par heure de début
    return filtered.sort((a, b) => {
      if (!a.heureDebut) return 1;
      if (!b.heureDebut) return -1;
      return a.heureDebut.localeCompare(b.heureDebut);
    });
  };

  const getActivitiesByType = (day, type) => {
    return getActivitiesByDay(day).filter(activity => activity.type === type);
  };

  // Vérifie si une activité est sélectionnée pour son créneau
  const isActivitySelected = (creneauKey, activityId) => {
    return selectedCreneaux[creneauKey] === activityId;
  };

  const openActivityDetail = (activity) => {
    setSelectedActivityDetail(activity);
  };

  const closeActivityDetail = () => {
    setSelectedActivityDetail(null);
  };

  const currentDayActivities = getActivitiesByDay(selectedDay);
  const obligatoireActivities = getActivitiesByType(selectedDay, 'obligatoire');
  const optionnelleActivities = getActivitiesByType(selectedDay, 'optionnelle');
  // Regrouper les activités optionnelles par créneau horaire
  const optionnellesByCreneau = {};
  optionnelleActivities.forEach(act => {
    const key = `${act.heureDebut || ''}-${act.heureFin || ''}`;
    if (!optionnellesByCreneau[key]) optionnellesByCreneau[key] = [];
    optionnellesByCreneau[key].push(act);
  });

  // Debug logs
  console.log('🔍 Total activities:', activities.length);
  console.log('🔍 Current day:', selectedDay);
  console.log('🔍 Activities for day', selectedDay, ':', currentDayActivities.length);
  console.log('🔍 Obligatoires:', obligatoireActivities.length);
  console.log('🔍 Optionnelles:', optionnelleActivities.length);

  const activityCounts = [1, 2, 3, 4].map(day => ({
    day,
    count: getActivitiesByDay(day).length
  }));

  // Message d'information pour les non-inscrits (sans bloquer l'accès)
  const showInfoMessage = !hasRegistration && token;

  if (loading && activities.length === 0) {
    return (
      <div className="activities-page">
        <div className="loading-spinner">⏳ Chargement des activités...</div>
      </div>
    );
  }

  return (
    <div className="activities-page">
      {/* Carrousel dynamique pour la page Activités */}
      <DynamicCarousel page="activities" height={350} />

      {/* Message d'information pour les non-inscrits */}
      {showInfoMessage && (
        <div style={{
          backgroundColor: '#e7f3ff',
          border: '2px solid #2196F3',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '800px',
          margin: '20px auto',
          textAlign: 'center'
        }}>
          <p style={{ color: '#0d47a1', fontSize: '15px', margin: 0 }}>
            ℹ️ Vous pouvez consulter les activités, mais pour faire vos sélections, 
            veuillez vous <a href="/inscription" style={{ color: '#a01e1e', fontWeight: 'bold' }}>inscrire au camp</a>.
          </p>
        </div>
      )}

      <div className="activities-hero">
        <h1>
          <span style={{display:'inline-block', verticalAlign:'middle', marginRight:'10px'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#764ba2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="4" fill="#fff" stroke="#764ba2" strokeWidth="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="#764ba2" strokeWidth="2"/>
              <rect x="7" y="14" width="2" height="2" fill="#764ba2"/>
              <rect x="11" y="14" width="2" height="2" fill="#764ba2"/>
              <rect x="15" y="14" width="2" height="2" fill="#764ba2"/>
            </svg>
          </span>
          Mon Planning
        </h1>
        <p>Sélectionnez vos activités pour chaque créneau, puis validez.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Sélecteur de jour */}
      <div className="day-selector">
        {activityCounts.map(({ day, count }) => (
          <button
            key={day}
            className={`day-button ${selectedDay === day ? 'active' : ''}`}
            onClick={() => {
              setSelectedDay(day);
              setSelectedCreneaux({});
              setShowCarousel(true);
            }}
          >
            <span className="day-label">Jour {day}</span>
            <span className="activity-count">{count} activité{count > 1 ? 's' : ''}</span>
          </button>
        ))}
      </div>

      {/* Carousel interactif pour la sélection du planning du jour */}
      {showCarousel && currentDayActivities.length > 0 && (
        <PlanningCarousel
          activities={currentDayActivities}
          selectedCreneaux={selectedCreneaux}
          onValidateCreneau={(creneauKey, actId) => setSelectedCreneaux(prev => ({ ...prev, [creneauKey]: actId }))}
          day={selectedDay}
          hasRegistration={hasRegistration}
          onFinish={async (choix) => {
            setSelectedCreneaux(choix);
            setShowCarousel(false);
            await handleSaveSelection(choix);
            await refreshUser();
            setTimeout(() => navigate('/programme'), 800); // Redirige après confirmation
          }}
        />
      )}

      {/* Récapitulatif après validation + bouton pour recommencer */}
      {!showCarousel && (
        <div className="planning-recap">
          <h2>✅ Récapitulatif de mes choix pour le jour {selectedDay}</h2>
          <button
            className="planning-btn-valider"
            style={{marginTop: '1.5rem'}}
            onClick={() => {
              setSelectedCreneaux({});
              setShowCarousel(true);
            }}
          >
            Modifier mon planning pour ce jour
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivitiesPage;
