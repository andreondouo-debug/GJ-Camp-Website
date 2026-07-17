import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setSuccess(response.data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero" style={{ paddingTop: '60px' }}>
        <div className="form-container">
          <h2>🔐 MOT DE PASSE OUBLIÉ</h2>
          
          {!success ? (
            <>
              <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.
              </p>

              {error && <div className="form-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {loading ? '⏳ Envoi en cours...' : '📧 Demander la réinitialisation'}
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                <Link to="/login">← Retour à la connexion</Link>
              </div>
            </>
          ) : (
            <>
              <div className="form-success" style={{ marginBottom: '20px' }}>
                {success}
              </div>

              <div style={{ 
                backgroundColor: '#d1ecf1', 
                border: '1px solid #bee5eb', 
                borderRadius: '8px', 
                padding: '20px', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ marginTop: 0, color: '#0c5460' }}>📬 Prochaines étapes :</h3>
                <ol style={{ marginBottom: 0, paddingLeft: '20px', color: '#0c5460' }}>
                  <li>Un email avec le lien de réinitialisation vous a été envoyé</li>
                  <li>Pensez à vérifier vos spams si vous ne le voyez pas</li>
                  <li>Cliquez sur le lien dans l'email pour créer un nouveau mot de passe</li>
                  <li>Le lien est valable <strong>24 heures</strong></li>
                </ol>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link to="/login">
                  <button className="btn-primary">
                    Retour à la connexion
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
