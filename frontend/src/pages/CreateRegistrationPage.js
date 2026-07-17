import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DateInput from '../components/DateInput';
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
    allergyDetails: '',
    numberOfDays: 3,
    amountPaid: 0
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [existingUser, setExistingUser] = useState(null); // compte déjà existant

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    // Vérifier si le compte existe quand l'email change
    if (name === 'email') {
      setExistingUser(null);
    }
  };

  // Vérifier si le compte existe (au blur sur le champ email)
  const handleEmailBlur = async () => {
    const email = form.email.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    try {
      const response = await axios.get(`${API_URL}/api/users/check-email?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingUser(response.data.exists ? response.data.user : null);
    } catch {
      setExistingUser(null);
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
      // Validation mot de passe uniquement si nouveau compte
      if (!existingUser) {
        const passwordErrors = validatePasswordStrength(form.password);
        if (passwordErrors.length > 0) {
          setError(`🔒 Mot de passe trop faible ! Il doit contenir : ${passwordErrors.join(', ')}.`);
          setLoading(false);
          return;
        }
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
        allergyDetails: '',
        numberOfDays: 3,
        amountPaid: 0
      });
      setExistingUser(null);
      
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
                  onBlur={handleEmailBlur}
                  required
                  placeholder="jean.dupont@example.com"
                />
                {existingUser && (
                  <p style={{ color: '#27ae60', fontSize: '13px', marginTop: '4px' }}>
                    ✅ Compte existant trouvé : <strong>{existingUser.firstName} {existingUser.lastName}</strong> — pas besoin de mot de passe
                  </p>
                )}
              </div>

              {!existingUser && (
              <div className="form-group">
                <label>Mot de passe * (min. 8 car., majuscule, chiffre, spécial)</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!existingUser}
                  placeholder="••••••••"
                />
              </div>
              )}

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
                  <DateInput 
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    name="dateOfBirth"
                    label="Date de naissance"
                    required
                  />
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
            <section className="form-section">
              <h3 className="section-title">📅 Nombre de jours &amp; Paiement</h3>
              <div className="form-group">
                <label>Nombre de jours de présence *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[1, 2, 3].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, numberOfDays: d }))}
                      style={{
                        padding: '10px 20px', borderRadius: '8px', border: '2px solid',
                        borderColor: form.numberOfDays === d ? '#667eea' : '#ddd',
                        background: form.numberOfDays === d ? '#667eea' : 'white',
                        color: form.numberOfDays === d ? 'white' : '#333',
                        cursor: 'pointer', fontWeight: 'bold'
                      }}
                    >
                      {d} jour{d > 1 ? 's' : ''}<br/>
                      <small>{d * 40}€</small>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>Total inscription : <strong>{form.numberOfDays * 40}€</strong></p>
              </div>
              <div className="form-group">
                <label>Montant déjà payé (0 si pas encore payé)</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={form.amountPaid}
                  onChange={handleChange}
                  min="0"
                  max={form.numberOfDays * 40}
                  step="1"
                  placeholder="Ex: 20"
                />
                {form.amountPaid > 0 && (
                  <p style={{ fontSize: '13px', color: '#27ae60', marginTop: '4px' }}>
                    ✅ Reste à payer : <strong>{Math.max(0, form.numberOfDays * 40 - form.amountPaid)}€</strong>
                  </p>
                )}
              </div>
            </section>

            <div className="payment-info-admin">
              <p>💡 Un <strong>émail de confirmation</strong> sera envoyé automatiquement à la personne dès la création.</p>
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
