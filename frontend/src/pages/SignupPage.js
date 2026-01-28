import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

/**
 * Page de redirection: Signup classique désactivé
 * Redirige automatiquement vers l'inscription au camp
 */
const SignupPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection automatique après 3 secondes
    const timer = setTimeout(() => {
      navigate('/inscription');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="registration-page-wrapper">
      <div className="registration-page">
        <div className="registration-card" style={{maxWidth: '600px'}}>
          <div className="registration-card-inner" style={{textAlign: 'center', padding: '3rem'}}>
            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🏕️</div>
            <h1 className="form-title" style={{marginBottom: '1rem'}}>
              Inscription désactivée
            </h1>
            <p style={{fontSize: '1.1rem', color: '#666', marginBottom: '2rem', lineHeight: '1.6'}}>
              La création de compte classique n'est plus disponible.
              <br /><br />
              <strong>Pour créer votre compte, inscrivez-vous au Camp GJ !</strong>
              <br /><br />
              Votre compte sera automatiquement créé après validation du paiement.
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              ✨ Redirection automatique dans 3 secondes...
            </div>
            <button 
              className="btn-primary btn-large"
              onClick={() => navigate('/inscription')}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f0d06f)',
                color: '#001a4d'
              }}
            >
              🏕️ Aller à l'inscription camp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
