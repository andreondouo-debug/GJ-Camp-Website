import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'Une erreur est survenue lors de la vérification.'
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  useEffect(() => {
    if (status !== 'success') {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [status, navigate]);

  const handleResend = async () => {
    // Logique de renvoi à implémenter si nécessaire
    alert('Veuillez contacter le support pour renvoyer un lien de vérification.');
  };

  return (
    <div className="container">
      <div className="hero" style={{ paddingTop: '60px' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <h2>VÉRIFICATION DE L'EMAIL</h2>
          
          {status === 'loading' && (
            <div style={{ padding: '40px' }}>
              <div className="loading-spinner" style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #001a4d',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p>🔍 Vérification en cours...</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ padding: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
              <div className="form-success" style={{ marginBottom: '20px' }}>
                {message}
              </div>
              <p>Redirection vers la page de connexion...</p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>
                Se connecter maintenant
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div style={{ padding: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
              <div className="form-error" style={{ marginBottom: '20px' }}>
                {message}
              </div>
              <div style={{ marginTop: '20px' }}>
                <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginRight: '10px' }}>
                  Retour à la connexion
                </Link>
                <Link to="/inscription" className="btn-primary" style={{ display: 'inline-block' }}>
                  🏕️ S'inscrire au camp
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
