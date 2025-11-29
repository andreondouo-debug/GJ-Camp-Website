import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/ProgrammePage.css';


function ProgrammePage() {
  const [activities, setActivities] = useState([]);
  const { isAuthenticated, token, user } = useContext(AuthContext);
  const selectedCreneaux = user?.selectedCreneaux || {};
  const joursDisponibles = Array.from(new Set(activities.map(act => act.jour))).sort((a, b) => a - b);
  const [selectedDay, setSelectedDay] = useState(joursDisponibles[0] || 1);

  // Charger les activités depuis l'API
  async function fetchActivities() {
    try {
      const response = await axios.get('/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des activités', error);
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
                      href={`http://localhost:5000${activity.fichierPdf}`}
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
        <div className="selected-summary">
          <h3>📌 Mon programme pour le jour {selectedDay}</h3>
          <ul>
            {activitesObligatoires.map(act => (
              <li key={act._id}><b>{act.titre}</b> <span style={{color:'#764ba2'}}>(Obligatoire)</span></li>
            ))}
            {activitesOptionnellesChoisies.map(act => (
              <li key={act._id}>{act.titre} <span style={{color:'#d4af37'}}>(Choix)</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProgrammePage;

