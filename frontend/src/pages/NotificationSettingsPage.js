import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import '../styles/NotificationSettings.css';

function NotificationSettingsPage() {
  const { user, token } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📥 Paramètres reçus du backend:', response.data);
      console.log('📥 pushNotifications brut:', response.data.pushNotifications);
      console.log('📥 Type:', typeof response.data.pushNotifications);
      
      // FORCER les notifications push à TOUJOURS être true
      const loadedSettings = {
        emailNotifications: response.data.emailNotifications !== false, // true par défaut
        smsNotifications: response.data.smsNotifications === true, // false par défaut
        pushNotifications: true // ✅ TOUJOURS ACTIVÉ
      };
      
      console.log('📊 Paramètres chargés:', loadedSettings);
      setSettings(loadedSettings);
      setPhoneNumber(response.data.phoneNumber || '');
      setLoading(false);
      setHasChanges(false);
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
      // En cas d'erreur, garder les notifications push activées
      setSettings({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
      });
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaveStatus('saving');

      console.log('💾 Sauvegarde des paramètres:', settings);

      const response = await axios.put(`${API_URL}/api/auth/notification-settings`, {
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        pushNotifications: settings.pushNotifications,
        phoneNumber: phoneNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Réponse backend:', response.data);
      
      setSaveStatus('saved');
      setHasChanges(false);
      
      setTimeout(() => setSaveStatus(''), 2000);

    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleToggleChange = (field, value) => {
    console.log(`🔄 Changement ${field}:`, value);
    
    // BLOQUER la désactivation des notifications push
    if (field === 'pushNotifications' && value === false) {
      console.warn('⚠️ Désactivation des notifications push bloquée - Toujours activé');
      alert('ℹ️ Les notifications push restent toujours activées pour ne manquer aucune information importante.');
      return; // Ne pas appliquer le changement
    }
    
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const enablePushNotifications = async () => {
    try {
      // Vérifier support navigateur
      if (!('Notification' in window)) {
        alert('❌ Votre navigateur ne supporte pas les notifications push');
        return;
      }

      // Demander permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Ici vous intégreriez OneSignal ou Firebase
        // Exemple avec OneSignal:
        /*
        window.OneSignal = window.OneSignal || [];
        OneSignal.push(function() {
          OneSignal.init({
            appId: "VOTRE_ONESIGNAL_APP_ID"
          });
          OneSignal.getUserId(function(userId) {
            // Enregistrer le userId sur le serveur
            axios.put(`${API_URL}/api/auth/push-player-id`, { pushPlayerId: userId }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          });
        });
        */
        
        setSettings({ ...settings, pushNotifications: true });
        alert('✅ Notifications push activées !');
      } else {
        alert('❌ Permission refusée');
      }
    } catch (error) {
      console.error('Erreur activation push:', error);
      alert('❌ Erreur lors de l\'activation');
    }
  };

  if (loading) {
    return (
      <div className="notification-settings-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="notification-settings-container">
      <div className="settings-header">
        <h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '10px'}}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          Paramètres de Notifications
        </h1>
        <p>Gérez comment vous souhaitez être notifié des nouveaux posts</p>
      </div>

      <div className="settings-card">
        <h2>Types de Notifications</h2>
        
        {/* Email */}
        <div className="setting-item">
          <div className="setting-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="setting-icon">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <div>
              <h3>Notifications par Email</h3>
              <p>Recevez un email pour chaque nouveau post</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleToggleChange('emailNotifications', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* SMS */}
        <div className="setting-item">
          <div className="setting-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="setting-icon">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <div>
              <h3>Notifications par SMS</h3>
              <p>Recevez un SMS pour les posts importants</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleToggleChange('smsNotifications', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {settings.smsNotifications && (
          <div className="phone-input-section">
            <label>Numéro de téléphone</label>
            <input
              type="tel"
              placeholder="+33 6 12 34 56 78"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="phone-input"
            />
            <small>Format international requis (ex: +33612345678)</small>
          </div>
        )}

        {/* Push - Toujours activé */}
        <div className="setting-item push-always-on">
          <div className="setting-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="setting-icon">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <div>
              <h3>Notifications Push 🔔</h3>
              <p>Notifications instantanées sur votre appareil</p>
              <span className="status-badge active">✅ Toujours activé</span>
              <small style={{ display: 'block', marginTop: '0.5rem', color: '#7f8c8d', fontStyle: 'italic' }}>
                Les notifications push restent activées pour ne manquer aucune information importante
              </small>
            </div>
          </div>
          <div className="push-locked-badge">
            <span className="locked-icon">🔒</span>
            <span className="locked-text">ACTIVÉ</span>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="save-banner">
          <div className="save-banner-content">
            <span className="save-icon">⚠️</span>
            <span>Vous avez des modifications non enregistrées</span>
            <button 
              className="btn-save-quick" 
              onClick={handleSaveNotifications}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? '💾 Enregistrement...' : '💾 Enregistrer maintenant'}
            </button>
          </div>
        </div>
      )}

      <div className="settings-card info-card">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '8px'}}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          À propos des notifications
        </h3>
        <ul>
          <li><strong>Email</strong> : Idéal pour les mises à jour détaillées</li>
          <li><strong>SMS</strong> : Pour les alertes urgentes (peut engendrer des frais)</li>
          <li><strong>Push</strong> : Notifications instantanées dans votre navigateur</li>
        </ul>
        <p className="note">💡 Vous pouvez modifier ces paramètres à tout moment</p>
      </div>

      <div className="settings-actions">
        <button 
          className={`btn-save-main ${saveStatus === 'saved' ? 'saved' : ''} ${saveStatus === 'error' ? 'error' : ''}`}
          onClick={handleSaveNotifications}
          disabled={saveStatus === 'saving' || !hasChanges}
        >
          {saveStatus === 'saving' && '⏳ Enregistrement...'}
          {saveStatus === 'saved' && '✅ Enregistré !'}
          {saveStatus === 'error' && '❌ Erreur'}
          {!saveStatus && (hasChanges ? '💾 Enregistrer les modifications' : '✅ Tout est à jour')}
        </button>
      </div>
    </div>
  );
}

export default NotificationSettingsPage;
