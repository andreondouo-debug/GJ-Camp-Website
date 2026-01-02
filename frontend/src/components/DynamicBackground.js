import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import '../styles/DynamicBackground.css';

const DynamicBackground = ({ page }) => {
  const [backgroundSettings, setBackgroundSettings] = useState({
    backgroundType: 'gradient',
    backgroundColorStart: '#667eea',
    backgroundColorEnd: '#764ba2',
    backgroundSolidColor: '#ffffff',
    homeBackground: 'default',
    aboutBackground: 'default',
    activitiesBackground: 'default'
  });

  useEffect(() => {
    const fetchBackgroundSettings = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/settings'));
        const settings = response?.data?.settings || {};
        setBackgroundSettings(prev => ({
          backgroundType: settings.backgroundType || prev.backgroundType || 'gradient',
          backgroundColorStart: settings.backgroundColorStart || prev.backgroundColorStart || '#667eea',
          backgroundColorEnd: settings.backgroundColorEnd || prev.backgroundColorEnd || '#764ba2',
          backgroundSolidColor: settings.backgroundSolidColor || prev.backgroundSolidColor || '#ffffff',
          homeBackground: settings.homeBackground || prev.homeBackground || 'default',
          aboutBackground: settings.aboutBackground || prev.aboutBackground || 'default',
          activitiesBackground: settings.activitiesBackground || prev.activitiesBackground || 'default'
        }));
      } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres d\'arrière-plan:', error);
      }
    };

    fetchBackgroundSettings();
  }, []);

  const getPageBackground = () => {
    let pageSpecificBackground = 'default';
    
    switch(page) {
      case 'home':
        pageSpecificBackground = backgroundSettings.homeBackground;
        break;
      case 'about':
        pageSpecificBackground = backgroundSettings.aboutBackground;
        break;
      case 'activities':
        pageSpecificBackground = backgroundSettings.activitiesBackground;
        break;
      default:
        pageSpecificBackground = 'default';
    }

    // Si la page a un style personnalisé
    if (pageSpecificBackground !== 'default') {
      switch(pageSpecificBackground) {
        case 'light':
          return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        case 'dark':
          return 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
        case 'custom':
          // Pour l'instant, utilise le style global
          break;
        default:
          break;
      }
    }

    // Sinon, utiliser le style global
    switch(backgroundSettings.backgroundType) {
      case 'gradient':
        return `linear-gradient(135deg, ${backgroundSettings.backgroundColorStart}, ${backgroundSettings.backgroundColorEnd})`;
      case 'color':
        return backgroundSettings.backgroundSolidColor;
      case 'image':
        return backgroundSettings.backgroundImage 
          ? `url(${backgroundSettings.backgroundImage})` 
          : `linear-gradient(135deg, ${backgroundSettings.backgroundColorStart}, ${backgroundSettings.backgroundColorEnd})`;
      default:
        return `linear-gradient(135deg, ${backgroundSettings.backgroundColorStart}, ${backgroundSettings.backgroundColorEnd})`;
    }
  };

  return (
    <div 
      className="dynamic-background"
      style={{
        background: getPageBackground(),
        backgroundSize: backgroundSettings.backgroundType === 'image' ? 'cover' : 'auto',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    />
  );
};

export default DynamicBackground;
