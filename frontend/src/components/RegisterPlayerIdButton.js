import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import { getOneSignalPlayerId, setUserEmail } from '../services/oneSignalService';
import '../styles/RegisterPlayerIdButton.css';

const RegisterPlayerIdButton = () => {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleRegisterPlayerId = async () => {
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Attendre que OneSignal soit initialisé (max 10 secondes)
      let playerId = null;
      let attempts = 0;
      const maxAttempts = 20; // 10 secondes (20 x 500ms)

      while (!playerId && attempts < maxAttempts) {
        playerId = await getOneSignalPlayerId();
        if (!playerId) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Attendre 500ms
          attempts++;
        }
      }

      if (!playerId) {
        setMessage('❌ OneSignal n\'est pas initialisé. Rechargez la page et réessayez.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      console.log('📱 Player ID trouvé:', playerId);

      // Sauvegarder sur le backend
      const response = await axios.put(
        getApiUrl('/api/auth/push-player-id'),
        { pushPlayerId: playerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Définir l'email pour la segmentation
      if (user?.email) {
        await setUserEmail(user.email);
      }

      console.log('✅ Player ID sauvegardé:', response.data);
      setMessage('✅ Notifications activées ! Vous recevrez maintenant les notifications push.');
      setMessageType('success');

      // Masquer le message après 5 secondes
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } catch (error) {
      console.error('❌ Erreur enregistrement Player ID:', error);
      setMessage(error.response?.data?.message || '❌ Erreur lors de l\'activation des notifications');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-player-id-container">
      <button
        className="register-player-id-btn"
        onClick={handleRegisterPlayerId}
        disabled={loading}
      >
        {loading ? '⏳ Activation en cours...' : '🔔 Activer les notifications push'}
      </button>
      
      {message && (
        <div className={`player-id-message ${messageType}`}>
          {message}
        </div>
      )}

      <p className="player-id-info">
        ℹ️ Cliquez pour recevoir les notifications du camp (messages, activités, actualités)
      </p>
    </div>
  );
};

export default RegisterPlayerIdButton;
