import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ModernLogo from '../components/ModernLogo';
import '../styles/App.css';

const CampRegistrationPage = () => {
  const { token, user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '', // Nouveau: mot de passe pour créer compte
    confirmPassword: '', // Nouveau: confirmation mot de passe
    sex: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    refuge: '',
    hasAllergies: false,
    allergyDetails: '',
    amountPaid: 20
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Validation mot de passe (seulement si pas déjà connecté)
      if (!user) {
        if (form.password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères.');
          setLoading(false);
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError('Les mots de passe ne correspondent pas.');
          setLoading(false);
          return;
        }
      }

      const response = await axios.post('/api/registrations/camp-with-account', form, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setMessage(response.data.message || 'Inscription réussie !');
      
      // Si compte créé, connecter automatiquement
      if (response.data.token && response.data.user) {
        await login(response.data.user, response.data.token);
      }
      
      // Rediriger vers la page d'accueil après 2 secondes
      setTimeout(() => {
        navigate('/tableau-de-bord');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page-wrapper">
      <div className="registration-page">
        <div className="registration-card" style={{maxWidth: '900px', margin: '0 auto'}}>
          <div className="registration-card-inner">
            
            {/* Header moderne avec logo animé */}
            <div className="form-header" style={{textAlign: 'center', marginBottom: '40px'}}>
              <ModernLogo variant={7} size="large" />
              <h1 className="form-title" style={{
                fontSize: '2.5rem',
                background: 'linear-gradient(135deg, #d4af37, #f0d06f)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginTop: '20px',
                marginBottom: '10px'
              }}>
                🏕️ Inscription Camp GJ
              </h1>
              <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem'}}>
                {user ? '✨ Complétez votre inscription' : '✨ Créez votre compte et inscrivez-vous au camp'}
              </p>
            </div>

            {message && <div className="alert alert-success" style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '30px',
              fontSize: '1.1rem',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
            }}>{message}</div>}
            
            {error && <div className="alert alert-error" style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '30px',
              fontSize: '1.1rem',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)'
            }}>{error}</div>}

            <form className="camp-form" onSubmit={handleSubmit} style={{gap: '30px'}}>
              
              {/* Informations Personnelles */}
              <div className="form-section">
                <h3 className="section-title">👤 Informations Personnelles</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Nom *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Date de naissance *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Sexe *</label>
                    <div className="radio-group-inline">
                      <label className="radio-label" style={{cursor: 'pointer'}}>
                        <input
                          type="radio"
                          name="sex"
                          value="M"
                          checked={form.sex === 'M'}
                          onChange={handleChange}
                          required
                        />
                        <span style={{fontSize: '1.1rem'}}>👨 Masculin</span>
                      </label>
                      <label className="radio-label" style={{cursor: 'pointer'}}>
                        <input
                          type="radio"
                          name="sex"
                          value="F"
                          checked={form.sex === 'F'}
                          onChange={handleChange}
                          required
                        />
                        <span style={{fontSize: '1.1rem'}}>👩 Féminin</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="form-section">
                <h3 className="section-title">📧 Coordonnées</h3>
                <div className="form-field">
                  <label>Adresse complète *</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Rue Example, Ville, Code Postal"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Téléphone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+33 6 12 34 56 78"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                      disabled={!!user}
                      style={user ? {opacity: 0.7, cursor: 'not-allowed'} : {}}
                    />
                  </div>
                </div>
              </div>

              {/* Mot de passe (seulement si pas connecté) */}
              {!user && (
                <div className="form-section" style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(160, 30, 30, 0.15))',
                  border: '2px solid rgba(212, 175, 55, 0.3)'
                }}>
                  <h3 className="section-title">🔐 Créer votre compte</h3>
                  <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '20px', fontSize: '0.95rem'}}>
                    Votre compte sera automatiquement créé après validation du paiement
                  </p>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Mot de passe * (min. 6 caractères)</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        minLength="6"
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Confirmer le mot de passe *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        minLength="6"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Refuge & Allergies */}
              <div className="form-section">
                <h3 className="section-title">🏠 Refuge & Santé</h3>
                <div className="form-field">
                  <label>Refuge (église ou campus) *</label>
                  <select
                    name="refuge"
                    value={form.refuge}
                    onChange={handleChange}
                    required
                    style={{cursor: 'pointer'}}
                  >
                    <option value="">-- Sélectionnez votre refuge --</option>
                    <option value="PARIS">Paris</option>
                    <option value="LYON">Lyon</option>
                    <option value="MARSEILLE">Marseille</option>
                    <option value="TOULOUSE">Toulouse</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="checkbox-label" style={{fontSize: '1.1rem', marginTop: '15px'}}>
                    <input
                      type="checkbox"
                      name="hasAllergies"
                      checked={form.hasAllergies}
                      onChange={handleChange}
                      style={{width: '22px', height: '22px', cursor: 'pointer'}}
                    />
                    <span>⚠️ J'ai des allergies ou besoins médicaux spécifiques</span>
                  </label>
                </div>

                {form.hasAllergies && (
                  <div className="form-field" style={{marginTop: '15px'}}>
                    <label>Détails des allergies / besoins médicaux *</label>
                    <textarea
                      name="allergyDetails"
                      value={form.allergyDetails}
                      onChange={handleChange}
                      placeholder="Décrivez vos allergies ou besoins médicaux..."
                      rows="4"
                      required={form.hasAllergies}
                      style={{resize: 'vertical', fontFamily: 'inherit'}}
                    />
                  </div>
                )}
              </div>

              {/* Frais d'inscription */}
              <div className="form-section" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
                border: '2px solid rgba(16, 185, 129, 0.3)'
              }}>
                <h3 className="section-title">💳 Frais d'inscription</h3>
                <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '25px', fontSize: '1.05rem'}}>
                  <strong>Total camp:</strong> 120€ | <strong>Minimum:</strong> 20€
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  {[20, 60, 80, 120].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, amountPaid: amount }))}
                      style={{
                        padding: '18px 25px',
                        borderRadius: '16px',
                        border: form.amountPaid === amount ? '3px solid #d4af37' : '2px solid rgba(255,255,255,0.2)',
                        background: form.amountPaid === amount 
                          ? 'linear-gradient(135deg, #d4af37, #f0d06f)' 
                          : 'rgba(10, 24, 46, 0.6)',
                        color: form.amountPaid === amount ? '#001a4d' : '#fff',
                        fontSize: '1.3rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: form.amountPaid === amount ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: form.amountPaid === amount 
                          ? '0 8px 32px rgba(212, 175, 55, 0.4)' 
                          : '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    >
                      {amount}€
                    </button>
                  ))}
                </div>

                <div style={{
                  background: 'rgba(10, 24, 46, 0.8)',
                  padding: '20px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '8px'}}>
                    Montant sélectionné
                  </div>
                  <div style={{fontSize: '2.5rem', fontWeight: '900', color: '#d4af37'}}>
                    {form.amountPaid}€
                  </div>
                  {form.amountPaid < 120 && (
                    <div style={{fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', marginTop: '8px'}}>
                      Reste à payer: {120 - form.amountPaid}€
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton de soumission */}
              <button 
                type="submit" 
                className="btn-primary btn-large" 
                disabled={loading}
                style={{
                  background: loading 
                    ? 'rgba(100,100,100,0.5)' 
                    : 'linear-gradient(135deg, #d4af37, #f0d06f)',
                  color: '#001a4d',
                  fontSize: '1.3rem',
                  fontWeight: '800',
                  padding: '22px 40px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 32px rgba(212, 175, 55, 0.4)',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  marginTop: '20px'
                }}
              >
                {loading ? '⏳ Inscription en cours...' : "✅ S'inscrire au Camp GJ"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampRegistrationPage;
