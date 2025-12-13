import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, API_URL } from '../config/api';
import '../styles/ModernLogo.css';

const ModernLogo = ({ variant = 1, size = 'medium' }) => {
  const [customLogo, setCustomLogo] = useState(null);
  const [logoSize, setLogoSize] = useState({ width: '120px', height: 'auto' });
  const [logoEffects, setLogoEffects] = useState({
    shape: 'none',
    effect: 'none',
    animation: 'none',
    borderColor: '#d4af37',
    glowColor: '#d4af37'
  });
  const [logoPosition, setLogoPosition] = useState({
    type: 'header',
    customX: '50',
    customY: '50'
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Charger le logo personnalisé depuis les paramètres
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/settings`);
        if (response.data.success && response.data.settings.logoUrl) {
          // Utiliser getApiUrl pour les uploads
          const logoUrl = getApiUrl(response.data.settings.logoUrl);
          setCustomLogo(logoUrl);
          setLogoSize({
            width: response.data.settings.logoWidth || '120px',
            height: response.data.settings.logoHeight || 'auto'
          });
          setLogoEffects({
            shape: response.data.settings.logoShape || 'none',
            effect: response.data.settings.logoEffect || 'none',
            animation: response.data.settings.logoAnimation || 'none',
            borderColor: response.data.settings.logoBorderColor || '#d4af37',
            glowColor: response.data.settings.logoGlowColor || '#d4af37'
          });
          setLogoPosition({
            type: response.data.settings.logoPosition || 'header',
            customX: response.data.settings.logoCustomX || '50',
            customY: response.data.settings.logoCustomY || '50'
          });
        }
      } catch (error) {
        // Silencieux - utilise le logo SVG par défaut
      }
    };
    fetchLogo();

    // Écouter l'événement personnalisé pour rafraîchir le logo
    const handleLogoUpdate = () => {
      setRefreshKey(prev => prev + 1);
      fetchLogo();
    };
    window.addEventListener('logoUpdated', handleLogoUpdate);

    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, [refreshKey]);

  // Calculer les styles en fonction des effets
  const getLogoStyles = () => {
    return {
      width: logoSize.width,
      height: logoSize.height,
      objectFit: 'contain',
      borderRadius: 
        logoEffects.shape === 'circle' ? '50%' :
        logoEffects.shape === 'rounded' ? '12px' :
        logoEffects.shape === 'square' ? '0' :
        logoEffects.shape === 'hexagon' ? '0' : '0',
      border: 
        logoEffects.effect === 'border' ? `3px solid ${logoEffects.borderColor}` :
        logoEffects.effect === 'gradient-border' ? '3px solid transparent' : 'none',
      boxShadow: 
        logoEffects.effect === 'shadow' ? '0 8px 24px rgba(0, 0, 0, 0.3)' :
        logoEffects.effect === 'glow' ? `0 0 20px ${logoEffects.glowColor}` :
        logoEffects.effect === '3d' ? '5px 5px 15px rgba(0, 0, 0, 0.5), -5px -5px 15px rgba(255, 255, 255, 0.1)' : 'none',
      backgroundImage: logoEffects.effect === 'gradient-border' ? 
        `linear-gradient(white, white), linear-gradient(135deg, ${logoEffects.borderColor}, #764ba2)` : 'none',
      backgroundOrigin: 'border-box',
      backgroundClip: logoEffects.effect === 'gradient-border' ? 'padding-box, border-box' : 'initial',
      transform: logoEffects.effect === '3d' ? 'perspective(1000px) rotateY(5deg)' : 'none',
      transition: 'all 0.3s ease'
    };
  };

  // Calculer les styles de position
  const getPositionStyles = () => {
    if (logoPosition.type === 'header') {
      return {};
    }

    const baseStyles = {
      position: 'fixed',
      zIndex: 9999
    };

    switch (logoPosition.type) {
      case 'fixed-top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'fixed-top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'fixed-bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'fixed-bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      case 'custom':
        return { 
          ...baseStyles, 
          top: `${logoPosition.customY}px`, 
          left: `${logoPosition.customX}px` 
        };
      default:
        return {};
    }
  };

  // Si un logo personnalisé existe, l'afficher
  if (customLogo) {
    // Si la position n'est pas 'header', ne rien afficher dans le header/footer
    // Le logo sera affiché en position fixe
    if (logoPosition.type !== 'header') {
      return null;
    }

    const combinedStyles = {
      ...getLogoStyles()
    };

    return (
      <div className={`modern-logo custom-logo logo-${size}`}>
        <img 
          src={`${customLogo}?t=${Date.now()}`}
          alt="GJ Camp Logo" 
          className={logoEffects.animation}
          style={combinedStyles}
        />
      </div>
    );
  }

  // Pour les logos par défaut (GJ), toujours afficher dans le header
  const renderLogo = () => {
    switch (variant) {
      case 1:
        // Logo minimaliste avec GJ en dégradé
        return (
          <div className={`modern-logo logo-variant-1 logo-${size}`}>
            <div className="logo-circle">
              <span className="logo-text">GJ</span>
            </div>
          </div>
        );
      
      case 2:
        // Logo géométrique avec hexagone
        return (
          <div className={`modern-logo logo-variant-2 logo-${size}`}>
            <div className="hexagon">
              <span className="logo-text">GJ</span>
            </div>
          </div>
        );
      
      case 3:
        // Logo 3D avec effet de profondeur
        return (
          <div className={`modern-logo logo-variant-3 logo-${size}`}>
            <div className="logo-3d">
              <div className="layer layer-1">GJ</div>
              <div className="layer layer-2">GJ</div>
              <div className="layer layer-3">GJ</div>
            </div>
          </div>
        );
      
      case 4:
        // Logo avec anneau et particules
        return (
          <div className={`modern-logo logo-variant-4 logo-${size}`}>
            <div className="ring-container">
              <div className="ring"></div>
              <div className="ring ring-2"></div>
              <span className="logo-text">GJ</span>
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
            </div>
          </div>
        );
      
      case 5:
        // Logo style badge moderne
        return (
          <div className={`modern-logo logo-variant-5 logo-${size}`}>
            <div className="badge">
              <div className="badge-inner">
                <span className="logo-text">GJ</span>
                <span className="badge-subtitle">CAMP</span>
              </div>
            </div>
          </div>
        );
      
      case 6:
        // Logo avec effet néon
        return (
          <div className={`modern-logo logo-variant-6 logo-${size}`}>
            <div className="neon-container">
              <span className="neon-text">GJ</span>
            </div>
          </div>
        );
      
      case 7:
        // Logo carré arrondi style app
        return (
          <div className={`modern-logo logo-variant-7 logo-${size}`}>
            <div className="app-icon">
              <div className="icon-gradient"></div>
              <span className="logo-text">GJ</span>
              <div className="icon-shine"></div>
            </div>
          </div>
        );
      
      case 8:
        // Logo avec cercles concentriques
        return (
          <div className={`modern-logo logo-variant-8 logo-${size}`}>
            <div className="concentric">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
              <div className="circle circle-3"></div>
              <span className="logo-text">GJ</span>
            </div>
          </div>
        );
      
      default:
        return renderLogo(1);
    }
  };

  return renderLogo();
};

export default ModernLogo;
