import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, isPushSubscribed, showTestNotification } from '../services/pushNotifications';
import axios from 'axios';
import './NotificationSettings.css';

const NotificationSettings = ({ user }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true); // ✅ Activé par défaut
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

      setEmailNotifications(response.data.emailEnabled !== undefined ? response.data.emailEnabled : true);
      
      // Vérifier si l'utilisateur est réellement abonné (browser + backend)
      const subscribed = await isPushSubscribed();
      setIsSubscribed(subscribed);
      
      // Le toggle doit refléter l'abonnement réel ET le setting backend
      const backendEnabled = response.data.pushEnabled !== undefined ? response.data.pushEnabled : true;
      setPushNotifications(subscribed && backendEnabled);
      
      console.log('📊 État notifications:', { 
        backendEnabled, 
        subscribed, 
        finalState: subscribed && backendEnabled 
      });
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
    console.log('═══════════════════════════════════════════');
    console.log('🔔 DÉBUT handlePushToggle:', { enabled });
    console.log('═══════════════════════════════════════════');
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token présent:', !!token);
      
      if (enabled) {
        console.log('🔔 Activation des notifications push...');
        
        // Étape 1: Vérifier Service Worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          console.log('📊 Service Workers enregistrés:', registrations.length);
          registrations.forEach((reg, i) => {
            console.log(`  SW ${i+1}:`, reg.scope);
          });
        } else {
          console.error('❌ Service Worker non supporté');
          showMessage('Votre navigateur ne supporte pas les notifications push', 'error');
          setPushNotifications(false);
          setLoading(false);
          return;
        }
        
        // Étape 2: Demander la permission
        console.log('🔔 Étape 2: Demande permission...');
        const granted = await requestNotificationPermission();
        console.log('📊 Permission résultat:', granted);
        
        if (!granted) {
          showMessage('Permission refusée. Activez les notifications dans les paramètres du navigateur.', 'error');
          setPushNotifications(false);
          setLoading(false);
          console.log('❌ FIN handlePushToggle: Permission refusée');
          return;
        }
        
        console.log('✅ Permission accordée');
        
        // Étape 3: Vérifier l'abonnement
        console.log('🔔 Étape 3: Vérification abonnement...');
        const subscribed = await isPushSubscribed();
        console.log('📊 État abonnement:', subscribed);
        
        // Étape 4: Mettre à jour le backend
        console.log('🔔 Étape 4: Mise à jour backend...');
        const response = await axios.post('/api/notifications/settings', 
          { pushNotifications: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Backend réponse:', response.data);
        
        // Étape 5: Mettre à jour l'interface
        setPushNotifications(true);
        setIsSubscribed(subscribed);
        showMessage('Notifications push activées ! 🎉', 'success');
        console.log('✅ FIN handlePushToggle: Succès complet');
        
        // Envoyer une notification de test
        setTimeout(() => showTestNotification(), 1000);
      } else {
        console.log('🔕 Désactivation des notifications push...');
        
        // Désactiver dans le backend
        await axios.post('/api/notifications/settings', 
          { pushNotifications: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPushNotifications(false);
        showMessage('Notifications push désactivées', 'success');
        console.log('✅ FIN handlePushToggle: Désactivation réussie');
      }
    } catch (error) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ ERREUR handlePushToggle:', error);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Response:', error.response?.data);
      console.error('═══════════════════════════════════════════');
      showMessage('Erreur lors de la mise à jour', 'error');
      setPushNotifications(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    console.log('═══════════════════════════════════════════');
    console.log('🧪 DÉBUT Test Notification');
    console.log('═══════════════════════════════════════════');
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token présent:', !!token);
      
      // Vérifier l'abonnement local
      const subscribed = await isPushSubscribed();
      console.log('📊 Abonné localement:', subscribed);
      
      if (!subscribed) {
        console.warn('⚠️ Pas d\'abonnement local - tentative d\'envoi quand même');
      }
      
      console.log('📤 Envoi requête backend...');
      const response = await axios.post('/api/notifications/test', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Réponse backend:', response.data);
      showMessage('Notification test envoyée !', 'success');
      console.log('✅ FIN Test Notification: Succès');
    } catch (error) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ ERREUR Test Notification');
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Full Response:', error.response);
      console.error('Stack:', error.stack);
      console.error('═══════════════════════════════════════════');
      
      // Si erreur VAPID, proposer de réinitialiser
      if (error.response?.status === 500 && 
          error.response?.data?.message?.includes('VAPID')) {
        showMessage('Erreur VAPID. Réinitialisez votre abonnement ci-dessous.', 'error');
      } else {
        showMessage(error.response?.data?.message || 'Erreur lors de l\'envoi', 'error');
      }
    }
  };

  const handleResetSubscription = async () => {
    if (!window.confirm('⚠️ Voulez-vous réinitialiser votre abonnement notifications ?\n\nCela supprimera votre abonnement actuel. Vous devrez vous réabonner.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      console.log('🗑️ Réinitialisation abonnement...');
      
      // Supprimer l'abonnement backend
      await axios.delete('/api/notifications/reset-subscription', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Désabonner le navigateur
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          console.log('✅ Désabonné du navigateur');
        }
      }

      setPushNotifications(false);
      setIsSubscribed(false);
      showMessage('✅ Abonnement réinitialisé ! Réactivez les notifications.', 'success');
      console.log('✅ Réinitialisation terminée');
    } catch (error) {
      console.error('❌ Erreur réinitialisation:', error);
      showMessage('Erreur lors de la réinitialisation', 'error');
    } finally {
      setLoading(false);
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
            
            <button 
              onClick={handleResetSubscription}
              className="btn-reset-subscription"
              disabled={loading}
              style={{ marginLeft: '10px', backgroundColor: '#ff6b6b' }}
            >
              🗑️ Réinitialiser l'abonnement
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
