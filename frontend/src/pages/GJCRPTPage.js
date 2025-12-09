import React from 'react';
import '../styles/GJCRPTPage.css';

function GJCRPTPage() {
  return (
    <div className="gjcrpt-page">
      {/* Hero Section avec image de fond */}
      <section className="gjcrpt-hero">
        <div className="gjcrpt-hero-overlay"></div>
        <div className="gjcrpt-hero-content">
          <div className="gjcrpt-logo-circle">
            <img src="/images/crpt-logo.png" alt="CRPT Logo" className="gjcrpt-logo-img" />
          </div>
          <h1 className="gjcrpt-hero-title">Christ Refuge Pour Tous</h1>
          <p className="gjcrpt-hero-subtitle">Une famille d'églises au service de Dieu et des hommes</p>
          <div className="gjcrpt-hero-stats">
            <div className="gjcrpt-stat">
              <div className="gjcrpt-stat-number">5+</div>
              <div className="gjcrpt-stat-label">Refuges</div>
            </div>
            <div className="gjcrpt-stat">
              <div className="gjcrpt-stat-number">1000+</div>
              <div className="gjcrpt-stat-label">Membres</div>
            </div>
            <div className="gjcrpt-stat">
              <div className="gjcrpt-stat-number">15+</div>
              <div className="gjcrpt-stat-label">Années</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="gjcrpt-mission">
        <div className="gjcrpt-container">
          <div className="gjcrpt-section-badge">Notre Mission</div>
          <h2 className="gjcrpt-section-title">Qui sommes-nous ?</h2>
          <div className="gjcrpt-mission-content">
            <div className="gjcrpt-mission-text">
              <p className="gjcrpt-lead">
                <strong>Christ Refuge Pour Tous (CRPT)</strong> est une famille d'églises évangéliques 
                implantée en France, avec une vision de faire de chaque membre un disciple engagé et un témoin efficace de l'Évangile.
              </p>
              <p>
                Fondée sur les valeurs bibliques d'amour, de communion fraternelle et de service, 
                la CRPT s'engage à être un refuge spirituel pour tous ceux qui cherchent Dieu.
              </p>
            </div>
            <div className="gjcrpt-mission-visual">
              <div className="gjcrpt-floating-card">
                <div className="gjcrpt-card-icon">🏛️</div>
                <h4>Un Refuge pour Tous</h4>
                <p>Un lieu d'accueil, de croissance et d'impact</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="gjcrpt-values">
        <div className="gjcrpt-container">
          <div className="gjcrpt-section-badge">Nos Valeurs</div>
          <h2 className="gjcrpt-section-title">Ce qui nous anime</h2>
          <div className="gjcrpt-values-grid">
            <div className="gjcrpt-value-card">
              <div className="gjcrpt-value-icon-wrapper">
                <span className="gjcrpt-value-icon">📖</span>
              </div>
              <h3>La Parole de Dieu</h3>
              <p>La Bible est notre fondement et notre guide pour la vie et la foi.</p>
            </div>
            <div className="gjcrpt-value-card">
              <div className="gjcrpt-value-icon-wrapper">
                <span className="gjcrpt-value-icon">❤️</span>
              </div>
              <h3>L'Amour</h3>
              <p>L'amour de Dieu et du prochain au cœur de notre identité.</p>
            </div>
            <div className="gjcrpt-value-card">
              <div className="gjcrpt-value-icon-wrapper">
                <span className="gjcrpt-value-icon">🙏</span>
              </div>
              <h3>La Prière</h3>
              <p>Nous croyons en la puissance de la prière et de la communion avec Dieu.</p>
            </div>
            <div className="gjcrpt-value-card">
              <div className="gjcrpt-value-icon-wrapper">
                <span className="gjcrpt-value-icon">🤝</span>
              </div>
              <h3>La Communion</h3>
              <p>Des relations authentiques et une vraie famille spirituelle.</p>
            </div>
            <div className="gjcrpt-value-card">
              <div className="gjcrpt-value-icon-wrapper">
                <span className="gjcrpt-value-icon">🌍</span>
              </div>
              <h3>Le Service</h3>
              <p>Appelés à servir Dieu et notre prochain avec excellence.</p>
            </div>
            <div className="gjcrpt-value-card">
              <div className="gjcrpt-value-icon-wrapper">
                <span className="gjcrpt-value-icon">🔥</span>
              </div>
              <h3>La Louange</h3>
              <p>Célébrer Sa grandeur dans l'adoration et la louange.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Refuges Map Section */}
      <section className="gjcrpt-refuges">
        <div className="gjcrpt-container">
          <div className="gjcrpt-section-badge">Nos Implantations</div>
          <h2 className="gjcrpt-section-title">Les Refuges CRPT</h2>
          <p className="gjcrpt-section-subtitle">
            Une présence dans plusieurs villes de France
          </p>
          <div className="gjcrpt-refuges-grid">
            <div className="gjcrpt-refuge-card">
              <div className="gjcrpt-refuge-header">
                <span className="gjcrpt-refuge-icon">🏛️</span>
                <h3>Lorient</h3>
              </div>
              <p className="gjcrpt-refuge-region">Bretagne</p>
              <p className="gjcrpt-refuge-desc">Un refuge dynamique au cœur de la Bretagne</p>
            </div>
            <div className="gjcrpt-refuge-card">
              <div className="gjcrpt-refuge-header">
                <span className="gjcrpt-refuge-icon">🏛️</span>
                <h3>Laval</h3>
              </div>
              <p className="gjcrpt-refuge-region">Pays de la Loire</p>
              <p className="gjcrpt-refuge-desc">Une communauté chaleureuse et accueillante</p>
            </div>
            <div className="gjcrpt-refuge-card">
              <div className="gjcrpt-refuge-header">
                <span className="gjcrpt-refuge-icon">🏛️</span>
                <h3>Amiens</h3>
              </div>
              <p className="gjcrpt-refuge-region">Hauts-de-France</p>
              <p className="gjcrpt-refuge-desc">Un phare spirituel dans le nord de la France</p>
            </div>
            <div className="gjcrpt-refuge-card">
              <div className="gjcrpt-refuge-header">
                <span className="gjcrpt-refuge-icon">🏛️</span>
                <h3>Nantes</h3>
              </div>
              <p className="gjcrpt-refuge-region">Pays de la Loire</p>
              <p className="gjcrpt-refuge-desc">Une église en pleine expansion</p>
            </div>
          </div>
        </div>
      </section>

      {/* GJ Section */}
      <section className="gjcrpt-gj">
        <div className="gjcrpt-container">
          <div className="gjcrpt-gj-content">
            <div className="gjcrpt-gj-left">
              <div className="gjcrpt-section-badge light">Notre Jeunesse</div>
              <h2 className="gjcrpt-gj-title">Génération Josué</h2>
              <p className="gjcrpt-gj-lead">
                Le mouvement jeunesse de la CRPT où les 15-30 ans peuvent grandir dans leur foi 
                et avoir un impact pour le Royaume de Dieu.
              </p>
              <ul className="gjcrpt-gj-features">
                <li>
                  <span className="gjcrpt-feature-icon">✨</span>
                  <span>Rencontres mensuelles de louange</span>
                </li>
                <li>
                  <span className="gjcrpt-feature-icon">🎤</span>
                  <span>Conférences pour jeunes</span>
                </li>
                <li>
                  <span className="gjcrpt-feature-icon">🏕️</span>
                  <span>Camp d'été annuel</span>
                </li>
                <li>
                  <span className="gjcrpt-feature-icon">🤝</span>
                  <span>Groupes de prière et d'étude</span>
                </li>
                <li>
                  <span className="gjcrpt-feature-icon">🎵</span>
                  <span>École de musique et louange</span>
                </li>
              </ul>
              <a href="/" className="gjcrpt-cta-btn">
                Découvrir Génération Josué →
              </a>
            </div>
            <div className="gjcrpt-gj-right">
              <div className="gjcrpt-gj-visual">
                <div className="gjcrpt-gj-circle">
                  <span className="gjcrpt-gj-emoji">🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gjcrpt-cta">
        <div className="gjcrpt-container">
          <div className="gjcrpt-cta-content">
            <h2 className="gjcrpt-cta-title">Rejoignez-nous !</h2>
            <p className="gjcrpt-cta-text">
              Vous êtes les bienvenus dans l'un de nos refuges pour découvrir notre communauté 
              et expérimenter l'amour de Dieu.
            </p>
            <div className="gjcrpt-cta-buttons">
              <a href="/contact" className="gjcrpt-btn gjcrpt-btn-primary">
                Nous contacter
              </a>
              <a href="/a-propos" className="gjcrpt-btn gjcrpt-btn-secondary">
                En savoir plus
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GJCRPTPage;
