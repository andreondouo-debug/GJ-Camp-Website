import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, isPushSubscribed, showTestNotification } from '../services/pushNotifications';
import axios from 'axios';
import './NotificationSettings.css';

const NotificationSettings = ({ user }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Récupérer le statut depuis le backend
      const response = await axios.get('/api/notifications/status', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmailNotifications(response.data.emailEnabled || false);
      setPushNotifications(response.data.pushEnabled || false);

      // Vérifier si l'utilisateur est abonné localement
      const subscribed = await isPushSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
    }
  };

  const handleEmailToggle = async (enabled) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post('/api/notifications/settings', 
        { emailNotifications: enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmailNotifications(enabled);
      showMessage(`Notifications email ${enabled ? 'activées' : 'désactivées'}`, 'success');
    } catch (error) {
      console.error('❌ Erreur mise à jour email:', error);
      showMessage('Erreur lors de la mise à jour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePushToggle = async (enabled) => {
    setLoading(true);
    try {
      if (enabled) {
        // Activer les notifications push
        const granted = await requestNotificationPermission();
        
        if (granted) {
          setPushNotifications(true);
          setIsSubscribed(true);
          showMessage('Notifications push activées ! 🎉', 'success');
          
          // Envoyer une notification de test
          setTimeout(() => showTestNotification(), 1000);
        } else {
          showMessage('Permission refusée. Activez les notifications dans les paramètres du navigateur.', 'error');
        }
      } else {
        // Désactiver les notifications push
        const token = localStorage.getItem('token');
        
        await axios.post('/api/notifications/settings', 
          { pushNotifications: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPushNotifications(false);
        showMessage('Notifications push désactivées', 'success');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour push:', error);
      showMessage('Erreur lors de la mise à jour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post('/api/notifications/test', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showMessage('Notification test envoyée !', 'success');
    } catch (error) {
      console.error('❌ Erreur notification test:', error);
      showMessage(error.response?.data?.message || 'Erreur lors de l\'envoi', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setShowSuccess(type === 'success');
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <h2>🔔 Notifications</h2>
        <p>Gérez vos préférences de notifications</p>
      </div>

      {message && (
        <div className={`notification-message ${showSuccess ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="settings-list">
        {/* Notifications Email */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-icon">📧</div>
            <div>
              <h3>Notifications Email</h3>
              <p>Recevoir des emails pour les nouveaux posts et messages importants</p>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => handleEmailToggle(e.target.checked)}
              disabled={loading}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Notifications Push */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-icon">🔔</div>
            <div>
              <h3>Notifications Push</h3>
              <p>Recevoir des notifications en temps réel sur cet appareil</p>
              {isSubscribed && <span className="badge-subscribed">✅ Abonné</span>}
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => handlePushToggle(e.target.checked)}
              disabled={loading}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Bouton test */}
        {pushNotifications && isSubscribed && (
          <div className="test-notification-section">
            <button 
              onClick={handleTestNotification}
              className="btn-test-notification"
              disabled={loading}
            >
              🧪 Envoyer une notification test
            </button>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="notification-info">
        <h4>ℹ️ À propos des notifications</h4>
        <ul>
          <li><strong>Emails :</strong> Résumés quotidiens et messages importants</li>
          <li><strong>Push :</strong> Alertes instantanées pour les nouveaux contenus</li>
          <li><strong>Vie privée :</strong> Vous pouvez désactiver à tout moment</li>
          <li><strong>Permissions :</strong> Les notifications push nécessitent l'autorisation du navigateur</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSettings;
