import React, { useContext, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MailIcon, UserIcon } from './Icons';
import SettingsIcon from './SettingsIcon';
import ModernLogo from './ModernLogo';
import LogoGJ from './LogoGJ';
// import logoGJ from '../assets/images/logo-gj.png';
import '../styles/App.css';

const Header = () => {
  const { isAuthenticated, user, logout, token } = useContext(AuthContext);
  const [isGestionOpen, setIsGestionOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
        <Link to="/" className="logo">
          <LogoGJ size="medium" />
        </Link>
        <nav className="nav-menu">
          <li><Link to="/">ACCUEIL</Link></li>
          <li><Link to="/programme">PROGRAMME</Link></li>
          <li><Link to="/activites">ACTIVITES</Link></li>
          <li><Link to="/newsletter">GJ NEWS</Link></li>
          {isAuthenticated && (
            <li className="messages-menu-item">
              <Link to="/messages" className="messages-link">
                <MailIcon size={24} color="#ffffff" />
                {unreadCount > 0 && (
                  <span className="message-badge">{unreadCount}</span>
                )}
              </Link>
            </li>
          )}
          <li><Link to="/gj-crpt">GJ CRPT</Link></li>
          {isAuthenticated && <li><Link to="/tableau-de-bord">TABLEAU DE BORD</Link></li>}
          {isAuthenticated && canAccessGestion && (
            <li
              className={`dropdown ${isGestionOpen ? 'dropdown-open' : ''}`}
              onMouseEnter={openGestionMenu}
              onMouseLeave={closeGestionMenu}
              onFocus={openGestionMenu}
              onBlur={handleGestionBlur}
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
                <li><Link to="/profil">Mon Profil</Link></li>
                {canAccessInscriptions && (
                  <li><Link to="/suivi-inscriptions">Inscriptions</Link></li>
                )}
                {canAccessActivities && (
                  <li><Link to="/gestion-activites">Activités</Link></li>
                )}
                {canAccessUserAdmin && (
                  <li><Link to="/gestion-carrousel">🎨 Carrousel</Link></li>
                )}
                {canAccessPayouts && (
                  <li><Link to="/suivi-activites">Suivi Activités</Link></li>
                )}
                {canAccessUserAdmin && (
                  <li><Link to="/gestion/utilisateurs">Utilisateurs</Link></li>
                )}
                {canAccessUserAdmin && (
                  <li className="dropdown-messages-item">
                    <Link to="/gestion/messages">
                      Messages
                      {unreadCount > 0 && (
                        <span className="dropdown-message-badge">{unreadCount}</span>
                      )}
                    </Link>
                  </li>
                )}
                {canAccessPayouts && (
                  <>
                    <li><Link to="/gestion/redistributions">Redistributions</Link></li>
                    <li><Link to="/gestion/paiements-especes">Paiements espèces</Link></li>
                  </>
                )}
                {canAccessUserAdmin && (
                  <li><Link to="/gestion/reinitialisations">Mots de passe</Link></li>
                )}
              </ul>
            </li>
          )}
        </nav>
        <div className="user-menu">
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
