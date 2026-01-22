import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { VERSION_INFO } from '../version';
import SocialLinks from './SocialLinks';
import '../styles/App.css';

const Footer = () => {
  const [logoUrl, setLogoUrl] = useState('/images/logo-gj.png');

  // Récupérer le logo depuis les settings
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/settings`);
        if (response.data.settings && response.data.settings.logoUrl) {
          setLogoUrl(response.data.settings.logoUrl);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du logo footer:', error);
        // Garder le logo par défaut
      }
    };

    fetchLogo();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <img src={logoUrl} alt="Génération Josué" className="footer-logo" />
          <p className="footer-text">© {new Date().getFullYear()} Génération Josué — Tous droits réservés</p>
          <p className="footer-version" style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            v{VERSION_INFO.version} • {VERSION_INFO.buildDate}
          </p>
        </div>
        <div className="footer-right">
          <nav className="footer-nav">
            <Link className="footer-link" to="/gj-crpt">CRPT</Link>
            <Link className="footer-link" to="/activites">Activités</Link>
            <Link className="footer-link" to="/politique-confidentialite">Confidentialité</Link>
            <Link className="footer-link" to="/conditions-utilisation">CGU</Link>
            <Link className="footer-link" to="/gestion-donnees">Mes Données</Link>
          </nav>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
