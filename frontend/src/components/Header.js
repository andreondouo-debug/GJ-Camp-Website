import React, { useContext, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// import logoGJ from '../assets/images/logo-gj.png';
import '../styles/App.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isGestionOpen, setIsGestionOpen] = useState(false);

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

  const normalizedRole = user?.role === 'user' ? 'utilisateur' : user?.role || 'utilisateur';
  const canAccessGestion = ['referent', 'responsable', 'admin'].includes(normalizedRole);
  const canAccessInscriptions = ['referent', 'responsable', 'admin'].includes(normalizedRole);
  const canAccessActivities = ['referent', 'responsable', 'admin'].includes(normalizedRole);
  const canAccessUserAdmin = ['responsable', 'admin'].includes(normalizedRole);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img 
            src={process.env.PUBLIC_URL + '/logo.jpeg'} 
            alt="Logo Génération Josué" 
            style={{
              height: 64, 
              width: 64, 
              objectFit: 'cover',
              borderRadius: '50%',
              border: '3px solid #d4af37',
              boxShadow: '0 0 10px rgba(212,175,55,0.25)'
            }}
          />
        </Link>
        <nav className="nav-menu">
          <li><Link to="/">ACCUEIL</Link></li>
          <li><Link to="/programme">PROGRAMME</Link></li>
          <li><Link to="/activites">ACTIVITES</Link></li>
          <li><Link to="/newsletter">NEWSLETTER</Link></li>
          <li><Link to="/#apropos">GJ CRPT</Link></li>
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
                <li><Link to="/profil">Profil</Link></li>
                {canAccessInscriptions && (
                  <li><Link to="/suivi-inscriptions">Suivi des inscriptions</Link></li>
                )}
                {canAccessActivities && (
                  <li><Link to="/gestion-activites">Gestion des activités</Link></li>
                )}
                {canAccessUserAdmin && (
                  <li><Link to="/gestion/utilisateurs">Gestion des utilisateurs</Link></li>
                )}
              </ul>
            </li>
          )}
        </nav>
        <div className="user-menu">
          {isAuthenticated ? (
            <>
              <span>{user?.firstName} {user?.lastName}</span>
              <button className="btn-secondary" onClick={logout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn-primary">CONNEXION</button>
              </Link>
              <Link to="/signup">
                <button className="btn-secondary">S'INSCRIRE</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
