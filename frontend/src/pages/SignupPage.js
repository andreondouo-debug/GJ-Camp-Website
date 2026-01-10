import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/App.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    churchWebsite: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const { signup, loading, checkEmailAvailability } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailBlur = async () => {
    if (formData.email && formData.email.includes('@')) {
      setEmailChecking(true);
      setEmailError('');
      const result = await checkEmailAvailability(formData.email);
      setEmailChecking(false);
      
      if (!result.available) {
        setEmailError('❌ Cet email est déjà utilisé');
      } else {
        setEmailError('✅ Email disponible');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation côté client
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Vérifier l'unicité de l'email avant l'inscription
    if (emailError && emailError.includes('❌')) {
      setError('Cet email est déjà utilisé. Veuillez en choisir un autre.');
      return;
    }
    
    const result = await signup(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password,
      formData.churchWebsite
    );
    if (result.success) {
      setSuccess('✅ Inscription réussie ! Un email de vérification a été envoyé à ' + formData.email + '.');
      // Rediriger vers la page d'accueil après 2 secondes
      setTimeout(() => {
        navigate('/', { state: { signupSuccess: true, email: formData.email } });
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container">
      <div className="hero" style={{ paddingTop: '60px' }}>
        <div className="form-container">
          <h2>S'INSCRIRE</h2>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                required
              />
              {emailChecking && <small style={{color: '#666'}}>🔍 Vérification en cours...</small>}
              {emailError && (
                <small style={{color: emailError.includes('✅') ? '#27ae60' : '#e74c3c', fontWeight: 'bold'}}>
                  {emailError}
                </small>
              )}
            </div>
            <div className="form-group">
              <label>Mot de passe (minimum 6 caractères)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label>Site web de l'église (optionnel)</label>
              <input
                type="url"
                name="churchWebsite"
                value={formData.churchWebsite}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </form>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            Déjà inscrit? <Link to="/login">Se connecter ici</Link>
          </p>
          <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px' }}>
            Email de vérification non reçu? <Link to="/resend-verification">Renvoyer l'email</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
