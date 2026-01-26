import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import '../styles/GJCRPTPage.css';

const crptDefaults = require('../config/crptPageDefaults');

function GJCRPTPage() {
  const [settings, setSettings] = useState(crptDefaults);
  const [loading, setLoading] = useState(true);
  const [photoModal, setPhotoModal] = useState({ isOpen: false, photoUrl: '', leaderName: '' });

  useEffect(() => {
    fetchSettings();
    
    // Nettoyer le cache si paramètre refresh présent
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh')) {
      console.log('🔄 Forcer le rechargement des paramètres CRPT...');
      // Supprimer le cache du service worker pour cette route
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    }
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('🔄 Chargement paramètres CRPT depuis API...');
      // Ajouter timestamp pour éviter le cache
      const timestamp = new Date().getTime();
      const response = await axios.get(getApiUrl(`/api/settings/crpt?t=${timestamp}`));
      
      console.log('📦 Paramètres reçus:', response.data.crptSettings ? 'Oui' : 'Non (valeurs par défaut)');
      
      if (response.data.crptSettings) {
        console.log('✅ Application des paramètres personnalisés CRPT');
        console.log('🎨 Preview:', {
          hero: response.data.crptSettings.hero.title,
          mission: response.data.crptSettings.mission.title,
          valuesCount: response.data.crptSettings.values.items.length,
          refugesCount: response.data.crptSettings.refuges.items.length
        });
        
        setSettings(response.data.crptSettings);
        
        // Appliquer la couleur de la barre de statut mobile
        if (response.data.crptSettings.styles.statusBarColor) {
          let themeColorMeta = document.querySelector('meta[name="theme-color"]');
          if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta');
            themeColorMeta.name = 'theme-color';
            document.head.appendChild(themeColorMeta);
          }
          themeColorMeta.content = response.data.crptSettings.styles.statusBarColor;
        }
        
        // Appliquer les couleurs au header et footer globalement
        if (response.data.crptSettings.styles.headerColor) {
          const header = document.querySelector('.header');
          if (header) {
            header.style.background = response.data.crptSettings.styles.headerColor;
          }
        }
        
        if (response.data.crptSettings.styles.footerColor) {
          const footer = document.querySelector('.footer');
          if (footer) {
            footer.style.background = response.data.crptSettings.styles.footerColor;
          }
        }
      }
    } catch (error) {
      console.log('📝 Utilisation des paramètres CRPT par défaut');
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

  // Générer les styles dynamiques
  const dynamicStyles = `
    :root {
      --crpt-primary: ${settings.styles.primaryColor};
      --crpt-secondary: ${settings.styles.secondaryColor};
      --crpt-accent: ${settings.styles.accentColor};
      --crpt-background: ${settings.styles.backgroundColor};
      --crpt-text: ${settings.styles.textColor};
      --crpt-font-family: ${settings.styles.fontFamily};
      --crpt-heading-font: ${settings.styles.headingFontFamily};
      --crpt-border-radius: ${settings.styles.borderRadius};
      --crpt-card-shadow: ${settings.styles.cardShadow};
      --crpt-animation-duration: ${settings.styles.animationDuration};
    }

    .gjcrpt-hero {
      background-image: url(${settings.hero.backgroundImage});
    }

    .gjcrpt-hero-overlay {
      opacity: ${settings.hero.overlayOpacity / 100};
    }

    .gjcrpt-hero-title {
      font-size: ${settings.hero.titleFontSize};
      color: ${settings.hero.titleColor};
      ${settings.styles.enableAnimations && settings.hero.titleAnimation !== 'none' 
        ? `animation: ${settings.hero.titleAnimation} ${settings.styles.animationDuration};` 
        : ''
      }
    }

    .gjcrpt-hero-subtitle {
      font-size: ${settings.hero.subtitleFontSize};
      color: ${settings.hero.subtitleColor};
    }

    .gjcrpt-stat-number {
      color: ${settings.hero.statsColor};
      ${settings.styles.enableAnimations && settings.hero.statsAnimation !== 'none'
        ? `animation: ${settings.hero.statsAnimation} ${settings.styles.animationDuration};`
        : ''
      }
    }

    .gjcrpt-section-badge {
      background: ${settings.mission.badgeColor};
    }

    .gjcrpt-section-title {
      font-size: ${settings.mission.titleFontSize};
      color: ${settings.mission.titleColor};
      font-family: var(--crpt-heading-font);
    }

    .gjcrpt-lead {
      color: ${settings.mission.leadTextColor};
      font-size: ${settings.mission.leadTextSize};
    }

    .gjcrpt-floating-card {
      background: ${settings.mission.cardBackgroundColor};
      ${settings.styles.enableGlassmorphism ? 'backdrop-filter: blur(10px);' : ''}
      ${settings.styles.enableAnimations && settings.mission.cardAnimation !== 'none'
        ? `animation: ${settings.mission.cardAnimation} ${settings.styles.animationDuration};`
        : ''
      }
    }

    .gjcrpt-value-card, .gjcrpt-refuge-card {
      background: ${settings.values.cardBackgroundColor};
      ${settings.styles.enableHoverEffects && settings.values.cardHoverEffect !== 'none'
        ? `transition: all ${settings.styles.animationDuration};`
        : ''
      }
    }

    ${settings.styles.enableHoverEffects && settings.values.cardHoverEffect === 'lift' ? `
      .gjcrpt-value-card:hover, .gjcrpt-refuge-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
    ` : ''}

    ${settings.styles.enableHoverEffects && settings.values.cardHoverEffect === 'glow' ? `
      .gjcrpt-value-card:hover, .gjcrpt-refuge-card:hover {
        box-shadow: 0 0 20px ${settings.styles.primaryColor}40;
      }
    ` : ''}

    .gjcrpt-values-grid {
      grid-template-columns: repeat(${settings.values.gridColumns}, 1fr);
    }

    .gjcrpt-refuges-grid {
      grid-template-columns: repeat(${settings.refuges.gridColumns}, 1fr);
    }

    /* Responsive: Force 1 colonne sur mobile */
    @media (max-width: 1024px) {
      .gjcrpt-values-grid,
      .gjcrpt-refuges-grid {
        grid-template-columns: 1fr !important;
      }
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slide-up {
      from { 
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes zoom-in {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;

  return (
    <>
      <style>{dynamicStyles}</style>
      <div className="gjcrpt-page" style={{ 
        fontFamily: settings.styles.fontFamily,
        background: settings.styles.pageBackgroundColor || '#ffffff'
      }}>
        {/* Hero Section */}
        <section className="gjcrpt-hero">
          <div className="gjcrpt-hero-overlay"></div>
          <div className="gjcrpt-hero-content">
            <div className="gjcrpt-logo-circle">
              <img src={settings.hero.logoUrl} alt="CRPT Logo" className="gjcrpt-logo-img" />
            </div>
            <h1 className="gjcrpt-hero-title">{settings.hero.title}</h1>
            <p className="gjcrpt-hero-subtitle" style={{ whiteSpace: 'pre-wrap' }}>{settings.hero.subtitle}</p>
            <div className="gjcrpt-hero-stats">
              {settings.hero.stats.map((stat, index) => (
                <div key={index} className="gjcrpt-stat">
                  <div className="gjcrpt-stat-icon">{stat.icon}</div>
                  <div className="gjcrpt-stat-number">{stat.number}</div>
                  <div className="gjcrpt-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="gjcrpt-mission">
          <div className="gjcrpt-container">
            <div className="gjcrpt-section-badge">{settings.mission.badge}</div>
            <h2 className="gjcrpt-section-title">{settings.mission.title}</h2>
            <div className="gjcrpt-mission-content">
              <div className="gjcrpt-mission-text">
                <p className="gjcrpt-lead" style={{ whiteSpace: 'pre-wrap' }}>{settings.mission.leadText}</p>
                <p style={{ whiteSpace: 'pre-wrap' }}>{settings.mission.bodyText}</p>
              </div>
              <div className="gjcrpt-mission-visual">
                <div className="gjcrpt-floating-card">
                  <div className="gjcrpt-card-icon">{settings.mission.cardIcon}</div>
                  <h4>{settings.mission.cardTitle}</h4>
                  <p>{settings.mission.cardDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="gjcrpt-values">
          <div className="gjcrpt-container">
            <div className="gjcrpt-section-badge">{settings.values.badge}</div>
            <h2 className="gjcrpt-section-title">{settings.values.title}</h2>
            <div className="gjcrpt-values-grid">
              {settings.values.items.map((value, index) => (
                <div key={index} className="gjcrpt-value-card">
                  <div className="gjcrpt-value-icon-wrapper">
                    <span 
                      className="gjcrpt-value-icon" 
                      style={{ color: value.iconColor }}
                    >
                      {value.icon}
                    </span>
                  </div>
                  <h3>{value.title}</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Refuges Section */}
        <section className="gjcrpt-refuges">
          <div className="gjcrpt-container">
            <div className="gjcrpt-section-badge">{settings.refuges.badge}</div>
            <h2 className="gjcrpt-section-title">{settings.refuges.title}</h2>
            <p className="gjcrpt-section-subtitle" style={{ whiteSpace: 'pre-wrap' }}>{settings.refuges.subtitle}</p>
            <div className="gjcrpt-refuges-grid">
              {settings.refuges.items.map((refuge, index) => (
                <div key={index} className="gjcrpt-refuge-card">
                  <div className="gjcrpt-refuge-icon" style={{ color: refuge.iconColor }}>
                    {refuge.icon}
                  </div>
                  <h3>{refuge.name}</h3>
                  <div className="gjcrpt-refuge-region">{refuge.region}</div>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{refuge.description}</p>
                  {refuge.leaderPhoto && (
                    <div className="gjcrpt-refuge-leader">
                      <img 
                        src={refuge.leaderPhoto} 
                        alt={refuge.leaderName || 'Leader'}
                        className="gjcrpt-refuge-leader-photo"
                        onClick={() => setPhotoModal({ 
                          isOpen: true, 
                          photoUrl: refuge.leaderPhoto, 
                          leaderName: refuge.leaderName || 'Leader' 
                        })}
                        style={{ cursor: 'pointer' }}
                        title="Cliquer pour agrandir"
                      />
                      {refuge.leaderName && (
                        <div className="gjcrpt-refuge-leader-name">{refuge.leaderName}</div>
                      )}
                    </div>
                  )}
                  {refuge.address && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(refuge.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gjcrpt-refuge-address"
                      title="Ouvrir dans Google Maps"
                    >
                      📍 {refuge.address}
                    </a>
                  )}
                  {refuge.phone && (
                    <div className="gjcrpt-refuge-contact">
                      📞 {refuge.phone}
                    </div>
                  )}
                  {refuge.email && (
                    <div className="gjcrpt-refuge-contact">
                      ✉️ {refuge.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA Section - Section Génération Josué supprimée car elle existe sur /generation-josue */}
        <section className="gjcrpt-cta" style={{ background: settings.styles.primaryColor }}>
          <div className="gjcrpt-container">
            <h2 style={{ color: 'white' }}>Rejoignez-nous !</h2>
            <p style={{ color: 'white', opacity: 0.9 }}>
              Trouvez un refuge près de chez vous et faites partie de notre famille
            </p>
            <button 
              className="gjcrpt-cta-button"
              style={{ 
                background: settings.styles.secondaryColor,
                borderRadius: settings.styles.borderRadius 
              }}
            >
              Nous contacter
            </button>
          </div>
        </section>

        {/* Modal pour agrandir les photos */}
        {photoModal.isOpen && (
          <div 
            className="gjcrpt-photo-modal"
            onClick={() => setPhotoModal({ isOpen: false, photoUrl: '', leaderName: '' })}
          >
            <div className="gjcrpt-photo-modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="gjcrpt-photo-modal-close"
                onClick={() => setPhotoModal({ isOpen: false, photoUrl: '', leaderName: '' })}
                aria-label="Fermer"
              >
                ✕
              </button>
              <img 
                src={photoModal.photoUrl} 
                alt={photoModal.leaderName}
                className="gjcrpt-photo-modal-img"
              />
              <div className="gjcrpt-photo-modal-caption">
                {photoModal.leaderName}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default GJCRPTPage;
