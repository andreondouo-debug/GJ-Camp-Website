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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
