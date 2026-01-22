import React, { useContext, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MailIcon, UserIcon } from './Icons';
import SettingsIcon from './SettingsIcon';
import { API_URL } from '../config/api';
import '../styles/App.css';

const Header = () => {
  const { isAuthenticated, user, logout, token } = useContext(AuthContext);
  const [isGestionOpen, setIsGestionOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/images/logo-gj.png');
  const [crptLogoUrl, setCrptLogoUrl] = useState('/images/crpt-logo.png');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openGestionMenu = useCallback(() => setIsGestionOpen(true), []);
  const closeGestionMenu = useCallback(() => setIsGestionOpen(false), []);
  const toggleGestionMenu = useCallback(() => {
    setIsGestionOpen((prev) => !prev);
  }, []);
  const handleGestionBlur = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsGestionOpen(false);
    }
  }, []);

  // Récupérer le nombre de messages non lus
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isAuthenticated && token) {
        try {
          const response = await axios.get('/api/messages/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
          console.error('Erreur lors de la récupération des messages:', error);
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Écouter l'événement personnalisé pour rafraîchir immédiatement
    const handleRefreshMessages = () => fetchUnreadCount();
    window.addEventListener('messagesUpdated', handleRefreshMessages);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('messagesUpdated', handleRefreshMessages);
    };
  }, [isAuthenticated, token]);

  // Récupérer les logos depuis les settings
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/settings`);
        if (response.data.settings) {
          if (response.data.settings.logoUrl) {
            setLogoUrl(response.data.settings.logoUrl);
            console.log('🎨 Logo GJ chargé:', response.data.settings.logoUrl);
          }
          if (response.data.settings.crptLogoUrl) {
            setCrptLogoUrl(response.data.settings.crptLogoUrl);
            console.log('🏛️ Logo CRPT chargé:', response.data.settings.crptLogoUrl);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des logos:', error);
        // Garder les logos par défaut
      }
    };

    fetchLogos();
  }, []);

  // Fermer le dropdown GESTION quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isGestionOpen && !event.target.closest('.dropdown')) {
        setIsGestionOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isGestionOpen]);

  const normalizedRole = user?.role === 'user' ? 'utilisateur' : user?.role || 'utilisateur';
  const canAccessGestion = ['referent', 'responsable', 'admin'].includes(normalizedRole);
  const canAccessInscriptions = ['referent', 'responsable', 'admin'].includes(normalizedRole);
  const canAccessActivities = ['referent', 'responsable', 'admin'].includes(normalizedRole);
  const canAccessUserAdmin = ['responsable', 'admin'].includes(normalizedRole);
  const canAccessPayouts = ['responsable', 'admin'].includes(normalizedRole);
  const isAdmin = normalizedRole === 'admin';

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo GJ à gauche */}
        <Link to="/" className="logo-link logo-link-left">
          <img src={logoUrl} alt="Génération Josué" className="header-logo" />
        </Link>

        {/* Logo CRPT à droite */}
        <Link to="/gj-crpt" className="logo-link logo-link-right">
          <img src={crptLogoUrl} alt="CRPT" className="header-logo" />
        </Link>

        {/* Bouton Hamburger */}
        <button 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu Navigation */}
        <nav className={`nav-menu ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <ul>
            <li><Link to="/" onClick={closeMobileMenu}>ACCUEIL</Link></li>
            <li><Link to="/programme" onClick={closeMobileMenu}>PROGRAMME</Link></li>
            <li><Link to="/activites" onClick={closeMobileMenu}>ACTIVITES</Link></li>
            <li><Link to="/newsletter" onClick={closeMobileMenu}>GJ NEWS</Link></li>
            {isAuthenticated && (
              <li className="messages-menu-item">
                <Link to="/messages" className="messages-link" onClick={closeMobileMenu}>
                  <MailIcon size={24} color="#ffffff" />
                  {unreadCount > 0 && (
                    <span className="message-badge">{unreadCount}</span>
                  )}
                  <span className="mobile-menu-label">Messages</span>
                </Link>
              </li>
            )}
            <li><Link to="/generation-josue" onClick={closeMobileMenu}>GJ</Link></li>
            <li><Link to="/gj-crpt" onClick={closeMobileMenu}>CRPT</Link></li>
            {isAuthenticated && <li><Link to="/tableau-de-bord" onClick={closeMobileMenu}>TABLEAU DE BORD</Link></li>}
            {isAuthenticated && canAccessGestion && (
              <li
                className={`dropdown ${isGestionOpen ? 'dropdown-open' : ''}`}
              >
                <button
                  type="button"
                  className="dropdown-toggle"
                  onClick={toggleGestionMenu}
                  aria-expanded={isGestionOpen}
                  aria-haspopup="true"
                >
                  GESTION
                  <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <ul className={`dropdown-menu ${isGestionOpen ? 'dropdown-menu-open' : ''}`}>
                  <li><Link to="/profil" onClick={closeMobileMenu}>Mon Profil</Link></li>
                  {canAccessInscriptions && (
                    <li><Link to="/suivi-inscriptions" onClick={closeMobileMenu}>Inscriptions</Link></li>
                  )}
                  {canAccessActivities && (
                    <li><Link to="/gestion-activites" onClick={closeMobileMenu}>Activités</Link></li>
                  )}
                  {canAccessUserAdmin && (
                    <li><Link to="/gestion-carrousel" onClick={closeMobileMenu}>🎨 Carrousel</Link></li>
                  )}
                  {canAccessPayouts && (
                    <li><Link to="/suivi-activites" onClick={closeMobileMenu}>Suivi Activités</Link></li>
                  )}
                  {canAccessUserAdmin && (
                    <li><Link to="/gestion/utilisateurs" onClick={closeMobileMenu}>Utilisateurs</Link></li>
                  )}
                  {canAccessUserAdmin && (
                    <li><Link to="/parametres/gj" onClick={closeMobileMenu}>🌟 Page GJ</Link></li>
                  )}
                  {isAdmin && (
                    <li><Link to="/parametres/crpt" onClick={closeMobileMenu}>⚙️ Page CRPT</Link></li>
                  )}
                  {canAccessUserAdmin && (
                    <li className="dropdown-messages-item">
                      <Link to="/gestion/messages" onClick={closeMobileMenu}>
                        Messages
                        {unreadCount > 0 && (
                          <span className="dropdown-message-badge">{unreadCount}</span>
                        )}
                      </Link>
                    </li>
                  )}
                  {canAccessPayouts && (
                    <>
                      <li><Link to="/gestion/redistributions" onClick={closeMobileMenu}>Redistributions</Link></li>
                      <li><Link to="/gestion/paiements-especes" onClick={closeMobileMenu}>Paiements espèces</Link></li>
                    </>
                  )}
                  {canAccessUserAdmin && (
                    <li><Link to="/gestion/reinitialisations" onClick={closeMobileMenu}>Mots de passe</Link></li>
                  )}
                </ul>
              </li>
            )}
            {/* Menu Utilisateur dans la navigation mobile */}
            <div className="mobile-user-section">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <li><Link to="/parametres" onClick={closeMobileMenu}>⚙️ Paramètres</Link></li>
                  )}
                  <li><Link to="/profil" onClick={closeMobileMenu}>👤 {user?.firstName}</Link></li>
                  <li><button className="mobile-logout-btn" onClick={() => { logout(); closeMobileMenu(); }}>🚪 Déconnexion</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" onClick={closeMobileMenu}>🔑 Connexion</Link></li>
                  <li><Link to="/signup" onClick={closeMobileMenu}><button className="btn-signup">S'INSCRIRE</button></Link></li>
                </>
              )}
            </div>
          </ul>
        </nav>

        {/* Menu Utilisateur Desktop */}
        <div className="user-menu desktop-only">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/parametres" className="settings-link" title="Paramètres du site">
                  <SettingsIcon size={24} color="#d4af37" />
                </Link>
              )}
              <Link to="/profil" className="user-profile-link" title={`${user?.firstName} ${user?.lastName}`}>
                <UserIcon size={28} color="#ffffff" />
                <span className="user-name">{user?.firstName}</span>
              </Link>
              <button className="btn-logout" onClick={logout} title="Déconnexion">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link" title="Connexion">
                <UserIcon size={24} color="#d4af37" />
              </Link>
              <Link to="/signup">
                <button className="btn-signup">S'INSCRIRE</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
