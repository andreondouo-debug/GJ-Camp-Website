import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Carousel from '../components/Carousel';
import TimerCamp from '../components/TimerCamp';
import SectionICCOnline from '../components/SectionICCOnline';
import '../styles/App.css';

const HomePage = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;
  const location = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (location.state?.inscriptionSuccess || location.state?.signupSuccess) {
      setShowSuccessMessage(true);
      
      // Masquer le message après 5 secondes
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      // Nettoyer l'état
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="container">
      {/* Message de succès inscription */}
      {showSuccessMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: '16px',
          fontWeight: '500',
          animation: 'slideDown 0.3s ease-out',
          textAlign: 'center',
          maxWidth: '90%'
        }}>
          {location.state?.signupSuccess 
            ? `✅ Inscription réussie ! Vérifiez votre email ${location.state?.email || ''} pour activer votre compte ! 📧`
            : '✅ Inscription réussie ! Bienvenue au Camp GJ 2026 ! 🎉'
          }
        </div>
      )}
      
      {/* Timer affiché en haut sur mobile */}
      {isMobile && (
        <div className="timer-camp-mobile-top">
          <TimerCamp />
        </div>
      )}
      
      <div className="hero" style={{position: 'relative'}}>
        {/* Timer flotant sur desktop */}
        {!isMobile && (
          <div className="timer-camp-floating">
            <TimerCamp />
          </div>
        )}
        <Carousel />
      </div>
      {/* Section Pourquoi rejoindre le Camp GJ déplacée ici */}
      <div className="carousel-why-join">
        <h3 className="carousel-why-title">Pourquoi rejoindre le Camp GJ&nbsp;?</h3>
        <div className="carousel-why-cards">
          <div className="carousel-why-card">
            <span className="carousel-why-icon material-icons" style={{color:'#d4af37'}}>groups</span>
            <div className="carousel-why-text">Rencontrer des jeunes passionnés et engagés</div>
          </div>
          <div className="carousel-why-card">
            <span className="carousel-why-icon material-icons" style={{color:'#d4af37'}}>auto_awesome</span>
            <div className="carousel-why-text">Vivre des temps forts dans la présence de Dieu</div>
          </div>
          <div className="carousel-why-card">
            <span className="carousel-why-icon material-icons" style={{color:'#d4af37'}}>celebration</span>
            <div className="carousel-why-text">Partager des moments inoubliables et des activités fun</div>
          </div>
          <div className="carousel-why-card">
            <span className="carousel-why-icon material-icons" style={{color:'#d4af37'}}>emoji_objects</span>
            <div className="carousel-why-text">Grandir dans la foi, l’amitié et la fraternité</div>
          </div>
        </div>
      </div>
      {/* Le bouton d'inscription est maintenant dans le carrousel */}
      {/* Section ICC Online juste avant le footer */}
      <SectionICCOnline />
    </div>
  );
};

export default HomePage;
