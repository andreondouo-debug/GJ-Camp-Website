import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './CreateRegistrationPage.css';

const API_URL = process.env.REACT_APP_API_URL || '';

const CreateRegistrationPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    sex: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    refuge: '',
    hasAllergies: false,
    allergyDetails: ''
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

  const validatePasswordStrength = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('une lettre majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('une lettre minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
      errors.push('un caractère spécial (!@#$%&*...)');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Validation mot de passe
      const passwordErrors = validatePasswordStrength(form.password);
      if (passwordErrors.length > 0) {
        setError(`🔒 Mot de passe trop faible ! Il doit contenir : ${passwordErrors.join(', ')}.`);
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/api/registrations/create-without-payment`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(response.data.message || '✅ Inscription créée avec succès !');
      
      // Réinitialiser le formulaire
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        sex: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        refuge: '',
        hasAllergies: false,
        allergyDetails: ''
      });
      
      // Rediriger vers dashboard après 2 secondes
      setTimeout(() => {
        navigate('/tableau-de-bord-inscriptions');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || '❌ Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-registration-wrapper">
      <div className="create-registration-page">
        <div className="create-registration-card">
          <div className="form-header">
            <h1 className="form-title">👤 Créer une inscription</h1>
            <p className="form-subtitle">Sans paiement immédiat (statut: en attente)</p>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="registration-form">
            {/* Informations personnelles */}
            <section className="form-section section-info">
              <h3 className="section-title">📋 Informations personnelles</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Jean"
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="jean.dupont@example.com"
                />
              </div>

              <div className="form-group">
                <label>Mot de passe * (min. 8 car., majuscule, chiffre, spécial)</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sexe *</label>
                  <select
                    name="sex"
                    value={form.sex}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date de naissance *</label>
                  <input
                    type="text"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    placeholder="JJ/MM/AAAA (ex: 15/03/2000)"
                    pattern="\d{2}/\d{2}/\d{4}"
                    title="Format: JJ/MM/AAAA"
                    required
                  />
                  <small style={{color: '#666', fontSize: '0.85rem'}}>Format : JJ/MM/AAAA (ex: 15/03/2000)</small>
                </div>
              </div>
            </section>

            {/* Coordonnées */}
            <section className="form-section section-contact">
              <h3 className="section-title">📍 Coordonnées</h3>
              
              <div className="form-group">
                <label>Adresse *</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Rue de la Paix, 75001 Paris"
                />
              </div>

              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="06 12 34 56 78"
                />
              </div>
            </section>

            {/* Refuge CRPT */}
            <section className="form-section section-refuge">
              <h3 className="section-title">⛪ Refuge CRPT</h3>
              
              <div className="form-group">
                <label>Sélectionner votre refuge *</label>
                <select
                  name="refuge"
                  value={form.refuge}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choisir un refuge --</option>
                  <option value="Lorient">Lorient</option>
                  <option value="Laval">Laval</option>
                  <option value="Amiens">Amiens</option>
                  <option value="Nantes">Nantes</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>
            </section>

            {/* Informations médicales */}
            <section className="form-section section-medical">
              <h3 className="section-title">🏥 Informations médicales</h3>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="hasAllergies"
                    checked={form.hasAllergies}
                    onChange={handleChange}
                  />
                  <span>J'ai des allergies ou besoins médicaux particuliers</span>
                </label>
              </div>

              {form.hasAllergies && (
                <div className="form-group">
                  <label>Détails des allergies *</label>
                  <textarea
                    name="allergyDetails"
                    value={form.allergyDetails}
                    onChange={handleChange}
                    required={form.hasAllergies}
                    placeholder="Décrivez vos allergies ou besoins médicaux..."
                    rows="3"
                  />
                </div>
              )}
            </section>

            {/* Info paiement */}
            <div className="payment-info-admin">
              <p>💡 <strong>Paiement différé :</strong> Cette inscription sera créée avec le statut <span className="badge-pending">En attente</span>. L'utilisateur pourra payer plus tard via son espace personnel.</p>
            </div>

            {/* Bouton Submit */}
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? '⏳ Création en cours...' : '✅ Créer l\'inscription'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRegistrationPage;
