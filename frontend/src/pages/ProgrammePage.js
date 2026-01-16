import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import '../styles/ProgrammePage.css';


function ProgrammePage() {
  const [activities, setActivities] = useState([]);
  const { isAuthenticated, token, user, refreshUser } = useContext(AuthContext);
  const [selectedCreneaux, setSelectedCreneaux] = useState(user?.selectedCreneaux || {});
  const joursDisponibles = Array.from(new Set(activities.map(act => act.jour))).sort((a, b) => a - b);
  const [selectedDay, setSelectedDay] = useState(joursDisponibles[0] || 1);
  const [hasRegistration, setHasRegistration] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

  // Vérifier si l'utilisateur a une inscription validée
  useEffect(() => {
    const checkRegistration = async () => {
      if (!token) {
        setCheckingRegistration(false);
        setHasRegistration(false);
        return;
      }

      try {
        const response = await axios.get('/api/registration/mes-inscriptions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Vérifier si l'utilisateur a au moins une inscription
        if (response.data?.registrations && response.data.registrations.length > 0) {
          // Prendre la première inscription (la plus récente)
          const registration = response.data.registrations[0];
          // Autoriser l'accès même avec paiement partiel
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
  }, [token]);

  // Mettre à jour selectedCreneaux quand user change
  useEffect(() => {
    if (user?.selectedCreneaux) {
      setSelectedCreneaux(user.selectedCreneaux);
      console.log('✅ Créneaux mis à jour depuis user:', user.selectedCreneaux);
    }
  }, [user]);

  // Rafraîchir les données utilisateur au chargement
  useEffect(() => {
    if (refreshUser) {
      refreshUser();
    }
  }, [refreshUser]);

  // Charger les activités depuis l'API
  async function fetchActivities() {
    try {
      const response = await axios.get('/api/activities');
      // Gérer les deux formats : array direct ou objet avec propriété activities
      const data = Array.isArray(response.data) ? response.data : (response.data.activities || []);
      setActivities(data);
    } catch (error) {
      console.error('Erreur lors du chargement des activités', error);
      setActivities([]);
    }
  }


  // Sélectionner/désélectionner une activité optionnelle

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  // Filtrer et trier les activités du jour sélectionné
  const currentDayActivities = activities
    .filter(act => act.jour === selectedDay)
    .sort((a, b) => {
      const parseHeure = h => h ? h.replace('h', ':') : '';
      const toMinutes = h => {
        if (!h) return 0;
        const [hh, mm] = parseHeure(h).split(':');
        return parseInt(hh, 10) * 60 + (parseInt(mm, 10) || 0);
      };
      return toMinutes(a.heureDebut) - toMinutes(b.heureDebut);
    });


  // Fusionner et trier toutes les activités du jour (obligatoires + optionnelles choisies)
  const activitesObligatoires = currentDayActivities.filter(act => act.type === 'obligatoire');
  const activitesOptionnellesChoisies = currentDayActivities.filter(
    act => act.type === 'optionnelle' && Object.values(selectedCreneaux).includes(act._id)
  );
  // Fusion chronologique
  const activitesChrono = [...activitesObligatoires, ...activitesOptionnellesChoisies].sort((a, b) => {
    const toMinutes = (heure) => {
      if (!heure) return 0;
      const [hh, mm] = heure.split(':');
      return parseInt(hh, 10) * 60 + (parseInt(mm, 10) || 0);
    };
    return toMinutes(a.heureDebut) - toMinutes(b.heureDebut);
  });

  if (checkingRegistration) {
    return (
      <div className="programme-page-container">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          ⏳ Vérification de votre inscription...
        </div>
      </div>
    );
  }

  if (!hasRegistration) {
    return (
      <div className="programme-page-container">
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
            Vous devez être inscrit au camp avec un paiement validé pour accéder à votre programme personnalisé.
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

  return (
    <div className="programme-page-container">
      <h2 className="programme-title">Mon programme personnalisé</h2>
      {/* Boutons de sélection de jour */}
      <div className="jour-selector">
        {joursDisponibles.map(jour => (
          <button
            key={jour}
            className={`jour-btn${jour === selectedDay ? ' active' : ''}`}
            onClick={() => setSelectedDay(jour)}
          >
            Jour {jour}
          </button>
        ))}
      </div>

      {/* Timeline verticale simple des activités */}
      <div className="activities-timeline-vertical">
        {currentDayActivities.length === 0 ? (
          <div className="no-activities">
            <p>Aucune activité programmée pour ce jour</p>
          </div>
        ) : (
          <ul className="timeline-list">
            {/* Affichage chronologique de toutes les activités du jour (obligatoires + optionnelles choisies) */}
            {activitesChrono.map((activity, index) => (
              <li key={activity._id} className={`timeline-item ${activity.type}`}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-time">{activity.heureDebut}{activity.heureFin && ` - ${activity.heureFin}`}</div>
                  <div className="timeline-title-row">
                    <h3 className="timeline-title">{activity.titre}</h3>
                    <span className={`timeline-badge ${activity.type}`}>{activity.type === 'obligatoire' ? 'Obligatoire' : 'Optionnelle (choisie)'}</span>
                  </div>
                  <p className="timeline-desc">{activity.description}</p>
                  {activity.fichierPdf && (
                    <a
                      href={getApiUrl(activity.fichierPdf)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="timeline-pdf-link"
                    >
                      Voir le document
                    </a>
                  )}
                  {activity.type === 'obligatoire' && (
                    <div className="obligatoire-notice">Activité obligatoire pour tous</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Activités choisies pour ce jour (programme personnalisé) */}
      {isAuthenticated && (activitesObligatoires.length > 0 || activitesOptionnellesChoisies.length > 0) && (
        <div className={`selected-summary ${isSummaryCollapsed ? 'collapsed' : ''}`}>
          <div className="summary-header">
            <h3>📌 Mon programme pour le jour {selectedDay}</h3>
            <button 
              className="summary-toggle-btn"
              onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
              title={isSummaryCollapsed ? 'Agrandir' : 'Réduire'}
            >
              {isSummaryCollapsed ? '▲' : '▼'}
            </button>
          </div>
          {!isSummaryCollapsed && (
            <ul>
              {activitesObligatoires.map(act => (
                <li key={act._id}><b>{act.titre}</b> <span style={{color:'#764ba2'}}>(Obligatoire)</span></li>
              ))}
              {activitesOptionnellesChoisies.map(act => (
                <li key={act._id}>{act.titre} <span style={{color:'#d4af37'}}>(Choix)</span></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgrammePage;

