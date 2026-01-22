import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import '../styles/GJPage.css';

function GJPage() {
  const [leadersByCampus, setLeadersByCampus] = useState({});
  const [loading, setLoading] = useState(true);
  const [photoModal, setPhotoModal] = useState({ isOpen: false, photoUrl: '', leaderName: '' });
  const [logoUrl, setLogoUrl] = useState('/images/logo-gj.png');

  useEffect(() => {
    fetchCampusLeaders();
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/settings'));
      if (response.data.settings && response.data.settings.logoUrl) {
        setLogoUrl(response.data.settings.logoUrl);
      }
    } catch (error) {
      console.error('❌ Erreur chargement logo:', error);
    }
  };

  const fetchCampusLeaders = async () => {
    try {
      console.log('🔄 Chargement des responsables de campus...');
      const response = await axios.get(getApiUrl('/api/campus-leaders'));
      
      if (response.data.success) {
        setLeadersByCampus(response.data.leadersByCampus);
        console.log(`✅ ${response.data.count} responsables chargés`);
      }
    } catch (error) {
      console.error('❌ Erreur chargement responsables:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="gj-page">
      {/* Hero Section */}
      <section className="gj-hero">
        <div className="gj-hero-overlay"></div>
        <div className="gj-hero-content">
          <div className="gj-logo-circle">
            <img src={logoUrl} alt="Génération Josué" className="gj-logo-img" />
          </div>
          <h1 className="gj-hero-title">Génération Josué</h1>
          <p className="gj-hero-subtitle">
            Le mouvement jeunesse où les 15-30 ans peuvent grandir dans leur foi 
            et avoir un impact pour le Royaume de Dieu
          </p>
        </div>
      </section>

      {/* Notre Jeunesse Section */}
      <section className="gj-generation">
        <div className="gj-container">
          <div className="gj-generation-content">
            <div className="gj-generation-left">
              <div className="gj-section-badge light">Notre Jeunesse</div>
              <h2 className="gj-generation-title">Génération Josué</h2>
              <p className="gj-generation-lead">
                Un mouvement dynamique de jeunes passionnés par Dieu, engagés dans leur 
                communauté et déterminés à faire une différence dans le monde.
              </p>
              <ul className="gj-generation-features">
                <li>
                  <span className="gj-feature-icon">🙏</span>
                  <span>Des moments de louange puissants</span>
                </li>
                <li>
                  <span className="gj-feature-icon">📖</span>
                  <span>Enseignements bibliques pertinents</span>
                </li>
                <li>
                  <span className="gj-feature-icon">🤝</span>
                  <span>Communauté fraternelle et authentique</span>
                </li>
                <li>
                  <span className="gj-feature-icon">🎯</span>
                  <span>Projets d'évangélisation et missions</span>
                </li>
                <li>
                  <span className="gj-feature-icon">🌟</span>
                  <span>Développement du leadership</span>
                </li>
              </ul>
              <a href="/" className="gj-cta-btn">
                Rejoindre Génération Josué →
              </a>
            </div>
            <div className="gj-generation-right">
              <div className="gj-generation-visual">
                <div className="gj-generation-circle">
                  <span className="gj-generation-emoji">🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Groupes de Jeunesse par Église */}
      <section className="gj-campus-groups">
        <div className="gj-container">
          <div className="gj-section-badge">Nos Groupes</div>
          <h2 className="gj-section-title">Groupes de Jeunesse par Église</h2>
          <p className="gj-section-subtitle">
            Retrouvez votre groupe de jeunesse près de chez vous et rencontrez vos responsables
          </p>

          {Object.keys(leadersByCampus).length === 0 ? (
            <div className="gj-no-data">
              <p>Aucun groupe de jeunesse disponible pour le moment.</p>
            </div>
          ) : (
            <div className="gj-campus-grid">
              {Object.entries(leadersByCampus).map(([campusName, data], index) => (
                <div key={index} className="gj-campus-card">
                  <div className="gj-campus-header">
                    <div className="gj-campus-icon">🏛️</div>
                    <div>
                      <h3 className="gj-campus-name">{data.campus?.name || campusName}</h3>
                      {data.campus?.city && (
                        <div className="gj-campus-city">📍 {data.campus.city}</div>
                      )}
                    </div>
                  </div>

                  <div className="gj-leaders-section">
                    <h4 className="gj-leaders-title">
                      Responsable{data.leaders.length > 1 ? 's' : ''} du groupe
                    </h4>
                    <div className="gj-leaders-list">
                      {data.leaders.map((leader, leaderIndex) => (
                        <div key={leaderIndex} className="gj-leader-card">
                          {leader.photo?.url && (
                            <div className="gj-leader-photo-wrapper">
                              <img 
                                src={leader.photo.url} 
                                alt={`${leader.firstName} ${leader.lastName}`}
                                className="gj-leader-photo"
                                onClick={() => setPhotoModal({ 
                                  isOpen: true, 
                                  photoUrl: leader.photo.url, 
                                  leaderName: `${leader.firstName} ${leader.lastName}` 
                                })}
                                style={{ cursor: 'pointer' }}
                                title="Cliquer pour agrandir"
                              />
                            </div>
                          )}
                          <div className="gj-leader-info">
                            <div className="gj-leader-name">
                              {leader.firstName} {leader.lastName}
                            </div>
                            {leader.role && (
                              <div className="gj-leader-role">{leader.role}</div>
                            )}
                            <div className="gj-leader-contacts">
                              <a 
                                href={`mailto:${leader.email}`}
                                className="gj-leader-contact"
                                title="Envoyer un email"
                              >
                                ✉️ {leader.email}
                              </a>
                              <a 
                                href={`tel:${leader.phone}`}
                                className="gj-leader-contact"
                                title="Appeler"
                              >
                                📞 {leader.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="gj-cta">
        <div className="gj-container">
          <h2>Rejoignez-nous !</h2>
          <p>
            Trouvez un groupe près de chez vous et faites partie de notre famille
          </p>
          <a href="/tableau-de-bord" className="gj-cta-button">
            Accéder au tableau de bord
          </a>
        </div>
      </section>

      {/* Modal pour agrandir les photos */}
      {photoModal.isOpen && (
        <div 
          className="gj-photo-modal"
          onClick={() => setPhotoModal({ isOpen: false, photoUrl: '', leaderName: '' })}
        >
          <div className="gj-photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="gj-photo-modal-close"
              onClick={() => setPhotoModal({ isOpen: false, photoUrl: '', leaderName: '' })}
              aria-label="Fermer"
            >
              ✕
            </button>
            <img 
              src={photoModal.photoUrl} 
              alt={photoModal.leaderName}
              className="gj-photo-modal-img"
            />
            <div className="gj-photo-modal-caption">
              {photoModal.leaderName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GJPage;
