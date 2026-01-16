import React, { useState } from 'react';
import { VERSION_INFO } from '../version';
import '../styles/VersionBadge.css';

const VersionBadge = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClearCache = async () => {
    if (!window.confirm('🔄 Voulez-vous vider le cache et recharger la dernière version du site ?')) {
      return;
    }

    setIsUpdating(true);

    try {
      console.log('🔄 Début de la mise à jour...');

      // 1. Forcer la mise à jour du Service Worker actif
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          // Forcer la vérification de mise à jour
          await registration.update();
          // Puis désinscrire
          await registration.unregister();
          console.log('✅ Service Worker désinscrit:', registration.scope);
        }
      }

      // 2. Vider tous les caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        console.log('✅ Caches supprimés:', cacheNames);
      }

      // 3. Vider localStorage et sessionStorage (sauf le token)
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      localStorage.clear();
      sessionStorage.clear();
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', user);
      console.log('✅ Storage vidé (token préservé)');

      // 4. Forcer le rechargement complet avec bypass du cache
      console.log('🔄 Rechargement de la page...');
      
      // Utiliser window.location.replace pour forcer un rechargement complet
      const url = new URL(window.location.href);
      url.searchParams.set('nocache', Date.now());
      window.location.replace(url.toString());

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      alert('⚠️ Erreur lors de la mise à jour. Essayez de recharger manuellement (Ctrl+Shift+R).');
      setIsUpdating(false);
    }
  };

  return (
    <div className="version-badge-container">
      <div 
        className="version-badge"
        onClick={() => setShowDetails(!showDetails)}
        title="Cliquez pour plus d'infos"
      >
        🚀 v{VERSION_INFO.version}
      </div>
      
      {showDetails && (
        <div className="version-details">
          <div className="version-detail-item">
            <span className="version-label">📦 Version:</span>
            <span className="version-value">{VERSION_INFO.version}</span>
          </div>
          <div className="version-detail-item">
            <span className="version-label">📅 Build:</span>
            <span className="version-value">{VERSION_INFO.buildDate}</span>
          </div>
          {VERSION_INFO.buildTime && (
            <div className="version-detail-item">
              <span className="version-label">⏰ Heure:</span>
              <span className="version-value">{VERSION_INFO.buildTime}</span>
            </div>
          )}
          <div className="version-detail-item">
            <span className="version-label">💾 Cache:</span>
            <span className="version-value">{VERSION_INFO.cacheVersion}</span>
          </div>
          <div className="version-detail-item">
            <span className="version-label">🌐 Env:</span>
            <span className="version-value">{process.env.NODE_ENV}</span>
          </div>
          
          <button 
            className="version-update-btn"
            onClick={handleClearCache}
            disabled={isUpdating}
          >
            {isUpdating ? '🔄 Mise à jour...' : '🔄 Mettre à jour le cache'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VersionBadge;
