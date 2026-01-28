import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/App.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = await login(email, password);
    if (result.success) {
      setSuccess('✅ Connexion réussie ! Redirection en cours...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container">
      <div className="hero" style={{ paddingTop: '60px' }}>
        <div className="form-container">
          <h2>CONNEXION</h2>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
              <Link 
                to="/forgot-password" 
                style={{ fontSize: '14px', color: '#a01e1e', textDecoration: 'none' }}
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            Pas encore inscrit? <Link to="/inscription">🏕️ S'inscrire au camp</Link>
          </p>
          <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px' }}>
            Email non vérifié? <Link to="/resend-verification">Renvoyer l'email de vérification</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
