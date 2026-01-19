import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';
import { API_URL } from './config/api';

// Nettoyer les valeurs corrompues dans localStorage au démarrage
try {
  ['user', 'token'].forEach(key => {
    const value = localStorage.getItem(key);
    if (value === 'undefined' || value === 'null') {
      console.warn(`🧹 Nettoyage localStorage: ${key} = ${value}`);
      localStorage.removeItem(key);
    }
  });
} catch (error) {
  console.error('❌ Erreur nettoyage localStorage:', error);
}

// Configurer axios pour utiliser l'API backend en production
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
console.log('🔗 API URL configurée:', API_URL);

// ✅ Enregistrer le Service Worker pour PWA + Notifications Push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);
        
        // Vérifier les mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch(error => {
        console.error('❌ Erreur enregistrement Service Worker:', error);
      });
  });
} else {
  console.warn('⚠️ Service Worker non supporté par ce navigateur');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
