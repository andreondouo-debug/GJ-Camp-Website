/**
 * Composant PWAInstallPrompt - Bouton pour installer l'application
 * Affiche un bouton "Installer l'app" quand l'installation PWA est possible
 */

import React, { useState, useEffect } from 'react';
import '../styles/PWAInstall.css';


const isAppInstalled = () => {
  // Détection multiplateforme
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;
  return isStandalone || (isIOS && isInStandaloneMode);
};

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [installSupported, setInstallSupported] = useState(true);

  useEffect(() => {
    let promptEvent = null;
    const handler = (e) => {
      e.preventDefault();
      promptEvent = e;
      setDeferredPrompt(e);
      setShowInstallButton(true);
      setInstallSupported(true);
      console.log('📱 PWA installable détectée');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Réafficher le bouton à chaque visite si non installée
    if (!isAppInstalled()) {
      setShowInstallButton(!!promptEvent);
    } else {
      setShowInstallButton(false);
    }

    // Si le navigateur ne supporte pas beforeinstallprompt
    setTimeout(() => {
      if (!promptEvent && !isAppInstalled()) {
        setInstallSupported(false);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);


  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('✅ Utilisateur a accepté l\'installation');
    } else {
      console.log('❌ Utilisateur a refusé l\'installation');
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (isAppInstalled()) return null;

  if (!installSupported) {
    // Message d'aide si le navigateur ne supporte pas l'installation PWA
    return (
      <div className="pwa-install-prompt">
        <div className="pwa-install-content">
          <div className="pwa-install-icon">📱</div>
          <div className="pwa-install-text">
            <h4>Installer GJ Camp</h4>
            <p>Pour installer l'application, ouvrez le menu de votre navigateur et choisissez "Ajouter à l'écran d'accueil".</p>
          </div>
          <button 
            className="pwa-install-close" 
            onClick={() => setInstallSupported(true)}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (!showInstallButton) return null;

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">📱</div>
        <div className="pwa-install-text">
          <h4>Installer GJ Camp</h4>
          <p>Accédez rapidement à l'app depuis votre écran d'accueil</p>
        </div>
        <button className="pwa-install-button" onClick={handleInstallClick}>
          Installer
        </button>
        <button 
          className="pwa-install-close" 
          onClick={() => setShowInstallButton(false)}
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
