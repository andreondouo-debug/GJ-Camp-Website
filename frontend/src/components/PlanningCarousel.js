import React, { useEffect, useState, useRef } from 'react';
import { getApiUrl } from '../config/api';
import './PlanningCarousel.css';

/**
 * Composant interactif pour la sélection du planning d'un jour donné.
 * - Affiche les activités fixes (obligatoires ou optionnelles sans choix) en carousel automatique (5s)
 * - Affiche les créneaux à choix multiples avec validation obligatoire
 * - Affiche images, titres, descriptions
 */
function PlanningCarousel({ activities, selectedCreneaux, onValidateCreneau, day, onFinish, hasRegistration = true }) {
  // Trier les activités par heure de début
  const sorted = [...activities].sort((a, b) => {
    const toMinutes = h => {
      if (!h) return 0;
      const [hh, mm] = h.replace('h', ':').split(':');
      return parseInt(hh, 10) * 60 + (parseInt(mm, 10) || 0);
    };
    return toMinutes(a.heureDebut) - toMinutes(b.heureDebut);
  });

  // Regrouper par créneau (heureDebut-heureFin)
  const creneaux = [];
  sorted.forEach(act => {
    const key = `${act.heureDebut || ''}-${act.heureFin || ''}`;
    let group = creneaux.find(c => c.key === key);
    if (!group) {
      group = { key, heureDebut: act.heureDebut, heureFin: act.heureFin, acts: [] };
      creneaux.push(group);
    }
    group.acts.push(act);
  });


  // Index du créneau affiché
  const [currentIdx, setCurrentIdx] = useState(0);
  const timerRef = useRef();

  // Remettre à zéro à chaque changement de jour ou d'activités
  useEffect(() => {
    setCurrentIdx(0);
  }, [day]);

  // Suppression de l'avance automatique pour les activités obligatoires

  // Validation d'un créneau à choix
  const [choix, setChoix] = useState(selectedCreneaux || {});
  const handleChoix = (creneauKey, actId) => {
    setChoix(prev => ({ ...prev, [creneauKey]: actId }));
  };
  const [readyToSave, setReadyToSave] = useState(false);
  const handleValider = () => {
    const group = creneaux[currentIdx];
    if (group.acts.length > 1) {
      onValidateCreneau(group.key, choix[group.key]);
    }
    // Si c'est le dernier créneau, on prépare l'enregistrement
    if (currentIdx === creneaux.length - 1) {
      setReadyToSave(true);
    } else {
      setCurrentIdx(idx => Math.min(idx + 1, creneaux.length - 1));
    }
  };
  const handleSuivant = () => {
    // Si c'est le dernier créneau, on prépare l'enregistrement
    if (currentIdx === creneaux.length - 1) {
      setReadyToSave(true);
    } else {
      setCurrentIdx(idx => Math.min(idx + 1, creneaux.length - 1));
    }
  };
  const handleEnregistrer = () => {
    onFinish && onFinish(choix);
  };

  // Fin du jour
  useEffect(() => {
    if (currentIdx >= creneaux.length) {
      onFinish && onFinish(choix);
    }
  }, [currentIdx, creneaux.length, onFinish, choix]);

  if (currentIdx >= creneaux.length) {
    return <div className="planning-finished">✅ Sélection terminée pour le jour {day} !</div>;
  }

  const group = creneaux[currentIdx];
  return (
    <div className="planning-carousel">
      <div className="planning-creneau-label">
        <span className="time-icon">🕐</span> {group.heureDebut}{group.heureFin && ` - ${group.heureFin}`}
      </div>
      <div className={`planning-activities-group ${group.acts.length > 1 ? 'multiple' : 'single'}`}> 
        {group.acts.map(act => (
          <div
            key={act._id}
            className={`planning-activity-card${choix[group.key] === act._id ? ' selected' : ''}`}
            onClick={() => group.acts.length > 1 && handleChoix(group.key, act._id)}
          >
            {act.image && (
              <div className="planning-activity-image">
                <img src={getApiUrl(act.image)} alt={act.titre} />
              </div>
            )}
            <div className="planning-activity-content">
              <h3>{act.titre}</h3>
              <p>{act.description}</p>
              {act.fichierPdf && (
                <a
                  href={getApiUrl(act.fichierPdf)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="planning-pdf-link"
                  onClick={e => e.stopPropagation()}
                >
                  📄 Voir le document
                </a>
              )}
            </div>
            {group.acts.length > 1 && (
              <div className="planning-radio-custom">
                <input
                  type="radio"
                  name={`creneau-${group.key}`}
                  checked={choix[group.key] === act._id}
                  onChange={() => handleChoix(group.key, act._id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {act.type === 'obligatoire' && <div className="planning-badge-obligatoire">Obligatoire</div>}
          </div>
        ))}
      </div>
      {/* Si on est prêt à enregistrer (après validation du dernier créneau) */}
      {readyToSave && hasRegistration ? (
        <button
          className="planning-btn-valider"
          onClick={handleEnregistrer}
        >
          Enregistrer mes choix
        </button>
      ) : (
        <>
          {/* Si créneau à choix multiples : bouton valider (seulement si inscrit) */}
          {group.acts.length > 1 && hasRegistration && (
            <button
              className="planning-btn-valider"
              onClick={handleValider}
              disabled={!choix[group.key]}
            >
              Valider ce choix
            </button>
          )}
          {/* Si créneau à choix multiples MAIS non inscrit : bouton suivant */}
          {group.acts.length > 1 && !hasRegistration && (
            <button
              className="planning-btn-valider"
              onClick={handleSuivant}
            >
              {currentIdx === creneaux.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          )}
          {/* Si activité obligatoire ou unique : bouton suivant */}
          {group.acts.length === 1 && (
            <button
              className="planning-btn-valider"
              onClick={handleSuivant}
            >
              {currentIdx === creneaux.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default PlanningCarousel;
