import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/RegistrationRequired.css';

/**
 * Composant pour protéger les routes nécessitant une inscription au camp
 * Redirige vers la page d'inscription si l'utilisateur n'est pas inscrit
 */
const RequireRegistration = ({ children }) => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [hasRegistration, setHasRegistration] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkRegistration = async () => {
      if (!token || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/registrations/mes-inscriptions', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.registrations && response.data.registrations.length > 0) {
          const registration = response.data.registrations[0];
          setHasRegistration(true);
          setRegistrationStatus(registration.paymentStatus);
        } else {
          setHasRegistration(false);
        }
      } catch (error) {
        console.error('❌ Erreur vérification inscription:', error);
        setHasRegistration(false);
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [token, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div className="registration-check-loading">
        <div className="spinner"></div>
        <p>Vérification de votre inscription...</p>
      </div>
    );
  }

  if (!hasRegistration) {
    return (
      <div className="registration-required-container">
        <div className="registration-required-card">
          <div className="icon-warning">⚠️</div>
          <h1>Inscription au Camp Requise</h1>
          <p className="subtitle">
            Vous devez être inscrit au camp Génération Josué pour accéder à cette page.
          </p>

          <div className="benefits-list">
            <h3>En vous inscrivant, vous pourrez :</h3>
            <ul>
              <li>✅ Accéder à votre tableau de bord personnalisé</li>
              <li>✅ Consulter les détails de votre inscription</li>
              <li>✅ Voir le planning complet du camp</li>
              <li>✅ Choisir et vous inscrire aux activités</li>
              <li>✅ Accéder aux informations des activités</li>
              <li>✅ Gérer vos paiements</li>
              <li>✅ Inscrire des invités</li>
            </ul>
          </div>

          <div className="action-buttons">
            <a href="/inscription-camp" className="btn-primary">
              📝 S'inscrire au Camp
            </a>
            <a href="/" className="btn-secondary">
              🏠 Retour à l'accueil
            </a>
          </div>

          <div className="info-box">
            <p>
              <strong>💰 Montant de l'inscription :</strong> 120€
              <br />
              <small>(Paiement partiel possible à partir de 20€)</small>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur a une inscription mais n'a pas encore payé
  if (registrationStatus === 'unpaid') {
    return (
      <div className="registration-required-container">
        <div className="registration-required-card">
          <div className="icon-warning">💳</div>
          <h1>Paiement en Attente</h1>
          <p className="subtitle">
            Votre inscription est enregistrée, mais vous devez effectuer au moins un paiement pour accéder à votre tableau de bord.
          </p>

          <div className="payment-info">
            <h3>Montant restant à payer</h3>
            <div className="amount-display">120€</div>
            <p className="payment-note">
              Vous pouvez payer partiellement (minimum 20€) ou en totalité.
            </p>
            <div className="payment-methods-info">
              <p><strong>💳 Paiement PayPal :</strong> Accès immédiat après paiement</p>
              <p><strong>💵 Paiement en espèces :</strong> Accès après validation par un responsable de votre campus</p>
            </div>
          </div>

          <div className="action-buttons">
            <a href="/tableau-de-bord" className="btn-primary">
              💳 Effectuer un Paiement
            </a>
            <a href="/" className="btn-secondary">
              🏠 Retour à l'accueil
            </a>
          </div>

          <div className="info-box">
            <p>
              <strong>⚠️ Important :</strong> Pour accéder au tableau de bord, au planning et aux activités, votre inscription doit être validée.
              <br />
              <small><strong>PayPal :</strong> Validation automatique instantanée</small>
              <br />
              <small><strong>Espèces :</strong> Validation manuelle par le responsable de votre campus (délai possible)</small>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // L'utilisateur a une inscription et a au moins payé partiellement
  return children;
};

export default RequireRegistration;
