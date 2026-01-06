import React from 'react';
import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import '../styles/App.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p className="footer-text">© {new Date().getFullYear()} Génération Josué — Tous droits réservés</p>
        </div>
        <div className="footer-right">
          <nav className="footer-nav">
            <Link className="footer-link" to="/gj-crpt">GJ CRPT</Link>
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
